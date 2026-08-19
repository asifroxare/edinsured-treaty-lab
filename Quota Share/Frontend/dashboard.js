/**
 * EdInsured Treaty Lab — M4.5 Student Interaction Lab
 * Presentation & Input Layer
 */

const PRESETS = {
  standard: {
    qs_pct: 40,
    ceding_comm_pct: 30,
    cedant_expenses: 0,
    reinsurer_expenses: 0,
    risks: [
      { risk_id: 'Risk 001', sum_insured: 10000000, premium: 50000, claim: 2000000 },
      { risk_id: 'Risk 002', sum_insured: 5000000, premium: 75000, claim: 0 },
      { risk_id: 'Risk 003', sum_insured: 20000000, premium: 100000, claim: 500000 }
    ]
  },
  high_loss: {
    qs_pct: 40,
    ceding_comm_pct: 30,
    cedant_expenses: 0,
    reinsurer_expenses: 0,
    risks: [
      { risk_id: 'Risk 001', sum_insured: 10000000, premium: 50000, claim: 8000000 },
      { risk_id: 'Risk 002', sum_insured: 5000000, premium: 75000, claim: 4000000 },
      { risk_id: 'Risk 003', sum_insured: 20000000, premium: 100000, claim: 18000000 }
    ]
  },
  no_claims: {
    qs_pct: 40,
    ceding_comm_pct: 30,
    cedant_expenses: 0,
    reinsurer_expenses: 0,
    risks: [
      { risk_id: 'Risk 001', sum_insured: 10000000, premium: 50000, claim: 0 },
      { risk_id: 'Risk 002', sum_insured: 5000000, premium: 75000, claim: 0 },
      { risk_id: 'Risk 003', sum_insured: 20000000, premium: 100000, claim: 0 }
    ]
  },
  full_qs: {
    qs_pct: 100,
    ceding_comm_pct: 30,
    cedant_expenses: 0,
    reinsurer_expenses: 0,
    risks: [
      { risk_id: 'Risk 001', sum_insured: 10000000, premium: 50000, claim: 2000000 },
      { risk_id: 'Risk 002', sum_insured: 5000000, premium: 75000, claim: 0 },
      { risk_id: 'Risk 003', sum_insured: 20000000, premium: 100000, claim: 500000 }
    ]
  }
};

let currentRisks = JSON.parse(JSON.stringify(PRESETS.standard.risks));

const formatCurrency = (val, decimals = 0) => {
  if (val === null || val === undefined || isNaN(val)) return '$0';
  const num = Number(val);
  const formatted = Math.abs(num).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
  return num < 0 ? `-$${formatted}` : `$${formatted}`;
};

const formatPercent = (val) => {
  if (val === null || val === undefined || isNaN(val)) return '0.00%';
  return `${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
};

document.addEventListener('DOMContentLoaded', () => {
  renderPortfolioEditor();
  attachEventListeners();
});

function attachEventListeners() {
  const form = document.getElementById('simulation-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await handleRunSimulation();
    });
  }

  const addBtn = document.getElementById('add-risk-btn');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      addNewRisk();
    });
  }

  const resetBtn = document.getElementById('reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      resetPortfolio();
    });
  }

  const presetButtons = document.querySelectorAll('.preset-btn');
  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      presetButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const presetKey = btn.dataset.preset;
      if (PRESETS[presetKey]) {
        loadPreset(PRESETS[presetKey]);
      }
    });
  });
}

function renderPortfolioEditor() {
  const container = document.getElementById('risks-container');
  const countLabel = document.getElementById('risk-count-label');
  if (!container) return;

  if (countLabel) {
    countLabel.textContent = currentRisks.length;
  }

  container.innerHTML = currentRisks.map((risk, index) => `
    <div class="risk-entry-card" data-index="${index}">
      <div class="risk-card-top">
        <span class="risk-title font-mono">${risk.risk_id}</span>
        ${currentRisks.length > 1 ? `
          <button type="button" class="btn-delete-risk" onclick="deleteRisk(${index})" title="Delete Risk">
            ✕ Remove
          </button>
        ` : '<span class="min-risk-tag">Min 1 Risk</span>'}
      </div>

      <div class="risk-inputs-grid">
        <div class="input-field">
          <label>Sum Insured ($)</label>
          <input type="number" class="risk-input" data-field="sum_insured" value="${risk.sum_insured}" min="0" step="1000" />
          <div class="field-error inline-err" id="error-risk-${index}-sum_insured"></div>
        </div>

        <div class="input-field">
          <label>Gross Premium ($)</label>
          <input type="number" class="risk-input" data-field="premium" value="${risk.premium}" min="0" step="500" />
          <div class="field-error inline-err" id="error-risk-${index}-premium"></div>
        </div>

        <div class="input-field">
          <label>Gross Claim ($)</label>
          <input type="number" class="risk-input" data-field="claim" value="${risk.claim}" min="0" step="500" />
          <div class="field-error inline-err" id="error-risk-${index}-claim"></div>
        </div>
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.risk-input').forEach(input => {
    input.addEventListener('input', (e) => {
      const card = e.target.closest('.risk-entry-card');
      const idx = parseInt(card.dataset.index, 10);
      const field = e.target.dataset.field;
      currentRisks[idx][field] = parseFloat(e.target.value) || 0;
    });
  });
}

function addNewRisk() {
  const nextNum = currentRisks.length + 1;
  const formattedId = `Risk ${String(nextNum).padStart(3, '0')}`;

  currentRisks.push({
    risk_id: formattedId,
    sum_insured: 10000000,
    premium: 50000,
    claim: 0
  });

  renderPortfolioEditor();
}

window.deleteRisk = function(index) {
  if (currentRisks.length <= 1) {
    showGlobalError('Cannot delete the final remaining risk. At least 1 risk is required.');
    return;
  }
  currentRisks.splice(index, 1);
  currentRisks.forEach((r, idx) => {
    r.risk_id = `Risk ${String(idx + 1).padStart(3, '0')}`;
  });
  renderPortfolioEditor();
};

function loadPreset(preset) {
  document.getElementById('quota-share').value = preset.qs_pct;
  document.getElementById('ceding-comm').value = preset.ceding_comm_pct;
  document.getElementById('cedant-expenses').value = preset.cedant_expenses;
  document.getElementById('reinsurer-expenses').value = preset.reinsurer_expenses;

  currentRisks = JSON.parse(JSON.stringify(preset.risks));
  clearAllErrors();
  renderPortfolioEditor();
}

function resetPortfolio() {
  document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
  const stdBtn = document.querySelector('.preset-btn[data-preset="standard"]');
  if (stdBtn) stdBtn.classList.add('active');

  loadPreset(PRESETS.standard);

  const dashboard = document.getElementById('results-dashboard');
  if (dashboard) {
    dashboard.innerHTML = `
      <div class="placeholder-state">
        <div class="placeholder-icon">📊</div>
        <h3>Ready to Experiment</h3>
        <p>Portfolio reset to standard defaults. Click <strong>"Run Simulation"</strong> to execute.</p>
      </div>
    `;
  }
}

function clearAllErrors() {
  document.querySelectorAll('.field-error').forEach(el => {
    el.textContent = '';
    el.style.display = 'none';
  });
  const banner = document.getElementById('error-banner');
  if (banner) banner.style.display = 'none';
}

function showFieldError(elementId, message) {
  const el = document.getElementById(elementId);
  if (el) {
    el.textContent = message;
    el.style.display = 'block';
  }
}

function showGlobalError(message) {
  const banner = document.getElementById('error-banner');
  if (banner) {
    banner.textContent = message;
    banner.style.display = 'block';
  }
}

function validateInputs() {
  clearAllErrors();
  let isValid = true;

  const qsInput = document.getElementById('quota-share');
  const qsVal = parseFloat(qsInput.value);
  if (isNaN(qsVal) || qsVal < 0 || qsVal > 100) {
    showFieldError('error-quota-share', 'Quota Share must be between 0% and 100%.');
    isValid = false;
  }

  const commInput = document.getElementById('ceding-comm');
  const commVal = parseFloat(commInput.value);
  if (isNaN(commVal) || commVal < 0 || commVal > 100) {
    showFieldError('error-ceding-comm', 'Ceding Commission must be between 0% and 100%.');
    isValid = false;
  }

  const cedExpInput = document.getElementById('cedant-expenses');
  const cedExpVal = parseFloat(cedExpInput.value);
  if (isNaN(cedExpVal) || cedExpVal < 0) {
    showFieldError('error-cedant-expenses', 'Cedant Expenses cannot be negative.');
    isValid = false;
  }

  const reinExpInput = document.getElementById('reinsurer-expenses');
  const reinExpVal = parseFloat(reinExpInput.value);
  if (isNaN(reinExpVal) || reinExpVal < 0) {
    showFieldError('error-reinsurer-expenses', 'Reinsurer Expenses cannot be negative.');
    isValid = false;
  }

  if (!currentRisks || currentRisks.length === 0) {
    showFieldError('error-portfolio-global', 'Portfolio must contain at least one risk.');
    isValid = false;
  }

  currentRisks.forEach((risk, idx) => {
    if (isNaN(risk.sum_insured) || risk.sum_insured < 0) {
      showFieldError(`error-risk-${idx}-sum_insured`, 'Sum Insured cannot be negative.');
      isValid = false;
    }
    if (isNaN(risk.premium) || risk.premium < 0) {
      showFieldError(`error-risk-${idx}-premium`, 'Premium cannot be negative.');
      isValid = false;
    }
    if (isNaN(risk.claim) || risk.claim < 0) {
      showFieldError(`error-risk-${idx}-claim`, 'Claim cannot be negative.');
      isValid = false;
    }
  });

  return isValid;
}

function buildSimulationPayload() {
  const rawQs = parseFloat(document.getElementById('quota-share').value) || 0;
  const rawComm = parseFloat(document.getElementById('ceding-comm').value) || 0;
  const cedExp = parseFloat(document.getElementById('cedant-expenses').value) || 0;
  const reinExp = parseFloat(document.getElementById('reinsurer-expenses').value) || 0;

  // Convert 40 -> 0.40, 30 -> 0.30
  const qsDecimal = rawQs > 1.0 ? rawQs / 100.0 : rawQs;
  const commDecimal = rawComm > 1.0 ? rawComm / 100.0 : rawComm;

  return {
    treaty: {
      quota_share_pct: qsDecimal,
      ceding_commission_pct: commDecimal,
      cedant_expenses: cedExp,
      reinsurer_expenses: reinExp
    },
    risks: currentRisks.map(r => ({
      risk_id: r.risk_id,
      sum_insured: Number(r.sum_insured),
      premium: Number(r.premium),
      claim: Number(r.claim)
    }))
  };
}

async function handleRunSimulation() {
  if (!validateInputs()) {
    return;
  }

  const simulateBtn = document.getElementById('simulate-btn');
  const btnText = simulateBtn.querySelector('.btn-text');
  const btnSpinner = simulateBtn.querySelector('.btn-spinner');

  simulateBtn.disabled = true;
  if (btnText) btnText.style.display = 'none';
  if (btnSpinner) btnSpinner.style.display = 'inline';

  const payload = buildSimulationPayload();

  try {
    const response = await fetch('/simulate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      const errorDetail = errJson.detail || response.statusText;
      throw new Error(typeof errorDetail === 'object' ? JSON.stringify(errorDetail) : errorDetail);
    }

    const data = await response.json();
    renderResultsDashboard(data);

    const resultsPanel = document.getElementById('results-panel-container');
    if (resultsPanel && window.innerWidth <= 1024) {
      resultsPanel.scrollIntoView({ behavior: 'smooth' });
    }
  } catch (err) {
    console.error('Simulation Failed:', err);
    showGlobalError(`Simulation Request Failed: ${err.message}`);
  } finally {
    simulateBtn.disabled = false;
    if (btnText) btnText.style.display = 'inline';
    if (btnSpinner) btnSpinner.style.display = 'none';
  }
}

function renderResultsDashboard(result) {
  const container = document.getElementById('results-dashboard');
  if (!container || !result) return;

  container.innerHTML = `
    ${renderTreatyConfigBadge(result.treaty)}
    ${renderResultSummary(result)}
    <div class="dashboard-grid-two-col">
      ${renderBeforeReinsurance(result.portfolio, result.gross_metrics)}
      ${renderMoneyFlow(result)}
    </div>
    ${renderCedantVsReinsurer(result.cedant, result.reinsurer)}
    ${renderCombinedEconomics(result.cedant, result.reinsurer, result.combined)}
    ${renderReconciliation(result.reconciliation)}
    ${renderRiskTable(result.risks)}
  `;
}

function renderTreatyConfigBadge(treaty) {
  const qsDisplay = (treaty?.quota_share_pct <= 1.0) ? treaty.quota_share_pct * 100 : treaty.quota_share_pct;
  const commDisplay = (treaty?.ceding_commission_pct <= 1.0) ? treaty.ceding_commission_pct * 100 : treaty.ceding_commission_pct;

  return `
    <div class="treaty-config-bar">
      <div class="config-title">Active Simulation Output</div>
      <div class="config-chips">
        <span class="chip"><strong>Quota Share:</strong> ${formatPercent(qsDisplay)}</span>
        <span class="chip"><strong>Ceding Commission:</strong> ${formatPercent(commDisplay)}</span>
      </div>
    </div>
  `;
}

function renderResultSummary(result) {
  const p = result.portfolio || {};
  const gm = result.gross_metrics || {};
  const comb = result.combined || {};
  const isLoss = (comb.result ?? 0) < 0;

  return `
    <section class="dashboard-section">
      <div class="kpi-cards-grid">
        <div class="kpi-card">
          <div class="kpi-label">NUMBER OF RISKS</div>
          <div class="kpi-value text-blue">${p.number_of_risks ?? 0}</div>
          <div class="kpi-sub">Portfolio size</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">GROSS PREMIUM</div>
          <div class="kpi-value text-slate">${formatCurrency(p.gross_premium)}</div>
          <div class="kpi-sub">Total underwritten</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">GROSS CLAIMS</div>
          <div class="kpi-value text-red">${formatCurrency(p.gross_claims)}</div>
          <div class="kpi-sub">Incurred losses</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">GROSS LOSS RATIO</div>
          <div class="kpi-value ${gm.gross_loss_ratio_pct > 100 ? 'text-red' : 'text-slate'}">${formatPercent(gm.gross_loss_ratio_pct)}</div>
          <div class="kpi-sub">Claims / Premium</div>
        </div>
        <div class="kpi-card highlight-card">
          <div class="kpi-label">COMBINED RESULT</div>
          <div class="kpi-value ${isLoss ? 'text-red' : 'text-green'}">${formatCurrency(comb.result)}</div>
          <div class="kpi-sub">Total economic outcome</div>
        </div>
      </div>
    </section>
  `;
}

function renderBeforeReinsurance(portfolio = {}, gm = {}) {
  const result = gm.gross_underwriting_result ?? (portfolio.gross_premium - portfolio.gross_claims);
  return `
    <div class="card panel-card">
      <div class="card-header">
        <h3>The Original Portfolio (Before Reinsurance)</h3>
      </div>
      <div class="card-body flow-vertical">
        <div class="flow-step">
          <span class="flow-step-label">Gross Premium</span>
          <span class="flow-step-value text-green">${formatCurrency(portfolio.gross_premium)}</span>
        </div>
        <div class="flow-arrow">↓ minus</div>
        <div class="flow-step">
          <span class="flow-step-label">Gross Incurred Claims</span>
          <span class="flow-step-value text-red">${formatCurrency(portfolio.gross_claims)}</span>
        </div>
        <div class="flow-arrow">↓ equals</div>
        <div class="flow-step total-step">
          <span class="flow-step-label">Gross Underwriting Result</span>
          <span class="flow-step-value ${result < 0 ? 'text-red' : 'text-green'}">${formatCurrency(result)}</span>
        </div>
        <div class="loss-ratio-badge">
          Original Loss Ratio: <strong>${formatPercent(gm.gross_loss_ratio_pct)}</strong>
        </div>
      </div>
    </div>
  `;
}

function renderMoneyFlow(result) {
  const c = result.cedant || {};
  const r = result.reinsurer || {};
  const p = result.portfolio || {};

  return `
    <div class="card panel-card">
      <div class="card-header">
        <h3>How Quota Share Changes the Portfolio</h3>
      </div>
      <div class="card-body">
        <div class="flow-block">
          <div class="flow-block-title">Premium Allocation (${formatCurrency(p.gross_premium)})</div>
          <div class="flow-split">
            <div class="split-side">
              <span class="split-tag">Cedant Retained</span>
              <span class="split-value text-blue">${formatCurrency(c.premium_retained)}</span>
            </div>
            <div class="split-plus">+</div>
            <div class="split-side">
              <span class="split-tag">Reinsurer Ceded</span>
              <span class="split-value text-purple">${formatCurrency(r.premium_ceded)}</span>
            </div>
          </div>
        </div>

        <div class="flow-block mt-3">
          <div class="flow-block-title">Claims Allocation (${formatCurrency(p.gross_claims)})</div>
          <div class="flow-split">
            <div class="split-side">
              <span class="split-tag">Cedant Retained</span>
              <span class="split-value text-red">${formatCurrency(c.claims_retained)}</span>
            </div>
            <div class="split-plus">+</div>
            <div class="split-side">
              <span class="split-tag">Reinsurer Ceded</span>
              <span class="split-value text-red">${formatCurrency(r.claims_ceded)}</span>
            </div>
          </div>
        </div>

        <div class="flow-block mt-3">
          <div class="flow-block-title">Ceding Commission Flow</div>
          <div class="flow-split">
            <div class="split-side">
              <span class="split-tag">Cedant Receives</span>
              <span class="split-value text-green">+${formatCurrency(c.commission_received)}</span>
            </div>
            <div class="split-arrow">⇄</div>
            <div class="split-side">
              <span class="split-tag">Reinsurer Pays</span>
              <span class="split-value text-slate">-${formatCurrency(r.commission_paid)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderCedantVsReinsurer(cedant = {}, reinsurer = {}) {
  return `
    <section class="dashboard-section mt-4">
      <h2 class="section-title">Cedant vs. Reinsurer Economics</h2>
      <div class="comparison-grid">
        <div class="card comparison-card cedant-card">
          <div class="comparison-header">
            <h3>CEDANT (Primary Insurer)</h3>
            <span class="badge badge-blue">Direct Carrier</span>
          </div>
          <div class="comparison-body">
            <table class="economic-table">
              <tr>
                <td>Premium Retained</td>
                <td class="text-right text-green">${formatCurrency(cedant.premium_retained)}</td>
              </tr>
              <tr>
                <td>Claims Retained</td>
                <td class="text-right text-red">${formatCurrency(cedant.claims_retained)}</td>
              </tr>
              <tr>
                <td>Commission Received</td>
                <td class="text-right text-green">+${formatCurrency(cedant.commission_received)}</td>
              </tr>
              ${cedant.expenses ? `
              <tr>
                <td>Direct Expenses</td>
                <td class="text-right text-slate">-${formatCurrency(cedant.expenses)}</td>
              </tr>` : ''}
              <tr class="result-row">
                <td><strong>Net Underwriting Result</strong></td>
                <td class="text-right ${cedant.net_result < 0 ? 'text-red' : 'text-green'}">
                  <strong>${formatCurrency(cedant.net_result)}</strong>
                </td>
              </tr>
              <tr>
                <td>Net Loss Ratio</td>
                <td class="text-right font-medium">${formatPercent(cedant.loss_ratio_pct)}</td>
              </tr>
            </table>
          </div>
        </div>

        <div class="card comparison-card reinsurer-card">
          <div class="comparison-header">
            <h3>REINSURER (Treaty Partner)</h3>
            <span class="badge badge-purple">Assumed Risk</span>
          </div>
          <div class="comparison-body">
            <table class="economic-table">
              <tr>
                <td>Premium Ceded</td>
                <td class="text-right text-green">${formatCurrency(reinsurer.premium_ceded)}</td>
              </tr>
              <tr>
                <td>Claims Ceded</td>
                <td class="text-right text-red">${formatCurrency(reinsurer.claims_ceded)}</td>
              </tr>
              <tr>
                <td>Commission Paid</td>
                <td class="text-right text-slate">-${formatCurrency(reinsurer.commission_paid)}</td>
              </tr>
              ${reinsurer.expenses ? `
              <tr>
                <td>Treaty Expenses</td>
                <td class="text-right text-slate">-${formatCurrency(reinsurer.expenses)}</td>
              </tr>` : ''}
              <tr class="result-row">
                <td><strong>Net Underwriting Result</strong></td>
                <td class="text-right ${reinsurer.net_result < 0 ? 'text-red' : 'text-green'}">
                  <strong>${formatCurrency(reinsurer.net_result)}</strong>
                </td>
              </tr>
              <tr>
                <td>Net Loss Ratio</td>
                <td class="text-right font-medium">${formatPercent(reinsurer.loss_ratio_pct)}</td>
              </tr>
            </table>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderCombinedEconomics(cedant = {}, reinsurer = {}, combined = {}) {
  return `
    <section class="dashboard-section mt-4">
      <div class="card combined-card">
        <div class="card-header">
          <h3>Combined Economics</h3>
          <p class="section-subtitle">The treaty reallocates the portfolio economics between Cedant and Reinsurer.</p>
        </div>
        <div class="combined-formula-bar">
          <div class="formula-col">
            <div class="f-label">Cedant Net Result</div>
            <div class="f-val ${cedant.net_result < 0 ? 'text-red' : 'text-green'}">${formatCurrency(cedant.net_result)}</div>
          </div>
          <div class="f-operator">+</div>
          <div class="formula-col">
            <div class="f-label">Reinsurer Net Result</div>
            <div class="f-val ${reinsurer.net_result < 0 ? 'text-red' : 'text-green'}">${formatCurrency(reinsurer.net_result)}</div>
          </div>
          <div class="f-operator">=</div>
          <div class="formula-col result-col">
            <div class="f-label">Combined Result</div>
            <div class="f-val ${combined.result < 0 ? 'text-red' : 'text-green'}">${formatCurrency(combined.result)}</div>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderReconciliation(recon = {}) {
  const premDiff = recon.premium_difference ?? 0;
  const claimsDiff = recon.claims_difference ?? 0;
  const resultDiff = recon.result_difference ?? 0;

  const isReconciled = Math.abs(premDiff) < 0.001 && Math.abs(claimsDiff) < 0.001 && Math.abs(resultDiff) < 0.001;

  return `
    <section class="dashboard-section mt-4">
      <div class="card recon-card ${isReconciled ? 'recon-success' : 'recon-warning'}">
        <div class="recon-header">
          <div class="recon-title-group">
            <h3>Mathematical Reconciliation</h3>
            <p>Reconciliation confirms that the portfolio allocation remains mathematically consistent with the validated Quota Share engine.</p>
          </div>
          <div class="recon-badge ${isReconciled ? 'badge-success' : 'badge-danger'}">
            ${isReconciled ? '✓ RECONCILED' : '⚠ DISCREPANCY DETECTED'}
          </div>
        </div>
        <div class="recon-checks-grid">
          <div class="check-box">
            <div class="check-label">Premium Difference</div>
            <div class="check-val">${formatCurrency(premDiff, 2)}</div>
            <div class="check-state">${Math.abs(premDiff) < 0.001 ? '✓ Exact Match' : 'Mismatch'}</div>
          </div>
          <div class="check-box">
            <div class="check-label">Claims Difference</div>
            <div class="check-val">${formatCurrency(claimsDiff, 2)}</div>
            <div class="check-state">${Math.abs(claimsDiff) < 0.001 ? '✓ Exact Match' : 'Mismatch'}</div>
          </div>
          <div class="check-box">
            <div class="check-label">Result Difference</div>
            <div class="check-val">${formatCurrency(resultDiff, 2)}</div>
            <div class="check-state">${Math.abs(resultDiff) < 0.001 ? '✓ Exact Match' : 'Mismatch'}</div>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderRiskTable(risks = []) {
  if (!risks || risks.length === 0) return '';

  return `
    <section class="dashboard-section mt-4">
      <div class="card">
        <div class="card-header">
          <h3>Individual Risk Breakdown</h3>
          <p class="section-subtitle">Allocation per policy under the active Quota Share treaty.</p>
        </div>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Risk ID</th>
                <th class="text-right">Sum Insured</th>
                <th class="text-right">Gross Premium</th>
                <th class="text-right">Gross Claim</th>
                <th class="text-right">Prem. Retained</th>
                <th class="text-right">Prem. Ceded</th>
                <th class="text-right">Claims Retained</th>
                <th class="text-right">Claims Ceded</th>
              </tr>
            </thead>
            <tbody>
              ${risks.map(item => {
                const r = item.risk || item;
                const c = item.cedant || {};
                const re = item.reinsurer || {};
                return `
                  <tr>
                    <td class="font-mono font-bold">${r.risk_id || '—'}</td>
                    <td class="text-right">${formatCurrency(r.sum_insured)}</td>
                    <td class="text-right text-slate">${formatCurrency(r.gross_premium ?? r.premium)}</td>
                    <td class="text-right ${ (r.gross_claim ?? r.claim) > 0 ? 'text-red' : ''}">${formatCurrency(r.gross_claim ?? r.claim)}</td>
                    <td class="text-right text-blue">${formatCurrency(c.premium_retained)}</td>
                    <td class="text-right text-purple">${formatCurrency(re.premium_ceded)}</td>
                    <td class="text-right text-red">${formatCurrency(c.claims_retained)}</td>
                    <td class="text-right text-red">${formatCurrency(re.claims_ceded)}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  `;
}
