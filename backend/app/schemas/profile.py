from typing import Optional

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    HttpUrl,
)


class ExperienceItem(BaseModel):
    company: str
    position: str

    start_date: str
    end_date: Optional[str] = None

    description: Optional[str] = None


class EducationItem(BaseModel):
    institution: str
    degree: Optional[str] = None
    field: Optional[str] = None

    start_date: Optional[str] = None
    end_date: Optional[str] = None


class LanguageItem(BaseModel):
    name: str
    level: str


class ProjectItem(BaseModel):
    name: str

    description: Optional[str] = None

    url: Optional[HttpUrl] = None


class ProfileBase(BaseModel):
    first_name: Optional[str] = Field(
        default=None,
        max_length=100,
    )

    last_name: Optional[str] = Field(
        default=None,
        max_length=100,
    )

    phone: Optional[str] = Field(
        default=None,
        max_length=20,
    )

    avatar_url: Optional[HttpUrl] = None

    bio: Optional[str] = None

    city: Optional[str] = Field(
        default=None,
        max_length=255,
    )

    github_url: Optional[HttpUrl] = None

    linkedin_url: Optional[HttpUrl] = None

    skills: list[str] = Field(
        default_factory=list,
    )

    experience: list[ExperienceItem] = Field(
        default_factory=list,
    )

    education: list[EducationItem] = Field(
        default_factory=list,
    )

    languages: list[LanguageItem] = Field(
        default_factory=list,
    )

    projects: list[ProjectItem] = Field(
        default_factory=list,
    )


class ProfileUpdate(ProfileBase):
    pass


class ProfileResponse(ProfileBase):

    model_config = ConfigDict(
        from_attributes=True,
    )

    id: int

    user_id: int