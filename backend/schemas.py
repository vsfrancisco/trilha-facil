from datetime import datetime
from enum import Enum
from typing import Generic, TypeVar

from pydantic import BaseModel, ConfigDict
from pydantic.generics import GenericModel


class AssessmentBase(BaseModel):
    age: str
    education: str
    current_field: str
    target_salary: int
    interests: str
    recommended_track: str
    match_score: int
    reason: str
    plan_30_days: str
    example_roles: str


class AssessmentCreate(AssessmentBase):
    pass


class AssessmentRead(AssessmentBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SortField(str, Enum):
    id = "id"
    created_at = "created_at"
    match_score = "match_score"
    target_salary = "target_salary"
    recommended_track = "recommended_track"


class SortOrder(str, Enum):
    asc = "asc"
    desc = "desc"


T = TypeVar("T")


class PaginatedResponse(GenericModel, Generic[T]):
    items: list[T]
    total: int
    page: int
    page_size: int
    total_pages: int