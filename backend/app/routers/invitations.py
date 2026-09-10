from fastapi import (
    APIRouter,
    Depends,
    status,
)

from backend.app.dependencies.current_user import (
    get_current_user,
)
from backend.app.dependencies.invitation import (
    get_invitation_service,
)
from backend.app.models.user import User
from backend.app.schemas.invitation import (
    InvitationCreate,
    InvitationResponse,
)
from backend.app.services.invitation import (
    InvitationService,
)


router = APIRouter(
    prefix="/invitations",
    tags=["Invitations"],
)


# ============================================================
# Создать приглашение
# Employer → Candidate
# ============================================================

@router.post(
    "",
    response_model=InvitationResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_invitation(
    data: InvitationCreate,
    current_user: User = Depends(
        get_current_user,
    ),
    service: InvitationService = Depends(
        get_invitation_service,
    ),
):

    return await service.create(
        current_user,
        data,
    )


# ============================================================
# Мои приглашения
#
# Candidate → received
# Employer  → sent
# ============================================================

@router.get(
    "/my",
    response_model=list[InvitationResponse],
)
async def get_my_invitations(
    current_user: User = Depends(
        get_current_user,
    ),
    service: InvitationService = Depends(
        get_invitation_service,
    ),
):

    return await service.get_my(
        current_user,
    )


# ============================================================
# Конкретное приглашение
# ============================================================

@router.get(
    "/{invitation_id}",
    response_model=InvitationResponse,
)
async def get_invitation(
    invitation_id: int,
    current_user: User = Depends(
        get_current_user,
    ),
    service: InvitationService = Depends(
        get_invitation_service,
    ),
):

    return await service.get_by_id(
        invitation_id,
        current_user,
    )


# ============================================================
# Принять приглашение
# ============================================================

@router.patch(
    "/{invitation_id}/accept",
    response_model=InvitationResponse,
)
async def accept_invitation(
    invitation_id: int,
    current_user: User = Depends(
        get_current_user,
    ),
    service: InvitationService = Depends(
        get_invitation_service,
    ),
):

    return await service.accept(
        invitation_id,
        current_user,
    )


# ============================================================
# Отклонить приглашение
# ============================================================

@router.patch(
    "/{invitation_id}/decline",
    response_model=InvitationResponse,
)
async def decline_invitation(
    invitation_id: int,
    current_user: User = Depends(
        get_current_user,
    ),
    service: InvitationService = Depends(
        get_invitation_service,
    ),
):

    return await service.decline(
        invitation_id,
        current_user,
    )