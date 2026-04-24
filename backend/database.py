from sqlmodel import Session, create_engine
from settings import settings

database_url = settings.database_url

if database_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
else:
    connect_args = {}

engine = create_engine(
    database_url,
    echo=False,
    connect_args=connect_args,
)

def get_session():
    with Session(engine) as session:
        yield session