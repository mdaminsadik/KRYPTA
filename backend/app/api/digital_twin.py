from fastapi import APIRouter, Query

from app.engines.digital_twin import simulate_intervention

router = APIRouter(
    prefix="/api/digital-twin",
    tags=["Financial Crime Digital Twin"]
)


@router.get("/simulate")
def simulate(
    account_id: str = Query(
        default="ACC9001",
        description="Account to simulate an intervention against"
    ),
    intervention: str = Query(
        default="hold_transfers",
        description="Intervention strategy"
    )
):
    return simulate_intervention(
        account_id=account_id,
        intervention=intervention
    )