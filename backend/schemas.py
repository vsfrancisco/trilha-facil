from pydantic import BaseModel
from typing import List
from datetime import datetime

class AssessmentIn(BaseModel):
    age: str
    education: str
    current_field: str
    target_salary: float
    interests: List[str]

class AssessmentRead(BaseModel):
    id: int
    age: str
    education: str
    current_field: str
    target_salary: float
    interests: str

    recommended_track: str
    match_score: int
    reason: str
    plan_30_days: str
    example_roles: str

    created_at: datetime

class LoginIn(BaseModel):
    username: str
    password: str