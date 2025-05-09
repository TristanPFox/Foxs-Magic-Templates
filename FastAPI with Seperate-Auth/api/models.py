from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Union, List, Dict

class MessageResponse(BaseModel):
    message: str

class NumberResponse(BaseModel):
    message: int

class CreateAccount(BaseModel):
    username: str
    password: str
    email: str

# For login and refresh token responses
class TokenResponse(BaseModel):
    access_token: str
    token_type: str

# For representing refresh tokens in queries
class RefreshTokenData(BaseModel):
    refresh_token: str
    issued_at: datetime
    expires_at: datetime