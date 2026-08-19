"""
EdInsured Treaty Lab
Portfolio Quota Share Simulator — M3 Tests
"""

import unittest

from portfolio_simulator import simulate_portfolio


class TestPortfolioSimulator(unittest.TestCase):

    def setUp(self):

        self.portfolio = [
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

    # --------------------------------------------------
    # 1. STANDARD PORTFOLIO
    # --------------------------------------------------

    def test_standard_portfolio(self):

        result = simulate_portfolio(
            self.portfolio,
            qs_pct=0.40,
            ceding_comm_pct=0.30
        )

        self.assertEqual(
            result["portfolio"]["number_of_risks"],
            3
        )

        self.assertEqual(
            result["portfolio"]["gross_premium"],
            225_000
        )

        self.assertEqual(
            result["portfolio"]["gross_claims"],
            2_500_000
        )

    # --------------------------------------------------
    # 2. SINGLE RISK PORTFOLIO
    # --------------------------------------------------

    def test_single_risk_portfolio(self):

        portfolio = [self.portfolio[0]]

        result = simulate_portfolio(
            portfolio,
            qs_pct=0.40,
            ceding_comm_pct=0.30
        )

        self.assertEqual(
            result["portfolio"]["number_of_risks"],
            1
        )

        self.assertEqual(
            result["portfolio"]["gross_premium"],
            50_000
        )

        self.assertEqual(
            result["portfolio"]["gross_claims"],
            2_000_000
        )

    # --------------------------------------------------
    # 3. QS = 0%
    # --------------------------------------------------

    def test_zero_quota_share(self):

        result = simulate_portfolio(
            self.portfolio,
            qs_pct=0.0,
            ceding_comm_pct=0.30
        )

        self.assertEqual(
            result["reinsurer"]["premium_ceded"],
            0
        )

        self.assertEqual(
            result["reinsurer"]["claims_ceded"],
            0
        )

        self.assertEqual(
            result["cedant"]["premium_retained"],
            225_000
        )

        self.assertEqual(
            result["cedant"]["claims_retained"],
            2_500_000
        )

    # --------------------------------------------------
    # 4. QS = 100%
    # --------------------------------------------------

    def test_full_quota_share(self):

        result = simulate_portfolio(
            self.portfolio,
            qs_pct=1.0,
            ceding_comm_pct=0.30
        )

        self.assertEqual(
            result["cedant"]["premium_retained"],
            0
        )

        self.assertEqual(
            result["cedant"]["claims_retained"],
            0
        )

        self.assertEqual(
            result["reinsurer"]["premium_ceded"],
            225_000
        )

        self.assertEqual(
            result["reinsurer"]["claims_ceded"],
            2_500_000
        )

    # --------------------------------------------------
    # 5. NO CLAIMS
    # --------------------------------------------------

    def test_no_claims(self):

        portfolio = [
            {
                "risk_id": "Risk 001",
                "sum_insured": 10_000_000,
                "premium": 50_000,
                "claim": 0
            },
            {
                "risk_id": "Risk 002",
                "sum_insured": 5_000_000,
                "premium": 75_000,
                "claim": 0
            }
        ]

        result = simulate_portfolio(
            portfolio,
            qs_pct=0.40,
            ceding_comm_pct=0.30
        )

        self.assertEqual(
            result["portfolio"]["gross_claims"],
            0
        )

        self.assertEqual(
            result["cedant"]["claims_retained"],
            0
        )

        self.assertEqual(
            result["reinsurer"]["claims_ceded"],
            0
        )

    # --------------------------------------------------
    # 6. EMPTY PORTFOLIO
    # --------------------------------------------------

    def test_empty_portfolio_rejected(self):

        with self.assertRaises(ValueError):

            simulate_portfolio(
                [],
                qs_pct=0.40,
                ceding_comm_pct=0.30
            )

    # --------------------------------------------------
    # 7. NEGATIVE EXPENSES
    # --------------------------------------------------

    def test_negative_cedant_expenses_rejected(self):

        with self.assertRaises(ValueError):

            simulate_portfolio(
                self.portfolio,
                qs_pct=0.40,
                ceding_comm_pct=0.30,
                cedant_expenses=-1
            )

    # --------------------------------------------------
    # 8. PREMIUM RECONCILIATION
    # --------------------------------------------------

    def test_premium_reconciliation(self):

        result = simulate_portfolio(
            self.portfolio,
            qs_pct=0.40,
            ceding_comm_pct=0.30
        )

        self.assertEqual(
            result["reconciliation"]["premium_difference"],
            0
        )

    # --------------------------------------------------
    # 9. CLAIM RECONCILIATION
    # --------------------------------------------------

    def test_claim_reconciliation(self):

        result = simulate_portfolio(
            self.portfolio,
            qs_pct=0.40,
            ceding_comm_pct=0.30
        )

        self.assertEqual(
            result["reconciliation"]["claims_difference"],
            0
        )

    # --------------------------------------------------
    # 10. RESULT RECONCILIATION
    # --------------------------------------------------

    def test_result_reconciliation(self):

        result = simulate_portfolio(
            self.portfolio,
            qs_pct=0.40,
            ceding_comm_pct=0.30
        )

        self.assertEqual(
            result["reconciliation"]["result_difference"],
            0
        )

    # --------------------------------------------------
    # 11. LARGE PORTFOLIO
    # --------------------------------------------------

    def test_large_portfolio(self):

        portfolio = []

        for i in range(1000):

            portfolio.append({
                "risk_id": f"Risk {i + 1:04d}",
                "sum_insured": 10_000_000,
                "premium": 50_000,
                "claim": 100_000
            })

        result = simulate_portfolio(
            portfolio,
            qs_pct=0.40,
            ceding_comm_pct=0.30
        )

        self.assertEqual(
            result["portfolio"]["number_of_risks"],
            1000
        )

        self.assertEqual(
            result["portfolio"]["gross_premium"],
            50_000_000
        )

        self.assertEqual(
            result["portfolio"]["gross_claims"],
            100_000_000
        )

        self.assertEqual(
            result["reconciliation"]["premium_difference"],
            0
        )

        self.assertEqual(
            result["reconciliation"]["claims_difference"],
            0
        )

    # --------------------------------------------------
    # 12. RISK RESULTS PRESERVED
    # --------------------------------------------------

    def test_risk_results_preserved(self):

        result = simulate_portfolio(
            self.portfolio,
            qs_pct=0.40,
            ceding_comm_pct=0.30
        )

        self.assertEqual(
            len(result["risks"]),
            3
        )

        self.assertEqual(
            result["risks"][0]["risk"]["risk_id"],
            "Risk 001"
        )

        self.assertEqual(
            result["risks"][1]["risk"]["risk_id"],
            "Risk 002"
        )

        self.assertEqual(
            result["risks"][2]["risk"]["risk_id"],
            "Risk 003"
        )


if __name__ == "__main__":
    unittest.main()