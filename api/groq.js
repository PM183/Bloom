// /api/groq.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userMessage, messages } = req.body;

    const messagesPayload = [
      { role: "system", content: "You are Bloom, a friendly student wellness assistant." },
      ...messages
        .filter(m => m.sender !== "user")
        .map(m => ({ role: "assistant", content: m.text })),
      { role: "user", content: userMessage },
    ];

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`, // Hidden in Vercel
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: messagesPayload,
        temperature: 0.7,
        max_tokens: 500,
        top_p: 0.9,
      }),
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Groq API error:", error);
    res.status(500).json({ error: "Error connecting to Groq API" });
  }
}
