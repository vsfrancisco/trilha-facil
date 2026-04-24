from datetime import date
from math import ceil

from fastapi import APIRouter, Depends, Query
from sqlalchemy import asc, desc, func, or_
from sqlmodel import Session, select

from database import get_session
from models import Assessment
from schemas import AssessmentListResponse, AssessmentRead, SortField, SortOrder

router = APIRouter(prefix="/api/admin", tags=["admin"])

MAX_PAGE_SIZE = 100


@router.get("/assessments", response_model=AssessmentListResponse[AssessmentRead])
def list_assessments(
    session: Session = Depends(get_session),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=MAX_PAGE_SIZE),
    search: str | None = Query(None, min_length=1, max_length=100),
    track: str | None = Query(None, min_length=1, max_length=100),
    start_date: date | None = Query(None),
    end_date: date | None = Query(None),
    sort_by: SortField = Query(SortField.created_at),
    sort_order: SortOrder = Query(SortOrder.desc),
):
    stmt = select(Assessment)

    if search:
        pattern = f"%{search.strip()}%"
        stmt = stmt.where(
            or_(
                Assessment.current_field.ilike(pattern),
                Assessment.interests.ilike(pattern),
                Assessment.recommended_track.ilike(pattern),
                Assessment.reason.ilike(pattern),
                Assessment.education.ilike(pattern),
            )
        )

    if track:
        stmt = stmt.where(Assessment.recommended_track.ilike(f"%{track.strip()}%"))

    if start_date:
        stmt = stmt.where(func.date(Assessment.created_at) >= start_date)

    if end_date:
        stmt = stmt.where(func.date(Assessment.created_at) <= end_date)

    total = session.exec(select(func.count()).select_from(stmt.subquery())).one()

    sort_column = getattr(Assessment, sort_by.value)
    stmt = stmt.order_by(desc(sort_column) if sort_order == SortOrder.desc else asc(sort_column))

    offset = (page - 1) * page_size
    items = session.exec(stmt.offset(offset).limit(page_size)).all()

    total_pages = max(1, ceil(total / page_size)) if total else 0

    return AssessmentListResponse[AssessmentRead](
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )