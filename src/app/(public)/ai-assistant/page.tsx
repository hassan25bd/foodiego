"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Send,
  Sparkles,
  User,
  Bot,
  Loader2,
  ArrowDown,
  ArrowUp,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  isLoading?: boolean;
  isError?: boolean;
  source?: string;
}

export default function AiAssistantPage() {
  const idCounter = useRef(2);
  const nextId = () => (idCounter.current++).toString();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "model",
      text: "Hi there! 👋 I'm your Virtual Assistant for FoodieGo. Ask me about menu recommendations, delivery tracking, payment options, restaurants, and more!",
      source: "checking",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiSource, setApiSource] = useState<"checking" | "connected" | "fallback">("checking");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: "hello", chatHistory: [] }),
        });
        const data: { source?: string } = await res.json();
        if (data.source && data.source !== "local") {
          setApiSource("connected");
        } else {
          setApiSource("fallback");
        }
      } catch {
        setApiSource("fallback");
      }
    };
    checkStatus();
  }, []);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: nextId(),
      role: "user",
      text: input.trim(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    setMessages((prev) => [
      ...prev,
      { id: nextId(), role: "model", text: "", isLoading: true },
    ]);

    try {
      const chatHistory = messages.map((m) => ({
        sender: m.role === "user" ? "user" : "assistant",
        text: m.text,
      }));

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.text, chatHistory }),
      });

      setMessages((prev) => prev.filter((m) => m.text !== ""));

      if (res.ok) {
        const data: { reply?: string; error?: string; source?: string } = await res.json();

        if (data.source && data.source !== "local") {
          setApiSource("connected");
        } else {
          setApiSource("fallback");
        }

        if (data.reply) {
          const replyMsg: ChatMessage = {
            id: nextId(),
            role: "model",
            text: data.reply,
            source: data.source,
          };
          setMessages((prev) => [...prev, replyMsg]);
        } else if (data.error) {
          const errMsg: ChatMessage = {
            id: nextId(),
            role: "model",
            text: data.error,
            isError: true,
            source: data.source,
          };
          setMessages((prev) => [...prev, errMsg]);
        } else {
          throw new Error("No reply received from AI");
        }
      } else {
        const errData = await res.json();
        const errMsg: ChatMessage = {
          id: nextId(),
          role: "model",
          text: errData.error || "Something went wrong. Please try again.",
          isError: true,
          source: "error",
        };
        setMessages((prev) => [...prev, errMsg]);
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.text !== ""));
      const errMsg: ChatMessage = {
        id: nextId(),
        role: "model",
        text: "Failed to connect to AI. Please check your connection and try again.",
        isError: true,
        source: "error",
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const retryLast = () => {
    setMessages((prev) => {
      const withoutErrors = prev.filter((m) => !m.isError);
      const lastAiMsg = [...withoutErrors]
        .reverse()
        .find((m) => m.role === "model" && !m.isError && !m.isLoading);
      if (lastAiMsg) {
        return withoutErrors;
      }
      return withoutErrors;
    });
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  const scrollToTop = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-[#FAF7EE]">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-50">
          <Sparkles className="text-emerald-600" size={20} />
        </div>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-slate-900">I&apos;m Your Virtual Assistant</h1>
          <p className="text-xs text-slate-500">Ask about food, delivery, and more</p>
        </div>
        {apiSource === "connected" && (
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
            <CheckCircle2 size={12} />
            AI Powered
          </div>
        )}
        {apiSource === "fallback" && (
          <div className="flex items-center gap-1.5 text-[11px] text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
            <AlertCircle size={12} />
            Limited
          </div>
        )}
        {apiSource === "checking" && (
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <Loader2 size={12} className="animate-spin" />
            Loading&hellip;
          </div>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        <div className="max-w-3xl mx-auto space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full ${
                    msg.role === "user" ? "bg-emerald-100" : "bg-amber-100"
                  }`}
                >
                  {msg.role === "user" ? (
                    <User size={14} className="text-emerald-700" />
                  ) : (
                    <Bot size={14} className="text-amber-700" />
                  )}
                </div>

                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-emerald-700 text-white rounded-br-sm"
                      : msg.isError
                        ? "bg-red-50 border border-red-200 text-red-700 rounded-bl-sm"
                        : "bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-xs"
                  }`}
                >
                  {msg.isLoading ? (
                    <div className="flex items-center gap-2 text-slate-400">
                      <Loader2 className="animate-spin" size={14} />
                      <span className="text-xs">Typing&hellip;</span>
                    </div>
                  ) : (
                    <>
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                      {msg.source && msg.source !== "checking" && (
                        <span
                          className={`inline-block mt-1.5 text-[10px] ${
                            msg.source === "local" || msg.source === "error"
                              ? "text-amber-600"
                              : "text-emerald-600"
                          }`}
                        >
                          {msg.source === "groq" && "🤖 Powered by Groq"}
                          {msg.source === "gemini" && "✨ Powered by Gemini"}
                          {msg.source === "local" && "⚡ Quick answer (no API key configured)"}
                          {msg.source === "error" && "⚠️ Error occurred"}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Error banner */}
      {messages.some((m) => m.isError) && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-100 flex items-center justify-between">
          <span className="text-[11px] text-red-600">Something went wrong</span>
          <button
            onClick={retryLast}
            className="flex items-center gap-1 text-[11px] text-red-700 hover:text-red-900 font-semibold transition-colors cursor-pointer"
          >
            <RefreshCw size={10} />
            Retry
          </button>
        </div>
      )}

      {/* Quick scroll buttons */}
      {messages.length > 10 && (
        <div className="fixed bottom-28 right-6 flex flex-col gap-2 z-10">
          <button
            type="button"
            onClick={scrollToBottom}
            className="w-9 h-9 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <ArrowDown size={14} className="text-slate-500" />
          </button>
          <button
            type="button"
            onClick={scrollToTop}
            className="w-9 h-9 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <ArrowUp size={14} className="text-slate-500" />
          </button>
        </div>
      )}

      {/* Input */}
      <div className="bg-white border-t border-slate-200 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              disabled={isLoading}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-300 transition-all disabled:opacity-50"
            />
          </div>
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="flex-shrink-0 flex items-center justify-center gap-2 rounded-2xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-200 disabled:text-slate-400 text-white px-5 py-3 text-sm font-bold transition-all cursor-pointer"
          >
            <Send size={14} />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
      </div>
    </div>
  );
}
