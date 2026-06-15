// AURA OS AUTHENTICATION & ONBOARDING CONTROLLER

document.addEventListener('DOMContentLoaded', () => {
  let isLoginMode = true;
  let onboardingGoal = 'Hypertrophy';

  // DOM elements cache
  const authForm = document.getElementById('auth-form-el');
  const authEmail = document.getElementById('auth-email');
  const authPassword = document.getElementById('auth-password');
  const authConfirmGroup = document.getElementById('auth-confirm-group');
  const authConfirmPassword = document.getElementById('auth-confirm-password');
  
  const authCardTitle = document.getElementById('auth-card-title');
  const authCardSubtitle = document.getElementById('auth-card-subtitle');
  const authSubmitBtn = document.getElementById('auth-submit-btn');
  const authSwitchPrompt = document.getElementById('auth-switch-prompt');
  const authSwitchLink = document.getElementById('auth-switch-link');

  // Step wizard inputs
  const onboardName = document.getElementById('onboard-name');
  const onboardAge = document.getElementById('onboard-age');
  const onboardHeight = document.getElementById('onboard-height');
  const onboardWeight = document.getElementById('onboard-weight');
  const onboardKcal = document.getElementById('onboard-kcal');
  const onboardSubmitBtn = document.getElementById('onboard-submit-btn');
  const onboardingProgress = document.getElementById('onboarding-progress-indicator');

  // 1. Toggle Login / Register modes
  window.addEventListener("load", () => {
    const emailInput = document.getElementById("auth-email");
    const passwordInput = document.getElementById("auth-password");
    const authSubmitBtn = document.getElementById("auth-submit-btn");

    // Fill the fields
    if (emailInput) {
        emailInput.value = "your-email@example.com";
    }

    if (passwordInput) {
        passwordInput.value = "your-password";
    }

    // Then click the button
    if (authSubmitBtn) {
        authSubmitBtn.click();
    }
});
  if (authSwitchLink) {
    authSwitchLink.onclick = (e) => {
      e.preventDefault();
      isLoginMode = !isLoginMode;

      if (isLoginMode) {
        authCardTitle.textContent = 'Access AURA OS';
        authCardSubtitle.textContent = 'Connect your biometric telemetry terminal';
        authSubmitBtn.textContent = 'Initialize Terminal';
        authSwitchPrompt.textContent = 'New athlete?';
        authSwitchLink.textContent = 'Register Account';
        authConfirmGroup.style.display = 'none';
        authConfirmPassword.removeAttribute('required');
      } else {
        authCardTitle.textContent = 'Register Terminal';
        authCardSubtitle.textContent = 'Initialize your biometric identity';
        authSubmitBtn.textContent = 'Register Identity';
        authSwitchPrompt.textContent = 'Already configured?';
        authSwitchLink.textContent = 'Access Account';
        authConfirmGroup.style.display = 'flex';
        authConfirmPassword.setAttribute('required', 'true');
      }
    };
  }

  // 2. Credentials validation handler
  if (authForm) {
    authForm.onsubmit = (e) => {
      e.preventDefault();

      const email = authEmail.value.trim();
      const pass = authPassword.value;

      if (!isLoginMode) {
        const confirmPass = authConfirmPassword.value;
        if (pass !== confirmPass) {
          alert("Telemetry verification mismatch: Passwords do not match.");
          return;
        }
        window.store.signup(email);
      } else {
        window.store.login(email);
      }
    };
  }

  // 3. Multi-Step Onboarding Wizard Step Transitions
  const nextButtons = document.querySelectorAll('.onboard-next-btn');
  const prevButtons = document.querySelectorAll('.onboard-prev-btn');

  nextButtons.forEach(btn => {
    btn.onclick = () => {
      const activeStepDiv = document.querySelector('.onboarding-step.active');
      const stepNum = parseInt(activeStepDiv.getAttribute('data-step'));

      // Validate step values before advancing
      if (stepNum === 1) {
        if (!onboardName.value.trim() || !onboardAge.value) {
          alert("All telemetry inputs must be completed.");
          return;
        }
      } else if (stepNum === 2) {
        if (!onboardHeight.value || !onboardWeight.value) {
          alert("Biometric height and mass measurements must be loaded.");
          return;
        }
      }

      // Transition forward
      activeStepDiv.classList.remove('active');
      const nextStepDiv = document.querySelector(`.onboarding-step[data-step="${stepNum + 1}"]`);
      if (nextStepDiv) {
        nextStepDiv.classList.add('active');
        
        // Update Progress Indicator bar & dots
        if (onboardingProgress) {
          const pct = ((stepNum + 1) / 3) * 100;
          onboardingProgress.style.width = `${pct}%`;
        }

        // Recalculate calorie recommendations if arriving at Step 3
        if (stepNum + 1 === 3) {
          calculateCalorieRecommendation();
        }
      }
    };
  });

  prevButtons.forEach(btn => {
    btn.onclick = () => {
      const activeStepDiv = document.querySelector('.onboarding-step.active');
      const stepNum = parseInt(activeStepDiv.getAttribute('data-step'));

      // Transition backward
      activeStepDiv.classList.remove('active');
      const prevStepDiv = document.querySelector(`.onboarding-step[data-step="${stepNum - 1}"]`);
      if (prevStepDiv) {
        prevStepDiv.classList.add('active');

        // Update Progress indicator
        if (onboardingProgress) {
          const pct = ((stepNum - 1) / 3) * 100;
          onboardingProgress.style.width = `${pct}%`;
        }
      }
    };
  });

  // 4. Onboarding Step 3 Goal Selection & Recommendation Calculator
  const goalOptions = document.querySelectorAll('.goal-option');
  goalOptions.forEach(opt => {
    opt.onclick = () => {
      goalOptions.forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      onboardingGoal = opt.getAttribute('data-goal');
      
      calculateCalorieRecommendation();
    };
  });

  function calculateCalorieRecommendation() {
    const weight = Number(onboardWeight.value) || 70;
    let recom = 2000;

    switch (onboardingGoal) {
      case 'Hypertrophy':
        recom = Math.round(weight * 33);
        break;
      case 'Fat Loss':
        recom = Math.round(weight * 23);
        break;
      case 'Endurance':
        recom = Math.round(weight * 30);
        break;
      case 'Recovery':
        recom = Math.round(weight * 26);
        break;
    }

    const recomValEl = document.getElementById('onboard-kcal-recommendation');
    if (recomValEl) {
      recomValEl.textContent = recom;
    }
  }

  // Quick Apply Recommendation Link click helper
  const applyLink = document.getElementById('apply-kcal-recommendation');
  if (applyLink) {
    applyLink.onclick = (e) => {
      e.preventDefault();
      const recomValEl = document.getElementById('onboard-kcal-recommendation');
      if (recomValEl && onboardKcal) {
        onboardKcal.value = recomValEl.textContent;
      }
    };
  }

  // Monitor physical inputs to adjust recommended targets instantly
  if (onboardWeight) {
    onboardWeight.oninput = () => calculateCalorieRecommendation();
  }

  // 5. Submit final onboarding details
  if (onboardSubmitBtn) {
    onboardSubmitBtn.onclick = (e) => {
      e.preventDefault();

      const name = onboardName.value.trim();
      const age = onboardAge.value;
      const height = onboardHeight.value;
      const weight = onboardWeight.value;
      const kcal = onboardKcal.value;

      if (!name || !age || !height || !weight || !kcal) {
        alert("Please complete all biometric directives before bootup.");
        return;
      }

      window.store.completeOnboarding(name, age, height, weight, kcal, onboardingGoal);
    };
  }

  // 6. Subscribe to global store changes to control visibility overlays
  window.store.subscribe(state => {
    const authContainer = document.getElementById('auth-container');
    const onboardingContainer = document.getElementById('onboarding-container');
    const appShell = document.getElementById('app-shell');

    if (!state.isLoggedIn) {
      if (authContainer) authContainer.style.display = 'flex';
      if (onboardingContainer) onboardingContainer.style.display = 'none';
      if (appShell) appShell.style.display = 'none';
    } else if (!state.isOnboarded) {
      if (authContainer) authContainer.style.display = 'none';
      if (onboardingContainer) onboardingContainer.style.display = 'flex';
      if (appShell) appShell.style.display = 'none';
    } else {
      if (authContainer) authContainer.style.display = 'none';
      if (onboardingContainer) onboardingContainer.style.display = 'none';
      if (appShell) appShell.style.display = 'grid';
    }
  });

  // 7. Global Sleep Modal Controller
  const sleepModal = document.getElementById('sleep-modal');
  const sleepModalForm = document.getElementById('sleep-modal-form');
  const sleepModalCancelBtn = document.getElementById('sleep-modal-cancel-btn');
  const sleepModalHours = document.getElementById('sleep-modal-hours');

  if (sleepModalForm) {
    sleepModalForm.onsubmit = (e) => {
      e.preventDefault();
      const hours = parseFloat(sleepModalHours.value);
      if (!isNaN(hours) && hours >= 0) {
        window.store.logSleep(hours);
        if (sleepModal) sleepModal.style.display = 'none';
      }
    };
  }

  if (sleepModalCancelBtn) {
    sleepModalCancelBtn.onclick = () => {
      if (sleepModal) sleepModal.style.display = 'none';
    };
  }

  if (sleepModal) {
    sleepModal.onclick = (e) => {
      if (e.target === sleepModal) {
        sleepModal.style.display = 'none';
      }
    };
  }
});
