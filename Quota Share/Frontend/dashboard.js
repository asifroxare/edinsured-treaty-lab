// State holders
let baselineData = null;
let scenarioData = null;

// USD Currency Formatter
const formatUSD = (val) => {
  if (val === undefined || val === null || isNaN(val)) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
};

// Delta Formatter
const formatDelta = (val) => {
  if (val === undefined || val === null || isNaN(val)) return "$0.00";
  const formatted = formatUSD(val);
  if (val > 0.001) {
    return `<span class="delta-pos">+${formatted}</span>`;
  } else if (val < -0.001) {
    return `<span class="delta-neg">${formatted}</span>`;
  }
  return `<span class="delta-zero">${formatted}</span>`;
};

// DOM Content Loaded Handler
document.addEventListener("DOMContentLoaded", () => {
  // Baseline Form Inputs
  const qsInput = document.getElementById("qs-percentage");
  const commInput = document.getElementById("ceding-commission");
  const cedExpInput = document.getElementById("cedant-expenses");
  const reinExpInput = document.getElementById("reinsurer-expenses");

  // Scenario Form Inputs
  const scenarioQsInput = document.getElementById("scenario-qs-percentage");
  const scenarioCommInput = document.getElementById("scenario-ceding-commission");
  const scenarioCedExpInput = document.getElementById("scenario-cedant-expenses");
  const scenarioReinExpInput = document.getElementById("scenario-reinsurer-expenses");

  // Risk Table Body
  const riskRowsBody = document.getElementById("risk-rows");

  // Presets - Baseline
  document.getElementById("preset-standard").addEventListener("click", () => {
    qsInput.value = 40;
    commInput.value = 30;
    cedExpInput.value = 0;
    reinExpInput.value = 0;
    runBaselineSimulation();
  });

  document.getElementById("preset-highloss").addEventListener("click", () => {
    qsInput.value = 40;
    commInput.value = 30;
    const claims = riskRowsBody.querySelectorAll(".risk-claim");
    if (claims[0]) claims[0].value = 5000000;
    if (claims[1]) claims[1].value = 2000000;
    if (claims[2]) claims[2].value = 10000000;
    runBaselineSimulation();
  });

  document.getElementById("preset-noclaims").addEventListener("click", () => {
    qsInput.value = 40;
    commInput.value = 30;
    riskRowsBody.querySelectorAll(".risk-claim").forEach(c => c.value = 0);
    runBaselineSimulation();
  });

  document.getElementById("preset-fullqs").addEventListener("click", () => {
    qsInput.value = 100;
    commInput.value = 30;
    runBaselineSimulation();
  });

  // Presets - Scenario
  document.getElementById("scenario-preset-no-re").addEventListener("click", () => {
    scenarioQsInput.value = 0;
    scenarioCommInput.value = 30;
    scenarioCedExpInput.value = 0;
    scenarioReinExpInput.value = 0;
  });

  document.getElementById("scenario-preset-baseline").addEventListener("click", () => {
    scenarioQsInput.value = 40;
    scenarioCommInput.value = 30;
    scenarioCedExpInput.value = 0;
    scenarioReinExpInput.value = 0;
  });

  document.getElementById("scenario-preset-60").addEventListener("click", () => {
    scenarioQsInput.value = 60;
    scenarioCommInput.value = 30;
    scenarioCedExpInput.value = 0;
    scenarioReinExpInput.value = 0;
  });

  document.getElementById("scenario-preset-100").addEventListener("click", () => {
    scenarioQsInput.value = 100;
    scenarioCommInput.value = 30;
    scenarioCedExpInput.value = 0;
    scenarioReinExpInput.value = 0;
  });

  // Add Risk Button
  document.getElementById("btn-add-risk").addEventListener("click", () => {
    const rowCount = riskRowsBody.querySelectorAll("tr").length + 1;
    const idStr = "Risk " + String(rowCount).padStart(3, "0");
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input type="text" class="risk-id" value="${idStr}" readonly></td>
      <td><input type="number" class="risk-si" value="5000000" min="0"></td>
      <td><input type="number" class="risk-prem" value="50000" min="0"></td>
      <td><input type="number" class="risk-claim" value="0" min="0"></td>
      <td><button type="button" class="btn-delete" title="Delete Risk">&times;</button></td>
    `;
    attachDeleteHandler(tr.querySelector(".btn-delete"));
    riskRowsBody.appendChild(tr);
  });

  // Reset Portfolio Button
  document.getElementById("btn-reset-portfolio").addEventListener("click", () => {
    riskRowsBody.innerHTML = `
      <tr>
        <td><input type="text" class="risk-id" value="Risk 001" readonly></td>
        <td><input type="number" class="risk-si" value="10000000" min="0"></td>
        <td><input type="number" class="risk-prem" value="50000" min="0"></td>
        <td><input type="number" class="risk-claim" value="2000000" min="0"></td>
        <td><button type="button" class="btn-delete" title="Delete Risk">&times;</button></td>
      </tr>
      <tr>
        <td><input type="text" class="risk-id" value="Risk 002" readonly></td>
        <td><input type="number" class="risk-si" value="5000000" min="0"></td>
        <td><input type="number" class="risk-prem" value="75000" min="0"></td>
        <td><input type="number" class="risk-claim" value="0" min="0"></td>
        <td><button type="button" class="btn-delete" title="Delete Risk">&times;</button></td>
      </tr>
      <tr>
        <td><input type="text" class="risk-id" value="Risk 003" readonly></td>
        <td><input type="number" class="risk-si" value="20000000" min="0"></td>
        <td><input type="number" class="risk-prem" value="100000" min="0"></td>
        <td><input type="number" class="risk-claim" value="500000" min="0"></td>
        <td><button type="button" class="btn-delete" title="Delete Risk">&times;</button></td>
      </tr>
    `;
    riskRowsBody.querySelectorAll(".btn-delete").forEach(attachDeleteHandler);
    qsInput.value = 40;
    commInput.value = 30;
    cedExpInput.value = 0;
    reinExpInput.value = 0;
    runBaselineSimulation();
  });

  // Reset Scenario Button
  document.getElementById("btn-reset-scenario").addEventListener("click", () => {
    scenarioQsInput.value = 40;
    scenarioCommInput.value = 30;
    scenarioCedExpInput.value = 0;
    scenarioReinExpInput.value = 0;
    document.getElementById("comparison-container").style.display = "none";
    scenarioData = null;
  });

  // Attach delete handlers to initial rows
  riskRowsBody.querySelectorAll(".btn-delete").forEach(attachDeleteHandler);

  function attachDeleteHandler(btn) {
    btn.addEventListener("click", (e) => {
      const rows = riskRowsBody.querySelectorAll("tr");
      if (rows.length <= 1) {
        alert("A portfolio must have at least one risk.");
        return;
      }
      e.target.closest("tr").remove();
    });
  }

  // Extract portfolio from DOM
  function getPortfolioFromDOM() {
    const risks = [];
    const rows = riskRowsBody.querySelectorAll("tr");
    rows.forEach(r => {
      risks.push({
        risk_id: r.querySelector(".risk-id").value,
        sum_insured: parseFloat(r.querySelector(".risk-si").value) || 0,
        gross_premium: parseFloat(r.querySelector(".risk-prem").value) || 0,
        claim_amount: parseFloat(r.querySelector(".risk-claim").value) || 0
      });
    });
    return { risks };
  }

  // Run Baseline Simulation
  async function runBaselineSimulation() {
    const payload = {
      portfolio: getPortfolioFromDOM(),
      treaty: {
        quota_share_percentage: parseFloat(qsInput.value) / 100.0,
        ceding_commission_percentage: parseFloat(commInput.value) / 100.0,
        cedant_expenses: parseFloat(cedExpInput.value) || 0,
        reinsurer_expenses: parseFloat(reinExpInput.value) || 0
      }
    };

    try {
      const res = await fetch("/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Simulation failed");
      baselineData = await res.json();
      renderBaseline(baselineData);

      // If a scenario was previously rendered, refresh comparison
      if (scenarioData) {
        renderComparison(baselineData, scenarioData);
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Run Scenario Simulation
  async function runScenarioSimulation() {
    if (!baselineData) {
      await runBaselineSimulation();
    }

    const payload = {
      portfolio: getPortfolioFromDOM(),
      treaty: {
        quota_share_percentage: parseFloat(scenarioQsInput.value) / 100.0,
        ceding_commission_percentage: parseFloat(scenarioCommInput.value) / 100.0,
        cedant_expenses: parseFloat(scenarioCedExpInput.value) || 0,
        reinsurer_expenses: parseFloat(scenarioReinExpInput.value) || 0
      }
    };

    try {
      const res = await fetch("/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Scenario simulation failed");
      scenarioData = await res.json();
      renderComparison(baselineData, scenarioData);
    } catch (err) {
      console.error(err);
    }
  }

  // Render Baseline Cards
  function renderBaseline(data) {
    document.getElementById("card-gross-premium").textContent = formatUSD(data.gross_metrics.gross_premium);
    document.getElementById("card-gross-claims").textContent = formatUSD(data.gross_metrics.gross_claims);
    document.getElementById("card-ceded-premium").textContent = formatUSD(data.cedant.premium_ceded);
    document.getElementById("card-ceding-commission").textContent = formatUSD(data.cedant.commission_received);
    document.getElementById("card-cedant-result").textContent = formatUSD(data.cedant.net_underwriting_result);
    document.getElementById("card-reinsurer-result").textContent = formatUSD(data.reinsurer.net_underwriting_result);

    document.getElementById("recon-premium").textContent = formatUSD(data.reconciliation.premium_difference);
    document.getElementById("recon-claims").textContent = formatUSD(data.reconciliation.claims_difference);
    document.getElementById("recon-result").textContent = formatUSD(data.reconciliation.result_difference);
  }

  // Render Baseline vs Scenario Comparison
  function renderComparison(base, scen) {
    const compContainer = document.getElementById("comparison-container");
    compContainer.style.display = "block";

    // Update Banner
    const baseQS = Math.round(base.treaty.quota_share_percentage * 100);
    const baseComm = Math.round(base.treaty.ceding_commission_percentage * 100);
    const scenQS = Math.round(scen.treaty.quota_share_percentage * 100);
    const scenComm = Math.round(scen.treaty.ceding_commission_percentage * 100);

    document.getElementById("badge-baseline-qs").textContent = `${baseQS}% QS | ${baseComm}% Comm`;
    document.getElementById("badge-scenario-qs").textContent = `${scenQS}% QS | ${scenComm}% Comm`;

    // M5.2 Insight Cards Population
    const cedantDelta = scen.cedant.net_underwriting_result - base.cedant.net_underwriting_result;
    const reinsurerDelta = scen.reinsurer.net_underwriting_result - base.reinsurer.net_underwriting_result;
    
    const baseLR = base.cedant.net_loss_ratio_pct ?? (base.cedant.premium_retained > 0 ? (base.cedant.claims_retained / base.cedant.premium_retained) * 100 : 0);
    const scenLR = scen.cedant.net_loss_ratio_pct ?? (scen.cedant.premium_retained > 0 ? (scen.cedant.claims_retained / scen.cedant.premium_retained) * 100 : 0);
    const lrDelta = scenLR - baseLR;

    const cedantDeltaEl = document.getElementById("insight-cedant-delta");
    cedantDeltaEl.innerHTML = formatDelta(cedantDelta);

    const reinsurerDeltaEl = document.getElementById("insight-reinsurer-delta");
    reinsurerDeltaEl.innerHTML = formatDelta(reinsurerDelta);

    const lrDeltaEl = document.getElementById("insight-loss-ratio-delta");
    if (lrDelta > 0.01) {
      lrDeltaEl.innerHTML = `<span class="delta-neg">+${lrDelta.toFixed(1)} pp</span>`;
    } else if (lrDelta < -0.01) {
      lrDeltaEl.innerHTML = `<span class="delta-pos">${lrDelta.toFixed(1)} pp</span>`;
    } else {
      lrDeltaEl.innerHTML = `<span class="delta-zero">0.0 pp</span>`;
    }

    // Metrics to compare
    const metrics = [
      {
        name: "Premium Retained (Cedant)",
        b: base.cedant.premium_retained,
        s: scen.cedant.premium_retained
      },
      {
        name: "Premium Ceded (Reinsurer)",
        b: base.cedant.premium_ceded,
        s: scen.cedant.premium_ceded
      },
      {
        name: "Claims Retained (Cedant)",
        b: base.cedant.claims_retained,
        s: scen.cedant.claims_retained
      },
      {
        name: "Claims Recovered (Ceded)",
        b: base.cedant.claims_recovered,
        s: scen.cedant.claims_recovered
      },
      {
        name: "Ceding Commission",
        b: base.cedant.commission_received,
        s: scen.cedant.commission_received
      },
      {
        name: "Cedant Net Underwriting Result",
        b: base.cedant.net_underwriting_result,
        s: scen.cedant.net_underwriting_result
      },
      {
        name: "Reinsurer Net Underwriting Result",
        b: base.reinsurer.net_underwriting_result,
        s: scen.reinsurer.net_underwriting_result
      },
      {
        name: "Combined Underwriting Result",
        b: base.combined.net_underwriting_result,
        s: scen.combined.net_underwriting_result
      }
    ];

    const tbody = document.getElementById("comparison-rows");
    tbody.innerHTML = metrics.map(m => `
      <tr>
        <td><strong>${m.name}</strong></td>
        <td>${formatUSD(m.b)}</td>
        <td>${formatUSD(m.s)}</td>
        <td>${formatDelta(m.s - m.b)}</td>
      </tr>
    `).join("");
  }

  // Event Listeners for Simulation Triggers
  document.getElementById("btn-run-simulation").addEventListener("click", runBaselineSimulation);
  document.getElementById("btn-run-scenario").addEventListener("click", runScenarioSimulation);

  // Initial Load Baseline Run
  runBaselineSimulation();
});