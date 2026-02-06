# routes/profile.py

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict
from typing import Optional
from services.profile_service import get_profile, update_profile_name
from auth import get_current_user

router = APIRouter(
    prefix="/api/profile",
    tags=["profile"],
    dependencies=[Depends(get_current_user)]
)


class ProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    name: Optional[str]
    username: str  # Same as email address


class ProfileUpdateRequest(BaseModel):
    name: str


@router.get("/", response_model=ProfileResponse)
def api_get_profile(user=Depends(get_current_user)):
    """Get the current user's profile."""
    profile = get_profile(user.user_id)
    if not profile:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Profile not found")
    return ProfileResponse(
        name=profile.name,
        username=profile.username
    )


@router.put("/", response_model=ProfileResponse)
def api_update_profile(req: ProfileUpdateRequest, user=Depends(get_current_user)):
    """Update the current user's profile."""
    profile = update_profile_name(user.user_id, req.name)
    if not profile:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Profile not found")
    return ProfileResponse(
        name=profile.name,
        username=profile.username
    )
