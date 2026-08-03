from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from .config import settings

# Движок базы данных (engine) — он отвечает за физическое соединение с PostgreSQL
engine = create_async_engine(
    settings.database_url,
    echo=True, # Включает вывод всех SQL-запросов в консоль (полезно при отладке)
)

# Фабрика сессий. Сессия нужна для выполнения запросов (добавление, поиск, удаление)
async_session_maker = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False # Предотвращает ошибку, когда данные пропадают после коммита
)

# Базовый класс для всех моделей БД. От него будут наследоваться таблицы (User, Company и т.д.)
class Base(DeclarativeBase):
    pass

# Эта функция (dependency) будет выдавать новую сессию БД для каждого запроса к API
async def get_db():
    async with async_session_maker() as session:
        yield session # Отдаем сессию, а когда запрос завершится — сессия автоматически закроется