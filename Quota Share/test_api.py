"""
API tests for EdInsured Treaty Lab (M4.3)
Verifies POST /simulate integration with the underlying engine.
"""

import unittest
from fastapi.testclient import TestClient
from api import app

client = TestClient(app)


class TestSimulationAPI(unittest.TestCase):

    def setUp(self):
        self.sample_payload = {
            "risks": [
                {"risk_id": "Risk 001", "sum_insured": 10000000, "premium": 50000, "claim": 2000000},
                {"risk_id": "Risk 002", "sum_insured": 15000000, "premium": 75000, "claim": 500000},
                {"risk_id": "Risk 003", "sum_insured": 10000000, "premium": 100000, "claim": 0}
            ],
            "qs_pct": 0.40,
            "ceding_comm_pct": 0.30,
            "cedant_expenses": 0.0,
            "reinsurer_expenses": 0.0
        }

    def test_health(self):
        res = client.get("/health")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["status"], "ok")

    def test_post_simulate_success(self):
        res = client.post("/simulate", json=self.sample_payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()

        # Check Portfolio
        self.assertEqual(data["portfolio"]["number_of_risks"], 3)
        self.assertEqual(data["portfolio"]["gross_premium"], 225000)
        self.assertEqual(data["portfolio"]["gross_claims"], 2500000)

        # Check Reconciliations
        self.assertEqual(data["reconciliation"]["premium_difference"], 0.0)
        self.assertEqual(data["reconciliation"]["claims_difference"], 0.0)
        self.assertEqual(data["reconciliation"]["result_difference"], 0.0)

        # Check Risk Results
        self.assertEqual(len(data["risks"]), 3)

    def test_empty_portfolio_rejected(self):
        bad_payload = self.sample_payload.copy()
        bad_payload["risks"] = []
        res = client.post("/simulate", json=bad_payload)
        self.assertEqual(res.status_code, 422)

    def test_invalid_qs_range_rejected(self):
        bad_payload = self.sample_payload.copy()
        bad_payload["qs_pct"] = 1.5  # > 100%
        res = client.post("/simulate", json=bad_payload)
        self.assertEqual(res.status_code, 422)


if __name__ == "__main__":
    unittest.main()