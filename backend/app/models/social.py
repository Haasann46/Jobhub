"""
Модели для откликов, резюме, чата, уведомлений, избранного, жалоб.
"""
import enum
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Boolean,
    ForeignKey, Enum, DateTime, Table
)
from sqlalchemy.orm import relationship
from app.database import Base
from backend.app.models.base import TimestampMixin

# ── Таблица связи conversation ↔ участники (многие ко многим) ────────────────
conversation_participants = Table(
    "conversation_participants",
    Base.metadata,
    Column("conversation_id", Integer, ForeignKey("conversations.id"), primary_key=True),
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
)


class ApplicationStatus(str, enum.Enum):
    """Статус отклика."""
    PENDING = "PENDING"       # На рассмотрении
    ACCEPTED = "ACCEPTED"     # Принят
    REJECTED = "REJECTED"     # Отклонён
    INVITED = "INVITED"       # Приглашён на интервью


class FavoriteType(str, enum.Enum):
    """Тип избранного."""
    VACANCY = "VACANCY"       # Кандидат сохранил вакансию
    CANDIDATE = "CANDIDATE"   # Работодатель сохранил кандидата


class ComplaintTargetType(str, enum.Enum):
    """На что подана жалоба."""
    VACANCY = "VACANCY"
    COMPANY = "COMPANY"
    USER = "USER"


class NotificationType(str, enum.Enum):
    """Типы уведомлений."""
    NEW_APPLICATION = "NEW_APPLICATION"       # Новый отклик
    APPLICATION_STATUS = "APPLICATION_STATUS" # Изменился статус отклика
    NEW_MESSAGE = "NEW_MESSAGE"               # Новое сообщение
    INVITATION = "INVITATION"                 # Приглашение на интервью
    NEW_VACANCY = "NEW_VACANCY"               # Новая вакансия по подписке


# ─────────────────────────────────────────────────────────────────────────────

class Resume(Base, TimestampMixin):
    """Таблица resumes — PDF резюме кандидатов."""
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidate_profiles.id"), nullable=False)

    title = Column(String(255), nullable=False)         # Название: "Backend Developer CV"
    file_url = Column(String(500), nullable=False)      # Cloudinary URL на PDF
    is_primary = Column(Boolean, default=False)         # Основное резюме

    candidate = relationship("CandidateProfile", back_populates="resumes")
    applications = relationship("Application", back_populates="resume")

    def __repr__(self):
        return f"<Resume id={self.id} title={self.title}>"


class Application(Base, TimestampMixin):
    """Таблица applications — отклики кандидатов на вакансии."""
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    vacancy_id = Column(Integer, ForeignKey("vacancies.id"), nullable=False)
    candidate_id = Column(Integer, ForeignKey("candidate_profiles.id"), nullable=False)
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=True)

    cover_letter = Column(Text, nullable=True)          # Сопроводительное письмо
    status = Column(Enum(ApplicationStatus), default=ApplicationStatus.PENDING)

    vacancy = relationship("Vacancy", back_populates="applications")
    candidate = relationship("CandidateProfile", back_populates="applications")
    resume = relationship("Resume", back_populates="applications")

    def __repr__(self):
        return f"<Application vacancy={self.vacancy_id} candidate={self.candidate_id}>"


class Conversation(Base):
    """Таблица conversations — диалоги между пользователями."""
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Участники диалога (обычно 2: кандидат + работодатель)
    participants = relationship(
        "User",
        secondary=conversation_participants,
    )
    messages = relationship(
        "Message",
        back_populates="conversation",
        cascade="all, delete-orphan",
        order_by="Message.created_at",
    )

    def __repr__(self):
        return f"<Conversation id={self.id}>"


class Message(Base):
    """Таблица messages — сообщения в диалогах."""
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=False)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    content = Column(Text, nullable=True)               # Текст сообщения
    file_url = Column(String(500), nullable=True)       # Вложение (Cloudinary)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    conversation = relationship("Conversation", back_populates="messages")
    sender = relationship("User", back_populates="sent_messages", foreign_keys=[sender_id])

    def __repr__(self):
        return f"<Message id={self.id} sender={self.sender_id}>"


class Notification(Base):
    """Таблица notifications — уведомления пользователей."""
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    type = Column(Enum(NotificationType), nullable=False)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=True)
    link = Column(String(500), nullable=True)       # Куда ведёт уведомление
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")

    def __repr__(self):
        return f"<Notification id={self.id} type={self.type}>"


class Favorite(Base):
    """Таблица favorites — избранные вакансии и кандидаты."""
    __tablename__ = "favorites"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(Enum(FavoriteType), nullable=False)

    # Только одно из полей заполнено (в зависимости от type)
    vacancy_id = Column(Integer, ForeignKey("vacancies.id"), nullable=True)
    candidate_id = Column(Integer, ForeignKey("candidate_profiles.id"), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="favorites")
    vacancy = relationship("Vacancy", back_populates="favorites")
    company = relationship("Company", back_populates="favorites",
                           foreign_keys=[candidate_id],
                           primaryjoin="Favorite.candidate_id == CandidateProfile.id",
                           viewonly=True)

    def __repr__(self):
        return f"<Favorite user={self.user_id} type={self.type}>"


class Complaint(Base, TimestampMixin):
    """Таблица complaints — жалобы пользователей."""
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    reporter_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    target_type = Column(Enum(ComplaintTargetType), nullable=False)
    target_id = Column(Integer, nullable=False)   # ID вакансии/компании/пользователя
    reason = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    is_resolved = Column(Boolean, default=False)

    reporter = relationship("User", back_populates="complaints", foreign_keys=[reporter_id])
    vacancy = relationship(
        "Vacancy",
        back_populates="complaints",
        foreign_keys=[target_id],
        primaryjoin="and_(Complaint.target_id == Vacancy.id, "
                    "Complaint.target_type == 'VACANCY')",
        viewonly=True,
    )

    def __repr__(self):
        return f"<Complaint reporter={self.reporter_id} type={self.target_type}>"
