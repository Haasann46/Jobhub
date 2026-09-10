from fastapi import APIRouter, Depends, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.database import get_db
from backend.app.dependencies.current_user import get_current_user
from backend.app.dependencies.resume import get_resume_service
from backend.app.models.user import User
from backend.app.repositories.profile import ProfileRepository
from backend.app.repositories.resume import ResumeRepository
from backend.app.schemas.resume import ResumeCreate, ResumeResponse, ResumeUpdate
from backend.app.services.resume import ResumeService
from backend.app.services.resume_pdf import build_resume_pdf

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
    current_user: User = Depends(get_current_user),
    service: ResumeService = Depends(get_resume_service),
):
    return await service.create(current_user, data)


@router.get(
    "/my",
    response_model=list[ResumeResponse],
)
async def get_my_resumes(
    current_user: User = Depends(get_current_user),
    service: ResumeService = Depends(get_resume_service),
):
    return await service.get_my(current_user)


@router.get(
    "/{resume_id}/pdf",
)
async def download_resume_pdf(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    resume_repository = ResumeRepository(db)
    resume = await resume_repository.get_by_id(resume_id)

    if resume is None:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found.",
        )

    if resume.user_id != current_user.id:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You cannot download this resume.",
        )

    profile = await ProfileRepository(db).get_by_user_id(
        current_user.id,
    )

    pdf = build_resume_pdf(
        resume=resume,
        profile=profile,
        user=current_user,
    )

    return StreamingResponse(
        pdf,
        media_type="application/pdf",
        headers={
            "Content-Disposition": (
                f'attachment; filename="resume-{resume.id}.pdf"'
            ),
        },
    )


@router.get(
    "/{resume_id}",
    response_model=ResumeResponse,
)
async def get_resume(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    service: ResumeService = Depends(get_resume_service),
):
    return await service.get_by_id(resume_id, current_user)


@router.patch(
    "/{resume_id}",
    response_model=ResumeResponse,
)
async def update_resume(
    resume_id: int,
    data: ResumeUpdate,
    current_user: User = Depends(get_current_user),
    service: ResumeService = Depends(get_resume_service),
):
    return await service.update(resume_id, current_user, data)


@router.delete(
    "/{resume_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_resume(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    service: ResumeService = Depends(get_resume_service),
):
    await service.delete(resume_id, current_user)