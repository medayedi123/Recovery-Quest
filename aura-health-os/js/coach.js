// ==========================================
// AURA AI COACH - FRONTEND
// ==========================================

function initCoach() {
  const chatForm = document.getElementById("coach-chat-form");
  const chatInput = document.getElementById("coach-chat-input");
  const container = document.getElementById("coach-messages-container");

  if (!chatForm) return;

  // prevent double binding
  if (chatForm.dataset.bound === "true") return;
  chatForm.dataset.bound = "true";

  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const text = chatInput.value.trim();
    if (!text) return;

    // user message
    appendMessage(container, "user", text);
    chatInput.value = "";

    // loading
    const loading = appendMessage(container, "ai", "Thinking...");

    try {
      const response = await fetch("/.netlify/functions/coach", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text,
          context: getContext()
        })
      });

      const data = await response.json();

      loading.remove();

      // FIXED: Now reads data.content from the backend
      const aiReply = data.content || data.error || "No response received.";

      appendMessage(container, "ai", aiReply);

    } catch (err) {
      loading.remove();
      appendMessage(container, "ai", "Error: " + err.message);
    }
  });
}

// ------------------------------------------
// CONTEXT BUILDER (optional safe version)
// ------------------------------------------
function getContext() {
  let calories = 0, protein = 0, carbs = 0, fats = 0;

  if (window.nutriData?.meals) {
    window.nutriData.meals.forEach(m => {
      calories += Number(m.cal || 0);
      protein += Number(m.pro || 0);
      carbs += Number(m.carb || 0);
      fats += Number(m.fat || 0);
    });
  }

  return `
Calories: ${calories}
Protein: ${protein}g
Carbs: ${carbs}g
Fats: ${fats}g
Water: ${window.nutriData?.water || 0}ml
Recovery: ${window.recoveryScore || 0}
Sleep: ${window.sleepHours || 0}
`;
}

// ------------------------------------------
// UI MESSAGE FUNCTION
// ------------------------------------------
function appendMessage(container, sender, text) {
  const bubble = document.createElement("div");
  bubble.className = `chat-bubble ${sender}`;
  bubble.innerHTML = text;

  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;

  return bubble;
}

// ------------------------------------------
// INIT
// ------------------------------------------
document.addEventListener("DOMContentLoaded", initCoach);