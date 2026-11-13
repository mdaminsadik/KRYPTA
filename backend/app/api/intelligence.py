from fastapi import APIRouter
from app.engines.intelligence import analyse_transactions

router = APIRouter(
    prefix="/api/intelligence",
    tags=["Intelligence"]
)

@router.get("/analyse")
def analyse():
    return analyse_transactions()
