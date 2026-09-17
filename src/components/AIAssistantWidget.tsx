"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Send, X, Bot, User, Loader2 } from "lucide-react";

interface Message {
  id: number;
  sender: "user" | "ai";
  text: string;
}

export default function AIAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "ai",
      text: "Hi! I am your FoodieGo AI assistant. How can I help you feed your cravings today? 🍔",
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const idCounter = useRef(2);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend ?? input;
    if (!query.trim() || loading) return;

    const userMsg: Message = { id: idCounter.current++, sender: "user", text: query };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          chatHistory: messages,
        }),
      });

      const data = await res.json();
      if (data.reply) {
        setMessages((prev) => [
          ...prev,
          { id: idCounter.current++, sender: "ai", text: data.reply },
        ]);
      } else {
        throw new Error(data.detail || data.error || "No reply received");
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Unknown error";
      setMessages((prev) => [
        ...prev,
        {
          id: idCounter.current++,
          sender: "ai",
          text: `Connection error: ${errorMsg}. Please try again or check server logs.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    "🍔 Recommend a top burger",
    "📦 Where is my order?",
    "🥗 Healthy choices",
    "💳 Payment methods",
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-5 py-3.5 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
        >
          <Sparkles className="w-5 h-5 animate-pulse" />
          <span className="font-semibold text-sm">Ask FoodieGo AI</span>
        </button>
      )}

      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[540px] bg-white/95 backdrop-blur-xl border border-emerald-100 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight">
                  FoodieGo AI Assistant
                </h3>
                <p className="text-[11px] text-emerald-100 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  Powered by Gemini AI
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/20 rounded-lg transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-slate-50 p-2.5 flex gap-2 overflow-x-auto border-b border-slate-100">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q.substring(2))}
                className="text-xs bg-white text-slate-700 border border-slate-200 px-3 py-1.5 rounded-full whitespace-nowrap hover:border-emerald-500 hover:text-emerald-600 transition shadow-sm cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "ai" && (
                  <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-emerald-600 text-white rounded-tr-none shadow-sm"
                      : "bg-white border border-slate-200/80 text-slate-800 rounded-tl-none shadow-sm"
                  }`}
                >
                  {msg.text}
                </div>
                {msg.sender === "user" && (
                  <div className="w-7 h-7 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-2.5 items-center text-slate-400 text-xs">
                <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border border-slate-200 px-3 py-2 rounded-2xl flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                  <span>Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-slate-100 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about dishes, orders, or delivery..."
              className="flex-1 bg-slate-100 text-slate-900 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white p-2.5 rounded-xl transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
