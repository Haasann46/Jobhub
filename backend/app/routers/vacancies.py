from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from backend.app.dependencies.current_user import get_current_user
from backend.app.dependencies.search import get_search_params
from backend.app.dependencies.vacancy import get_vacancy_service
from backend.app.models.user import User
from backend.app.schemas.vacancy import (
    TechnologyResponse,
    VacancyCreate,
    VacancyListResponse,
    VacancyResponse,
    VacancySearchParams,
    VacancyUpdate,
)
from backend.app.services.vacancy import VacancyService


router = APIRouter()


# ============================================================
# Public vacancy list
# ============================================================

@router.get(
    "",
    response_model=VacancyListResponse,
)
async def get_vacancies(
    params: VacancySearchParams = Depends(
        get_search_params,
    ),
    service: VacancyService = Depends(
        get_vacancy_service,
    ),
):
    return await service.search(
        **params.model_dump(),
    )


# ============================================================
# Create vacancy
# ============================================================

@router.post(
    "",
    response_model=VacancyResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_vacancy(
    data: VacancyCreate,
    current_user: User = Depends(
        get_current_user,
    ),
    service: VacancyService = Depends(
        get_vacancy_service,
    ),
):
    return await service.create(
        current_user,
        data,
    )


# ============================================================
# My vacancies
# ============================================================

@router.get(
    "/my",
    response_model=list[VacancyResponse],
)
async def get_my_vacancies(
    current_user: User = Depends(
        get_current_user,
    ),
    service: VacancyService = Depends(
        get_vacancy_service,
    ),
):
    return await service.get_my(
        current_user,
    )


# ============================================================
# Available technologies
#
# IMPORTANT:
# This route must be before /{vacancy_id}
# ============================================================

@router.get(
    "/technologies",
    response_model=list[TechnologyResponse],
)
async def get_vacancy_technologies(
    service: VacancyService = Depends(
        get_vacancy_service,
    ),
):
    return await service.get_technologies()


# ============================================================
# Get vacancy by ID
# ============================================================

@router.get(
    "/{vacancy_id}",
    response_model=VacancyResponse,
)
async def get_vacancy(
    vacancy_id: int,
    service: VacancyService = Depends(
        get_vacancy_service,
    ),
):

    vacancy = await service.get_by_id(
        vacancy_id,
    )


    if vacancy is None:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vacancy not found.",
        )


    return vacancy


# ============================================================
# Update vacancy
# ============================================================

@router.put(
    "/{vacancy_id}",
    response_model=VacancyResponse,
)
async def update_vacancy(
    vacancy_id: int,
    data: VacancyUpdate,
    current_user: User = Depends(
        get_current_user,
    ),
    service: VacancyService = Depends(
        get_vacancy_service,
    ),
):
    return await service.update(
        vacancy_id,
        current_user,
        data,
    )


# ============================================================
# Delete vacancy
# ============================================================

@router.delete(
    "/{vacancy_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_vacancy(
    vacancy_id: int,
    current_user: User = Depends(
        get_current_user,
    ),
    service: VacancyService = Depends(
        get_vacancy_service,
    ),
):
    await service.delete(
        vacancy_id,
        current_user,
    )