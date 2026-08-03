from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import vacancies
from app.routers import auth
from app.routers import users
from app.routers import profile
from app.routers import company

# ── Создаём приложение FastAPI ────────────────────────────────────────────────
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="API платформы для поиска работы JobHub",
    # Документация доступна по адресу: http://localhost:8000/docs
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS: разрешаем фронтенду обращаться к API ───────────────────────────────
# Без этого браузер заблокирует запросы с localhost:3000 к localhost:8000
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,      # Разрешаем передавать куки
    allow_methods=["*"],         # GET, POST, PUT, DELETE, PATCH...
    allow_headers=["*"],         # Authorization, Content-Type...
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
    return {"status": "healthy"}
