"""
EdInsured Treaty Lab
Risk-by-Risk Quota Share Simulator — M2

Purpose:
Simulate an individual risk under a Quota Share treaty.

The simulator does NOT contain Quota Share mathematics.
It calls the validated Quota Share Engine in quota_share.py.
"""

from quota_share import calculate_quota_share


def simulate_risk(
    risk_id,
    sum_insured,
    premium,
    claim,
    qs_pct,
    ceding_comm_pct,
    cedant_expenses=0.0,
    reinsurer_expenses=0.0
):
    """
    Simulate one individual risk under a Quota Share treaty.

    Parameters:
        risk_id: Unique identifier for the risk.
        sum_insured: Gross sum insured of the risk.
        premium: Gross premium for the risk.
        claim: Gross claim for the risk.
        qs_pct: Quota Share percentage as a decimal.
        ceding_comm_pct: Ceding commission as a decimal.
        cedant_expenses: Expenses allocated to cedant.
        reinsurer_expenses: Expenses allocated to reinsurer.

    Returns:
        Structured risk-level simulation result.
    """

    # --------------------------------------------------
    # 1. BASIC RISK VALIDATION
    # --------------------------------------------------

    if sum_insured < 0:
        raise ValueError("Sum insured cannot be negative.")

    # --------------------------------------------------
    # 2. CALL VALIDATED QUOTA SHARE ENGINE
    # --------------------------------------------------

    treaty_result = calculate_quota_share(
        gross_premium=premium,
        gross_claims=claim,
        qs_pct=qs_pct,
        ceding_comm_pct=ceding_comm_pct,
        cedant_expenses=cedant_expenses,
        reinsurer_expenses=reinsurer_expenses
    )

    # --------------------------------------------------
    # 3. RETURN RISK-LEVEL RESULT
    # --------------------------------------------------

    return {
        "risk": {
            "risk_id": risk_id,
            "sum_insured": round(sum_insured, 2),
            "gross_premium": round(premium, 2),
            "gross_claim": round(claim, 2)
        },

        "treaty": {
            "quota_share_pct": qs_pct,
            "ceding_commission_pct": ceding_comm_pct
        },

        "cedant": {
            "premium_retained": treaty_result["cedant_metrics"][
                "premium_retained"
            ],
            "claims_retained": treaty_result["cedant_metrics"][
                "claims_retained"
            ],
            "commission_received": treaty_result["cedant_metrics"][
                "ceding_commission_received"
            ],
            "net_result": treaty_result["cedant_metrics"][
                "cedant_net_result"
            ]
        },

        "reinsurer": {
            "premium_ceded": treaty_result["reinsurer_metrics"][
                "premium_ceded"
            ],
            "claims_ceded": treaty_result["reinsurer_metrics"][
                "claims_ceded"
            ],
            "commission_paid": treaty_result["reinsurer_metrics"][
                "ceding_commission_paid"
            ],
            "net_result": treaty_result["reinsurer_metrics"][
                "reinsurer_net_result"
            ]
        },

        "combined": {
            "result": treaty_result["combined_economics"][
                "combined_result"
            ]
        }
    }


# --------------------------------------------------
# DEMONSTRATION
# --------------------------------------------------

if __name__ == "__main__":

    result = simulate_risk(
        risk_id="Risk 001",
        sum_insured=10_000_000,
        premium=50_000,
        claim=2_000_000,
        qs_pct=0.40,
        ceding_comm_pct=0.30
    )

    print("\n" + "=" * 60)
    print("EDINSURED TREATY LAB")
    print("RISK-BY-RISK QUOTA SHARE SIMULATOR")
    print("=" * 60)

    print("\nRISK")
    print("-" * 60)
    print(f"Risk ID       : {result['risk']['risk_id']}")
    print(f"Sum Insured   : ₹{result['risk']['sum_insured']:,.2f}")
    print(f"Gross Premium : ₹{result['risk']['gross_premium']:,.2f}")
    print(f"Gross Claim   : ₹{result['risk']['gross_claim']:,.2f}")

    print("\nTREATY")
    print("-" * 60)
    print(f"Quota Share   : {result['treaty']['quota_share_pct']:.0%}")
    print(
        f"Commission    : "
        f"{result['treaty']['ceding_commission_pct']:.0%}"
    )

    print("\nCEDANT")
    print("-" * 60)
    print(
        f"Premium Retained : "
        f"₹{result['cedant']['premium_retained']:,.2f}"
    )
    print(
        f"Claims Retained  : "
        f"₹{result['cedant']['claims_retained']:,.2f}"
    )
    print(
        f"Commission       : "
        f"₹{result['cedant']['commission_received']:,.2f}"
    )
    print(
        f"Net Result       : "
        f"₹{result['cedant']['net_result']:,.2f}"
    )

    print("\nREINSURER")
    print("-" * 60)
    print(
        f"Premium Ceded    : "
        f"₹{result['reinsurer']['premium_ceded']:,.2f}"
    )
    print(
        f"Claims Ceded     : "
        f"₹{result['reinsurer']['claims_ceded']:,.2f}"
    )
    print(
        f"Commission Paid  : "
        f"₹{result['reinsurer']['commission_paid']:,.2f}"
    )
    print(
        f"Net Result       : "
        f"₹{result['reinsurer']['net_result']:,.2f}"
    )

    print("\nCOMBINED")
    print("-" * 60)
    print(
        f"Combined Result  : "
        f"₹{result['combined']['result']:,.2f}"
    )

    print("\n" + "=" * 60)