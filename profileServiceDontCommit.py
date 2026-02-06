# services/profile_service.py

from sqlmodel import select
from db.session import get_session
from db.models import User
from typing import Optional
import logging

logger = logging.getLogger(__name__)


def get_profile(user_id: str) -> Optional[User]:
    """
    Get user profile by user_id (which is the username).
    """
    with get_session() as session:
        stmt = select(User).where(User.username == user_id)
        user = session.exec(stmt).first()
        return user


def update_profile_name(user_id: str, name: str) -> Optional[User]:
    """
    Update the user's display name.
    """
    with get_session() as session:
        stmt = select(User).where(User.username == user_id)
        user = session.exec(stmt).first()
        if not user:
            return None
        user.name = name
        session.add(user)
        session.commit()
        session.refresh(user)
        logger.info(f"Updated profile name for user {user_id}")
        return user
