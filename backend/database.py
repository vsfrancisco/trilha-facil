from sqlmodel import create_engine
from settings import settings

database_url = settings.database_url

connect_args = {}
if database_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    database_url,
    echo=False,
    connect_args=connect_args,
)