from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, DateTime, func, JSON, Boolean, text
from sqlalchemy.orm import sessionmaker, declarative_base, scoped_session, relationship
import json, os
import psycopg2
from datetime import datetime
from dotenv import load_dotenv
import pytz

def get_time():
    return datetime.now(pytz.timezone("America/New_York"))

Base = declarative_base()

# ========= Database Tables ==========

class Users(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True)
    password = Column(String)
    email = Column(String, unique=True) 
    role = Column(String, server_default="user")  # Optional: User role
    last_access = Column(DateTime(timezone=True), server_default=func.now()) 

    refresh_tokens = relationship("RefreshToken", back_populates="user")


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    refresh_token = Column(String, nullable=False, unique=True)
    issued_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    device_info = Column(String, nullable=True)  # Optional: Device metadata
    ip_address = Column(String, nullable=True)  # Optional: Client IP address

    user = relationship("Users", back_populates="refresh_tokens")


# ========= Database Creation ==========

if os.getenv("IS_TEST_ENV"):
    DATABASE_URL = "sqlite:///./tests/test_projectname.db3"
    engine = create_engine(DATABASE_URL)
    SessionLocal = scoped_session(
        sessionmaker(autocommit=False, autoflush=False, bind=engine)
    )
else:
    # Ping the db locally to check if it's up, if not, use the remote db instead
    load_dotenv()
    DB_HOST = os.getenv("DB_HOST")
    DB_PORT = os.getenv("DB_PORT")
    DB_NAME = os.getenv("DB_NAME")
    DB_USER = os.getenv("DB_USER")
    DB_PASSWORD = os.getenv("DB_PASSWORD")
    DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}?client_encoding=utf8"
    print("Using remote db")
    engine = create_engine(DATABASE_URL)
    SessionLocal = scoped_session(
        sessionmaker(autocommit=False, autoflush=False, bind=engine)
    )

def init_db():
    Base.metadata.create_all(bind=engine)
    

if __name__ == "__main__":
    init_db()