from quota_share import calculate_quota_share


def run_tests():

    print("=" * 60)
    print("EDINSURED TREATY LAB")
    print("QUOTA SHARE ENGINE — V0.1 VALIDATION")
    print("=" * 60)

    # --------------------------------------------------
    # TEST 1 — STANDARD QUOTA SHARE
    # --------------------------------------------------

    result = calculate_quota_share(
        gross_premium=100000,
        gross_claims=60000,
        qs_pct=0.40,
        ceding_comm_pct=0.30
    )

    assert result["cedant_metrics"]["premium_retained"] == 60000
    assert result["reinsurer_metrics"]["premium_ceded"] == 40000
    assert result["cedant_metrics"]["claims_retained"] == 36000
    assert result["reinsurer_metrics"]["claims_ceded"] == 24000
    assert result["cedant_metrics"]["ceding_commission_received"] == 12000

    assert result["cedant_metrics"]["cedant_net_result"] == 36000
    assert result["reinsurer_metrics"]["reinsurer_net_result"] == 4000
    assert result["combined_economics"]["combined_result"] == 40000

    print("PASS — Test 1: Standard Quota Share")


    # --------------------------------------------------
    # TEST 2 — QS = 0%
    # --------------------------------------------------

    result = calculate_quota_share(
        gross_premium=100000,
        gross_claims=50000,
        qs_pct=0.0,
        ceding_comm_pct=0.25
    )

    assert result["reinsurer_metrics"]["premium_ceded"] == 0
    assert result["reinsurer_metrics"]["claims_ceded"] == 0
    assert result["cedant_metrics"]["premium_retained"] == 100000
    assert result["cedant_metrics"]["claims_retained"] == 50000
    assert result["cedant_metrics"]["cedant_net_result"] == 50000

    print("PASS — Test 2: QS = 0%")


    # --------------------------------------------------
    # TEST 3 — QS = 100%
    # --------------------------------------------------

    result = calculate_quota_share(
        gross_premium=100000,
        gross_claims=50000,
        qs_pct=1.0,
        ceding_comm_pct=0.20
    )

    assert result["cedant_metrics"]["premium_retained"] == 0
    assert result["cedant_metrics"]["claims_retained"] == 0
    assert result["reinsurer_metrics"]["premium_ceded"] == 100000
    assert result["reinsurer_metrics"]["claims_ceded"] == 50000
    assert result["cedant_metrics"]["ceding_commission_received"] == 20000

    assert result["cedant_metrics"]["cedant_net_result"] == 20000
    assert result["reinsurer_metrics"]["reinsurer_net_result"] == 30000
    assert result["combined_economics"]["combined_result"] == 50000

    print("PASS — Test 3: QS = 100%")


    # --------------------------------------------------
    # TEST 4 — EXTREME LOSS RATIO: 120%
    # --------------------------------------------------

    result = calculate_quota_share(
        gross_premium=100000,
        gross_claims=120000,
        qs_pct=0.50,
        ceding_comm_pct=0.20
    )

    # Cedant:
    # 50,000 retained premium
    # +10,000 commission
    # -60,000 retained claims
    # = 0

    assert result["cedant_metrics"]["cedant_net_result"] == 0

    # Reinsurer:
    # 50,000 ceded premium
    # -10,000 commission
    # -60,000 ceded claims
    # = -20,000

    assert result["reinsurer_metrics"]["reinsurer_net_result"] == -20000

    # Combined:
    # 0 + (-20,000) = -20,000

    assert result["combined_economics"]["combined_result"] == -20000

    print("PASS — Test 4: 120% Loss Ratio")


    # --------------------------------------------------
    # TEST 5 — NO CLAIMS
    # --------------------------------------------------

    result = calculate_quota_share(
        gross_premium=100000,
        gross_claims=0,
        qs_pct=0.40,
        ceding_comm_pct=0.30
    )

    assert result["gross_metrics"]["gross_loss_ratio_pct"] == 0
    assert result["cedant_metrics"]["claims_retained"] == 0
    assert result["reinsurer_metrics"]["claims_ceded"] == 0
    assert result["combined_economics"]["combined_result"] == 100000

    print("PASS — Test 5: No Claims")


    # --------------------------------------------------
    # TEST 6 — ZERO COMMISSION
    # --------------------------------------------------

    result = calculate_quota_share(
        gross_premium=100000,
        gross_claims=60000,
        qs_pct=0.40,
        ceding_comm_pct=0.0
    )

    assert result["cedant_metrics"]["ceding_commission_received"] == 0
    assert result["cedant_metrics"]["cedant_net_result"] == 24000
    assert result["reinsurer_metrics"]["reinsurer_net_result"] == 16000

    print("PASS — Test 6: Zero Commission")


    # --------------------------------------------------
    # TEST 7 — EXPENSES
    # --------------------------------------------------

    result = calculate_quota_share(
        gross_premium=100000,
        gross_claims=60000,
        qs_pct=0.40,
        ceding_comm_pct=0.30,
        cedant_expenses=5000,
        reinsurer_expenses=2000
    )

    assert result["gross_metrics"]["gross_underwriting_result"] == 35000
    assert result["cedant_metrics"]["cedant_net_result"] == 31000
    assert result["reinsurer_metrics"]["reinsurer_net_result"] == 2000
    assert result["combined_economics"]["combined_result"] == 33000

    print("PASS — Test 7: Expenses")


    # --------------------------------------------------
    # TEST 8 — LOSS RATIO CHECK
    # --------------------------------------------------

    result = calculate_quota_share(
        gross_premium=100000,
        gross_claims=60000,
        qs_pct=0.40,
        ceding_comm_pct=0.30
    )

    assert result["gross_metrics"]["gross_loss_ratio_pct"] == 60
    assert result["cedant_metrics"]["net_loss_ratio_pct"] == 60
    assert result["reinsurer_metrics"]["reinsurer_loss_ratio_pct"] == 60

    print("PASS — Test 8: Loss Ratio")


    # --------------------------------------------------
    # TEST 9 — INVALID QS
    # --------------------------------------------------

    try:
        calculate_quota_share(
            gross_premium=100000,
            gross_claims=50000,
            qs_pct=1.20,
            ceding_comm_pct=0.20
        )

        assert False, "Invalid QS should have raised ValueError"

    except ValueError:
        pass

    print("PASS — Test 9: Invalid QS rejected")


    # --------------------------------------------------
    # TEST 10 — INVALID COMMISSION
    # --------------------------------------------------

    try:
        calculate_quota_share(
            gross_premium=100000,
            gross_claims=50000,
            qs_pct=0.40,
            ceding_comm_pct=1.20
        )

        assert False, "Invalid commission should have raised ValueError"

    except ValueError:
        pass

    print("PASS — Test 10: Invalid Commission rejected")


    # --------------------------------------------------
    # TEST 11 — NEGATIVE PREMIUM
    # --------------------------------------------------

    try:
        calculate_quota_share(
            gross_premium=-100000,
            gross_claims=50000,
            qs_pct=0.40,
            ceding_comm_pct=0.20
        )

        assert False, "Negative premium should have raised ValueError"

    except ValueError:
        pass

    print("PASS — Test 11: Negative Premium rejected")


    # --------------------------------------------------
    # TEST 12 — NEGATIVE CLAIMS
    # --------------------------------------------------

    try:
        calculate_quota_share(
            gross_premium=100000,
            gross_claims=-50000,
            qs_pct=0.40,
            ceding_comm_pct=0.20
        )

        assert False, "Negative claims should have raised ValueError"

    except ValueError:
        pass

    print("PASS — Test 12: Negative Claims rejected")


    # --------------------------------------------------
    # FINAL RESULT
    # --------------------------------------------------

    print()
    print("=" * 60)
    print("ALL 12 QUOTA SHARE ENGINE TESTS PASSED")
    print("EDINSURED TREATY ENGINE V0.1 — VALIDATED")
    print("=" * 60)


if __name__ == "__main__":
    run_tests()