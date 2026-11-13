import random
import numpy as np
import pandas as pd
import networkx as nx

from datetime import datetime, timedelta
from sklearn.ensemble import IsolationForest


# ============================================================
# KRYPTA — FINANCIAL CRIME INTELLIGENCE ENGINE
# Synthetic demonstration data
# ============================================================

def generate_transactions():

    rng = random.Random(42)
    transactions = []

    now = datetime.now()

    normal_accounts = [
        f"ACC{1000 + i}" for i in range(30)
    ]

    # --------------------------------------------------------
    # 1. Generate normal transactions
    # --------------------------------------------------------

    for i in range(150):

        sender = rng.choice(normal_accounts)
        receiver = rng.choice(normal_accounts)

        while receiver == sender:
            receiver = rng.choice(normal_accounts)

        transactions.append({
            "transaction_id": f"TXN{i + 1:04d}",
            "sender": sender,
            "receiver": receiver,
            "amount": round(rng.uniform(500, 25000), 2),
            "timestamp": (
                now - timedelta(minutes=rng.randint(1, 10000))
            ).isoformat(),
            "channel": rng.choice([
                "UPI",
                "NEFT",
                "IMPS",
                "RTGS",
                "BANK_TRANSFER"
            ])
        })

    # --------------------------------------------------------
    # 2. Generate suspicious circular money movement
    # --------------------------------------------------------

    suspicious_flows = [
        ("ACC9001", "ACC9002", 95000),
        ("ACC9002", "ACC9003", 87000),
        ("ACC9003", "ACC9004", 79000),
        ("ACC9004", "ACC9005", 92000),
        ("ACC9005", "ACC9001", 110000),
        ("ACC9002", "ACC9005", 85000),
        ("ACC9003", "ACC9001", 98000),
    ]

    for i, (sender, receiver, amount) in enumerate(suspicious_flows):

        transactions.append({
            "transaction_id": f"AML{i + 1:04d}",
            "sender": sender,
            "receiver": receiver,
            "amount": float(amount),
            "timestamp": (
                now - timedelta(minutes=rng.randint(1, 120))
            ).isoformat(),
            "channel": "BANK_TRANSFER"
        })

    return transactions


# ============================================================
# MAIN ANALYSIS ENGINE
# ============================================================

def analyse_transactions():

    transactions = generate_transactions()

    df = pd.DataFrame(transactions)

    # --------------------------------------------------------
    # 1. Preprocessing
    # --------------------------------------------------------

    df["timestamp"] = pd.to_datetime(
        df["timestamp"],
        errors="coerce"
    )

    df["hour"] = df["timestamp"].dt.hour.fillna(0)

    df["sender_frequency"] = (
        df.groupby("sender")["sender"]
        .transform("count")
    )

    # --------------------------------------------------------
    # 2. Machine Learning — Isolation Forest
    # --------------------------------------------------------

    features = pd.DataFrame({
        "log_amount": np.log1p(df["amount"]),
        "transaction_hour": df["hour"],
        "sender_frequency": df["sender_frequency"]
    })

    normal_data = features.iloc[:150]

    model = IsolationForest(
        n_estimators=100,
        contamination=0.08,
        random_state=42,
        n_jobs=-1
    )

    model.fit(normal_data)

    anomaly_scores = model.decision_function(features)

    # --------------------------------------------------------
    # 3. Build complete transaction network
    # --------------------------------------------------------

    graph = nx.DiGraph()

    for transaction in transactions:

        graph.add_edge(
            transaction["sender"],
            transaction["receiver"],
            amount=transaction["amount"]
        )

    # --------------------------------------------------------
    # 4. Detect circular movement among high-value transfers
    # --------------------------------------------------------

    risk_graph = nx.DiGraph()

    for transaction in transactions:

        if transaction["amount"] >= 50000:

            risk_graph.add_edge(
                transaction["sender"],
                transaction["receiver"]
            )

    cyclic_components = [
        component
        for component in nx.strongly_connected_components(risk_graph)
        if len(component) > 1
        or any(
            risk_graph.has_edge(node, node)
            for node in component
        )
    ]

    circular_accounts = (
        set().union(*cyclic_components)
        if cyclic_components
        else set()
    )

    # --------------------------------------------------------
    # 5. Explainable risk scoring
    # --------------------------------------------------------

    analysed_transactions = []

    for index, transaction in enumerate(transactions):

        risk_score = 0
        reasons = []

        sender = transaction["sender"]
        receiver = transaction["receiver"]
        amount = transaction["amount"]

        frequency = int(
            df.iloc[index]["sender_frequency"]
        )

        anomaly_score = float(
            anomaly_scores[index]
        )

        # High-value transaction signal

        if amount >= 75000:

            risk_score += 35

            reasons.append(
                "Unusually high transaction amount"
            )

        # High transaction frequency signal

        if frequency >= 7:

            risk_score += 15

            reasons.append(
                "High transaction frequency detected"
            )

        # Circular money movement signal

        if (
            sender in circular_accounts
            or receiver in circular_accounts
        ):

            risk_score += 35

            reasons.append(
                "Account associated with circular transaction network"
            )

        # Machine learning anomaly signal

        if anomaly_score < -0.10:

            risk_score += 15

            reasons.append(
                "Machine learning model detected anomalous behaviour"
            )

        risk_score = min(risk_score, 100)

        # ----------------------------------------------------
        # Risk classification
        # ----------------------------------------------------

        if risk_score >= 70:

            risk_level = "CRITICAL"

        elif risk_score >= 40:

            risk_level = "HIGH"

        elif risk_score >= 20:

            risk_level = "MEDIUM"

        else:

            risk_level = "LOW"

        is_suspicious = risk_score >= 40

        analysed_transactions.append({

            **transaction,

            "risk_score": risk_score,

            "risk_level": risk_level,

            "is_suspicious": is_suspicious,

            "reasons": reasons

        })

    # --------------------------------------------------------
    # 6. Investigation alerts
    # --------------------------------------------------------

    alerts = [
        transaction
        for transaction in analysed_transactions
        if transaction["risk_score"] >= 40
    ]

    # --------------------------------------------------------
    # 7. Network visualisation data
    # --------------------------------------------------------

    nodes = [
        {
            "id": account,
            "label": account
        }
        for account in graph.nodes()
    ]

    edges = [
        {
            "source": sender,
            "target": receiver,
            "amount": data["amount"]
        }
        for sender, receiver, data in graph.edges(data=True)
    ]

    # --------------------------------------------------------
    # 8. Intelligence summary
    # --------------------------------------------------------

    summary = {

        "total_transactions": len(analysed_transactions),

        "suspicious_transactions": len(alerts),

        "critical_alerts": sum(
            1
            for transaction in alerts
            if transaction["risk_level"] == "CRITICAL"
        ),

        "total_volume": round(
            sum(
                transaction["amount"]
                for transaction in transactions
            ),
            2
        ),

        "accounts_monitored": graph.number_of_nodes(),

        "network_cycles": len(cyclic_components)

    }

    # --------------------------------------------------------
    # 9. Final API response
    # --------------------------------------------------------

    return {

        "summary": summary,

        "transactions": analysed_transactions,

        "alerts": alerts,

        "network": {

            "nodes": nodes,

            "edges": edges

        }

    }