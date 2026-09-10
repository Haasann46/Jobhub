from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from sqlalchemy.orm import DeclarativeBase

from backend.app.config import settings


# ============================================================================
# Database Engine
# ============================================================================

engine = create_async_engine(
    settings.DATABASE_URL,

    echo=True,

    pool_pre_ping=True,

    pool_recycle=300,
)


# ============================================================================
# Session Factory
# ============================================================================

async_session_maker = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


# ============================================================================
# Base
# ============================================================================

class Base(DeclarativeBase):
    pass


# ============================================================================
# Database Dependency
# ============================================================================

async def get_db():

    async with async_session_maker() as session:

        try:

            yield session

        except Exception:

            await session.rollback()

            raise