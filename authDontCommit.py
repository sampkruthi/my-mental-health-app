# routes/auth.py

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from services.auth_service import authenticate_user, create_access_token, register_user
from db.models import User
from db.session import get_session
from db.models import User
from auth import get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class RegisterRequest(BaseModel):
    username: str
    password: str

class RegisterDeviceRequest(BaseModel):
    device_token: str
    platform: str  # "ios", "android", "web"

@router.post("/token", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"})
    #token = create_access_token(subject=user.username) #changing for UserInToken issue
    token = create_access_token(user)

    return {"access_token": token, "token_type": "bearer"}

@router.post("/register", response_model=Token, status_code=201)
def register(req: RegisterRequest):
    existing = authenticate_user(req.username, req.password)
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")
    user = register_user(req.username, req.password)
    #token = create_access_token(subject=user.username) #changing for UserInToken issue
    token = create_access_token(user)
    return {"access_token": token}

@router.post("/api/auth/device")
def register_device(req: RegisterDeviceRequest, user=Depends(get_current_user)):
    """Register device token for push notifications."""
    
    with get_session() as session:
        db_user = session.get(User, user.user_db_id)
        if not db_user:
            raise HTTPException(status_code=404, detail="User not found")
        
        db_user.device_token = req.device_token
        db_user.device_platform = req.platform
        session.commit()
    
    return {"status": "ok", "message": "Device registered for notifications"}


@router.post("/api/auth/notifications/toggle")
def toggle_notifications(enabled: bool, user=Depends(get_current_user)):
    """Enable or disable push notifications."""
    from db.session import get_session
    from db.models import User
    
    with get_session() as session:
        db_user = session.get(User, user.user_db_id)
        if db_user:
            db_user.notifications_enabled = enabled
            session.commit()
    
    return {"status": "ok", "notifications_enabled": enabled}