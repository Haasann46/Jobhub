from pydantic import BaseModel, ConfigDict


class TechnologyBase(BaseModel):
    name: str

    slug: str


class TechnologyCreate(TechnologyBase):
    pass


class TechnologyUpdate(BaseModel):
    name: str | None = None

    slug: str | None = None


class TechnologyResponse(TechnologyBase):
    model_config = ConfigDict(
        from_attributes=True,
    )

    id: int