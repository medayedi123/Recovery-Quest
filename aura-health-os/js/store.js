class AuraStore {
  constructor() {

    this.state = {
      isLoggedIn: false,
      isOnboarded: false,
      activePage: 'dashboard', // kept only for state tracking (NOT navigation)
      sidebarCollapsed: false,
      gamificationEnabled: true,
      lastActiveDate: new Date().toDateString(),

      user: {
        name: '',
        email: '',
        level: 1,
        xp: 0,
        xpNextLevel: 100, // FIXED to match your UI system
        streak: 1,
      },

      notifications: [
        { id: 1, text: "Welcome to AURA OS! Configure your profile to start tracking metrics." }
      ],

      biometrics: {
        kcalEaten: 0,
        kcalTarget: 2000,
        waterEaten: 0,
        waterTarget: 2500,
        sleepHours: 0.0,
        sleepTarget: 8.0,
        sleepQuality: 0,
        readiness: 0,
        height: 175,
        weight: 75,
        goal: 'Hypertrophy',
        macros: {
          protein: 0,
          proteinTarget: 150,
          carbs: 0,
          carbsTarget: 220,
          fats: 0,
          fatsTarget: 70
        }
      },

      nutrition: {
        meals: []
      },

      exercises: [
        {
          id: 'squat',
          name: 'Barbell Squat',
          muscle: 'Quadriceps',
          difficulty: 'Advanced',
          videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-performing-squats-with-barbell-in-gym-40505-large.mp4',
          desc: 'Compound lower body exercise...',
          instructions: ['Full depth squat'],
          mistakes: ['Knee valgus', 'Heel lift']
        }
      ],

      workoutSession: {
        name: 'Lower Body Strength',
        completedExercisesCount: 0,
        setsLogged: {}
      },

      gamification: {
        achievements: [
          { title: "Hydration Elite", desc: "Drink goal reached", unlocked: false, icon: "💧" },
          { title: "Somatic Master", desc: "Breathing cycle completed", unlocked: false, icon: "🧘" },
          { title: "Mechanical Monster", desc: "High workout volume", unlocked: false, icon: "🏋️" }
        ]
      }
    };

    this.loadStateFromLocalStorage();
    this.checkDailyReset();
    this.subscribers = [];
  }

  /* ==========================================
     STORAGE
  ========================================== */

  loadStateFromLocalStorage() {
    const saved = localStorage.getItem('aura_state');
    if (!saved) return;

    try {
      this.state = JSON.parse(saved);
    } catch (e) {
      console.error("State load error", e);
    }
  }

  saveStateToLocalStorage() {
    localStorage.setItem('aura_state', JSON.stringify(this.state));
  }

  subscribe(cb) {
    this.subscribers.push(cb);
    cb(this.state);
  }

  notify() {
    this.saveStateToLocalStorage();
    this.subscribers.forEach(cb => cb(this.state));
  }

  /* ==========================================
     AUTH
  ========================================== */

  login(email) {
    this.state.isLoggedIn = true;
    this.state.user.email = email;
    this.notify();
  }

  signup(email) {
    this.state.isLoggedIn = true;
    this.state.user.email = email;
    this.notify();
  }

  completeOnboarding(name, height, weight, kcal, goal) {
    this.state.user.name = name;
    this.state.biometrics.height = Number(height);
    this.state.biometrics.weight = Number(weight);
    this.state.biometrics.kcalTarget = Number(kcal);
    this.state.biometrics.goal = goal;

    this.state.isOnboarded = true;

    this.state.notifications.unshift({
      id: Date.now(),
      text: `Welcome ${name}! Setup complete.`
    });

    this.notify();
  }

  logout() {
    localStorage.clear();
    location.reload();
  }

  /* ==========================================
     GAMIFICATION CORE
  ========================================== */

  addXp(amount) {
    this.state.user.xp += amount;

    if (this.state.user.xp >= this.state.user.xpNextLevel) {
      this.state.user.level += 1;
      this.state.user.xp = this.state.user.xp - this.state.user.xpNextLevel;

      this.triggerFloatingNotification(
        "LEVEL UP!",
        `You reached Level ${this.state.user.level}`
      );
    }

    this.notify();
  }

  unlockAchievement(title) {
    const ach = this.state.gamification.achievements.find(a => a.title === title);

    if (ach && !ach.unlocked) {
      ach.unlocked = true;

      this.triggerFloatingNotification(
        "Achievement Unlocked",
        `${ach.icon} ${ach.title}`
      );
    }
  }

  /* ==========================================
     WATER / FOOD / SLEEP
  ========================================== */

  addWater(amount) {
    this.state.biometrics.waterEaten += amount;

    if (this.state.biometrics.waterEaten >= this.state.biometrics.waterTarget) {
      this.unlockAchievement("Hydration Elite");
    }

    this.addXp(15);
  }

  addFood(cal, pro, carb, fat) {
    this.state.biometrics.kcalEaten += cal;
    this.state.biometrics.macros.protein += pro;
    this.state.biometrics.macros.carbs += carb;
    this.state.biometrics.macros.fats += fat;

    this.addXp(25);
  }

  logSleep(hours) {
    this.state.biometrics.sleepHours = hours;

    this.state.biometrics.sleepQuality =
      Math.min((hours / this.state.biometrics.sleepTarget) * 100, 100);

    this.addXp(50);
  }

  /* ==========================================
     WORKOUT
  ========================================== */

  toggleSet(exId, setIndex) {
    const sets = this.state.workoutSession.setsLogged[exId];
    if (!sets) return;

    const set = sets.find(s => s.setIndex === setIndex);
    if (!set) return;

    set.completed = !set.completed;

    if (set.completed) this.addXp(20);

    this.notify();
  }

  /* ==========================================
     DAILY RESET
  ========================================== */

  checkDailyReset() {
    const today = new Date().toDateString();

    if (this.state.lastActiveDate !== today) {

      this.state.biometrics.kcalEaten = 0;
      this.state.biometrics.waterEaten = 0;

      this.state.biometrics.macros = {
        protein: 0,
        carbs: 0,
        fats: 0
      };

      this.state.nutrition.meals = [];

      this.state.lastActiveDate = today;

      this.state.notifications.unshift({
        id: Date.now(),
        text: "New day started - stats reset"
      });

      this.notify();
    }
  }

  /* ==========================================
     UI NOTIFICATIONS
  ========================================== */

  triggerFloatingNotification(title, message) {
    if (!this.state.gamificationEnabled) return;

    const el = document.createElement("div");
    el.className = "gamification-reward-banner";
    el.innerHTML = `
      <div>
        <strong>${title}</strong>
        <div>${message}</div>
      </div>
    `;

    document.body.appendChild(el);

    setTimeout(() => el.remove(), 4000);
  }
}

window.store = new AuraStore();