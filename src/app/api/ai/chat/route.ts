import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT =
  "You are an AI assistant for FoodieGo, a food delivery website. You can ONLY answer questions related to this website (dishes, orders, delivery, payment methods, etc.). If someone asks anything unrelated to this website, say: \"I'm only able to provide answers related to this website.\" Do not answer any other questions.";

async function callGroq(
  apiKey: string,
  userMessage: string,
  chatHistory: { sender: string; text: string }[],
): Promise<string> {
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...chatHistory.map((msg) => ({
      role: msg.sender === "user" ? "user" : "assistant",
      content: msg.text,
    })),
    { role: "user", content: userMessage },
  ];

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "openai/gpt-oss-120b",
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || `Groq API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function callGemini(
  apiKey: string,
  userMessage: string,
  chatHistory: { sender: string; text: string }[],
): Promise<string> {
  const { GoogleGenAI } = await import("@google/genai");
  const ai = new GoogleGenAI({ apiKey });

  const contents = [
    { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
    ...chatHistory.map((msg) => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.text }],
    })),
    { role: "user", parts: [{ text: userMessage }] },
  ];

  const models = ["gemini-3.8-flash", "gemini-3.6-flash"];

  for (const model of models) {
    try {
      const response = await ai.models.generateContent({ model, contents });
      const t = response.text;
      return typeof t === "string" ? t : "";
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "";
      const isQuota = errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("quota");
      const isRateLimit = errMsg.includes("429") || errMsg.includes("high demand");
      if (isQuota || isRateLimit) {
        console.error(`Gemini model ${model} failed, trying next...`);
        continue;
      }
      throw error;
    }
  }

  throw new Error("All Gemini models failed");
}

export async function POST(req: NextRequest) {
  try {
    const groqKey = process.env.GROQ_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    if (!groqKey && !geminiKey) {
      return NextResponse.json(
        { error: "AI service is not configured on the server." },
        { status: 503 },
      );
    }

    const body = await req.json();
    const { message, chatHistory = [] } = body;

    if (typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { error: "A message is required." },
        { status: 400 },
      );
    }

    if (groqKey) {
      try {
        const reply = await callGroq(groqKey, message, chatHistory);
        return NextResponse.json({ reply });
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : "";
        console.error("Groq API Error:", errMsg);
        // Fall through to Gemini
      }
    }

    if (geminiKey) {
      try {
        const reply = await callGemini(geminiKey, message, chatHistory);
        return NextResponse.json({ reply });
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : "";
        console.error("Gemini API Error:", errMsg);
        throw error;
      }
    }

    return NextResponse.json(
      { error: "AI service is temporarily unavailable." },
      { status: 503 },
    );
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("AI Backend Error:", errMsg);
    return NextResponse.json(
      { error: errMsg },
      { status: 500 },
    );
  }
}
