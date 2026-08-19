import os
import traceback
from pathlib import Path
from typing import Any, Dict, List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
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

BASE_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = BASE_DIR / "Frontend"

# --------------------------------------------------
# Schemas
# --------------------------------------------------

class RiskItem(BaseModel):
    risk_id: Optional[str] = None
    id: Optional[str] = None
    sum_insured: float = Field(default=0.0, ge=0)
    premium: Optional[float] = None
    gross_premium: Optional[float] = None
    claim: Optional[float] = None
    claim_amount: Optional[float] = None
    gross_claim: Optional[float] = None

class PortfolioWrapper(BaseModel):
    risks: List[RiskItem] = Field(default_factory=list)

class TreatyConfig(BaseModel):
    quota_share_pct: Optional[float] = Field(None, ge=0.0, le=1.0)
    quota_share_percentage: Optional[float] = Field(None, ge=0.0, le=1.0)
    qs_pct: Optional[float] = Field(None, ge=0.0, le=1.0)
    ceding_commission_pct: Optional[float] = Field(None, ge=0.0, le=1.0)
    ceding_commission_percentage: Optional[float] = Field(None, ge=0.0, le=1.0)
    ceding_comm_pct: Optional[float] = Field(None, ge=0.0, le=1.0)
    cedant_expenses: Optional[float] = Field(0.0, ge=0.0)
    reinsurer_expenses: Optional[float] = Field(0.0, ge=0.0)

class SimulationPayload(BaseModel):
    risks: Optional[List[RiskItem]] = None
    portfolio: Optional[PortfolioWrapper] = None
    treaty: Optional[TreatyConfig] = None
    quota_share_pct: Optional[float] = Field(None, ge=0.0, le=1.0)
    quota_share_percentage: Optional[float] = Field(None, ge=0.0, le=1.0)
    qs_pct: Optional[float] = Field(None, ge=0.0, le=1.0)
    ceding_commission_pct: Optional[float] = Field(None, ge=0.0, le=1.0)
    ceding_commission_percentage: Optional[float] = Field(None, ge=0.0, le=1.0)
    ceding_comm_pct: Optional[float] = Field(None, ge=0.0, le=1.0)
    cedant_expenses: Optional[float] = Field(0.0, ge=0.0)
    reinsurer_expenses: Optional[float] = Field(0.0, ge=0.0)

# --------------------------------------------------
# Endpoints
# --------------------------------------------------

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/")
def read_root():
    index_file = FRONTEND_DIR / "dashboard.html"
    if not index_file.exists():
        raise HTTPException(status_code=404, detail="dashboard.html not found")
    return FileResponse(index_file, media_type="text/html")

@app.get("/dashboard.css")
def get_css():
    css_file = FRONTEND_DIR / "dashboard.css"
    if not css_file.exists():
        return JSONResponse(content={"status": "empty"}, status_code=200)
    return FileResponse(css_file, media_type="text/css")

@app.get("/dashboard.js")
def get_js():
    js_file = FRONTEND_DIR / "dashboard.js"
    if not js_file.exists():
        return JSONResponse(content={"status": "empty"}, status_code=200)
    return FileResponse(js_file, media_type="application/javascript")

@app.post("/simulate")
def simulate_treaty(payload: SimulationPayload):
    try:
        raw_risks = payload.risks or (payload.portfolio.risks if payload.portfolio else None)
        if not raw_risks or len(raw_risks) == 0:
            raise HTTPException(status_code=422, detail="Portfolio must contain at least one risk.")

        formatted_risks = []
        for idx, r in enumerate(raw_risks):
            prem = r.premium if r.premium is not None else (r.gross_premium if r.gross_premium is not None else 0.0)
            clm = r.claim if r.claim is not None else (
                r.claim_amount if r.claim_amount is not None else (
                    r.gross_claim if r.gross_claim is not None else 0.0
                )
            )
            formatted_risks.append({
                "risk_id": r.risk_id or r.id or f"Risk 00{idx+1}",
                "sum_insured": float(r.sum_insured),
                "premium": float(prem),
                "claim": float(clm)
            })

        t = payload.treaty
        qs_val = (
            payload.qs_pct or payload.quota_share_pct or payload.quota_share_percentage or
            (t.qs_pct if t else None) or (t.quota_share_pct if t else None) or (t.quota_share_percentage if t else None) or
            0.40
        )

        comm_val = (
            payload.ceding_comm_pct or payload.ceding_commission_pct or payload.ceding_commission_percentage or
            (t.ceding_comm_pct if t else None) or (t.ceding_commission_pct if t else None) or (t.ceding_commission_percentage if t else None) or
            0.30
        )

        ced_exp = payload.cedant_expenses or (t.cedant_expenses if t else 0.0) or 0.0
        rein_exp = payload.reinsurer_expenses or (t.reinsurer_expenses if t else 0.0) or 0.0

        result = simulate_portfolio(
            risks=formatted_risks,
            qs_pct=float(qs_val),
            ceding_comm_pct=float(comm_val),
            cedant_expenses=float(ced_exp),
            reinsurer_expenses=float(rein_exp)
        )
        return JSONResponse(content=result, status_code=200)

    except HTTPException as he:
        return JSONResponse(content={"detail": he.detail}, status_code=he.status_code)
    except ValueError as ve:
        return JSONResponse(content={"detail": str(ve)}, status_code=422)
    except Exception as e:
        return JSONResponse(content={"detail": str(e)}, status_code=400)