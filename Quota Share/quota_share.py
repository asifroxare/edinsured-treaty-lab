"""
EdInsured Treaty Lab
Quota Share Treaty Engine — V0.1

Purpose:
Calculate the financial distribution of a Quota Share treaty
between Cedant and Reinsurer.

V0.1 supports:
- Gross premium
- Gross claims
- Quota Share %
- Ceding commission %
- Cedant expenses
- Reinsurer expenses
"""

def calculate_quota_share(
    gross_premium,
    gross_claims,
    qs_pct,
    ceding_comm_pct,
    cedant_expenses=0.0,
    reinsurer_expenses=0.0
):
    """
    Calculate Quota Share treaty results.

    Percentages must be entered as decimals:
        40% = 0.40
        30% = 0.30
    """

    # --------------------------------------------------
    # 1. INPUT VALIDATION
    # --------------------------------------------------

    if gross_premium < 0:
        raise ValueError("Gross premium cannot be negative.")

    if gross_claims < 0:
        raise ValueError("Gross claims cannot be negative.")

    if cedant_expenses < 0:
        raise ValueError("Cedant expenses cannot be negative.")

    if reinsurer_expenses < 0:
        raise ValueError("Reinsurer expenses cannot be negative.")

    if not 0 <= qs_pct <= 1:
        raise ValueError("Quota Share percentage must be between 0% and 100%.")

    if not 0 <= ceding_comm_pct <= 1:
        raise ValueError("Ceding commission must be between 0% and 100%.")

    # --------------------------------------------------
    # 2. PREMIUM ALLOCATION
    # --------------------------------------------------

    premium_ceded = gross_premium * qs_pct

    premium_retained = gross_premium * (1 - qs_pct)

    # --------------------------------------------------
    # 3. CLAIM ALLOCATION
    # --------------------------------------------------

    claims_ceded = gross_claims * qs_pct

    claims_retained = gross_claims * (1 - qs_pct)

    # --------------------------------------------------
    # 4. CEDING COMMISSION
    # --------------------------------------------------

    ceding_commission = premium_ceded * ceding_comm_pct

    # --------------------------------------------------
    # 5. GROSS PORTFOLIO METRICS
    # --------------------------------------------------

    if gross_premium > 0:
        gross_loss_ratio = (gross_claims / gross_premium) * 100
    else:
        gross_loss_ratio = 0.0

    gross_underwriting_result = (
        gross_premium
        - gross_claims
        - cedant_expenses
    )

    # --------------------------------------------------
    # 6. CEDANT RESULT
    # --------------------------------------------------

    cedant_result = (
        premium_retained
        + ceding_commission
        - claims_retained
        - cedant_expenses
    )

    if premium_retained > 0:
        cedant_loss_ratio = (
            claims_retained / premium_retained
        ) * 100
    else:
        cedant_loss_ratio = 0.0

    # --------------------------------------------------
    # 7. REINSURER RESULT
    # --------------------------------------------------

    reinsurer_result = (
        premium_ceded
        - ceding_commission
        - claims_ceded
        - reinsurer_expenses
    )

    if premium_ceded > 0:
        reinsurer_loss_ratio = (
            claims_ceded / premium_ceded
        ) * 100
    else:
        reinsurer_loss_ratio = 0.0

    # --------------------------------------------------
    # 8. COMBINED ECONOMICS
    # --------------------------------------------------

    combined_result = cedant_result + reinsurer_result

    # --------------------------------------------------
    # 9. RETURN STRUCTURED RESULTS
    # --------------------------------------------------

    return {

        "inputs": {
            "gross_premium": round(gross_premium, 2),
            "gross_claims": round(gross_claims, 2),
            "qs_pct": qs_pct,
            "ceding_comm_pct": ceding_comm_pct,
            "cedant_expenses": round(cedant_expenses, 2),
            "reinsurer_expenses": round(reinsurer_expenses, 2)
        },

        "gross_metrics": {
            "gross_loss_ratio_pct": round(gross_loss_ratio, 2),
            "gross_underwriting_result": round(
                gross_underwriting_result, 2
            )
        },

        "cedant_metrics": {
            "premium_retained": round(
                premium_retained, 2
            ),
            "claims_retained": round(
                claims_retained, 2
            ),
            "ceding_commission_received": round(
                ceding_commission, 2
            ),
            "cedant_expenses": round(
                cedant_expenses, 2
            ),
            "cedant_net_result": round(
                cedant_result, 2
            ),
            "net_loss_ratio_pct": round(
                cedant_loss_ratio, 2
            )
        },

        "reinsurer_metrics": {
            "premium_ceded": round(
                premium_ceded, 2
            ),
            "claims_ceded": round(
                claims_ceded, 2
            ),
            "ceding_commission_paid": round(
                ceding_commission, 2
            ),
            "reinsurer_expenses": round(
                reinsurer_expenses, 2
            ),
            "reinsurer_net_result": round(
                reinsurer_result, 2
            ),
            "reinsurer_loss_ratio_pct": round(
                reinsurer_loss_ratio, 2
            )
        },

        "combined_economics": {
            "combined_result": round(
                combined_result, 2
            )
        }
    }