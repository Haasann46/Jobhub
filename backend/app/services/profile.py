from app.models.profile import Profile
from app.models.user import User
from app.repositories.profile import ProfileRepository
from app.schemas.profile import (
    ProfileResponse,
    ProfileUpdate,
)


class ProfileService:

    def __init__(
        self,
        repository: ProfileRepository,
    ):
        self.repository = repository

    async def get_me(
        self,
        current_user: User,
    ) -> ProfileResponse:

        profile = await self.repository.get_by_user_id(
            current_user.id,
        )

        if profile is None:

            profile = await self.repository.create(
                Profile(
                    user_id=current_user.id,
                )
            )

        return ProfileResponse.model_validate(
            profile,
        )

    async def update_me(
        self,
        current_user: User,
        data: ProfileUpdate,
    ) -> ProfileResponse:

        profile = await self.repository.get_by_user_id(
            current_user.id,
        )

        if profile is None:

            profile = await self.repository.create(
                Profile(
                    user_id=current_user.id,
                )
            )

        for field, value in data.model_dump(
            exclude_unset=True,
        ).items():

            setattr(
                profile,
                field,
                value,
            )

        profile = await self.repository.update(
            profile,
        )

        return ProfileResponse.model_validate(
            profile,
        )