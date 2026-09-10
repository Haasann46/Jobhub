from typing import Optional

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    HttpUrl,
)


class CompanyBase(BaseModel):

    name: str = Field(
        min_length=1,
        max_length=255,
    )

    description: str = Field(
        min_length=1,
    )

    website: Optional[HttpUrl] = None

    logo_url: Optional[HttpUrl] = None

    size: Optional[str] = Field(
        default=None,
        max_length=100,
    )

    address: Optional[str] = Field(
        default=None,
        max_length=500,
    )

    industry: Optional[str] = Field(
        default=None,
        max_length=255,
    )


class CompanyCreate(CompanyBase):
    pass


class CompanyUpdate(CompanyBase):
    pass


class CompanyResponse(CompanyBase):

    model_config = ConfigDict(
        from_attributes=True,
    )

    id: int

    owner_id: int