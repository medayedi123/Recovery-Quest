/* =========================================
   RECOVERY SYSTEM — FINAL FIXED VERSION
========================================= */

let breathingTimer = null;
let breathingPhaseTimer = null;
let recoveryInterval = null;

/* =========================================
   HELPERS
========================================= */

function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function safeJSON(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "{}");
  } catch {
    return {};
  }
}

/* =========================================
   DATA SOURCES
========================================= */

function getSleepScore() {
  const data = safeJSON("consistencyData");
  return Number(data[getTodayKey()]?.sleep || 0);
}

function getNutritionScore() {
  const data = safeJSON("nutriData");

  let cal = 0, pro = 0;

  data.meals?.forEach(m => {
    cal += Number(m.cal || 0);
    pro += Number(m.pro || 0);
  });

  let score = 100;

  if (cal > 2200) score -= (cal - 2200) / 60;
  if (pro < 120) score -= 10;

  return Math.max(0, Math.min(100, score));
}

function getTrainingLoad() {
  const t = safeJSON("aura-training");
  const week = t.week || {};

  let total = 0;
  let count = 0;

  Object.values(week).forEach(d => {
    total += d.score || 0;
    count++;
  });

  return count ? total / count : 0;
}

function getInputs() {
  return safeJSON("recovery-inputs");
}

/* =========================================
   RECOVERY SCORE MODEL
========================================= */

function calculateRecovery() {

  const sleep = getSleepScore();
  const nutrition = getNutritionScore();
  const training = getTrainingLoad();
  const inputs = getInputs();

  let total = 0;
  let w = 0;

  total += sleep * 0.45; w += 0.45;
  total += nutrition * 0.25; w += 0.25;
  total += (100 - training) * 0.20; w += 0.20;

  if (inputs.hrv) {
    total += Math.min(100, (inputs.hrv - 25) * 1.2) * 0.07;
    w += 0.07;
  }

  if (inputs.stress) {
    total += (100 - inputs.stress * 10) * 0.03;
    w += 0.03;
  }

  return Math.round(Math.max(0, Math.min(100, total / w)));
}

/* =========================================
   SINGLE SOURCE OF TRUTH (FIXED LOGIC)
========================================= */

function getRecoveryState(score) {

  if (score >= 80) {
    return {
      state: "Optimal",
      recommendation: "High Intensity"
    };
  }

  if (score >= 60) {
    return {
      state: "Good",
      recommendation: "Moderate Training"
    };
  }

  return {
    state: "Fatigued",
    recommendation: "Recovery Only"
  };
}

/* =========================================
   UI UPDATE
========================================= */

function updateUI() {

  const score = calculateRecovery();
  const inputs = getInputs();

  const { state, recommendation } = getRecoveryState(score);

  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  /* MAIN SCORE */
  set("rec-readiness-text", score);

  /* FATIGUE */
  set("rec-fatigue-idx", `${100 - score}%`);

  /* SLEEP */
  set("rec-bedtime-consistency", `${getSleepScore()}%`);

  /* HRV */
  set(
    "rec-hrv-val",
    inputs.hrv ? `${inputs.hrv} ms` : `~${Math.round(30 + score / 2)} ms`
  );

  /* RHR */
  set(
    "rec-rhr-val",
    inputs.rhr ? `${inputs.rhr} bpm` : `~${Math.round(75 - score / 3)} bpm`
  );

  /* STATE */
  const stateEl = document.getElementById("recovery-state");

  if (stateEl) {

    stateEl.style.color = "#fff";

    if (state === "Optimal") stateEl.style.color = "#22c55e";
    if (state === "Good") stateEl.style.color = "#f59e0b";
    if (state === "Fatigued") stateEl.style.color = "#ef4444";

    stateEl.textContent = state;
  }

  /* RECOMMENDATION */
  set("recovery-recommendation", recommendation);

  /* DESCRIPTION */
  set(
    "rec-readiness-desc",
    `Sleep: ${getSleepScore()}% | Nutrition: ${Math.round(getNutritionScore())}%`
  );
}

/* =========================================
   GRAPH (SLEEP TREND)
========================================= */

function drawGraph() {

  const c = document.getElementById("recovery-graph");
  if (!c) return;

  const ctx = c.getContext("2d");
  const data = safeJSON("consistencyData");

  const keys = Object.keys(data).slice(-7);
  const values = keys.map(k => data[k]?.sleep || 0);

  ctx.clearRect(0, 0, c.width, c.height);

  if (!values.length) return;

  ctx.beginPath();

  values.forEach((v, i) => {

    const x = (i / (values.length - 1 || 1)) * c.width;
    const y = c.height - (v / 100) * c.height;

    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });

  ctx.strokeStyle = "#22c55e";
  ctx.lineWidth = 3;
  ctx.stroke();
}

/* =========================================
   LIVE SYSTEM
========================================= */

function startSystem() {

  updateUI();

  if (recoveryInterval) clearInterval(recoveryInterval);

  recoveryInterval = setInterval(() => {
    updateUI();
    drawGraph();
  }, 2000);

  window.addEventListener("storage", updateUI);
}

/* =========================================
   SAVE INPUTS (FIXED)
========================================= */

document.addEventListener("DOMContentLoaded", () => {

  const btn = document.getElementById("save-recovery-inputs");
  if (!btn) return;

  btn.addEventListener("click", () => {

    const data = {
      hrv: Number(document.getElementById("recovery-hrv-input")?.value) || null,
      rhr: Number(document.getElementById("recovery-rhr-input")?.value) || null,
      stress: Number(document.getElementById("recovery-stress-input")?.value) || null,
      soreness: Number(document.getElementById("recovery-soreness-input")?.value) || null,
    };

    localStorage.setItem("recovery-inputs", JSON.stringify(data));

    updateUI();
  });

  startSystem();
});