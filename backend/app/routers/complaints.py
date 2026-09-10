from fastapi import (
    APIRouter,
    Depends,
    status,
)

from backend.app.dependencies.complaint import (
    get_complaint_service,
)

from backend.app.dependencies.current_user import (
    get_current_user,
)

from backend.app.models.user import (
    User,
)

from backend.app.schemas.complaint import (
    ComplaintAdminUpdate,
    ComplaintCreate,
    ComplaintResponse,
)

from backend.app.services.complaint import (
    ComplaintService,
)


router = APIRouter()


# ============================================================
# Create complaint
# ============================================================

@router.post(
    "",
    response_model=ComplaintResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_complaint(
    data: ComplaintCreate,
    current_user: User = Depends(
        get_current_user,
    ),
    service: ComplaintService = Depends(
        get_complaint_service,
    ),
):

    return await service.create(
        current_user,
        data,
    )


# ============================================================
# My complaints
# ============================================================

@router.get(
    "/my",
    response_model=list[ComplaintResponse],
)
async def get_my_complaints(
    current_user: User = Depends(
        get_current_user,
    ),
    service: ComplaintService = Depends(
        get_complaint_service,
    ),
):

    return await service.get_my(
        current_user,
    )


# ============================================================
# Admin complaints
# IMPORTANT:
# This route must be before /{complaint_id}
# ============================================================

@router.get(
    "/admin",
    response_model=list[ComplaintResponse],
)
async def get_admin_complaints(
    current_user: User = Depends(
        get_current_user,
    ),
    service: ComplaintService = Depends(
        get_complaint_service,
    ),
):

    return await service.get_all_for_admin(
        current_user,
    )


# ============================================================
# Admin update
# ============================================================

@router.patch(
    "/admin/{complaint_id}",
    response_model=ComplaintResponse,
)
async def update_admin_complaint(
    complaint_id: int,
    data: ComplaintAdminUpdate,
    current_user: User = Depends(
        get_current_user,
    ),
    service: ComplaintService = Depends(
        get_complaint_service,
    ),
):

    return await service.update_for_admin(
        complaint_id,
        current_user,
        data,
    )


# ============================================================
# One complaint
# ============================================================

@router.get(
    "/{complaint_id}",
    response_model=ComplaintResponse,
)
async def get_complaint(
    complaint_id: int,
    current_user: User = Depends(
        get_current_user,
    ),
    service: ComplaintService = Depends(
        get_complaint_service,
    ),
):

    return await service.get_by_id(
        complaint_id,
        current_user,
    )