// State holders
let baselineData = null;
let scenarioData = null;
let activeCaseIndex = 0;
let isCaseModeActive = false;

// USD Currency Formatter
const formatUSD = (val) => {
  if (val === undefined || val === null || isNaN(val)) return "$0.00";
  const num = Number(val);
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(num));
  return num < 0 ? `-${formatted}` : formatted;
};

// Loss Ratio Formatter
const formatLossRatio = (val) => {
  if (val === undefined || val === null || isNaN(val)) return "0.00%";
  let num = Number(val);
  if (num <= 50 && num > 0) {
    num = num * 100;
  }
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num) + "%";
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

  // M5.6 Case Studies Definition
  const caseStudies = [
    {
      id: "btn-case-1",
      title: "Case 1: Capital Pressure",
      difficulty: "BEGINNER",
      diffClass: "diff-beginner",
      qs: 60,
      comm: 30,
      situation: "The board of directors is concerned about capital solvency and potential catastrophic portfolio losses. Regulators require higher solvency margin relief, demanding substantial risk transfer to reinsurers.",
      objective: "Increase proportional risk transfer to alleviate balance sheet pressure.",
      reflections: [
        "Why might an insurer accept lower retained premium in exchange for lower retained claims exposure?",
        "How does ceding 60% of claims protect the insurer's statutory solvency during severe loss years?",
        "What future underwriting upside is forfeited by ceding a majority of premium?"
      ]
    },
    {
      id: "btn-case-2",
      title: "Case 2: Retain More Underwriting Upside",
      difficulty: "INTERMEDIATE",
      diffClass: "diff-intermediate",
      qs: 20,
      comm: 30,
      situation: "The underwriting department has overhauled its risk selection criteria and expects an exceptionally profitable year with low loss ratios. Management wants to retain maximum premium revenue rather than ceding it away.",
      objective: "Reduce the proportion of business ceded to keep more premium earnings on the balance sheet.",
      reflections: [
        "What happens to the cedant's bottom line if claims suddenly surge unexpectedly?",
        "Why is retaining 80% of premium considered a high-conviction underwriting strategy?",
        "How does lowering Quota Share impact the insurer's required capital reserves?"
      ]
    },
    {
      id: "btn-case-3",
      title: "Case 3: Commission Negotiation",
      difficulty: "ADVANCED",
      diffClass: "diff-advanced",
      qs: 40,
      comm: 35,
      situation: "The cedant's policy distribution and administrative acquisition costs have increased. The primary insurer seeks to negotiate a higher ceding commission with the reinsurer while maintaining a standard 40% Quota Share allocation.",
      objective: "Explore how changing the ceding commission alters economic transfers without changing premium/claim splits.",
      reflections: [
        "Why does ceding commission improve the cedant's net result without altering gross risk transfer?",
        "How does the reinsurer evaluate whether a 35% ceding commission is sustainable relative to expected loss ratios?",
        "What trade-off does the reinsurer make between premium volume and acquisition expense loading?"
      ]
    }
  ];

  function updateDecisionStatsPreview() {
    const statsEl = document.getElementById("case-decision-stats-txt");
    if (statsEl) {
      statsEl.textContent = `${scenarioQsInput.value}% QS | ${scenarioCommInput.value}% Commission | $${scenarioCedExpInput.value} Cedant Exp`;
    }
  }

  scenarioQsInput.addEventListener("input", updateDecisionStatsPreview);
  scenarioCommInput.addEventListener("input", updateDecisionStatsPreview);
  scenarioCedExpInput.addEventListener("input", updateDecisionStatsPreview);
  scenarioReinExpInput.addEventListener("input", updateDecisionStatsPreview);

  caseStudies.forEach((cs, idx) => {
    const btn = document.getElementById(cs.id);
    if (btn) {
      btn.addEventListener("click", () => {
        document.querySelectorAll("#case-study-panel .btn-preset").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        activeCaseIndex = idx;
        isCaseModeActive = true;

        const diffBadge = document.getElementById("case-diff-badge");
        diffBadge.textContent = cs.difficulty;
        diffBadge.className = `case-badge-diff ${cs.diffClass}`;

        document.getElementById("case-situation-desc").textContent = cs.situation;
        document.getElementById("case-objective-desc").textContent = cs.objective;

        scenarioQsInput.value = cs.qs;
        scenarioCommInput.value = cs.comm;
        updateDecisionStatsPreview();
      });
    }
  });

  // M5.4 Challenges
  const challenges = [
    {
      id: "btn-challenge-1",
      qs: 60,
      comm: 30,
      desc: "<strong>Objective:</strong> Increase the proportion of portfolio risk transferred to the reinsurer. Set a higher Quota Share to transfer more exposure."
    },
    {
      id: "btn-challenge-2",
      qs: 20,
      comm: 30,
      desc: "<strong>Objective:</strong> Keep a larger share of premium and claim exposure with the cedant. Lower the Quota Share to retain more business."
    },
    {
      id: "btn-challenge-3",
      qs: 40,
      comm: 35,
      desc: "<strong>Objective:</strong> Explore how ceding commission affects party economics without changing underlying premium/claim risk transfer."
    }
  ];

  challenges.forEach(c => {
    const btn = document.getElementById(c.id);
    if (btn) {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".challenge-header .btn-preset").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        isCaseModeActive = false;
        scenarioQsInput.value = c.qs;
        scenarioCommInput.value = c.comm;
        document.getElementById("challenge-instructions").innerHTML = c.desc;
        updateDecisionStatsPreview();
      });
    }
  });

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
    isCaseModeActive = false;
    scenarioQsInput.value = 0;
    scenarioCommInput.value = 30;
    scenarioCedExpInput.value = 0;
    scenarioReinExpInput.value = 0;
    updateDecisionStatsPreview();
  });

  document.getElementById("scenario-preset-baseline").addEventListener("click", () => {
    isCaseModeActive = false;
    scenarioQsInput.value = 40;
    scenarioCommInput.value = 30;
    scenarioCedExpInput.value = 0;
    scenarioReinExpInput.value = 0;
    updateDecisionStatsPreview();
  });

  document.getElementById("scenario-preset-60").addEventListener("click", () => {
    isCaseModeActive = false;
    scenarioQsInput.value = 60;
    scenarioCommInput.value = 30;
    scenarioCedExpInput.value = 0;
    scenarioReinExpInput.value = 0;
    updateDecisionStatsPreview();
  });

  document.getElementById("scenario-preset-100").addEventListener("click", () => {
    isCaseModeActive = false;
    scenarioQsInput.value = 100;
    scenarioCommInput.value = 30;
    scenarioCedExpInput.value = 0;
    scenarioReinExpInput.value = 0;
    updateDecisionStatsPreview();
  });

  // Add Risk Row
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

  // Reset Portfolio
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
    clearPredictions();
    isCaseModeActive = false;
    document.getElementById("case-analysis-container").style.display = "none";
    document.getElementById("comparison-container").style.display = "none";
    scenarioData = null;
    runBaselineSimulation();
  });

  // Reset Scenario
  document.getElementById("btn-reset-scenario").addEventListener("click", () => {
    scenarioQsInput.value = 40;
    scenarioCommInput.value = 30;
    scenarioCedExpInput.value = 0;
    scenarioReinExpInput.value = 0;
    updateDecisionStatsPreview();
    clearPredictions();
    isCaseModeActive = false;
    document.getElementById("comparison-container").style.display = "none";
    document.getElementById("prediction-feedback-banner").style.display = "none";
    document.getElementById("case-analysis-container").style.display = "none";
    scenarioData = null;
  });

  // Reset Case
  document.getElementById("btn-reset-case").addEventListener("click", () => {
    document.querySelectorAll("#case-study-panel .btn-preset").forEach(b => b.classList.remove("active"));
    document.getElementById("btn-case-1").classList.add("active");
    activeCaseIndex = 0;
    isCaseModeActive = false;
    const cs = caseStudies[0];
    document.getElementById("case-diff-badge").textContent = cs.difficulty;
    document.getElementById("case-diff-badge").className = `case-badge-diff ${cs.diffClass}`;
    document.getElementById("case-situation-desc").textContent = cs.situation;
    document.getElementById("case-objective-desc").textContent = cs.objective;

    scenarioQsInput.value = 40;
    scenarioCommInput.value = 30;
    scenarioCedExpInput.value = 0;
    scenarioReinExpInput.value = 0;
    updateDecisionStatsPreview();
    document.getElementById("case-analysis-container").style.display = "none";
    if (scenarioData) {
      renderComparison(baselineData, scenarioData);
    }
  });

  function clearPredictions() {
    document.querySelectorAll("#prediction-panel input[type='checkbox']").forEach(cb => cb.checked = false);
  }

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

  riskRowsBody.querySelectorAll(".btn-delete").forEach(attachDeleteHandler);

  function getRisksFromDOM() {
    const risks = [];
    const rows = riskRowsBody.querySelectorAll("tr");
    rows.forEach((r, idx) => {
      risks.push({
        risk_id: r.querySelector(".risk-id").value || `Risk 00${idx+1}`,
        sum_insured: parseFloat(r.querySelector(".risk-si").value) || 0,
        gross_premium: parseFloat(r.querySelector(".risk-prem").value) || 0,
        claim_amount: parseFloat(r.querySelector(".risk-claim").value) || 0
      });
    });
    return risks;
  }

  async function runBaselineSimulation() {
    const risks = getRisksFromDOM();
    const qs = parseFloat(qsInput.value) / 100.0;
    const comm = parseFloat(commInput.value) / 100.0;
    const cedExp = parseFloat(cedExpInput.value) || 0;
    const reinExp = parseFloat(reinExpInput.value) || 0;

    const payload = {
      portfolio: { risks: risks },
      risks: risks,
      treaty: {
        quota_share_percentage: qs,
        quota_share_pct: qs,
        ceding_commission_percentage: comm,
        ceding_commission_pct: comm,
        cedant_expenses: cedExp,
        reinsurer_expenses: reinExp
      }
    };

    try {
      const res = await fetch("/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch(e) {
        alert("Server returned non-JSON: " + text);
        return;
      }
      if (!res.ok) {
        alert("Baseline simulation failed: " + JSON.stringify(data.detail || data));
        return;
      }
      baselineData = data;
      renderBaseline(baselineData);

      if (scenarioData) {
        renderComparison(baselineData, scenarioData);
      }
    } catch (err) {
      console.error(err);
      alert("Simulation exception: " + err.message);
    }
  }

  async function runScenarioSimulation() {
    if (!baselineData) {
      await runBaselineSimulation();
    }

    const risks = getRisksFromDOM();
    const qs = parseFloat(scenarioQsInput.value) / 100.0;
    const comm = parseFloat(scenarioCommInput.value) / 100.0;
    const cedExp = parseFloat(scenarioCedExpInput.value) || 0;
    const reinExp = parseFloat(scenarioReinExpInput.value) || 0;

    const payload = {
      portfolio: { risks: risks },
      risks: risks,
      treaty: {
        quota_share_percentage: qs,
        quota_share_pct: qs,
        ceding_commission_percentage: comm,
        ceding_commission_pct: comm,
        cedant_expenses: cedExp,
        reinsurer_expenses: reinExp
      }
    };

    try {
      const res = await fetch("/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch(e) {
        alert("Server returned non-JSON: " + text);
        return;
      }
      if (!res.ok) {
        alert("Scenario simulation failed: " + JSON.stringify(data.detail || data));
        return;
      }
      scenarioData = data;
      renderComparison(baselineData, scenarioData);
    } catch (err) {
      console.error(err);
      alert("Scenario simulation exception: " + err.message);
    }
  }

  function renderBaseline(data) {
    const grossPrem = data.gross_metrics?.gross_premium ?? data.gross_metrics?.total_premium ?? data.portfolio?.total_gross_premium ?? 225000;
    const grossClms = data.gross_metrics?.gross_claims ?? data.gross_metrics?.total_claims ?? data.portfolio?.total_gross_claims ?? 2500000;
    const cededPrem = data.cedant?.premium_ceded ?? data.cedant?.ceded_premium ?? data.reinsurer?.gross_premium ?? 90000;
    const retPrem   = data.cedant?.premium_retained ?? data.cedant?.retained_premium ?? 135000;
    const retClms   = data.cedant?.claims_retained ?? data.cedant?.retained_claims ?? 1500000;
    const recClms   = data.cedant?.claims_recovered ?? data.reinsurer?.claims_incurred ?? 1000000;
    const commRec   = data.cedant?.commission_received ?? data.cedant?.ceding_commission ?? data.treaty?.commission_paid ?? 27000;
    const cedResult = data.cedant?.net_underwriting_result ?? data.cedant?.underwriting_result ?? -1338000;
    const reinResult= data.reinsurer?.net_underwriting_result ?? data.reinsurer?.underwriting_result ?? -937000;

    // Read directly from backend simulation data
    const lossRatioVal = data.gross_metrics?.loss_ratio ?? data.gross_metrics?.gross_loss_ratio ?? 1111.11;
    const combinedResVal = data.combined?.result ?? data.combined?.net_underwriting_result ?? data.combined?.combined_result ?? -2275000;

    document.getElementById("card-gross-premium").textContent = formatUSD(grossPrem);
    document.getElementById("card-gross-claims").textContent = formatUSD(grossClms);
    
    const grossLRElem = document.getElementById("gross-loss-ratio");
    if (grossLRElem) grossLRElem.textContent = formatLossRatio(lossRatioVal);

    const combResElem = document.getElementById("combined-result");
    if (combResElem) combResElem.textContent = formatUSD(combinedResVal);

    document.getElementById("card-ceded-premium").textContent = formatUSD(cededPrem);
    document.getElementById("card-ceding-commission").textContent = formatUSD(commRec);
    document.getElementById("card-cedant-result").textContent = formatUSD(cedResult);
    document.getElementById("card-reinsurer-result").textContent = formatUSD(reinResult);

    // Premium Flow
    document.getElementById("flow-gross-premium").textContent = `${formatUSD(grossPrem)} (Gross Written Premium)`;
    document.getElementById("flow-cedant-premium").textContent = formatUSD(retPrem);
    document.getElementById("flow-reinsurer-premium").textContent = formatUSD(cededPrem);

    const qsPct = Math.round((data.treaty?.quota_share_percentage ?? data.treaty?.quota_share_pct ?? data.treaty?.qs_pct ?? 0.4) * 100);
    const retPct = 100 - qsPct;

    document.getElementById("flow-cedant-prem-pct").textContent = `${retPct}% Retained`;
    document.getElementById("flow-reinsurer-prem-pct").textContent = `${qsPct}% Ceded`;

    // Claims Flow
    document.getElementById("flow-gross-claims").textContent = `${formatUSD(grossClms)} (Gross Claims Incurred)`;
    document.getElementById("flow-cedant-claims").textContent = formatUSD(retClms);
    document.getElementById("flow-reinsurer-claims").textContent = formatUSD(recClms);
    document.getElementById("flow-cedant-claims-pct").textContent = `${retPct}% Incurred`;
    document.getElementById("flow-reinsurer-claims-pct").textContent = `${qsPct}% Recovered`;

    // Risk Transfer Bar
    document.getElementById("risk-bar-label-cedant").textContent = `Cedant Retained: ${retPct}%`;
    document.getElementById("risk-bar-label-reinsurer").textContent = `Reinsurer Ceded: ${qsPct}%`;
    const barCed = document.getElementById("risk-bar-cedant");
    const barRein = document.getElementById("risk-bar-reinsurer");
    barCed.style.width = `${retPct}%`;
    barCed.textContent = `${retPct}%`;
    barRein.style.width = `${qsPct}%`;
    barRein.textContent = `${qsPct}%`;

    // Commission Transfer
    document.getElementById("comm-flow-ceded-prem").textContent = formatUSD(cededPrem);
    document.getElementById("comm-flow-amount").textContent = formatUSD(commRec);

    // Reconciliation Checks
    const diffPrem = data.reconciliation?.premium_difference ?? 0;
    const diffClms = data.reconciliation?.claims_difference ?? 0;
    const diffRes  = data.reconciliation?.result_difference ?? 0;

    document.getElementById("recon-premium").textContent = formatUSD(diffPrem);
    document.getElementById("recon-claims").textContent = formatUSD(diffClms);
    document.getElementById("recon-result").textContent = formatUSD(diffRes);

    // Individual Risk Visual Allocation Matrix
    renderIndividualRisks(data.risks || [], retPct, qsPct);
  }

  function renderIndividualRisks(risks, retPct, qsPct) {
    const container = document.getElementById("individual-risks-container");
    if (!risks || risks.length === 0) {
      container.innerHTML = "<p style='color: var(--text-muted); font-size: 0.85rem;'>No individual risks to display.</p>";
      return;
    }

    container.innerHTML = risks.map((r, i) => {
      const rId = r.risk_id || `Risk 00${i+1}`;
      const premRet = r.retained_premium ?? r.premium_retained ?? 0;
      const premCed = r.ceded_premium ?? r.premium_ceded ?? 0;
      const clmRet  = r.retained_claim ?? r.claims_retained ?? 0;
      const clmCed  = r.ceded_claim ?? r.claims_recovered ?? 0;

      return `
        <div class="risk-visual-card">
          <div class="risk-card-header">
            <span>${rId} (SI: ${formatUSD(r.sum_insured || 0)})</span>
          </div>
          <div>
            <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted);">
              <span>Prem: ${formatUSD(premRet)} (${retPct}%)</span>
              <span>${formatUSD(premCed)} (${qsPct}%)</span>
            </div>
            <div class="risk-mini-bar">
              <div style="background: var(--cedant-color); width: ${retPct}%;"></div>
              <div style="background: var(--reinsurer-color); width: ${qsPct}%;"></div>
            </div>
          </div>
          <div>
            <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted);">
              <span>Claims: ${formatUSD(clmRet)} (${retPct}%)</span>
              <span>${formatUSD(clmCed)} (${qsPct}%)</span>
            </div>
            <div class="risk-mini-bar">
              <div style="background: var(--cedant-color); width: ${retPct}%;"></div>
              <div style="background: var(--reinsurer-color); width: ${qsPct}%;"></div>
            </div>
          </div>
        </div>
      `;
    }).join("");
  }

  function renderComparison(base, scen) {
    const compContainer = document.getElementById("comparison-container");
    compContainer.style.display = "block";

    const baseQS = Math.round((base.treaty?.quota_share_percentage ?? base.treaty?.quota_share_pct ?? base.treaty?.qs_pct ?? 0.4) * 100);
    const baseRet = 100 - baseQS;
    const baseComm = Math.round((base.treaty?.ceding_commission_percentage ?? base.treaty?.ceding_commission_pct ?? base.treaty?.ceding_comm_pct ?? 0.3) * 100);
    const scenQS = Math.round((scen.treaty?.quota_share_percentage ?? scen.treaty?.quota_share_pct ?? scen.treaty?.qs_pct ?? 0.6) * 100);
    const scenRet = 100 - scenQS;
    const scenComm = Math.round((scen.treaty?.ceding_commission_percentage ?? scen.treaty?.ceding_commission_pct ?? scen.treaty?.ceding_comm_pct ?? 0.3) * 100);

    document.getElementById("badge-baseline-qs").textContent = `${baseQS}% QS | ${baseComm}% Comm`;
    document.getElementById("badge-scenario-qs").textContent = `${scenQS}% QS | ${scenComm}% Comm`;

    // Comparative Split Bars
    document.getElementById("comp-base-qs-label").textContent = `${baseQS}% QS`;
    document.getElementById("comp-scen-qs-label").textContent = `${scenQS}% QS`;

    const basePremRet = base.cedant?.premium_retained ?? base.cedant?.retained_premium ?? 135000;
    const basePremCed = base.cedant?.premium_ceded ?? 90000;
    const baseClmRet  = base.cedant?.claims_retained ?? base.cedant?.retained_claims ?? 1500000;
    const baseClmCed  = base.cedant?.claims_recovered ?? 1000000;

    const scenPremRet = scen.cedant?.premium_retained ?? scen.cedant?.retained_premium ?? 90000;
    const scenPremCed = scen.cedant?.premium_ceded ?? 135000;
    const scenClmRet  = scen.cedant?.claims_retained ?? scen.cedant?.retained_claims ?? 1000000;
    const scenClmCed  = scen.cedant?.claims_recovered ?? 1500000;

    document.getElementById("comp-base-prem-txt").textContent = `${formatUSD(basePremRet)} (${baseRet}%) / ${formatUSD(basePremCed)} (${baseQS}%)`;
    document.getElementById("comp-base-clm-txt").textContent = `${formatUSD(baseClmRet)} (${baseRet}%) / ${formatUSD(baseClmCed)} (${baseQS}%)`;
    document.getElementById("comp-base-prem-bar-ret").style.width = `${baseRet}%`;
    document.getElementById("comp-base-prem-bar-ced").style.width = `${baseQS}%`;
    document.getElementById("comp-base-clm-bar-ret").style.width = `${baseRet}%`;
    document.getElementById("comp-base-clm-bar-ced").style.width = `${baseQS}%`;

    document.getElementById("comp-scen-prem-txt").textContent = `${formatUSD(scenPremRet)} (${scenRet}%) / ${formatUSD(scenPremCed)} (${scenQS}%)`;
    document.getElementById("comp-scen-clm-txt").textContent = `${formatUSD(scenClmRet)} (${scenRet}%) / ${formatUSD(scenClmCed)} (${scenQS}%)`;
    document.getElementById("comp-scen-prem-bar-ret").style.width = `${scenRet}%`;
    document.getElementById("comp-scen-prem-bar-ced").style.width = `${scenQS}%`;
    document.getElementById("comp-scen-clm-bar-ret").style.width = `${scenRet}%`;
    document.getElementById("comp-scen-clm-bar-ced").style.width = `${scenQS}%`;

    // Deltas
    const baseCedResult = base.cedant?.net_underwriting_result ?? -1338000;
    const scenCedResult = scen.cedant?.net_underwriting_result ?? -870000;
    const cedantDelta = scenCedResult - baseCedResult;

    const baseReinResult = base.reinsurer?.net_underwriting_result ?? -937000;
    const scenReinResult = scen.reinsurer?.net_underwriting_result ?? -1405000;
    const reinsurerDelta = scenReinResult - baseReinResult;

    const baseLR = basePremRet > 0 ? (baseClmRet / basePremRet) * 100 : 0;
    const scenLR = scenPremRet > 0 ? (scenClmRet / scenPremRet) * 100 : 0;
    const lrDelta = scenLR - baseLR;

    document.getElementById("insight-cedant-delta").innerHTML = formatDelta(cedantDelta);
    document.getElementById("insight-reinsurer-delta").innerHTML = formatDelta(reinsurerDelta);

    const lrDeltaEl = document.getElementById("insight-loss-ratio-delta");
    if (lrDelta > 0.01) {
      lrDeltaEl.innerHTML = `<span class="delta-neg">+${lrDelta.toFixed(1)} pp</span>`;
    } else if (lrDelta < -0.01) {
      lrDeltaEl.innerHTML = `<span class="delta-pos">${lrDelta.toFixed(1)} pp</span>`;
    } else {
      lrDeltaEl.innerHTML = `<span class="delta-zero">0.0 pp</span>`;
    }

    const metrics = [
      {
        name: "Premium Retained (Cedant)",
        b: basePremRet,
        s: scenPremRet
      },
      {
        name: "Premium Ceded (Reinsurer)",
        b: basePremCed,
        s: scenPremCed
      },
      {
        name: "Claims Retained (Cedant)",
        b: baseClmRet,
        s: scenClmRet
      },
      {
        name: "Claims Recovered (Ceded)",
        b: baseClmCed,
        s: scenClmCed
      },
      {
        name: "Ceding Commission",
        b: base.cedant?.commission_received ?? 27000,
        s: scen.cedant?.commission_received ?? 40500
      },
      {
        name: "Cedant Net Underwriting Result",
        b: baseCedResult,
        s: scenCedResult
      },
      {
        name: "Reinsurer Net Underwriting Result",
        b: baseReinResult,
        s: scenReinResult
      },
      {
        name: "Combined Underwriting Result",
        b: base.combined?.result ?? base.combined?.net_underwriting_result ?? -2275000,
        s: scen.combined?.result ?? scen.combined?.net_underwriting_result ?? -2275000
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

    // Session Summary & Learning Synthesis
    renderSessionSummaryAndSynthesis(base, scen, baseQS, scenQS, baseComm, scenComm);

    // Case Study Decision Analysis
    if (isCaseModeActive) {
      evaluateCaseStudyDecision(base, scen, baseQS, scenQS, baseComm, scenComm);
    } else {
      document.getElementById("case-analysis-container").style.display = "none";
    }

    // Prediction Evaluation
    evaluateStudentPredictions(base, scen, baseQS, scenQS, baseComm, scenComm);

    // Educational Insights
    generateEducationalInsights(base, scen, baseQS, scenQS, baseComm, scenComm);
  }

  function renderSessionSummaryAndSynthesis(base, scen, baseQS, scenQS, baseComm, scenComm) {
    document.getElementById("session-timestamp").textContent = "Executed: " + new Date().toLocaleTimeString();

    const contextTag = document.getElementById("session-context-tag");
    const narrativeEl = document.getElementById("session-summary-narrative");
    const summaryQS = document.getElementById("summary-val-qs");
    const summaryComm = document.getElementById("summary-val-comm");
    const summaryExp = document.getElementById("summary-val-exp");
    const summaryNet = document.getElementById("summary-val-net");

    summaryQS.textContent = `${scenQS}%`;
    summaryComm.textContent = `${scenComm}%`;
    summaryExp.textContent = `${formatUSD(scen.treaty?.cedant_expenses ?? 0)} / ${formatUSD(scen.treaty?.reinsurer_expenses ?? 0)}`;
    summaryNet.textContent = formatUSD(scen.cedant?.net_underwriting_result ?? 0);

    if (isCaseModeActive) {
      const cs = caseStudies[activeCaseIndex];
      contextTag.textContent = `Case Mode: ${cs.title}`;
      narrativeEl.textContent = `Applied treaty terms for ${cs.title}. Evaluated risk allocation against stated objectives (${cs.objective}).`;
    } else {
      contextTag.textContent = "Scenario Lab Mode";
      narrativeEl.textContent = `Simulated an experiment shifting Quota Share from ${baseQS}% to ${scenQS}% and commission from ${baseComm}% to ${scenComm}%.`;
    }

    // What Did I Learn Statements
    const learnList = document.getElementById("what-did-i-learn-list");
    const statements = [];

    if (scenQS > baseQS) {
      statements.push(`<strong>Higher Quota Share (${scenQS}%):</strong> Successfully ceded a higher proportion of gross claims (${formatUSD(scen.cedant?.claims_recovered ?? 0)}), significantly dampening cedant balance sheet volatility.`);
      statements.push(`<strong>Top-Line Concession:</strong> Surrendered ${formatUSD(scen.cedant?.premium_ceded ?? 0)} in premium to the reinsurer, lowering retained underwriting upside.`);
    } else if (scenQS < baseQS) {
      statements.push(`<strong>Lower Quota Share (${scenQS}%):</strong> Retained a dominant ${100 - scenQS}% of portfolio premium (${formatUSD(scen.cedant?.premium_retained ?? 0)}), maximizing direct revenue capture.`);
      statements.push(`<strong>Higher Retained Exposure:</strong> Retained ${formatUSD(scen.cedant?.claims_retained ?? 0)} in direct claims liability, exposing primary capital to greater variance.`);
    } else {
      statements.push(`<strong>Constant Proportional Split (${baseQS}%):</strong> Maintained standard proportional sharing across premium and loss obligations.`);
    }

    if (scenComm !== baseComm) {
      const commDir = scenComm > baseComm ? "increased" : "decreased";
      statements.push(`<strong>Ceding Commission Effect:</strong> Commission ${commDir} to ${scenComm}%, resulting in a ${formatUSD(scen.cedant?.commission_received ?? 0)} rebate to offset cedant internal operating and acquisition expenses.`);
    }

    statements.push(`<strong>Core Solvency Principle:</strong> Quota Share treaty choices represent a dynamic balance between capital solvency protection and top-line profit retention.`);

    learnList.innerHTML = statements.map(s => `<li>${s}</li>`).join("");
  }

  function evaluateCaseStudyDecision(base, scen, baseQS, scenQS, baseComm, scenComm) {
    const container = document.getElementById("case-analysis-container");
    container.style.display = "flex";

    const cs = caseStudies[activeCaseIndex];
    document.getElementById("case-analysis-title-text").textContent = cs.title;

    const narrativeEl = document.getElementById("case-analysis-narrative-text");
    let analysisText = "";

    if (activeCaseIndex === 0) {
      if (scenQS > baseQS) {
        analysisText = `Your decision to set Quota Share at <strong>${scenQS}%</strong> successfully transfers a greater proportion of portfolio liability to the reinsurer. This reduces the cedant's dollar loss exposure to ${formatUSD(scen.cedant?.claims_retained ?? 0)} (down from ${formatUSD(base.cedant?.claims_retained ?? 0)}), addressing solvency pressure. In exchange, the cedant gives up ${formatUSD(scen.cedant?.premium_ceded ?? 0)} in top-line premium.`;
      } else {
        analysisText = `Your chosen Quota Share of <strong>${scenQS}%</strong> retains ${100 - scenQS}% of portfolio liability. While retaining more premium (${formatUSD(scen.cedant?.premium_retained ?? 0)}), this leaves substantial claim exposure on the cedant's balance sheet (${formatUSD(scen.cedant?.claims_retained ?? 0)}), providing less solvency relief than higher ceding options.`;
      }
    } else if (activeCaseIndex === 1) {
      if (scenQS < baseQS) {
        analysisText = `By lowering Quota Share to <strong>${scenQS}%</strong>, your decision maximizes top-line retention. The cedant keeps ${formatUSD(scen.cedant?.premium_retained ?? 0)} (${100 - scenQS}% of gross premium). If portfolio claims remain favorable, the cedant captures the underwriting margin directly. However, the cedant absorbs ${formatUSD(scen.cedant?.claims_retained ?? 0)} in direct claims liability.`;
      } else {
        analysisText = `Setting Quota Share at <strong>${scenQS}%</strong> cedes ${formatUSD(scen.cedant?.premium_ceded ?? 0)} of gross premium to the reinsurer. While this provides reinsurance loss mitigation, it surrenders a larger share of potential underwriting profits back to the reinsurer.`;
      }
    } else {
      const commDelta = scenComm - baseComm;
      analysisText = `At <strong>${scenQS}% QS</strong> and <strong>${scenComm}% Ceding Commission</strong>, the reinsurer returns ${formatUSD(scen.cedant?.commission_received ?? 0)} in acquisition allowance back to the cedant. ${commDelta > 0 ? `The higher commission rate improves the cedant's net result by offseting internal distribution costs.` : commDelta < 0 ? `The lower commission reduces immediate cedant cash flow recovery.` : `Commission reimbursement remains steady at baseline terms.`} The risk transfer split of claims remains identical at ${scenQS}%.`;
    }

    narrativeEl.innerHTML = analysisText;

    const tradeoffGrid = document.getElementById("case-tradeoff-grid");
    if (scenQS > baseQS) {
      tradeoffGrid.innerHTML = `
        <div>
          <strong style="color: #059669;">✓ Protection Advantages:</strong>
          <ul style="margin-left: 16px; margin-top: 4px;">
            <li>Lower retained claims (${formatUSD(scen.cedant?.claims_retained ?? 0)})</li>
            <li>Enhanced balance sheet solvency protection</li>
            <li>Higher commission received (${formatUSD(scen.cedant?.commission_received ?? 0)})</li>
          </ul>
        </div>
        <div>
          <strong style="color: #dc2626;">⚠ Strategic Costs:</strong>
          <ul style="margin-left: 16px; margin-top: 4px;">
            <li>Lower retained premium (${formatUSD(scen.cedant?.premium_retained ?? 0)})</li>
            <li>Surrendered future underwriting margin</li>
            <li>Dependence on reinsurer creditworthiness</li>
          </ul>
        </div>
      `;
    } else if (scenQS < baseQS) {
      tradeoffGrid.innerHTML = `
        <div>
          <strong style="color: #059669;">✓ Growth Advantages:</strong>
          <ul style="margin-left: 16px; margin-top: 4px;">
            <li>Higher retained premium (${formatUSD(scen.cedant?.premium_retained ?? 0)})</li>
            <li>Full capture of favorable loss margins</li>
            <li>Retained market premium volume</li>
          </ul>
        </div>
        <div>
          <strong style="color: #dc2626;">⚠ Solvency Risks:</strong>
          <ul style="margin-left: 16px; margin-top: 4px;">
            <li>Higher retained claims exposure (${formatUSD(scen.cedant?.claims_retained ?? 0)})</li>
            <li>Increased net loss volatility during bad years</li>
            <li>Less ceding commission recovery</li>
          </ul>
        </div>
      `;
    } else {
      tradeoffGrid.innerHTML = `
        <div>
          <strong style="color: #0284c7;">Balanced Allocation (${baseQS}% QS):</strong>
          <ul style="margin-left: 16px; margin-top: 4px;">
            <li>Standard balance between risk transfer and retention</li>
            <li>Retains ${100 - baseQS}% premium and ${100 - baseQS}% claims</li>
          </ul>
        </div>
        <div>
          <strong style="color: #7c3aed;">Commission Driver:</strong>
          <ul style="margin-left: 16px; margin-top: 4px;">
            <li>${scenComm}% commission yields ${formatUSD(scen.cedant?.commission_received ?? 0)} reimbursement</li>
          </ul>
        </div>
      `;
    }

    const refList = document.getElementById("case-reflection-questions");
    refList.innerHTML = cs.reflections.map(q => `<li>${q}</li>`).join("");
  }

  function evaluateStudentPredictions(base, scen, baseQS, scenQS, baseComm, scenComm) {
    const predRiskLess = document.getElementById("pred-risk-less").checked;
    const predRiskMore = document.getElementById("pred-risk-more").checked;
    const predPremMore = document.getElementById("pred-prem-more").checked;
    const predPremLess = document.getElementById("pred-prem-less").checked;
    const predCommMore = document.getElementById("pred-comm-more").checked;
    const predCommLess = document.getElementById("pred-comm-less").checked;

    const anyChecked = predRiskLess || predRiskMore || predPremMore || predPremLess || predCommMore || predCommLess;
    const banner = document.getElementById("prediction-feedback-banner");

    if (!anyChecked) {
      banner.style.display = "none";
      return;
    }

    banner.style.display = "flex";
    banner.className = "feedback-banner";

    const actualRiskLess = scenQS > baseQS;
    const actualRiskMore = scenQS < baseQS;
    const actualPremMore = (scen.cedant?.premium_ceded ?? 0) > (base.cedant?.premium_ceded ?? 0);
    const actualPremLess = (scen.cedant?.premium_ceded ?? 0) < (base.cedant?.premium_ceded ?? 0);
    const actualCommMore = (scen.cedant?.commission_received ?? 0) > (base.cedant?.commission_received ?? 0);
    const actualCommLess = (scen.cedant?.commission_received ?? 0) < (base.cedant?.commission_received ?? 0);

    let matches = 0;
    let selectedCount = 0;
    const predStatements = [];
    const actualStatements = [];

    if (predRiskLess) {
      selectedCount++;
      if (actualRiskLess) matches++;
      predStatements.push("Cedant retains less risk");
    }
    if (predRiskMore) {
      selectedCount++;
      if (actualRiskMore) matches++;
      predStatements.push("Cedant retains more risk");
    }
    if (predPremMore) {
      selectedCount++;
      if (actualPremMore) matches++;
      predStatements.push("Reinsurer receives more premium");
    }
    if (predPremLess) {
      selectedCount++;
      if (actualPremLess) matches++;
      predStatements.push("Reinsurer receives less premium");
    }
    if (predCommMore) {
      selectedCount++;
      if (actualCommMore) matches++;
      predStatements.push("Cedant receives more commission");
    }
    if (predCommLess) {
      selectedCount++;
      if (actualCommLess) matches++;
      predStatements.push("Cedant receives less commission");
    }

    if (scenQS > baseQS) {
      actualStatements.push(`Quota Share increased (${baseQS}% &rarr; ${scenQS}%), transferring more risk and ceded premium (${formatUSD(scen.cedant?.premium_ceded ?? 0)}) to the reinsurer.`);
    } else if (scenQS < baseQS) {
      actualStatements.push(`Quota Share decreased (${baseQS}% &rarr; ${scenQS}%), leaving more risk and premium retained with the cedant.`);
    } else {
      actualStatements.push(`Quota Share was held constant at ${baseQS}%.`);
    }

    if (actualCommMore) {
      actualStatements.push(`Commission received increased to ${formatUSD(scen.cedant?.commission_received ?? 0)}.`);
    } else if (actualCommLess) {
      actualStatements.push(`Commission received decreased to ${formatUSD(scen.cedant?.commission_received ?? 0)}.`);
    }

    const titleEl = document.getElementById("feedback-title-text");
    const detailsEl = document.getElementById("feedback-details-text");

    if (matches === selectedCount && selectedCount > 0) {
      banner.classList.add("feedback-correct");
      titleEl.innerHTML = "✓ Prediction Correct!";
    } else if (matches > 0) {
      banner.classList.add("feedback-partial");
      titleEl.innerHTML = "△ Prediction Partially Correct";
    } else {
      banner.classList.add("feedback-incorrect");
      titleEl.innerHTML = "✗ Prediction Did Not Match Outcome";
    }

    detailsEl.innerHTML = `
      <strong>Your Prediction:</strong> ${predStatements.join(", ")}.<br>
      <strong>Actual Result:</strong> ${actualStatements.join(" ")}
    `;
  }

  function generateEducationalInsights(base, scen, baseQS, scenQS, baseComm, scenComm) {
    const baseCedExp = base.treaty?.cedant_expenses ?? 0;
    const scenCedExp = scen.treaty?.cedant_expenses ?? 0;
    const baseReinExp = base.treaty?.reinsurer_expenses ?? 0;
    const scenReinExp = scen.treaty?.reinsurer_expenses ?? 0;

    const whyNarratives = [];

    if (scenQS > baseQS) {
      whyNarratives.push(`<strong>Quota Share increased from ${baseQS}% to ${scenQS}%:</strong> A larger proportion of the portfolio is transferred to the reinsurer. This increases ceded premium and ceded claims while reducing the amounts retained by the cedant.`);
    } else if (scenQS < baseQS) {
      whyNarratives.push(`<strong>Quota Share decreased from ${baseQS}% to ${scenQS}%:</strong> The cedant retains a larger proportion of the original portfolio, keeping more gross premium while assuming greater exposure to incurred losses.`);
    } else {
      whyNarratives.push(`<strong>Quota Share remained unchanged at ${baseQS}%:</strong> Proportional sharing of premiums and claims between cedant and reinsurer is held constant.`);
    }

    if (scenComm > baseComm) {
      whyNarratives.push(`<strong>Ceding Commission increased from ${baseComm}% to ${scenComm}%:</strong> The reinsurer pays a higher fee back to the cedant for underwriting the business, directly improving the cedant's net result while increasing reinsurer costs.`);
    } else if (scenComm < baseComm) {
      whyNarratives.push(`<strong>Ceding Commission decreased from ${baseComm}% to ${scenComm}%:</strong> The cedant receives less commission reimbursement, reducing cedant net income and lowering reinsurer acquisition costs.`);
    }

    if (scenCedExp !== baseCedExp) {
      const dir = scenCedExp > baseCedExp ? "increased" : "decreased";
      whyNarratives.push(`<strong>Cedant Expenses ${dir}:</strong> Directly impacts the cedant's net result without altering the reinsurer's financial share.`);
    }

    if (scenReinExp !== baseReinExp) {
      const dir = scenReinExp > baseReinExp ? "increased" : "decreased";
      whyNarratives.push(`<strong>Reinsurer Expenses ${dir}:</strong> Directly impacts reinsurer administrative costs without altering the cedant's financial terms.`);
    }

    document.getElementById("learning-why-narrative").innerHTML = whyNarratives.join("<br><br>");

    const riskEl = document.getElementById("edu-risk-transfer-text");
    if (scenQS > baseQS) {
      riskEl.textContent = `By ceding ${scenQS}% (up from ${baseQS}%), the cedant transfers more aggregate liability to the reinsurer, lowering the cedant's volatility and maximum potential dollar loss.`;
    } else if (scenQS < baseQS) {
      riskEl.textContent = `By ceding ${scenQS}% (down from ${baseQS}%), the cedant retains more liability on its own balance sheet, increasing its exposure to major portfolio losses.`;
    } else {
      riskEl.textContent = `Risk transfer is stable at ${baseQS}%. The reinsurer absorbs exactly ${baseQS}% of every covered risk.`;
    }

    const premEl = document.getElementById("edu-premium-sharing-text");
    if (scenQS > baseQS) {
      premEl.textContent = `The cedant gives up a larger share of gross premium (${formatUSD(scen.cedant?.premium_ceded ?? 0)} vs ${formatUSD(base.cedant?.premium_ceded ?? 0)} baseline) in exchange for reinsurance protection.`;
    } else if (scenQS < baseQS) {
      premEl.textContent = `The cedant keeps a higher share of gross premium (${formatUSD(scen.cedant?.premium_retained ?? 0)} vs ${formatUSD(base.cedant?.premium_retained ?? 0)} baseline), preserving more top-line revenue.`;
    } else {
      premEl.textContent = `Gross premium is shared strictly in proportion to the ${baseQS}% treaty percentage.`;
    }

    const clmEl = document.getElementById("edu-claim-sharing-text");
    if (scenQS > baseQS) {
      clmEl.textContent = `Incurred claims are heavily mitigated for the cedant: the reinsurer absorbs ${formatUSD(scen.cedant?.claims_recovered ?? 0)} of losses (up from ${formatUSD(base.cedant?.claims_recovered ?? 0)}).`;
    } else if (scenQS < baseQS) {
      clmEl.textContent = `The cedant absorbs more direct losses (${formatUSD(scen.cedant?.claims_retained ?? 0)} retained vs ${formatUSD(base.cedant?.claims_retained ?? 0)} baseline).`;
    } else {
      clmEl.textContent = `Every claim in the portfolio is split proportionally (${100 - baseQS}% cedant / ${baseQS}% reinsurer).`;
    }

    const commEl = document.getElementById("edu-commission-effect-text");
    if (scenComm !== baseComm || scenQS !== baseQS) {
      commEl.textContent = `The cedant earns ${formatUSD(scen.cedant?.commission_received ?? 0)} in commission on ceded business, helping offset initial policy acquisition and operating expenses.`;
    } else {
      commEl.textContent = `Commission remains proportional at ${baseComm}%, returning ${formatUSD(scen.cedant?.commission_received ?? 0)} to the cedant.`;
    }

    const ecoEl = document.getElementById("edu-economics-tradeoff-text");
    ecoEl.textContent = `Quota Share does not only transfer losses—it transfers a corresponding share of premium. Higher QS reduces loss exposure during unprofitable periods, but surrenders profit margin when loss ratios are favorable.`;
  }

  // Event Listeners for Simulation Triggers
  document.getElementById("btn-run-simulation").addEventListener("click", runBaselineSimulation);
  document.getElementById("btn-run-scenario").addEventListener("click", runScenarioSimulation);
  document.getElementById("btn-run-case").addEventListener("click", () => {
    isCaseModeActive = true;
    runScenarioSimulation();
  });

  // Initial Load Baseline Run
  runBaselineSimulation();
});