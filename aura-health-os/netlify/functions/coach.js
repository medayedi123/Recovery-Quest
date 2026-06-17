exports.handler = async (event) => {
  try {
    const { text, context } = JSON.parse(event.body);

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: `
You are Recovery Quest AI coach.

You are a fitness, nutrition, and recovery assistant.

Use user data:
${context}

Rules:
- Be concise
- Be practical
- Give actionable advice
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

    const data = await response.json();

    // Check if Groq returned an error
    if (!response.ok) {
      throw new Error(data.error?.message || "Groq API error");
    }

    // Extract the content
    const content = data.choices?.[0]?.message?.content || "No response from AI.";

    return {
      statusCode: 200,
      body: JSON.stringify({ content })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};