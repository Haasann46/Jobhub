from fastapi import (
    Depends,
)

from sqlalchemy.ext.asyncio import (
    AsyncSession,
)

from backend.app.database import (
    get_db,
)

from backend.app.repositories.complaint import (
    ComplaintRepository,
)

from backend.app.services.complaint import (
    ComplaintService,
)


def get_complaint_service(
    db: AsyncSession = Depends(
        get_db,
    ),
) -> ComplaintService:

    repository = ComplaintRepository(
        db,
    )

    return ComplaintService(
        repository,
    )