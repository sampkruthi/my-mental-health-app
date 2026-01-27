
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional, Literal
from pydantic import BaseModel, Field, ConfigDict, field_validator
from services.reminder_service import create_reminder, list_reminders, delete_reminder
from auth import get_current_user

router = APIRouter(
    prefix="/api/reminders",
    tags=["reminders"],
    dependencies=[Depends(get_current_user)]
)


def convert_to_24h(hour: int, period: str) -> int:
    """Convert 12-hour format to 24-hour format."""
    period = period.upper()
    if period == "AM":
        return 0 if hour == 12 else hour
    else:  # PM
        return hour if hour == 12 else hour + 12


def convert_to_12h(hour: int) -> tuple[int, str]:
    """Convert 24-hour format to 12-hour format with AM/PM."""
    if hour == 0:
        return 12, "AM"
    elif hour < 12:
        return hour, "AM"
    elif hour == 12:
        return 12, "PM"
    else:
        return hour - 12, "PM"


class ReminderRequest(BaseModel):
    type: str = Field(..., pattern="^(meditation|journaling|hydration|activity)$")
    hour: int = Field(..., ge=1, le=12)  # 12-hour format
    minute: int = Field(..., ge=0, le=59)
    period: Literal["AM", "PM", "am", "pm"]
    message: str


class ReminderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    type: str
    hour: int          # Returns 12-hour format
    minute: int
    period: str        # "AM" or "PM"
    message: str

@router.post("/", response_model=ReminderResponse, status_code=status.HTTP_201_CREATED)
def api_create_reminder(req: ReminderRequest, user=Depends(get_current_user)):
    # Convert to 24-hour format for storage
    hour_24 = convert_to_24h(req.hour, req.period)
    rem = create_reminder(user.user_id, req.type, hour_24, req.minute, req.message)

    # Convert back to 12-hour for response
    hour_12, period = convert_to_12h(rem.hour)
    return ReminderResponse(
        id=rem.id,
        type=rem.type,
        hour=hour_12,
        minute=rem.minute,
        period=period,
        message=rem.message
    )

@router.get("/", response_model=List[ReminderResponse])
def api_list_reminders(user=Depends(get_current_user)):
    rems = list_reminders(user.user_id)
    responses = []
    for r in rems:
        hour_12, period = convert_to_12h(r.hour)
        responses.append(ReminderResponse(
            id=r.id,
            type=r.type,
            hour=hour_12,
            minute=r.minute,
            period=period,
            message=r.message
        ))
    return responses

@router.delete("/{reminder_id}", status_code=status.HTTP_204_NO_CONTENT)
def api_delete_reminder(reminder_id: int, user=Depends(get_current_user)):
    success = delete_reminder(reminder_id, user.user_id)
    if not success:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Reminder not found")