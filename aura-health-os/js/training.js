/* ==========================================
   AURA TRAINING SYSTEM
========================================== */

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];

/* ==========================================
   STATE
========================================== */

const todayRealIndex =
  new Date().getDay() === 0
    ? 6
    : new Date().getDay() - 1;

const state = {
  split: null,
  splitName: "",
  dayIndex: todayRealIndex,
  lastActiveDay: todayRealIndex,
  week: {},
  currentDay: days[todayRealIndex]
};

/* ==========================================
   REAL DAY SYNC SYSTEM
========================================== */

function getTodayIndex() {

  const jsDay =
    new Date().getDay();

  return jsDay === 0
    ? 6
    : jsDay - 1;
}

function syncRealDayProgress() {

  const todayIndex =
    getTodayIndex();

  state.dayIndex = todayIndex;

  state.currentDay =
    days[todayIndex];

  if (
    state.lastActiveDay === undefined
  ) {

    state.lastActiveDay =
      todayIndex;

    return;
  }

  if (
    state.lastActiveDay === todayIndex
  ) {

    state.dayIndex = todayIndex;

    return;
  }

  const previousDay =
    days[state.lastActiveDay];

  const previousData =
    state.week[previousDay];

  if (previousData) {

    previousData.finished = false;

    previousData.score = 0;

    previousData.exercises.forEach(ex => {

      ex.completed = false;

      ex.sets = "";

      ex.reps = "";

      ex.weight = "";
    });
  }

  state.lastActiveDay =
    todayIndex;

  saveTrainingData();
}

/* ==========================================
   MUSCLE TRACKER (HIDDEN)
========================================== */

const muscleTracker = {
  Chest: 0,
  Back: 0,
  Legs: 0,
  Shoulders: 0,
  Arms: 0,
  Core: 0,
  Cardio: 0
};

/* ==========================================
   WEEK RESET SYSTEM
========================================== */

function getCurrentWeekKey() {

  const now = new Date();

  const start = new Date(now.getFullYear(), 0, 1);

  const daysPassed = Math.floor(
    (now - start) / (24 * 60 * 60 * 1000)
  );

  return `${now.getFullYear()}-${Math.ceil(daysPassed / 7)}`;
}

const currentWeekKey = getCurrentWeekKey();

/* ==========================================
   EXERCISE LIBRARY
========================================== */

const library = [

/* CHEST */
{
  name:"Bench Press",
  muscle:"Chest",
  desc:"Heavy compound chest press.",
  mistakes:["Bouncing bar","Flaring elbows"]
},

{
  name:"Incline Bench Press",
  muscle:"Chest",
  desc:"Upper chest pressing movement.",
  mistakes:["Short reps","Too much arch"]
},

{
  name:"Decline Bench Press",
  muscle:"Chest",
  desc:"Lower chest focused press.",
  mistakes:["Fast reps"]
},

{
  name:"Push Up",
  muscle:"Chest",
  desc:"Bodyweight chest exercise.",
  mistakes:["Sagging hips"]
},

{
  name:"Cable Fly",
  muscle:"Chest",
  desc:"Chest isolation movement.",
  mistakes:["Using momentum"]
},

{
  name:"Dumbbell Press",
  muscle:"Chest",
  desc:"Free weight chest press.",
  mistakes:["Uneven pressing"]
},

{
  name:"Chest Dip",
  muscle:"Chest",
  desc:"Lower chest bodyweight movement.",
  mistakes:["Swinging"]
},

{
  name:"Machine Chest Press",
  muscle:"Chest",
  desc:"Machine chest press.",
  mistakes:["Locking elbows"]
},

/* BACK */

{
  name:"Deadlift",
  muscle:"Back",
  desc:"Posterior chain strength movement.",
  mistakes:["Rounded back"]
},

{
  name:"Pull Up",
  muscle:"Back",
  desc:"Vertical bodyweight pull.",
  mistakes:["Half reps"]
},

{
  name:"Lat Pulldown",
  muscle:"Back",
  desc:"Lat focused cable pull.",
  mistakes:["Pulling behind neck"]
},

{
  name:"Bent Over Row",
  muscle:"Back",
  desc:"Barbell rowing movement.",
  mistakes:["Standing upright"]
},

{
  name:"Seated Cable Row",
  muscle:"Back",
  desc:"Cable rowing exercise.",
  mistakes:["Using momentum"]
},

{
  name:"T-Bar Row",
  muscle:"Back",
  desc:"Heavy rowing movement.",
  mistakes:["Jerking weight"]
},

{
  name:"Single Arm Row",
  muscle:"Back",
  desc:"Single arm dumbbell row.",
  mistakes:["Twisting torso"]
},

{
  name:"Face Pull",
  muscle:"Back",
  desc:"Rear delt and upper back movement.",
  mistakes:["Pulling too low"]
},

/* LEGS */

{
  name:"Squat",
  muscle:"Legs",
  desc:"Primary lower body movement.",
  mistakes:["Knees collapsing"]
},

{
  name:"Front Squat",
  muscle:"Legs",
  desc:"Quad focused squat.",
  mistakes:["Elbows dropping"]
},

{
  name:"Romanian Deadlift",
  muscle:"Legs",
  desc:"Hamstring hinge movement.",
  mistakes:["Rounded back"]
},

{
  name:"Leg Press",
  muscle:"Legs",
  desc:"Machine lower body exercise.",
  mistakes:["Locking knees"]
},

{
  name:"Walking Lunges",
  muscle:"Legs",
  desc:"Single leg movement.",
  mistakes:["Short steps"]
},

{
  name:"Bulgarian Split Squat",
  muscle:"Legs",
  desc:"Advanced unilateral movement.",
  mistakes:["Leaning forward"]
},

{
  name:"Leg Curl",
  muscle:"Legs",
  desc:"Hamstring isolation.",
  mistakes:["Momentum"]
},

{
  name:"Calf Raise",
  muscle:"Legs",
  desc:"Calf training exercise.",
  mistakes:["Bouncing"]
},

/* SHOULDERS */

{
  name:"Overhead Press",
  muscle:"Shoulders",
  desc:"Vertical shoulder press.",
  mistakes:["Overarching"]
},

{
  name:"Arnold Press",
  muscle:"Shoulders",
  desc:"Rotational shoulder press.",
  mistakes:["Rushing reps"]
},

{
  name:"Lateral Raise",
  muscle:"Shoulders",
  desc:"Side delt movement.",
  mistakes:["Swinging"]
},

{
  name:"Rear Delt Fly",
  muscle:"Shoulders",
  desc:"Rear shoulder isolation.",
  mistakes:["Using traps"]
},

{
  name:"Machine Shoulder Press",
  muscle:"Shoulders",
  desc:"Machine shoulder press.",
  mistakes:["Locking elbows"]
},

/* ARMS */

{
  name:"Barbell Curl",
  muscle:"Arms",
  desc:"Classic bicep movement.",
  mistakes:["Swinging torso"]
},

{
  name:"Hammer Curl",
  muscle:"Arms",
  desc:"Neutral grip curl.",
  mistakes:["Momentum"]
},

{
  name:"Concentration Curl",
  muscle:"Arms",
  desc:"Strict bicep isolation.",
  mistakes:["Body movement"]
},

{
  name:"Tricep Pushdown",
  muscle:"Arms",
  desc:"Cable tricep exercise.",
  mistakes:["Moving elbows"]
},

{
  name:"Skull Crusher",
  muscle:"Arms",
  desc:"Tricep extension movement.",
  mistakes:["Flaring elbows"]
},

{
  name:"Close Grip Bench",
  muscle:"Arms",
  desc:"Heavy tricep press.",
  mistakes:["Grip too narrow"]
},

/* CORE */

{
  name:"Plank",
  muscle:"Core",
  desc:"Core stabilization hold.",
  mistakes:["Sagging hips"]
},

{
  name:"Crunch",
  muscle:"Core",
  desc:"Abdominal flexion movement.",
  mistakes:["Pulling neck"]
},

{
  name:"Hanging Leg Raise",
  muscle:"Core",
  desc:"Advanced ab exercise.",
  mistakes:["Swinging"]
},

{
  name:"Cable Crunch",
  muscle:"Core",
  desc:"Weighted ab exercise.",
  mistakes:["Using arms"]
},

{
  name:"Ab Wheel",
  muscle:"Core",
  desc:"Core anti-extension exercise.",
  mistakes:["Arching lower back"]
},

/* CARDIO */

{
  name:"Running",
  muscle:"Cardio",
  desc:"Endurance cardio exercise.",
  mistakes:["Bad posture"]
},

{
  name:"Jump Rope",
  muscle:"Cardio",
  desc:"Coordination cardio movement.",
  mistakes:["Jumping too high"]
},

{
  name:"Burpees",
  muscle:"Cardio",
  desc:"Full body cardio movement.",
  mistakes:["Poor plank"]
},

{
  name:"Mountain Climbers",
  muscle:"Cardio",
  desc:"HIIT movement.",
  mistakes:["Fast sloppy reps"]
},

{
  name:"Cycling",
  muscle:"Cardio",
  desc:"Low impact cardio.",
  mistakes:["Wrong seat height"]
},

{
  name:"Battle Ropes",
  muscle:"Cardio",
  desc:"Explosive cardio movement.",
  mistakes:["Standing upright"]
}

];

/* ==========================================
   SPLITS
========================================== */

const splits = {

  "Push Pull Legs": [
    "Chest",
    "Back",
    "Legs",
    "Shoulders",
    "Arms",
    "Core",
    "Rest"
  ],

  "Upper Lower": [
    "Chest",
    "Legs",
    "Back",
    "Legs",
    "Shoulders",
    "Arms",
    "Rest"
  ],

  "Calisthenics": [
    "Chest",
    "Back",
    "Legs",
    "Core",
    "Chest",
    "Back",
    "Rest"
  ],

  "Hybrid Athlete": [
    "Chest",
    "Cardio",
    "Back",
    "Legs",
    "Cardio",
    "Arms",
    "Rest"
  ]
};

/* ==========================================
   INIT
========================================== */

/* ==========================================
   INIT
========================================== */

function initTraining() {

  bindTabs();

  renderPrograms();

  renderExerciseCatalog(library);

  bindSearch();

  loadTrainingData();

  syncRealDayProgress();

  populateTodayExerciseSelect();

  renderTodayWorkout();

  updateDashboardTrainingSummary();
}
/* ==========================================
   TABS
========================================== */

function bindTabs() {

  const tabs = document.querySelectorAll(".tab-btn");

  tabs.forEach(tab => {

    tab.onclick = () => {

      tabs.forEach(t =>
        t.classList.remove("active")
      );

      document
        .querySelectorAll(".tab-content")
        .forEach(c =>
          c.classList.remove("active")
        );

      tab.classList.add("active");

      document
        .getElementById(
          "tab-" + tab.dataset.tab
        )
        .classList.add("active");
    };
  });
}

/* ==========================================
   PROGRAMS
========================================== */

function renderPrograms() {

  const container =
    document.getElementById("program-grid");

  if (!container) return;

  container.innerHTML = "";

  Object.keys(splits).forEach(splitName => {

    const card = document.createElement("div");

    card.className = "program-card";

    card.innerHTML = `
      <h3>${splitName}</h3>
      <p>${splits[splitName].join(" • ")}</p>

      <button class="modern-btn">
        Select Split
      </button>
    `;

    card.querySelector("button").onclick =
      () => selectSplit(splitName);

    container.appendChild(card);
  });
}

function selectSplit(splitName) {

  state.split = splits[splitName];

  state.splitName = splitName;

  generateWorkoutWeek();

  state.dayIndex = getTodayIndex();

  saveTrainingData();

  renderTodayWorkout();

  alert(`${splitName} selected.`);

  updateDashboardTrainingSummary();
}

/* ==========================================
   GENERATE WEEK
========================================== */

function generateWorkoutWeek() {

  state.week = {};

  days.forEach((day, index) => {

    const muscle = state.split[index];

    if (muscle === "Rest") {

      state.week[day] = {
        rest: true,
        score: 0,
        finished: false,
        exercises: []
      };

      return;
    }

    const filtered =
      library.filter(
        ex => ex.muscle === muscle
      );

    const shuffled =
      filtered.sort(() => 0.5 - Math.random());

    const exercises =
      shuffled.slice(0, 6).map(ex => ({
        ...ex,
        completed: false,
        sets: "",
        reps: "",
        weight: ""
      }));

    state.week[day] = {
      rest: false,
      muscle,
      score: 0,
      finished: false,
      exercises
    };
  });
}

/* ==========================================
   TODAY WORKOUT
========================================== */

function renderTodayWorkout() {

  const dayName = days[state.dayIndex];

  const dayData = state.week[dayName];

  const title =
    document.getElementById("today-title");

  const container =
    document.getElementById("today-exercises");

  const score =
    document.getElementById("today-score");

  const progress =
    document.getElementById("today-progress");
  updateDashboardTrainingSummary();

  if (!container) return;

  if (!dayData) {

    container.innerHTML =
      `<p style="color:white">
        Select a split first.
      </p>`;

    return;
  }

  title.textContent =
    `${dayName} • ${dayData.muscle || "Rest"}`;

  score.textContent = dayData.score;

  progress.textContent =
    `${dayData.exercises.filter(
      ex => ex.completed
    ).length} / ${dayData.exercises.length}`;

  if (dayData.finished) {

    container.innerHTML = `
      <div class="exercise-item">
        <h2 style="color:#22c55e">
          🎉 Workout Completed
        </h2>

        <p style="color:#aaa">
          Great job finishing today's workout.
        </p>
      `;

    return;
  }

  if (dayData.rest) {

    container.innerHTML = `
      <div class="exercise-item">
        <h2 style="color:#fff">
          Rest Day
        </h2>
      </div>
    `;

    return;
  }

  container.innerHTML = "";

  dayData.exercises.forEach((ex, index) => {

    const div = document.createElement("div");

    div.className = "exercise-item";

    div.innerHTML = `

      <div class="exercise-top">

        <div>
          <div class="exercise-name">
            ${ex.name}
          </div>

          <div class="exercise-muscle">
            ${ex.muscle}
          </div>
        </div>

        <button
          class="modern-btn secondary"
          onclick="removeExercise('${dayName}',${index})">
          Remove
        </button>

      </div>

      <p style="color:#aaa; margin-top:10px;">
        ${ex.desc}
      </p>

      <div class="exercise-inputs">

        <input
          placeholder="Sets"
          value="${ex.sets}"
          onchange="
            updateExerciseData(
              '${dayName}',
              ${index},
              'sets',
              this.value
            )
          ">

        <input
          placeholder="Reps"
          value="${ex.reps}"
          onchange="
            updateExerciseData(
              '${dayName}',
              ${index},
              'reps',
              this.value
            )
          ">

        <input
          placeholder="Weight"
          value="${ex.weight}"
          onchange="
            updateExerciseData(
              '${dayName}',
              ${index},
              'weight',
              this.value
            )
          ">

      </div>

      <button
        class="modern-btn"
        style="margin-top:14px;"
        onclick="
          completeExercise(
            '${dayName}',
            ${index}
          )
        ">

        ${
          ex.completed
            ? "Completed"
            : "Complete Exercise"
        }

      </button>
    `;

    container.appendChild(div);
  });
}

/* ==========================================
   COMPLETE EXERCISE
========================================== */

function completeExercise(dayName,index) {

  const ex =
    state.week[dayName].exercises[index];
  updateDashboardTrainingSummary();

  if (ex.completed) return;

  ex.completed = true;

  state.week[dayName].score += 10;

  if (
    muscleTracker[ex.muscle] !== undefined
  ) {
    muscleTracker[ex.muscle]++;
  }

  saveTrainingData();

  renderTodayWorkout();
  updateDashboardTrainingSummary();
}

/* ==========================================
   COMPLETE DAY
========================================== */

function completeWorkoutDay() {

  const dayName =
    days[state.dayIndex];

  const dayData =
    state.week[dayName];

  if (!dayData) return;

  dayData.finished = true;

  saveTrainingData();

  renderTodayWorkout();

  alert(
    `🎉 Congratulations!\nYou completed ${dayName}'s workout.`
  );
}

/* ==========================================
   SKIP DAY
========================================== */

function skipWorkoutDay() {

  const nextIndex =
    (state.dayIndex + 1) % 7;

  const currentDay =
    days[state.dayIndex];

  const nextDay =
    days[nextIndex];

  state.week[currentDay] =
    JSON.parse(
      JSON.stringify(
        state.week[nextDay]
      )
    );

  state.week[currentDay].score = 0;

  state.week[currentDay].finished = false;

  state.week[currentDay]
    .exercises
    .forEach(ex => {

      ex.completed = false;
    });

  saveTrainingData();

  renderTodayWorkout();
}

/* ==========================================
   UPDATE INPUTS
========================================== */

function updateExerciseData(
  day,
  index,
  field,
  value
) {

  state.week[day]
    .exercises[index][field] = value;

  saveTrainingData();
}

/* ==========================================
   REMOVE EXERCISE
========================================== */

function removeExercise(day,index) {

  state.week[day]
    .exercises.splice(index,1);

  saveTrainingData();

  renderTodayWorkout();
}

/* ==========================================
   ADD EXERCISE
========================================== */

function populateTodayExerciseSelect() {

  const select =
    document.getElementById(
      "today-add-exercise-select"
    );

  if (!select) return;

  select.innerHTML =
    `<option value="">
      Add Exercise
    </option>`;

  library.forEach(ex => {

    const option =
      document.createElement("option");

    option.value = ex.name;

    option.textContent =
      `${ex.name} (${ex.muscle})`;

    select.appendChild(option);
  });
}

function addExerciseFromTodaySelect() {

  const select =
    document.getElementById(
      "today-add-exercise-select"
    );

  if (!select.value) return;

  addExerciseToToday(select.value);

  select.value = "";
}

function addExerciseToToday(name) {

  const ex =
    library.find(
      e => e.name === name
    );

  if (!ex) return;

  const day =
    days[state.dayIndex];

  state.week[day]
    .exercises.push({

      ...ex,

      completed:false,

      sets:"",
      reps:"",
      weight:""
    });

  saveTrainingData();

  renderTodayWorkout();
}

/* ==========================================
   EXERCISE LIBRARY
========================================== */

function renderExerciseCatalog(list) {

  const container =
    document.getElementById(
      "exercise-catalog-list"
    );

  if (!container) return;

  container.innerHTML = "";

  list.forEach(ex => {

    const div =
      document.createElement("div");

    div.className = "exercise-card";

    div.innerHTML = `
      <strong>${ex.name}</strong>

      <div class="badge">
        ${ex.muscle}
      </div>
    `;

    div.onclick = () =>
      selectExercise(ex,div);

    container.appendChild(div);
  });
}

function selectExercise(ex,el) {

  document
    .querySelectorAll(".exercise-card")
    .forEach(card =>
      card.classList.remove("active")
    );

  el.classList.add("active");

  document
    .getElementById(
      "ex-detail-name"
    ).textContent = ex.name;

  document
    .getElementById(
      "ex-detail-desc"
    ).textContent = ex.desc;

  const mistakes =
    document.getElementById(
      "ex-detail-mistakes"
    );

  mistakes.innerHTML = "";

  ex.mistakes.forEach(m => {

    const li =
      document.createElement("li");

    li.textContent = m;

    mistakes.appendChild(li);
  });
}

/* ==========================================
   SEARCH
========================================== */

function bindSearch() {

  const search =
    document.getElementById(
      "exercise-search"
    );

  const filter =
    document.getElementById(
      "exercise-filter"
    );

  function update() {

    const q =
      search.value.toLowerCase();

    const f = filter.value;

    const filtered =
      library.filter(ex => {

        return (
          (f === "All" ||
            ex.muscle === f)
          &&
          ex.name
            .toLowerCase()
            .includes(q)
        );
      });

    renderExerciseCatalog(filtered);
  }

  search.oninput = update;

  filter.onchange = update;
}

/* ==========================================
   CUSTOM EXERCISE
========================================== */

function addCustomExercise() {

  const name =
    document.getElementById(
      "custom-ex-name"
    ).value;

  const muscle =
    document.getElementById(
      "custom-ex-muscle"
    ).value;

  const desc =
    document.getElementById(
      "custom-ex-desc"
    ).value;

  const mistakes =
    document.getElementById(
      "custom-ex-mistakes"
    ).value;

  if (!name || !desc) return;

  const ex = {

    name,

    muscle,

    desc,

    mistakes:
      mistakes
        .split(",")
        .map(m => m.trim())
  };

  library.push(ex);

  localStorage.setItem(
    "customExercises",
    JSON.stringify(
      library.filter(
        ex => ex.custom
      )
    )
  );

  renderExerciseCatalog(library);

  populateTodayExerciseSelect();

  alert("Exercise added.");
}

/* ==========================================
   STORAGE
========================================== */

function saveTrainingData() {

  localStorage.setItem(
    "aura-training",
    JSON.stringify({

      ...state,

      weekKey: currentWeekKey
    })
  );

  updateDashboardTrainingSummary();
}

function loadTrainingData() {

  const saved =
    localStorage.getItem(
      "aura-training"
    );

  if (!saved) {

    state.dayIndex =
      getTodayIndex();

    state.currentDay =
      days[state.dayIndex];

    state.lastActiveDay =
      state.dayIndex;

    return;
  }

  const parsed =
    JSON.parse(saved);

  if (
    parsed.weekKey !== currentWeekKey
  ) {

    Object.keys(
      parsed.week || {}
    ).forEach(day => {

      if (parsed.week[day]) {

        parsed.week[day].score = 0;

        parsed.week[day].finished = false;

        parsed.week[day]
          .exercises
          .forEach(ex => {

            ex.completed = false;

            ex.sets = "";

            ex.reps = "";

            ex.weight = "";
          });
      }
    });

    parsed.weekKey =
      currentWeekKey;
  }

  Object.assign(state, parsed);

  state.dayIndex =
    getTodayIndex();

  state.currentDay =
    days[state.dayIndex];

  if (
    state.lastActiveDay === undefined
  ) {

    state.lastActiveDay =
      state.dayIndex;
  }

  updateDashboardTrainingSummary();
}

/* ==========================================
   START
========================================== */

window.initTraining =
  initTraining;

document.addEventListener(
  "DOMContentLoaded",
  initTraining
);
/* ==========================================
   DASHBOARD TRAINING SUMMARY
========================================== */

function updateDashboardTrainingSummary() {

  const splitEl =
    document.getElementById(
      "dash-split-name"
    );

  const focusEl =
    document.getElementById(
      "dash-focus"
    );

  const exercisesEl =
    document.getElementById(
      "dash-exercises-done"
    );

  const scoreEl =
    document.getElementById(
      "dash-training-score"
    );

  if (
    !splitEl ||
    !focusEl ||
    !exercisesEl ||
    !scoreEl
  ) return;

  splitEl.textContent =
    state.splitName ||
    "No Split Selected";

  const dayName =
    days[state.dayIndex];

  const dayData =
    state.week[dayName];

  if (!dayData) {

    focusEl.textContent = "-";

    exercisesEl.textContent = "0/0";

    scoreEl.textContent = "0";

    return;
  }

  focusEl.textContent =
    dayData.rest
      ? "Rest Day"
      : (dayData.muscle || "-");

  const completed =
    dayData.exercises.filter(
      ex => ex.completed
    ).length;

  exercisesEl.textContent =
    `${completed}/${dayData.exercises.length}`;

  scoreEl.textContent =
    dayData.score || 0;
}