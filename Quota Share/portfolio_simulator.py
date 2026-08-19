"""
EdInsured Treaty Lab
Portfolio Quota Share Simulator — M3

Purpose:
Simulate multiple individual risks under a Quota Share treaty.

The portfolio simulator does NOT contain Quota Share mathematics.
It calls the validated risk simulator in risk_simulator.py,
which in turn calls the validated Quota Share Engine.
"""

from risk_simulator import simulate_risk


def simulate_portfolio(
    risks,
    qs_pct,
    ceding_comm_pct,
    cedant_expenses=0.0,
    reinsurer_expenses=0.0
):
    """
    Simulate a portfolio of risks under a Quota Share treaty.

    Parameters:
        risks: List of dictionaries containing:
            risk_id
            sum_insured
            premium
            claim

        qs_pct: Quota Share percentage as a decimal.
        ceding_comm_pct: Ceding commission as a decimal.
        cedant_expenses: Portfolio-level cedant expenses.
        reinsurer_expenses: Portfolio-level reinsurer expenses.

    Returns:
        Structured portfolio-level simulation result.
    """

    # --------------------------------------------------
    # 1. BASIC PORTFOLIO VALIDATION
    # --------------------------------------------------

    if not isinstance(risks, list):
        raise ValueError("Risks must be provided as a list.")

    if len(risks) == 0:
        raise ValueError("Portfolio must contain at least one risk.")

    if cedant_expenses < 0:
        raise ValueError("Cedant expenses cannot be negative.")

    if reinsurer_expenses < 0:
        raise ValueError("Reinsurer expenses cannot be negative.")

    # --------------------------------------------------
    # 2. SIMULATE EACH RISK
    # --------------------------------------------------

    risk_results = []

    for risk in risks:

        result = simulate_risk(
            risk_id=risk["risk_id"],
            sum_insured=risk["sum_insured"],
            premium=risk["premium"],
            claim=risk["claim"],
            qs_pct=qs_pct,
            ceding_comm_pct=ceding_comm_pct
        )

        risk_results.append(result)

    # --------------------------------------------------
    # 3. AGGREGATE GROSS PORTFOLIO
    # --------------------------------------------------

    gross_premium = sum(
        result["risk"]["gross_premium"]
        for result in risk_results
    )

    gross_claims = sum(
        result["risk"]["gross_claim"]
        for result in risk_results
    )

    total_sum_insured = sum(
        result["risk"]["sum_insured"]
        for result in risk_results
    )

    # --------------------------------------------------
    # 4. AGGREGATE CEDANT RESULTS
    # --------------------------------------------------

    premium_retained = sum(
        result["cedant"]["premium_retained"]
        for result in risk_results
    )

    claims_retained = sum(
        result["cedant"]["claims_retained"]
        for result in risk_results
    )

    commission_received = sum(
        result["cedant"]["commission_received"]
        for result in risk_results
    )

    # --------------------------------------------------
    # 5. AGGREGATE REINSURER RESULTS
    # --------------------------------------------------

    premium_ceded = sum(
        result["reinsurer"]["premium_ceded"]
        for result in risk_results
    )

    claims_ceded = sum(
        result["reinsurer"]["claims_ceded"]
        for result in risk_results
    )

    commission_paid = sum(
        result["reinsurer"]["commission_paid"]
        for result in risk_results
    )

    # --------------------------------------------------
    # 6. PORTFOLIO EXPENSES
    # --------------------------------------------------

    cedant_expenses_total = cedant_expenses
    reinsurer_expenses_total = reinsurer_expenses

    # --------------------------------------------------
    # 7. PORTFOLIO RESULTS
    # --------------------------------------------------

    gross_underwriting_result = (
        gross_premium
        - gross_claims
        - cedant_expenses_total
    )

    cedant_result = (
        premium_retained
        + commission_received
        - claims_retained
        - cedant_expenses_total
    )

    reinsurer_result = (
        premium_ceded
        - commission_paid
        - claims_ceded
        - reinsurer_expenses_total
    )

    combined_result = (
        cedant_result
        + reinsurer_result
    )

    # --------------------------------------------------
    # 8. PORTFOLIO LOSS RATIOS
    # --------------------------------------------------

    if gross_premium > 0:
        gross_loss_ratio = (
            gross_claims / gross_premium
        ) * 100
    else:
        gross_loss_ratio = 0.0

    if premium_retained > 0:
        cedant_loss_ratio = (
            claims_retained / premium_retained
        ) * 100
    else:
        cedant_loss_ratio = 0.0

    if premium_ceded > 0:
        reinsurer_loss_ratio = (
            claims_ceded / premium_ceded
        ) * 100
    else:
        reinsurer_loss_ratio = 0.0

    # --------------------------------------------------
    # 9. RECONCILIATION
    # --------------------------------------------------

    premium_reconciliation = (
        gross_premium
        - premium_retained
        - premium_ceded
    )

    claims_reconciliation = (
        gross_claims
        - claims_retained
        - claims_ceded
    )

    result_reconciliation = (
        combined_result
        - (
            gross_premium
            - gross_claims
            - cedant_expenses_total
            - reinsurer_expenses_total
        )
    )

    # --------------------------------------------------
    # 10. RETURN STRUCTURED PORTFOLIO RESULT
    # --------------------------------------------------

    return {

        "portfolio": {
            "number_of_risks": len(risk_results),
            "total_sum_insured": round(total_sum_insured, 2),
            "gross_premium": round(gross_premium, 2),
            "gross_claims": round(gross_claims, 2)
        },

        "treaty": {
            "quota_share_pct": qs_pct,
            "ceding_commission_pct": ceding_comm_pct
        },

        "gross_metrics": {
            "gross_loss_ratio_pct": round(
                gross_loss_ratio, 2
            ),
            "gross_underwriting_result": round(
                gross_underwriting_result, 2
            )
        },

        "cedant": {
            "premium_retained": round(
                premium_retained, 2
            ),
            "claims_retained": round(
                claims_retained, 2
            ),
            "commission_received": round(
                commission_received, 2
            ),
            "expenses": round(
                cedant_expenses_total, 2
            ),
            "net_result": round(
                cedant_result, 2
            ),
            "loss_ratio_pct": round(
                cedant_loss_ratio, 2
            )
        },

        "reinsurer": {
            "premium_ceded": round(
                premium_ceded, 2
            ),
            "claims_ceded": round(
                claims_ceded, 2
            ),
            "commission_paid": round(
                commission_paid, 2
            ),
            "expenses": round(
                reinsurer_expenses_total, 2
            ),
            "net_result": round(
                reinsurer_result, 2
            ),
            "loss_ratio_pct": round(
                reinsurer_loss_ratio, 2
            )
        },

        "combined": {
            "result": round(
                combined_result, 2
            )
        },

        "reconciliation": {
            "premium_difference": round(
                premium_reconciliation, 2
            ),
            "claims_difference": round(
                claims_reconciliation, 2
            ),
            "result_difference": round(
                result_reconciliation, 2
            )
        },

        "risks": risk_results
    }


# --------------------------------------------------
# DEMONSTRATION
# --------------------------------------------------

if __name__ == "__main__":

    portfolio = [
        {
            "risk_id": "Risk 001",
            "sum_insured": 10_000_000,
            "premium": 50_000,
            "claim": 2_000_000
        },
        {
            "risk_id": "Risk 002",
            "sum_insured": 5_000_000,
            "premium": 75_000,
            "claim": 0
        },
        {
            "risk_id": "Risk 003",
            "sum_insured": 20_000_000,
            "premium": 100_000,
            "claim": 500_000
        }
    ]

    result = simulate_portfolio(
        risks=portfolio,
        qs_pct=0.40,
        ceding_comm_pct=0.30
    )

    print("\n" + "=" * 60)
    print("EDINSURED TREATY LAB")
    print("PORTFOLIO QUOTA SHARE SIMULATOR")
    print("=" * 60)

    print("\nPORTFOLIO")
    print("-" * 60)
    print(
        f"Number of Risks : "
        f"{result['portfolio']['number_of_risks']}"
    )
    print(
        f"Total Sum Insured : "
        f"₹{result['portfolio']['total_sum_insured']:,.2f}"
    )
    print(
        f"Gross Premium : "
        f"₹{result['portfolio']['gross_premium']:,.2f}"
    )
    print(
        f"Gross Claims : "
        f"₹{result['portfolio']['gross_claims']:,.2f}"
    )

    print("\nTREATY")
    print("-" * 60)
    print(
        f"Quota Share : "
        f"{result['treaty']['quota_share_pct']:.0%}"
    )
    print(
        f"Commission : "
        f"{result['treaty']['ceding_commission_pct']:.0%}"
    )

    print("\nCEDANT")
    print("-" * 60)
    print(
        f"Premium Retained : "
        f"₹{result['cedant']['premium_retained']:,.2f}"
    )
    print(
        f"Claims Retained : "
        f"₹{result['cedant']['claims_retained']:,.2f}"
    )
    print(
        f"Commission : "
        f"₹{result['cedant']['commission_received']:,.2f}"
    )
    print(
        f"Net Result : "
        f"₹{result['cedant']['net_result']:,.2f}"
    )

    print("\nREINSURER")
    print("-" * 60)
    print(
        f"Premium Ceded : "
        f"₹{result['reinsurer']['premium_ceded']:,.2f}"
    )
    print(
        f"Claims Ceded : "
        f"₹{result['reinsurer']['claims_ceded']:,.2f}"
    )
    print(
        f"Commission Paid : "
        f"₹{result['reinsurer']['commission_paid']:,.2f}"
    )
    print(
        f"Net Result : "
        f"₹{result['reinsurer']['net_result']:,.2f}"
    )

    print("\nCOMBINED")
    print("-" * 60)
    print(
        f"Combined Result : "
        f"₹{result['combined']['result']:,.2f}"
    )

    print("\nRECONCILIATION")
    print("-" * 60)
    print(
        f"Premium Difference : "
        f"₹{result['reconciliation']['premium_difference']:,.2f}"
    )
    print(
        f"Claims Difference : "
        f"₹{result['reconciliation']['claims_difference']:,.2f}"
    )
    print(
        f"Result Difference : "
        f"₹{result['reconciliation']['result_difference']:,.2f}"
    )

    print("\n" + "=" * 60)