from typing import Optional

from pydantic import BaseModel, ConfigDict, HttpUrl


class CompanyBase(BaseModel):
    name: str
    description: Optional[str] = None
    website: Optional[HttpUrl] = None
    logo_url: Optional[HttpUrl] = None


class CompanyCreate(CompanyBase):
    pass


class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    website: Optional[HttpUrl] = None
    logo_url: Optional[HttpUrl] = None


class CompanyResponse(CompanyBase):
    model_config = ConfigDict(
        from_attributes=True
    )

    id: int
    owner_id: int