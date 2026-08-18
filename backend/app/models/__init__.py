from backend.app.database import Base

from backend.app.models.base import BaseModel
from backend.app.models.company import Company
from backend.app.models.profile import Profile
from backend.app.models.user import User
from backend.app.models.vacancy import Vacancy
from backend.app.models.application import Application
from backend.app.models.resume import Resume
from backend.app.models.favorite import Favorite
from backend.app.models.technology import Technology
from backend.app.models.conversation import Conversation
from backend.app.models.message import Message
from backend.app.models.notification import Notification


# Регистрируем association table
from backend.app.models.association_tables import vacancy_technologies


__all__ = [
    "Base",
    "BaseModel",
    "User",
    "Profile",
    "Company",
    "Vacancy",
    "Technology",
    "Application",
    "Resume",
    "Favorite",
    "vacancy_technologies",
    "Conversation",
    "Message",
    "Notification",
]