from httpx import AsyncClient
import pytest
from main import app


@pytest.mark.anyio
async def test_health_ok():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        resp = await ac.get("/health")
    assert resp.status_code == 200