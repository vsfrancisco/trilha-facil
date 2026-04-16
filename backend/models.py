from typing import Optional
from sqlmodel import SQLModel, Field
from datetime import datetime

class Assessment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
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

    created_at: datetime = Field(default_factory=datetime.utcnow)