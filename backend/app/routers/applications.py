from fastapi import APIRouter, Depends, status

from backend.app.dependencies.application import (
    get_application_service,
)
from backend.app.dependencies.current_user import (
    get_current_user,
)
from backend.app.models.user import User
from backend.app.schemas.application import (
    ApplicationCreate,
    ApplicationResponse,
    ApplicationStatusUpdate,
    EmployerApplicationCountResponse,
    EmployerApplicationResponse,
)
from backend.app.services.application import (
    ApplicationService,
)


router = APIRouter(
    prefix="/applications",
    tags=["Applications"],
)


# ============================================================
# Создание отклика
# ============================================================

@router.post(
    "/vacancy/{vacancy_id}",
    response_model=ApplicationResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_application(
    vacancy_id: int,
    data: ApplicationCreate,
    current_user: User = Depends(
        get_current_user,
    ),
    service: ApplicationService = Depends(
        get_application_service,
    ),
):
    return await service.create(
        vacancy_id,
        current_user,
        data,
    )


# ============================================================
# Мои отклики кандидата
# ============================================================

@router.get(
    "/my",
    response_model=list[ApplicationResponse],
)
async def get_my_applications(
    current_user: User = Depends(
        get_current_user,
    ),
    service: ApplicationService = Depends(
        get_application_service,
    ),
):
    return await service.get_my(
        current_user,
    )


# ============================================================
# Количество откликов работодателя
# ============================================================

@router.get(
    "/employer/my/count",
    response_model=EmployerApplicationCountResponse,
)
async def get_my_application_count(
    current_user: User = Depends(
        get_current_user,
    ),
    service: ApplicationService = Depends(
        get_application_service,
    ),
):
    total = await service.get_my_count(
        current_user,
    )

    return EmployerApplicationCountResponse(
        total=total,
    )


# ============================================================
# Отклики на конкретную вакансию
# ============================================================

@router.get(
    "/vacancy/{vacancy_id}",
    response_model=list[EmployerApplicationResponse],
)
async def get_vacancy_applications(
    vacancy_id: int,
    current_user: User = Depends(
        get_current_user,
    ),
    service: ApplicationService = Depends(
        get_application_service,
    ),
):
    return await service.get_by_vacancy(
        vacancy_id,
        current_user,
    )


# ============================================================
# Изменение статуса отклика
# ============================================================

@router.patch(
    "/{application_id}/status",
    response_model=EmployerApplicationResponse,
)
async def update_application_status(
    application_id: int,
    data: ApplicationStatusUpdate,
    current_user: User = Depends(
        get_current_user,
    ),
    service: ApplicationService = Depends(
        get_application_service,
    ),
):
    return await service.update_status(
        application_id,
        current_user,
        data,
    )