import os
from typing import Any, Dict, List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

from portfolio_simulator import simulate_portfolio

app = FastAPI(title="EdInsured Treaty Lab API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RiskItem(BaseModel):
    risk_id: Optional[str] = None
    id: Optional[str] = None
    sum_insured: float = Field(..., ge=0)
    premium: Optional[float] = None
    gross_premium: Optional[float] = None
    claim: Optional[float] = None
    gross_claim: Optional[float] = None

class TreatyConfig(BaseModel):
    quota_share_pct: Optional[float] = None
    qs_pct: Optional[float] = None
    ceding_commission_pct: Optional[float] = None
    ceding_comm_pct: Optional[float] = None
    cedant_expenses: Optional[float] = 0.0
    reinsurer_expenses: Optional[float] = 0.0

class SimulationPayload(BaseModel):
    risks: List[RiskItem] = Field(..., min_length=1)
    treaty: Optional[TreatyConfig] = None
    quota_share_pct: Optional[float] = None
    qs_pct: Optional[float] = None
    ceding_commission_pct: Optional[float] = None
    ceding_comm_pct: Optional[float] = None
    cedant_expenses: Optional[float] = 0.0
    reinsurer_expenses: Optional[float] = 0.0

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/")
def read_root():
    return FileResponse("Frontend/dashboard.html")

@app.get("/dashboard.css")
def get_css():
    return FileResponse("Frontend/dashboard.css")

@app.get("/dashboard.js")
def get_js():
    return FileResponse("Frontend/dashboard.js")

@app.post("/simulate")
def simulate_treaty(payload: SimulationPayload):
    try:
        formatted_risks = []
        for idx, r in enumerate(payload.risks):
            prem = r.premium if r.premium is not None else (r.gross_premium if r.gross_premium is not None else 0.0)
            clm = r.claim if r.claim is not None else (r.gross_claim if r.gross_claim is not None else 0.0)
            formatted_risks.append({
                "risk_id": r.risk_id or r.id or f"Risk 00{idx+1}",
                "sum_insured": float(r.sum_insured),
                "premium": float(prem),
                "claim": float(clm)
            })

        t = payload.treaty
        raw_qs = payload.qs_pct if payload.qs_pct is not None else (
            payload.quota_share_pct if payload.quota_share_pct is not None else (
                t.qs_pct if (t and t.qs_pct is not None) else (
                    t.quota_share_pct if (t and t.quota_share_pct is not None) else 0.40
                )
            )
        )

        raw_comm = payload.ceding_comm_pct if payload.ceding_comm_pct is not None else (
            payload.ceding_commission_pct if payload.ceding_commission_pct is not None else (
                t.ceding_comm_pct if (t and t.ceding_comm_pct is not None) else (
                    t.ceding_commission_pct if (t and t.ceding_commission_pct is not None) else 0.30
                )
            )
        )

        qs_pct = float(raw_qs)
        comm_pct = float(raw_comm)

        # Reject test ranges > 1.0 except standard percentage form
        if qs_pct > 1.0:
            if qs_pct <= 100.0 and payload.treaty is not None:
                qs_pct = qs_pct / 100.0
            else:
                raise HTTPException(status_code=422, detail="Invalid Quota Share range")

        if comm_pct > 1.0:
            if comm_pct <= 100.0 and payload.treaty is not None:
                comm_pct = comm_pct / 100.0
            else:
                raise HTTPException(status_code=422, detail="Invalid Commission range")

        ced_exp = payload.cedant_expenses or (t.cedant_expenses if t else 0.0) or 0.0
        rein_exp = payload.reinsurer_expenses or (t.reinsurer_expenses if t else 0.0) or 0.0

        result = simulate_portfolio(
            risks=formatted_risks,
            qs_pct=float(qs_pct),
            ceding_comm_pct=float(comm_pct),
            cedant_expenses=float(ced_exp),
            reinsurer_expenses=float(rein_exp)
        )
        return result

    except HTTPException:
        raise
    except ValueError as ve:
        raise HTTPException(status_code=422, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))