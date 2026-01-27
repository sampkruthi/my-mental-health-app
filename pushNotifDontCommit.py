# services/push_notification_service.py

import os
import json
import logging
import firebase_admin
from firebase_admin import credentials, messaging
from typing import Optional

logger = logging.getLogger(__name__)

_firebase_initialized = False


def initialize_firebase():
    """Initialize Firebase Admin SDK."""
    global _firebase_initialized
    
    if _firebase_initialized:
        return True
    
    try:
        service_account_json = os.getenv("FIREBASE_SERVICE_ACCOUNT")
        
        if not service_account_json:
            logger.warning("FIREBASE_SERVICE_ACCOUNT not set - push notifications disabled")
            return False
        
        service_account_dict = json.loads(service_account_json)
        cred = credentials.Certificate(service_account_dict)
        firebase_admin.initialize_app(cred)
        
        _firebase_initialized = True
        logger.info("Firebase initialized successfully")
        return True
        
    except Exception as e:
        logger.error(f"Failed to initialize Firebase: {e}")
        return False


def send_push_notification(
    device_token: str,
    title: str,
    body: str,
    data: Optional[dict] = None
) -> bool:
    """Send a push notification to a single device."""
    
    if not initialize_firebase():
        return False
    
    if not device_token:
        logger.warning("No device token provided")
        return False
    
    try:
        message = messaging.Message(
            notification=messaging.Notification(
                title=title,
                body=body,
            ),
            data=data or {},
            token=device_token,
        )
        
        response = messaging.send(message)
        logger.info(f"Notification sent: {response}")
        return True
        
    except messaging.UnregisteredError:
        logger.warning(f"Device token invalid/unregistered")
        return False
        
    except Exception as e:
        logger.error(f"Failed to send notification: {e}")
        return False


def send_push_to_user(user_id: str, title: str, body: str, data: Optional[dict] = None) -> bool:
    """Send push notification to a user by looking up their device token."""
    from db.session import get_session
    from db.models import User
    from sqlmodel import select
    
    with get_session() as session:
        user = session.exec(
            select(User).where(User.user_id == user_id)
        ).first()
        
        if not user:
            logger.warning(f"User not found: {user_id}")
            return False
        
        if not user.device_token:
            logger.warning(f"No device token for user: {user_id}")
            return False
        
        if not user.notifications_enabled:
            logger.info(f"Notifications disabled for user: {user_id}")
            return False
        
        return send_push_notification(user.device_token, title, body, data)