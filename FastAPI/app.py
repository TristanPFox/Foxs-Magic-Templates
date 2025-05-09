from fastapi import FastAPI, Depends, HTTPException, status, Cookie, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from typing import Optional
from dotenv import load_dotenv
import uvicorn
import pytz

import os

from api.models import *
from utils.ssl_generator import generate_self_signed_cert

utc = pytz.utc
local_tz = pytz.timezone("America/New_York")
load_dotenv()

# FastAPI app
app = FastAPI()

app.state.mission_gen_time = datetime.now(local_tz)
app.state.initial_gen = False

templates = Jinja2Templates(directory="templates")
app.mount("/static", StaticFiles(directory="static"), name="static")

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

# ============ Endpoints ============

@app.get("/api/healthcheck",
            summary="Health Check",
            description="This endpoint checks the health of the API.",
            tags=["Health"])
def health_check():
    return {"status": "ok"}

# ============ Webhosting ============

@app.get("/favicon.ico",
         summary="Favicon Link",
         description="This endpoint returns the favicon for the webapp",
         tags=["Webpages"])
def read_favicon():
    return FileResponse("static/images/favicon.ico")

# Home Page
@app.get("/",
         summary="Home Page",
         description="This is the main page for ProjectName.",
         tags=["Webpages"])
def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

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