from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from app.config import settings

# Password hashing context
import bcrypt
import hashlib

def verify_password(plain_password, hashed_password):
    shorter_hash = hashlib.sha256(plain_password.encode('utf-8')).hexdigest()
    # verify bcrypt expects bytes for both
    # hashed_password from db is a string
    return bcrypt.checkpw(shorter_hash.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password):
    # Hash down to 64 char hex string to guarantee length compliance
    shorter_hash = hashlib.sha256(password.encode('utf-8')).hexdigest()
    # bcrypt.hashpw returns bytes, decode to store as string in db
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(shorter_hash.encode('utf-8'), salt).decode('utf-8')



def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login", auto_error=False)

async def get_current_user(token: str = Depends(oauth2_scheme)):
    if not token:
        return None
    payload = decode_access_token(token)
    if not payload:
        return None
    return payload

async def get_current_admin(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have enough permissions"
        )
    return current_user
