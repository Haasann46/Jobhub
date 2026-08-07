from fastapi import (
    APIRouter,
    Depends,
    status,
)

from backend.app.dependencies.current_user import get_current_user
from backend.app.dependencies.resume import get_resume_service
from backend.app.models.user import User
from backend.app.schemas.resume import (
    ResumeCreate,
    ResumeResponse,
    ResumeUpdate,
)
from backend.app.services.resume import ResumeService

router = APIRouter(
    tags=["Resumes"],
)


@router.post(
    "",
    response_model=ResumeResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_resume(
    data: ResumeCreate,
    current_user: User = Depends(
        get_current_user,
    ),
    service: ResumeService = Depends(
        get_resume_service,
    ),
):
    return await service.create(
        current_user,
        data,
    )


@router.get(
    "/my",
    response_model=list[ResumeResponse],
)
async def get_my_resumes(
    current_user: User = Depends(
        get_current_user,
    ),
    service: ResumeService = Depends(
        get_resume_service,
    ),
):
    return await service.get_my(
        current_user,
    )


@router.get(
    "/{resume_id}",
    response_model=ResumeResponse,
)
async def get_resume(
    resume_id: int,
    current_user: User = Depends(
        get_current_user,
    ),
    service: ResumeService = Depends(
        get_resume_service,
    ),
):
    return await service.get_by_id(
        resume_id,
        current_user,
    )


@router.patch(
    "/{resume_id}",
    response_model=ResumeResponse,
)
async def update_resume(
    resume_id: int,
    data: ResumeUpdate,
    current_user: User = Depends(
        get_current_user,
    ),
    service: ResumeService = Depends(
        get_resume_service,
    ),
):
    return await service.update(
        resume_id,
        current_user,
        data,
    )


@router.delete(
    "/{resume_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_resume(
    resume_id: int,
    current_user: User = Depends(
        get_current_user,
    ),
    service: ResumeService = Depends(
        get_resume_service,
    ),
):
    await service.delete(
        resume_id,
        current_user,
    )