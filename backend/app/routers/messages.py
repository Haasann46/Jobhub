from fastapi import APIRouter, Depends, status

from backend.app.dependencies.current_user import (
    get_current_user,
)
from backend.app.dependencies.message import (
    get_message_service,
)
from backend.app.models.user import User
from backend.app.schemas.message import (
    MessageCreate,
    MessageResponse,
)
from backend.app.services.message import (
    MessageService,
)


router = APIRouter(
    prefix="/conversations",
    tags=["Messages"],
)


@router.get(
    "/{conversation_id}/messages",
    response_model=list[MessageResponse],
)
async def get_messages(
    conversation_id: int,
    current_user: User = Depends(
        get_current_user,
    ),
    service: MessageService = Depends(
        get_message_service,
    ),
):
    return await service.get_by_conversation(
        conversation_id,
        current_user,
    )


@router.post(
    "/{conversation_id}/messages",
    response_model=MessageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_message(
    conversation_id: int,
    data: MessageCreate,
    current_user: User = Depends(
        get_current_user,
    ),
    service: MessageService = Depends(
        get_message_service,
    ),
):
    return await service.create(
        conversation_id,
        current_user,
        data,
    )


@router.patch(
    "/{conversation_id}/read",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def mark_conversation_as_read(
    conversation_id: int,
    current_user: User = Depends(
        get_current_user,
    ),
    service: MessageService = Depends(
        get_message_service,
    ),
):
    await service.mark_as_read(
        conversation_id,
        current_user,
    )