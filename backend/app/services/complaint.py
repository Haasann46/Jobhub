from fastapi import (
    HTTPException,
    status,
)

from backend.app.models.complaint import (
    Complaint,
)

from backend.app.models.enums import (
    ComplaintStatus,
    UserRole,
)

from backend.app.models.user import (
    User,
)

from backend.app.repositories.complaint import (
    ComplaintRepository,
)

from backend.app.repositories.vacancy import (
    VacancyRepository,
)

from backend.app.schemas.complaint import (
    ComplaintAdminUpdate,
    ComplaintCreate,
    ComplaintResponse,
)


class ComplaintService:

    def __init__(
        self,
        repository: ComplaintRepository,
    ):
        self.repository = repository


    @staticmethod
    def _to_response(
        complaint: Complaint,
    ) -> ComplaintResponse:

        return ComplaintResponse(
            id=complaint.id,

            reporter_id=complaint.reporter_id,

            vacancy_id=complaint.vacancy_id,

            reason=complaint.reason,

            description=complaint.description,

            status=complaint.status,

            admin_id=complaint.admin_id,

            admin_comment=complaint.admin_comment,

            created_at=complaint.created_at,

            updated_at=complaint.updated_at,
        )


    async def create(
        self,
        current_user: User,
        data: ComplaintCreate,
    ) -> ComplaintResponse:

        if current_user.role not in (
            UserRole.CANDIDATE,
            UserRole.EMPLOYER,
        ):

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "Only candidates and "
                    "employers can submit complaints."
                ),
            )


        vacancy_repository = VacancyRepository(
            self.repository.db,
        )


        vacancy = await vacancy_repository.get_by_id(
            data.vacancy_id,
        )


        if vacancy is None:

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Vacancy not found.",
            )


        if (
            vacancy.company is not None
            and vacancy.company.owner_id ==
            current_user.id
        ):

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "You cannot complain "
                    "about your own vacancy."
                ),
            )


        existing = (
            await self.repository
            .get_by_reporter_and_vacancy(
                reporter_id=current_user.id,
                vacancy_id=data.vacancy_id,
            )
        )


        if existing is not None:

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "You already have an active "
                    "complaint about this vacancy."
                ),
            )


        description = None

        if data.description is not None:

            description = (
                data.description
                .strip()
            )

            if not description:

                description = None


        complaint = Complaint(
            reporter_id=current_user.id,

            vacancy_id=data.vacancy_id,

            reason=data.reason,

            description=description,

            status=ComplaintStatus.PENDING,
        )


        complaint = (
            await self.repository.create(
                complaint,
            )
        )


        return self._to_response(
            complaint,
        )


    async def get_my(
        self,
        current_user: User,
    ) -> list[ComplaintResponse]:

        complaints = (
            await self.repository
            .get_by_reporter_id(
                current_user.id,
            )
        )


        return [
            self._to_response(
                complaint,
            )
            for complaint in complaints
        ]


    async def get_by_id(
        self,
        complaint_id: int,
        current_user: User,
    ) -> ComplaintResponse:

        complaint = (
            await self.repository
            .get_by_id(
                complaint_id,
            )
        )


        if complaint is None:

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Complaint not found.",
            )


        if (
            current_user.role !=
            UserRole.ADMIN
            and complaint.reporter_id !=
            current_user.id
        ):

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "You cannot access "
                    "this complaint."
                ),
            )


        return self._to_response(
            complaint,
        )


    async def get_all_for_admin(
        self,
        current_user: User,
    ) -> list[ComplaintResponse]:

        if (
            current_user.role !=
            UserRole.ADMIN
        ):

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required.",
            )


        complaints = (
            await self.repository
            .get_all()
        )


        return [
            self._to_response(
                complaint,
            )
            for complaint in complaints
        ]


    async def update_for_admin(
        self,
        complaint_id: int,
        current_user: User,
        data: ComplaintAdminUpdate,
    ) -> ComplaintResponse:

        if (
            current_user.role !=
            UserRole.ADMIN
        ):

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required.",
            )


        complaint = (
            await self.repository
            .get_by_id(
                complaint_id,
            )
        )


        if complaint is None:

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Complaint not found.",
            )


        complaint.status = data.status

        complaint.admin_comment = (
            data.admin_comment.strip()
            if data.admin_comment
            else None
        )

        complaint.admin_id = (
            current_user.id
        )


        complaint = (
            await self.repository
            .update(
                complaint,
            )
        )


        return self._to_response(
            complaint,
        )