import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, chatHistory = [] } = body;

    console.log("Request body keys:", Object.keys(body));
    console.log("Message type:", typeof message);
    console.log("Message value:", message);
    console.log("ChatHistory length:", chatHistory.length);
    if (chatHistory.length > 0) {
      console.log("First chatHistory item:", JSON.stringify(chatHistory[0]));
    }

    const contents = [
      ...chatHistory.map((msg: { sender: string; text: string }) => ({
        role: msg.sender === "user" ? "user" : "model",
        parts: [{ text: msg.text }],
      })),
      { role: "user", parts: [{ text: message }] },
    ];

    console.log("Contents:", JSON.stringify(contents));

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents,
    });

    console.log("Response received");
    return NextResponse.json({ reply: response.text });
  } catch (error) {
    console.error("Gemini Backend Error:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to generate response from Gemini AI.", detail: errorMessage },
      { status: 500 },
    );
  }
}
