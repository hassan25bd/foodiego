import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini AI is not configured on the server." },
        { status: 503 },
      );
    }

    const ai = new GoogleGenAI({ apiKey });
    const body = await req.json();
    const { message, chatHistory = [] } = body;

    if (typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { error: "A message is required." },
        { status: 400 },
      );
    }

    const contents = [
      ...chatHistory.map((msg: { sender: string; text: string }) => ({
        role: msg.sender === "user" ? "user" : "model",
        parts: [{ text: msg.text }],
      })),
      { role: "user", parts: [{ text: message }] },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents,
    });

    return NextResponse.json({ reply: response.text });
  } catch (error) {
    console.error("Gemini Backend Error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Failed to generate response from Gemini AI." },
      { status: 500 },
    );
  }
}
