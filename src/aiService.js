const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

export const getAiResponse = async (userPrompt) => {
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `You are the official AI assistant for RideHive, a vehicle rental service in Uttarakhand (Dehradun, Rishikesh, Mussoorie).
            You help users choose between cars, bikes, and scooties.
            Keep your answers helpful, professional, and under 3 sentences.`
          },
          {
            role: "user",
            content: userPrompt
          }
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Groq API Error:", data);
      return "I'm having trouble connecting. Please try again!";
    }

    return data.choices[0].message.content;

  } catch (error) {
    console.error("Network Error:", error);
    return "I'm having trouble connecting. Please try again!";
  }
};