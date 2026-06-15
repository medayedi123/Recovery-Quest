// ==========================================
// AURA AI COACH SYSTEM
// ==========================================

const GROQ_API_KEY = "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";

// ==========================================
// INITIALIZE COACH
// ==========================================

function initCoach() {

  const chatForm =
    document.getElementById(
      'coach-chat-form'
    );

  const chatInput =
    document.getElementById(
      'coach-chat-input'
    );

  if (!chatForm) return;

  // prevent duplicate bindings
  if (chatForm.dataset.bound === "true") {
    return;
  }

  chatForm.dataset.bound = "true";

  chatForm.onsubmit = async (e) => {

    e.preventDefault();

    const text =
      chatInput.value.trim();

    if (!text) return;

    // ==========================================
    // USER MESSAGE
    // ==========================================

    appendChatMessage(
      'user',
      text
    );

    chatInput.value = '';

    // ==========================================
    // LOADING MESSAGE
    // ==========================================

    const loadingBubble =
      appendChatMessage(
        'ai',
        'Recovery Quest AI is thinking...'
      );

    try {

      // ==========================================
      // USER HEALTH CONTEXT
      // ==========================================

      let calories = 0;
      let protein = 0;
      let carbs = 0;
      let fats = 0;

      if (
        window.nutriData &&
        window.nutriData.meals
      ) {

        window.nutriData.meals.forEach(m => {

          calories += Number(m.cal || 0);
          protein += Number(m.pro || 0);
          carbs += Number(m.carb || 0);
          fats += Number(m.fat || 0);

        });
      }

      const water =
        window.nutriData?.water || 0;

      const recovery =
        window.recoveryScore || 0;

      const sleep =
        window.sleepHours || 0;

      const context = `

USER FITNESS DATA

Calories: ${calories}
Protein: ${protein}g
Carbs: ${carbs}g
Fats: ${fats}g
Water: ${water}ml
Recovery Score: ${recovery}
Sleep Hours: ${sleep}

`;

      // ==========================================
      // SEND TO GROQ
      // ==========================================

      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {

          method: "POST",

          headers: {

            "Content-Type":
              "application/json",

            "Authorization":
              `Bearer ${GROQ_API_KEY}`

          },

          body: JSON.stringify({

            model:
              "llama-3.3-70b-versatile",

            messages: [

              {
                role: "system",

                content: `

You are Recovery Quest AI,
an advanced fitness,
nutrition, recovery,
and training coach.

You provide:
- workout advice
- recovery analysis
- nutrition suggestions
- sleep recommendations
- hydration guidance
- muscle building help
- fat loss coaching

Use the user's data
to personalize answers.

${context}

Keep responses:
- helpful
- concise
- intelligent
- realistic
- fitness focused

`

              },

              {
                role: "user",
                content: text
              }

            ],

            temperature: 0.7,
            max_tokens: 700

          })

        }
      );

      const data =
        await response.json();

      console.log(data);

      // ==========================================
      // REMOVE LOADING
      // ==========================================

      loadingBubble.remove();

      // ==========================================
      // AI RESPONSE
      // ==========================================

      const aiReply =
        data?.choices?.[0]
        ?.message?.content
        ||
        "No response received.";

      appendChatMessage(
        'ai',
        aiReply
      );

    } catch (err) {

      console.error(err);

      loadingBubble.remove();

      appendChatMessage(
        'ai',
        `
        ❌ Connection Error<br><br>
        Possible causes:
        <br>• Invalid API key
        <br>• Rate limit reached
        <br>• Internet issue
        `
      );
    }

  };

}

// ==========================================
// APPEND MESSAGE
// ==========================================

function appendChatMessage(
  sender,
  text
) {

  const container =
    document.getElementById(
      'coach-messages-container'
    );

  if (!container) return null;

  const bubble =
    document.createElement('div');

  bubble.className =
    `chat-bubble ${sender}`;

  bubble.innerHTML = text;

  container.appendChild(bubble);

  // smooth scroll
  container.scrollTop =
    container.scrollHeight;

  return bubble;
}

// ==========================================
// GLOBAL AI HOOK
// ==========================================

window.handleUserMessage =
  function(userQuery) {

    console.log(
      "AI Query:",
      userQuery
    );

  };

// ==========================================
// GLOBAL INIT
// ==========================================

window.initCoach = initCoach;

// ==========================================
// PAGE SUBSCRIPTION
// ==========================================

window.store.subscribe((state) => {

  if (
    state.activePage === 'coach'
  ) {

    initCoach();

  }

});

// ==========================================
// INITIAL FALLBACK INIT
// ==========================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    initCoach();

  }
);