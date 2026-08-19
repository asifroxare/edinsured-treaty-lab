"""
EdInsured Treaty Lab
Risk-by-Risk Quota Share Simulator — M2 Tests

Purpose:
Validate the risk simulator without duplicating
the Quota Share mathematics.
"""

import unittest

from risk_simulator import simulate_risk


class TestRiskSimulator(unittest.TestCase):

    # --------------------------------------------------
    # TEST 1 — STANDARD RISK
    # --------------------------------------------------

    def test_standard_risk(self):

        result = simulate_risk(
            risk_id="Risk 001",
            sum_insured=10_000_000,
            premium=50_000,
            claim=2_000_000,
            qs_pct=0.40,
            ceding_comm_pct=0.30
        )

        self.assertEqual(
            result["risk"]["risk_id"],
            "Risk 001"
        )

        self.assertEqual(
            result["cedant"]["premium_retained"],
            30_000
        )

        self.assertEqual(
            result["reinsurer"]["premium_ceded"],
            20_000
        )

        self.assertEqual(
            result["cedant"]["claims_retained"],
            1_200_000
        )

        self.assertEqual(
            result["reinsurer"]["claims_ceded"],
            800_000
        )

        self.assertEqual(
            result["cedant"]["commission_received"],
            6_000
        )

        self.assertEqual(
            result["cedant"]["net_result"],
            -1_164_000
        )

        self.assertEqual(
            result["reinsurer"]["net_result"],
            -786_000
        )

        self.assertEqual(
            result["combined"]["result"],
            -1_950_000
        )

    # --------------------------------------------------
    # TEST 2 — QS = 0%
    # --------------------------------------------------

    def test_zero_quota_share(self):

        result = simulate_risk(
            risk_id="Risk 002",
            sum_insured=5_000_000,
            premium=100_000,
            claim=40_000,
            qs_pct=0.0,
            ceding_comm_pct=0.30
        )

        self.assertEqual(
            result["cedant"]["premium_retained"],
            100_000
        )

        self.assertEqual(
            result["reinsurer"]["premium_ceded"],
            0
        )

        self.assertEqual(
            result["cedant"]["claims_retained"],
            40_000
        )

        self.assertEqual(
            result["reinsurer"]["claims_ceded"],
            0
        )

        self.assertEqual(
            result["reinsurer"]["net_result"],
            0
        )

    # --------------------------------------------------
    # TEST 3 — QS = 100%
    # --------------------------------------------------

    def test_full_quota_share(self):

        result = simulate_risk(
            risk_id="Risk 003",
            sum_insured=5_000_000,
            premium=100_000,
            claim=40_000,
            qs_pct=1.0,
            ceding_comm_pct=0.30
        )

        self.assertEqual(
            result["cedant"]["premium_retained"],
            0
        )

        self.assertEqual(
            result["reinsurer"]["premium_ceded"],
            100_000
        )

        self.assertEqual(
            result["cedant"]["claims_retained"],
            0
        )

        self.assertEqual(
            result["reinsurer"]["claims_ceded"],
            40_000
        )

    # --------------------------------------------------
    # TEST 4 — NO CLAIM
    # --------------------------------------------------

    def test_no_claim(self):

        result = simulate_risk(
            risk_id="Risk 004",
            sum_insured=2_000_000,
            premium=50_000,
            claim=0,
            qs_pct=0.40,
            ceding_comm_pct=0.30
        )

        self.assertEqual(
            result["cedant"]["claims_retained"],
            0
        )

        self.assertEqual(
            result["reinsurer"]["claims_ceded"],
            0
        )

        self.assertEqual(
            result["combined"]["result"],
            50_000
        )

    # --------------------------------------------------
    # TEST 5 — ZERO PREMIUM
    # --------------------------------------------------

    def test_zero_premium(self):

        result = simulate_risk(
            risk_id="Risk 005",
            sum_insured=1_000_000,
            premium=0,
            claim=50_000,
            qs_pct=0.40,
            ceding_comm_pct=0.30
        )

        self.assertEqual(
            result["cedant"]["premium_retained"],
            0
        )

        self.assertEqual(
            result["reinsurer"]["premium_ceded"],
            0
        )

        self.assertEqual(
            result["combined"]["result"],
            -50_000
        )

    # --------------------------------------------------
    # TEST 6 — NEGATIVE SUM INSURED
    # --------------------------------------------------

    def test_negative_sum_insured(self):

        with self.assertRaises(ValueError):

            simulate_risk(
                risk_id="Risk 006",
                sum_insured=-1,
                premium=50_000,
                claim=10_000,
                qs_pct=0.40,
                ceding_comm_pct=0.30
            )

    # --------------------------------------------------
    # TEST 7 — INVALID QUOTA SHARE
    # --------------------------------------------------

    def test_invalid_quota_share(self):

        with self.assertRaises(ValueError):

            simulate_risk(
                risk_id="Risk 007",
                sum_insured=1_000_000,
                premium=50_000,
                claim=10_000,
                qs_pct=1.20,
                ceding_comm_pct=0.30
            )

    # --------------------------------------------------
    # TEST 8 — COMBINED RECONCILIATION
    # --------------------------------------------------

    def test_combined_reconciliation(self):

        result = simulate_risk(
            risk_id="Risk 008",
            sum_insured=3_000_000,
            premium=100_000,
            claim=60_000,
            qs_pct=0.50,
            ceding_comm_pct=0.20
        )

        combined = result["combined"]["result"]

        gross_economics = 100_000 - 60_000

        self.assertEqual(
            combined,
            gross_economics
        )


if __name__ == "__main__":
    unittest.main()