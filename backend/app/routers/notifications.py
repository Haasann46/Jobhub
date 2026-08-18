from fastapi import APIRouter, Depends, status

from backend.app.dependencies.current_user import (
    get_current_user,
)
from backend.app.dependencies.notification import (
    get_notification_service,
)
from backend.app.models.user import User
from backend.app.schemas.notification import (
    NotificationReadResponse,
    NotificationResponse,
)
from backend.app.services.notification import (
    NotificationService,
)


router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"],
)


@router.get(
    "/my",
    response_model=list[NotificationResponse],
)
async def get_my_notifications(
    current_user: User = Depends(
        get_current_user,
    ),
    service: NotificationService = Depends(
        get_notification_service,
    ),
):

    return await service.get_my(
        current_user,
    )


@router.get(
    "/unread/count",
)
async def get_unread_count(
    current_user: User = Depends(
        get_current_user,
    ),
    service: NotificationService = Depends(
        get_notification_service,
    ),
):
    count = await service.get_unread_count(
        current_user,
    )

    return {
        "total": count,
    }

@router.patch(
    "/read-all",
    response_model=NotificationReadResponse,
)
async def mark_all_notifications_as_read(
    current_user: User = Depends(
        get_current_user,
    ),
    service: NotificationService = Depends(
        get_notification_service,
    ),
):

    await service.mark_all_as_read(
        current_user,
    )

    return NotificationReadResponse(
        success=True,
    )


@router.patch(
    "/{notification_id}/read",
    response_model=NotificationResponse,
)
async def mark_notification_as_read(
    notification_id: int,
    current_user: User = Depends(
        get_current_user,
    ),
    service: NotificationService = Depends(
        get_notification_service,
    ),
):

    return await service.mark_as_read(
        notification_id,
        current_user,
    )