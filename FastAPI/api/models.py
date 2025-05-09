from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Union, List, Dict

class MessageResponse(BaseModel):
    message: str