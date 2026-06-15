

/* ==========================================
   XP + LEVEL + STREAK + NAVIGATION SYSTEM
========================================== */

/* ---------- XP SYSTEM ---------- */

let xp = parseInt(localStorage.getItem("userXP")) || 0;

function saveXP(amount) {
    xp += amount;
    localStorage.setItem("userXP", xp);
    updateLevelDisplay();
}

/* ---------- LEVEL SYSTEM ---------- */

function getLevelFromXP(xp) {
    return Math.floor(xp / 100) + 1;
}
function renderHeatmap() {
  // TODO: Implement heatmap
}
function updateLevelDisplay() {
    const level = getLevelFromXP(xp);
    const currentLevelXP = xp % 100;

    const levelElement = document.getElementById("topbar-user-level");
    const progressBar = document.getElementById("topbar-xp-progress");

    if (levelElement) {
        levelElement.textContent = `Lvl ${level}`;
    }

    if (progressBar) {
        progressBar.style.width = `${currentLevelXP}%`;
    }
}

/* ---------- STREAK SYSTEM ---------- */

function updateStreak() {

    const today = new Date().toDateString();

    let streak = parseInt(localStorage.getItem("userStreak")) || 0;
    let lastVisit = localStorage.getItem("lastVisitDate");

    if (!lastVisit) {
        streak = 1;
    } else {

        const last = new Date(lastVisit);
        const current = new Date(today);

        const diffDays =
            Math.floor((current - last) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            streak++;
        } else if (diffDays > 1) {
            streak = 1;
        }
    }

    localStorage.setItem("userStreak", streak);
    localStorage.setItem("lastVisitDate", today);

    const streakElement = document.getElementById("topbar-user-streak");

    if (streakElement) {
        streakElement.textContent = `🔥 ${streak} Days`;
    }
}

/* ---------- DAILY XP LIMIT SYSTEM ---------- */

function awardDailyConsistencyXP(consistencyScore) {

    const today = new Date().toDateString();

    const lastXPDate = localStorage.getItem("lastXPDate");

    if (lastXPDate !== today) {
        localStorage.setItem("lastXPDate", today);
        localStorage.setItem("xpEarnedToday", "0");
    }

    let currentDailyXP =
        parseInt(localStorage.getItem("xpEarnedToday")) || 0;

    let xpToAdd = Math.round(consistencyScore);

    if (currentDailyXP + xpToAdd > 100) {
        xpToAdd = 100 - currentDailyXP;
    }

    if (xpToAdd <= 0) return;

    saveXP(xpToAdd);

    currentDailyXP += xpToAdd;

    localStorage.setItem("xpEarnedToday", currentDailyXP);
}

/* ---------- PAGE SYSTEM ---------- */

function showPage(page) {

    document.querySelectorAll(".view-panel").forEach(p => {
        p.style.display = "none";
    });

    const active = document.getElementById(page + "-view");

    if (active) {
        active.style.display = "block";
    }
}

/* ---------- NAVIGATION SYSTEM (CONNECTED TO BOTH SIDEBAR + MOBILE) ---------- */

document.addEventListener("click", function (e) {

    const link = e.target.closest("a[data-page]");
    if (!link) return;

    e.preventDefault();

    const page = link.getAttribute("data-page");

    // XP reward for navigation


    // Update systems instantly
    updateLevelDisplay();
    updateStreak();

    // Switch page
    showPage(page);
});

/* ---------- INIT ON LOAD ---------- */

window.addEventListener("load", function () {

    updateLevelDisplay();
    updateStreak();

    showPage("dashboard"); // default page
});

/* ==========================================
   INITIALIZE
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    updateLevelDisplay();
    updateStreak();

});
function initDashboard() {
  const state = window.store.state;

  // 1. Update Hero Greeting & Stats
  const heroGreeting = document.querySelector('.hero-greeting');
  if (heroGreeting) {
    const userName = (state.user && state.user.name) ? state.user.name.split(' ')[0] : 'Athlete';
    heroGreeting.textContent = `Welcome back, ${userName}`;
  }

  // Update Hero Metrics
  const readinessVal = document.getElementById('hero-readiness-val');
  if (readinessVal) {
    readinessVal.textContent = state.biometrics.readiness > 0 ? `${state.biometrics.readiness}%` : '--%';
  }
  
  const kcalRemaining = document.getElementById('hero-kcal-val');
  if (kcalRemaining) {
    const remaining = state.biometrics.kcalTarget - state.biometrics.kcalEaten;
    kcalRemaining.textContent = `${remaining > 0 ? remaining : 0} kcal`;
  }

  // 2. Render Calorie Ring Progress
  renderProgressRing('dash-kcal-ring', state.biometrics.kcalEaten, state.biometrics.kcalTarget);
  const kcalLabel = document.getElementById('dash-kcal-text');
  if (kcalLabel) kcalLabel.textContent = state.biometrics.kcalEaten;

 

  // 4. Update Sleep & Recovery Card
  renderProgressRing('dash-sleep-ring', state.biometrics.sleepQuality, 100);
  const sleepLabel = document.getElementById('dash-sleep-text');
  if (sleepLabel) {
    sleepLabel.textContent = state.biometrics.sleepHours > 0 ? `${state.biometrics.sleepHours}h` : '--h';
  }

  const sleepQualityVal = document.getElementById('dash-sleep-quality-val');
  if (sleepQualityVal) {
    sleepQualityVal.textContent = state.biometrics.sleepHours > 0 ? `${state.biometrics.sleepQuality}%` : '--%';
  }

  const recoveryScoreText = document.getElementById('dash-recovery-score');
  if (recoveryScoreText) {
    recoveryScoreText.textContent = state.biometrics.sleepHours > 0 ? `${state.biometrics.readiness}% Readiness` : 'No sleep data logged';
  }

  // 5. Render Heatmap (Activity Calendar Grid)
  renderHeatmap();

  // 6. Bind Quick Water Logger Button
  const quickWaterBtn = document.getElementById('dash-quick-water');
  if (quickWaterBtn) {
    // Remove previous listener to prevent duplicate binds
    const newBtn = quickWaterBtn.cloneNode(true);
    quickWaterBtn.parentNode.replaceChild(newBtn, quickWaterBtn);
    newBtn.addEventListener('click', () => {
      window.store.addWater(250);
    });
  }

  // Bind Log Sleep Button
  const logSleepBtn = document.getElementById('dash-log-sleep-btn');
  if (logSleepBtn) {
    logSleepBtn.onclick = () => {
      const modal = document.getElementById('sleep-modal');
      if (modal) {
        modal.style.display = 'flex';
        const hrsInput = document.getElementById('sleep-modal-hours');
        if (hrsInput) {
          hrsInput.value = state.biometrics.sleepHours || '';
          hrsInput.focus();
        }
      }
    };
  }

  // 7. Update Gamification Headers
  renderGamificationHeader();
}

function renderProgressRing(svgId, current, target) {
  const circle = document.querySelector(`#${svgId} .progress-ring-circle`);
  if (!circle) return;
  
  const radius = circle.r.baseVal.value;
  const circumference = radius * 2 * Math.PI;
  
  circle.style.strokeDasharray = `${circumference} ${circumference}`;
  
  const percent = Math.min(Math.max(current / target, 0), 1);
  const offset = circumference - percent * circumference;
  circle.style.strokeDashoffset = offset;
}



function renderGamificationHeader() {
  const state = window.store.state;
  
  // Header Profile Section Updates
  const levelBadge = document.getElementById('topbar-user-level');
  const streakBadge = document.getElementById('topbar-user-streak');
  const xpProgress = document.getElementById('topbar-xp-progress');
  const gamificationElements = document.querySelectorAll('.gamification-element');

  // Hide or Show depending on state
  gamificationElements.forEach(el => {
    el.style.display = state.gamificationEnabled ? 'flex' : 'none';
  });

  if (state.gamificationEnabled) {
    if (levelBadge) levelBadge.textContent = `Lvl ${state.user.level}`;
    if (streakBadge) streakBadge.textContent = `🔥 ${state.user.streak} Days`;
    
    if (xpProgress) {
      const pct = (state.user.xp / state.user.xpNextLevel) * 100;
      xpProgress.style.width = `${pct}%`;
    }
  }
}

// Bind Global Window Callback for Routing
window.initDashboard = initDashboard;

// Subscribe dashboard rendering to global store updates
window.store.subscribe((state) => {
  if (state.activePage === 'dashboard') {
    initDashboard();
  }
  renderGamificationHeader(); // Keeps header updated globally

  // Global dynamic navbar and profile sync
  const topbarUsername = document.querySelector('.topbar-username');
  if (topbarUsername && state.user && state.user.name) {
    topbarUsername.textContent = state.user.name;
  }

  if (true) {
    const bioName = document.getElementById('profile-bio-name');
    const bioHeight = document.getElementById('profile-bio-height');
    const bioWeight = document.getElementById('profile-bio-weight');

    if (bioName) bioName.textContent = state.user.name || 'Athlete';
    if (bioHeight) bioHeight.textContent = `${state.biometrics.height || 175} cm`;
    if (bioWeight) bioWeight.textContent = `${state.biometrics.weight || 75} kg`;
  }
});
