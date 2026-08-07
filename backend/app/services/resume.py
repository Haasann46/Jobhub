from fastapi import HTTPException, status

from backend.app.models.enums import UserRole
from backend.app.models.resume import Resume
from backend.app.models.user import User
from backend.app.repositories.resume import ResumeRepository
from backend.app.schemas.resume import (
    ResumeCreate,
    ResumeResponse,
    ResumeUpdate,
)


class ResumeService:
    def __init__(
        self,
        repository: ResumeRepository,
    ):
        self.repository = repository

    async def create(
        self,
        current_user: User,
        data: ResumeCreate,
    ) -> ResumeResponse:

        if current_user.role != UserRole.CANDIDATE:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only candidates can create resumes.",
            )

        resume = Resume(
            user_id=current_user.id,
            **data.model_dump(),
        )

        resume = await self.repository.create(
            resume,
        )

        return ResumeResponse.model_validate(
            resume,
        )

    async def get_my(
        self,
        current_user: User,
    ) -> list[ResumeResponse]:

        if current_user.role != UserRole.CANDIDATE:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only candidates can view resumes.",
            )

        resumes = await self.repository.get_by_user_id(
            current_user.id,
        )

        return [
            ResumeResponse.model_validate(
                resume,
            )
            for resume in resumes
        ]

    async def get_by_id(
        self,
        resume_id: int,
        current_user: User,
    ) -> ResumeResponse:

        resume = await self.repository.get_by_id(
            resume_id,
        )

        if resume is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Resume not found.",
            )

        if resume.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You cannot view this resume.",
            )

        return ResumeResponse.model_validate(
            resume,
        )

    async def update(
        self,
        resume_id: int,
        current_user: User,
        data: ResumeUpdate,
    ) -> ResumeResponse:

        if current_user.role != UserRole.CANDIDATE:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only candidates can update resumes.",
            )

        resume = await self.repository.get_by_id(
            resume_id,
        )

        if resume is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Resume not found.",
            )

        if resume.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You cannot edit this resume.",
            )

        for field, value in data.model_dump(
            exclude_unset=True,
        ).items():
            setattr(
                resume,
                field,
                value,
            )

        resume = await self.repository.update(
            resume,
        )

        return ResumeResponse.model_validate(
            resume,
        )

    async def delete(
        self,
        resume_id: int,
        current_user: User,
    ) -> None:

        if current_user.role != UserRole.CANDIDATE:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only candidates can delete resumes.",
            )

        resume = await self.repository.get_by_id(
            resume_id,
        )

        if resume is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Resume not found.",
            )

        if resume.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You cannot delete this resume.",
            )

        await self.repository.delete(
            resume,
        )