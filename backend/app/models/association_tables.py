from sqlalchemy import Column, ForeignKey, Table

from backend.app.database import Base


vacancy_technologies = Table(
    "vacancy_technologies",
    Base.metadata,

    Column(
        "vacancy_id",
        ForeignKey(
            "vacancies.id",
            ondelete="CASCADE",
        ),
        primary_key=True,
    ),

    Column(
        "technology_id",
        ForeignKey(
            "technologies.id",
            ondelete="CASCADE",
        ),
        primary_key=True,
    ),
)