from fastapi import FastAPI, Depends, HTTPException, status, Cookie, Request
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone
from typing import Optional
from passlib.context import CryptContext
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from dotenv import load_dotenv
import uvicorn
import pytz

import os

from api.database import *
from api.models import *
from utils.ssl_generator import generate_self_signed_cert

utc = pytz.utc
local_tz = pytz.timezone("America/New_York")
load_dotenv()

# FastAPI app
app = FastAPI()

app.state.mission_gen_time = datetime.now(local_tz)
app.state.initial_gen = False

origins = []
origins.append(os.getenv("https://project.domain.com"))
if os.getenv("FRONTEND_IP"):
    origins.append(os.getenv("FRONTEND_IP"))
if os.getenv("LOCAL_IP"):
    origins.append(os.getenv("LOCAL_IP"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Path to the React build folder
dist_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../dist"))

# Load environment variables
SECRET_KEY = os.getenv("SECRET_KEY")
REFRESH_SECRET_KEY = os.getenv("REFRESH_SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS"))

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Password encryption context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Dependency for DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ============ Helper Functions ============

def set_user_last_access(db, db_user):
    db_user.last_access = datetime.now(local_tz)
    db.commit()
    

# ============ Token Functions ============

def create_token(data: dict, secret_key: str, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.now(local_tz) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, secret_key, algorithm=ALGORITHM)

def verify_token(token: str, secret_key: str):
    try:
        payload = jwt.decode(token, secret_key, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
    
async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = verify_token(token, SECRET_KEY)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    username = payload.get("sub")
    user = db.query(Users).filter(Users.username == username).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    set_user_last_access(db, user)

    return user

# ============ Auth ============

@app.post("/token",
          response_model=TokenResponse,
          summary="Get Token",
          description="This endpoint will authenticate the user and issue an access token.",
          tags=["Auth Required"])
@app.post("/api/login",
          response_model=TokenResponse,
          summary="Login",
          description="This endpoint will authenticate the user and issue an access token.",
          tags=["Auth Required"])
def get_token(request: Request,
              form_data: OAuth2PasswordRequestForm = Depends(),
              db: Session = Depends(get_db)):
    user = db.query(Users).filter(Users.username == form_data.username).first()
    if not user or not pwd_context.verify(form_data.password, user.password):
        print("Invalid credentials")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    # Create tokens
    access_token = create_token({"sub": user.username}, SECRET_KEY)
    refresh_token = create_token(
        {"sub": user.username}, REFRESH_SECRET_KEY, timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    )
    
    # Store refresh token in DB
    while True:
        try:
            if "X-Forwarded-For" in request.headers:
                client_ip = request.headers["X-Forwarded-For"].split(",")[0].strip()  # First IP is client
            else:
                client_ip = request.client.host if request.client else None

            print(f"Client IP: {client_ip}")

            refresh_entry = RefreshToken(
                user_id=user.id,
                refresh_token=refresh_token,
                expires_at=datetime.now(local_tz) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS),
                ip_address=client_ip
            )
            db.add(refresh_entry)
            db.commit()
            break
        except IntegrityError:
            print("Duplicate refresh token detected, retrying...")
            db.rollback()
            refresh_token = create_token(
                {"sub": user.username}, REFRESH_SECRET_KEY, timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
            )

    # Set refresh token as an HTTP-only cookie
    response = JSONResponse({"access_token": access_token, "token_type": "bearer"})
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,
        max_age=60 * 60 * 24 * 7  # 7 days
        )

    return response

@app.post("/api/refresh",
          response_model=TokenResponse,
          summary="Refresh Token",
          description="This endpoint will issue a new access token using the refresh token.",
          tags=["Auth Required"])
def refresh(request: Request,
            refresh_token: str = Cookie(None),
            db: Session = Depends(get_db)):

    if not refresh_token:
        print("Refresh token missing")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token missing")
    
    # Verify and validate refresh token
    payload = verify_token(refresh_token, REFRESH_SECRET_KEY)
    if not payload:
        print("Invalid refresh token")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    username = payload.get("sub")
    token_entry = db.query(RefreshToken).filter(RefreshToken.refresh_token == refresh_token).first()
    
    if not token_entry or token_entry.expires_at < datetime.now(timezone.utc):
        print("Token expired or revoked")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired or revoked")
    
    if "X-Forwarded-For" in request.headers:
        client_ip = request.headers["X-Forwarded-For"].split(",")[0].strip()  # First IP is client
    else:
        client_ip = request.client.host if request.client else None

    print(f"Client IP: {client_ip}")

    if token_entry.ip_address != client_ip:
        print(f"IP address mismatch: expected {token_entry.ip_address}, got {client_ip}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token IP address mismatch")

    # Issue new access token
    new_access_token = create_token({"sub": username}, SECRET_KEY)
    return {"access_token": new_access_token, "token_type": "bearer"}

@app.post("/api/logout",
          response_model=MessageResponse,
          summary="Logout",
          description="This endpoint will invalidate the users refresh token.",
          tags=["Auth Required"])
def logout(refresh_token: str = Cookie(None), db: Session = Depends(get_db)):
    if not refresh_token:
        print("Refresh token missing")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Refresh token missing")

    # Invalidate the refresh token
    db.query(RefreshToken).filter(RefreshToken.refresh_token == refresh_token).delete()
    db.commit()

    response = JSONResponse({"message": "Logged out successfully"})
    response.delete_cookie("refresh_token")
    return response

@app.get("/api/whoami",
        response_model=MessageResponse,
        summary="Get Username",
        description="This endpoint will return the username of the authenticated user.",
        tags=["Auth Required"])
def whoami(current_user: Users = Depends(get_current_user)):
    return {"message": f"{current_user.username}"}

# Create Account
@app.post("/api/v1/create_account",
          response_model=MessageResponse,
          summary="Create Account",
          description="This endpoint will create a new account for the Fallen Servers.",
          tags=["Public"])
def create_account(new_account: CreateAccount,
                   db: Session = Depends(get_db)):
    db_users = db.query(Users).all()

    for user in db_users:
        if user.username.lower() == new_account.username.lower():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Username already exists"
            )
        if user.email.lower() == new_account.email.lower():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already in use"
            )
    
    new_account.password = pwd_context.hash(new_account.password)
    db_user =  Users(username=new_account.username, password=new_account.password, email=new_account.email)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    set_user_last_access(db, db_user)
    return {"message": "Account Created Successfully"}

# ============ Webhosting ============

# Serve the React app
@app.get("/{full_path:path}")
async def serve_react_app(full_path: str):
    requested_file = os.path.join(dist_dir, full_path)

    if os.path.exists(requested_file) and os.path.isfile(requested_file):
        return FileResponse(requested_file)

    index_file = os.path.join(dist_dir, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)

    return {"error": "index.html not found"}

# ============ Run App ============

if __name__ == "__main__":
    cert_path, key_path = generate_self_signed_cert()
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8080,
        log_level="debug",
        reload=True,
        ssl_keyfile=key_path,
        ssl_certfile=cert_path,
    )