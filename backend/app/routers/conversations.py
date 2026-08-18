from fastapi import APIRouter, Depends

from backend.app.dependencies.conversation import (
    get_conversation_service,
)
from backend.app.dependencies.current_user import (
    get_current_user,
)
from backend.app.models.user import User
from backend.app.schemas.conversation import (
    ConversationListItem,
    ConversationResponse,
)
from backend.app.services.conversation import (
    ConversationService,
)


router = APIRouter(
    prefix="/conversations",
    tags=["Conversations"],
)


@router.post(
    "/application/{application_id}",
    response_model=ConversationResponse,
)
async def get_or_create_conversation(
    application_id: int,
    current_user: User = Depends(
        get_current_user,
    ),
    service: ConversationService = Depends(
        get_conversation_service,
    ),
):
    return await service.get_or_create(
        application_id,
        current_user,
    )


@router.get(
    "/application/{application_id}",
    response_model=ConversationResponse,
)
async def get_application_conversation(
    application_id: int,
    current_user: User = Depends(
        get_current_user,
    ),
    service: ConversationService = Depends(
        get_conversation_service,
    ),
):
    return await service.get_by_application(
        application_id,
        current_user,
    )


@router.get(
    "/my",
    response_model=list[ConversationListItem],
)
async def get_my_conversations(
    current_user: User = Depends(
        get_current_user,
    ),
    service: ConversationService = Depends(
        get_conversation_service,
    ),
):
    return await service.get_my(
        current_user,
    )


@router.get(
    "/{conversation_id}",
    response_model=ConversationResponse,
)
async def get_conversation(
    conversation_id: int,
    current_user: User = Depends(
        get_current_user,
    ),
    service: ConversationService = Depends(
        get_conversation_service,
    ),
):
    return await service.get(
        conversation_id,
        current_user,
    )