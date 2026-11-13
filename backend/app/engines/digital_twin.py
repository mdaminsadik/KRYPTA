from app.engines.intelligence import analyse_transactions


def simulate_intervention(
    account_id="ACC9001",
    intervention="hold_transfers"
):
    """
    Simulate possible financial exposure changes after an intervention.

    All results are illustrative projections using synthetic data.
    They do not represent actual prevented financial crime.
    """

    analysis = analyse_transactions()

    transactions = analysis["transactions"]
    alerts = analysis["alerts"]

    # Baseline exposure: total value of flagged transactions
    baseline_exposure = sum(
        transaction["amount"]
        for transaction in alerts
    )

    affected_transactions = [
        transaction
        for transaction in alerts
        if (
            transaction["sender"] == account_id
            or transaction["receiver"] == account_id
        )
    ]

    affected_amount = sum(
        transaction["amount"]
        for transaction in affected_transactions
    )

    remaining_exposure = baseline_exposure
    action_description = ""

    if intervention == "hold_transfers":

        # Simulate holding outgoing flagged transfers
        held_transactions = [
            transaction
            for transaction in alerts
            if transaction["sender"] == account_id
        ]

        held_amount = sum(
            transaction["amount"]
            for transaction in held_transactions
        )

        remaining_exposure = max(
            0,
            baseline_exposure - held_amount
        )

        action_description = (
            "Outgoing flagged transfers from the selected "
            "account are hypothetically placed on hold."
        )

    elif intervention == "enhanced_verification":

        # Illustrative assumption: 50% of affected exposure
        # is mitigated through additional verification.
        projected_reduction = affected_amount * 0.50

        remaining_exposure = max(
            0,
            baseline_exposure - projected_reduction
        )

        action_description = (
            "Enhanced verification is hypothetically applied "
            "to transactions involving the selected account. "
            "A 50% exposure reduction is an illustrative assumption."
        )

    elif intervention == "manual_review":

        # Review does not automatically reduce financial exposure.
        remaining_exposure = baseline_exposure

        action_description = (
            "The selected account is added to the investigation "
            "queue for analyst review. No automatic exposure "
            "reduction is assumed."
        )

    else:

        return {
            "success": False,
            "message": "Unsupported intervention.",
            "supported_interventions": [
                "hold_transfers",
                "enhanced_verification",
                "manual_review"
            ]
        }

    reduction = baseline_exposure - remaining_exposure

    reduction_percentage = (
        (reduction / baseline_exposure) * 100
        if baseline_exposure > 0
        else 0
    )

    return {
        "success": True,
        "simulation": {
            "account_id": account_id,
            "intervention": intervention,
            "action_description": action_description,
            "before": {
                "suspicious_exposure": round(
                    baseline_exposure, 2
                ),
                "flagged_transactions": len(alerts)
            },
            "after": {
                "projected_exposure": round(
                    remaining_exposure, 2
                ),
                "projected_flagged_transactions": len(alerts)
            },
            "projected_reduction": round(reduction, 2),
            "projected_reduction_percentage": round(
                reduction_percentage, 2
            ),
            "affected_transactions": len(
                affected_transactions
            )
        },
        "disclaimer": (
            "Simulation based on synthetic transactions and "
            "illustrative assumptions. Results are not predictions "
            "of actual prevented financial crime."
        )
    }