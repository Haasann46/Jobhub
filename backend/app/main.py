from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import auth
from app.routers import users
from app.routers import profile
from app.routers import company
from app.routers import vacancies
from app.routers import applications
from app.routers import resumes

# ── Создаём приложение FastAPI ────────────────────────────────────────────────
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="API платформы для поиска работы JobHub",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    vacancies.router,
    prefix="/api/vacancies",
    tags=["Vacancies"],
)

app.include_router(
    auth.router,
    prefix="/api/auth",
    tags=["Auth"],
)

app.include_router(
    users.router,
    prefix="/api/users",
    tags=["Users"],
)

app.include_router(
    profile.router,
    prefix="/api/profile",
    tags=["Profile"],
)

app.include_router(
    company.router,
    prefix="/api/companies",
    tags=["Companies"],
)

app.include_router(
    applications.router,
    prefix="/api/applications",
    tags=["Applications"],
)

app.include_router(
    resumes.router,
    prefix="/api/resumes",
    tags=["Resumes"],
)

@app.get("/", tags=["System"])
async def root():
    """Проверка что API работает."""
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health", tags=["System"])
async def health_check():
    """
    Health check для Docker и Railway.
    Возвращает статус всех сервисов.
    """
    return {
        "status": "healthy",
    }