from typing import Optional

from pydantic import BaseModel, ConfigDict


class ProfileBase(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None


class ProfileUpdate(ProfileBase):
    pass


class ProfileResponse(ProfileBase):
    model_config = ConfigDict(
        from_attributes=True
    )

    id: int
    user_id: int