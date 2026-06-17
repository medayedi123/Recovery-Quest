const NUTRI_GOALS = {
  calories: 2200,
  protein: 130,
  carbs: 220,
  fats: 75,
  water: 2500
};

let nutriData = JSON.parse(localStorage.getItem("nutriData")) || {
  meals: [],
  water: 0
};

/* =========================
HELPER SAFE GE
========================= */
function el(id) {
  return document.getElementById(id);
}

/* =========================
ADD MEAL
========================= */
el("nutri-food-form").addEventListener("submit", (e) => {
  e.preventDefault();

  nutriData.meals.push({
    type: el("food-type").value,
    name: el("food-name").value,
    cal: Number(el("food-cal").value || 0),
    pro: Number(el("food-pro").value || 0),
    carb: Number(el("food-carb").value || 0),
    fat: Number(el("food-fat").value || 0),
  });

  save();
  render();
  update();
  e.target.reset();
});

/* =========================
WATER
========================= */
el("water-add-250").onclick = () => {
  nutriData.water += 250;
  save();
  update();
};

el("water-add-500").onclick = () => {
  nutriData.water += 500;
  save();
  update();
};

/* =========================
CALCULATE
========================= */
function calculate() {

  let cal = 0, pro = 0, carb = 0, fat = 0;

  nutriData.meals.forEach(m => {
    cal += m.cal;
    pro += m.pro;
    carb += m.carb;
    fat += m.fat;
  });

  let score = 100;

  if (cal > NUTRI_GOALS.calories)
    score -= (cal - NUTRI_GOALS.calories) / 50;

  if (pro < NUTRI_GOALS.protein)
    score -= 10;

  return Math.max(0, Math.min(100, Math.round(score)));
}

/* =========================
UPDATE UI
========================= */
function update() {

  let cal = 0, pro = 0, carb = 0, fat = 0;

  nutriData.meals.forEach(m => {
    cal += m.cal;
    pro += m.pro;
    carb += m.carb;
    fat += m.fat;
  });

  el("nutri-cal-text-val").innerText = cal;
  el("nutri-carb-text-val").innerText = carb + "g";
  el("nutri-fat-text-val").innerText = fat + "g";

  el("nutri-score-val").innerText = calculate();

  el("macro-protein-val").innerText = `${pro} / ${NUTRI_GOALS.protein}g`;
  el("macro-carbs-val").innerText = `${carb} / ${NUTRI_GOALS.carbs}g`;
  el("macro-fats-val").innerText = `${fat} / ${NUTRI_GOALS.fats}g`;

  el("macro-protein-bar").style.width =
    Math.min(100, (pro / NUTRI_GOALS.protein) * 100) + "%";

  el("macro-carbs-bar").style.width =
    Math.min(100, (carb / NUTRI_GOALS.carbs) * 100) + "%";

  el("macro-fats-bar").style.width =
    Math.min(100, (fat / NUTRI_GOALS.fats) * 100) + "%";

  el("water-text").innerText =
    `${nutriData.water} / ${NUTRI_GOALS.water} ml`;

  el("water-pct").innerText =
    Math.round((nutriData.water / NUTRI_GOALS.water) * 100) + "%";
}

/* =========================
RENDER MEALS
========================= */
function render() {

  ["breakfast", "lunch", "dinner", "snacks"].forEach(type => {

    const box = el("timeline-" + type);
    box.innerHTML = "";

    nutriData.meals
      .filter(m => m.type === type)
      .forEach(m => {

        const div = document.createElement("div");
        div.innerText = `${m.name} - ${m.cal} kcal`;

        box.appendChild(div);
      });

  });
}

/* =========================
SAVE
========================= */
function save() {
  localStorage.setItem("nutriData", JSON.stringify(nutriData));
}

/* =========================
INIT
========================= */
render();
update();