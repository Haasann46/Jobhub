from fastapi import APIRouter, Depends, status

from app.dependencies.vacancy import get_vacancy_service
from app.schemas.vacancy import (
    VacancyCreate,
    VacancyUpdate,
    VacancyResponse,
)
from app.services.vacancy import VacancyService
from app.dependencies.current_user import get_current_user
from app.models.user import User

router = APIRouter()


@router.get(
    "/",
    response_model=list[VacancyResponse],
)
async def get_vacancies(
    service: VacancyService = Depends(get_vacancy_service),
):
    return await service.get_all()

@router.post(
    "",
    response_model=VacancyResponse,
    status_code=201,
)
async def create_vacancy(
    data: VacancyCreate,
    current_user: User = Depends(get_current_user),
    service: VacancyService = Depends(get_vacancy_service),
):
    return await service.create(
        current_user,
        data,
    )

@router.get(
    "/my",
    response_model=list[VacancyResponse],
)
async def get_my_vacancies(
    current_user: User = Depends(get_current_user),
    service: VacancyService = Depends(get_vacancy_service),
):
    return await service.get_my(
        current_user,
    )

@router.put(
    "/{vacancy_id}",
    response_model=VacancyResponse,
)
async def update_vacancy(
    vacancy_id: int,
    data: VacancyUpdate,
    current_user: User = Depends(get_current_user),
    service: VacancyService = Depends(get_vacancy_service),
):
    return await service.update(
        vacancy_id,
        current_user,
        data,
    )

@router.delete(
    "/{vacancy_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_vacancy(
    vacancy_id: int,
    current_user: User = Depends(get_current_user),
    service: VacancyService = Depends(get_vacancy_service),
):
    await service.delete(
        vacancy_id,
        current_user,
    )