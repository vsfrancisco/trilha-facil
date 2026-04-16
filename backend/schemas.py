from datetime import datetime
from pydantic import BaseModel


class AssessmentCreate(BaseModel):
    age: str
    education: str
    current_field: str
    target_salary: float
    interests: str


class AssessmentRead(BaseModel):
    id: int
    age: str
    education: str
    current_field: str
    target_salary: float
    interests: str
    recommended_track: str
    match_score: float
    reason: str
    plan_30_days: str
    example_roles: str
    created_at: datetime

    model_config = {
        "from_attributes": True
    }