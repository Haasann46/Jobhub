# JobHub 🚀

> Платформа для поиска работы — полный стек на Python + Next.js

**Живой сайт**: _будет добавлен после деплоя_
**API документация**: `http://localhost:8000/docs`

---

## Стек технологий

| Слой | Технологии |
|------|-----------|
| **Backend** | Python, FastAPI, SQLAlchemy, Alembic, PostgreSQL, Redis |
| **Frontend** | TypeScript, Next.js 14, Tailwind CSS, shadcn/ui |
| **Безопасность** | JWT, BCrypt, Role-based access |
| **Файлы** | Cloudinary |
| **Email** | SendGrid |
| **Деплой** | Vercel (Frontend) + Railway (Backend) |
| **CI/CD** | GitHub Actions |

---

## Быстрый старт (локальная разработка)

### 1. Клонируем репозиторий

```bash
git clone https://github.com/ВАШ_НИК/jobhub.git
cd jobhub
```

### 2. Запускаем PostgreSQL и Redis через Docker

```bash
docker-compose up -d
```

> Это запустит PostgreSQL на порту 5432 и Redis на порту 6379.
> Также откроется pgAdmin на http://localhost:5050 (admin@jobhub.com / admin)

### 3. Настраиваем Backend

```bash
cd backend

# Создаём виртуальное окружение
python -m venv venv
venv\Scripts\activate      # Windows
# source venv/bin/activate  # Mac/Linux

# Устанавливаем зависимости
pip install -r requirements.txt

# Создаём .env файл из шаблона
copy .env.example .env
# Заполняем .env своими данными (SECRET_KEY обязателен!)

# Создаём таблицы в БД
alembic upgrade head

# Запускаем сервер
uvicorn app.main:app --reload --port 8000
```

API доступно на: http://localhost:8000
Документация: http://localhost:8000/docs

### 4. Настраиваем Frontend

```bash
cd frontend_old

# Устанавливаем зависимости
npm install

# Создаём .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Запускаем
npm run dev
```

Сайт доступен на: http://localhost:3000

---

## Структура проекта

```
jobhub/
├── backend/               # FastAPI приложение
│   ├── app/
│   │   ├── models/        # SQLAlchemy модели (таблицы БД)
│   │   ├── schemas/       # Pydantic схемы (валидация данных)
│   │   ├── routers/       # API маршруты
│   │   ├── services/      # Бизнес-логика
│   │   ├── dependencies/  # FastAPI зависимости
│   │   ├── utils/         # Вспомогательные функции
│   │   ├── config.py      # Настройки из .env
│   │   ├── database.py    # Подключение к PostgreSQL
│   │   └── main.py        # Точка входа
│   ├── alembic/           # Миграции БД
│   └── requirements.txt
│
├── frontend/              # Next.js приложение
│   └── src/
│       ├── app/           # Страницы (App Router)
│       ├── components/    # React компоненты
│       ├── services/      # API клиент (Axios)
│       └── store/         # Zustand стор
│
├── docker-compose.yml     # Локальное окружение
└── README.md
```

---

## API Endpoints

| Метод | URL | Описание |
|-------|-----|---------|
| `GET` | `/docs` | Swagger документация |
| `GET` | `/health` | Health check |
| `POST` | `/api/auth/register` | Регистрация |
| `POST` | `/api/auth/login` | Вход |
| `GET` | `/api/vacancies` | Список вакансий |
| ... | ... | _в разработке_ |

---

## Функционал

- [x] Структура проекта
- [x] Docker Compose (PostgreSQL + Redis)
- [x] Модели базы данных
- [ ] JWT авторизация
- [ ] Профили кандидатов и работодателей
- [ ] Вакансии с поиском и фильтрами
- [ ] Система откликов и резюме
- [ ] Real-time чат (WebSocket)
- [ ] Уведомления
- [ ] Админ-панель
- [ ] Деплой

---

_Проект в активной разработке_ 🚧
