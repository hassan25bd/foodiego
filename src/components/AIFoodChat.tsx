"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, User, SendHorizontal, X, MessageSquareHeart, Zap, Star } from "lucide-react";

interface ChatMessage {
  id: number;
  sender: "bot" | "user";
  content: string;
  time: string;
  isError?: boolean;
  isLoading?: boolean;
  hasPopular?: boolean;
}

const POPULAR_DISHES = [
  { dish: "Margherita Classic Pizza", rating: "4.9/5", desc: "Light, fresh & perfect for sharing" },
  { dish: "Spicy Chipotle Beef Burger", rating: "4.8/5", desc: "Bold kick with cheddar" },
  { dish: "Butter Paneer Masala", rating: "4.7/5", desc: "Vegetarian classic" },
];

const POPULAR_KEYWORDS = ["popular", "top", "recommend", "best", "rated", "trending", "famous"];

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
}

export default function AIFoodChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      sender: "bot",
      content: "Hi! I'm your FoodieGo Assistant! Ask me about food recommendations, your orders, delivery, or payments!",
      time: formatTime(new Date()),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const idCounter = useRef(2);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = useCallback(async (text?: string) => {
    const query = text ?? input;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: idCounter.current++,
      sender: "user",
      content: query,
      time: formatTime(new Date()),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    setMessages((prev) => [
      ...prev,
      {
        id: idCounter.current++,
        sender: "bot",
        content: "",
        time: formatTime(new Date()),
        isLoading: true,
      },
    ]);

    try {
      const chatHistory = messages.map((m) => ({
        sender: m.sender === "user" ? "user" : "assistant",
        text: m.content,
      }));

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query, chatHistory }),
      });

      setMessages((prev) => prev.filter((m) => m.content !== ""));

      const data: { reply?: string; error?: string } = await res.json();

      if (data.error) {
        const errMsg: ChatMessage = {
          id: idCounter.current++,
          sender: "bot",
          content: data.error,
          time: formatTime(new Date()),
          isError: true,
        };
        setMessages((prev) => [...prev, errMsg]);
      } else if (data.reply) {
        const hasPopular = POPULAR_KEYWORDS.some((kw) =>
          data.reply!.toLowerCase().includes(kw)
        );
        const replyMsg: ChatMessage = {
          id: idCounter.current++,
          sender: "bot",
          content: data.reply,
          time: formatTime(new Date()),
          hasPopular,
        };
        setMessages((prev) => [...prev, replyMsg]);
      } else {
        throw new Error("No response");
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.content !== ""));
      const errMsg: ChatMessage = {
        id: idCounter.current++,
        sender: "bot",
        content: "The assistant couldn't respond right now. Please try again.",
        time: formatTime(new Date()),
        isError: true,
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages]);

  const suggestions = ["Recommend a top burger", "Healthy choices", "Track Order", "Menu"];

  return (
    <div className="w-full max-w-lg h-[650px] mx-auto rounded-3xl border shadow-xl bg-white overflow-hidden flex flex-col font-sans antialiased">
      {/* Header */}
      <header className="bg-[#124734] p-4 text-white flex items-center justify-between border-b border-emerald-900/40">
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-emerald-700"
          >
            <Bot className="w-5 h-5 text-emerald-100" />
          </motion.div>
          <div>
            <h1 className="text-lg font-bold">FoodieGo AI</h1>
            <div className="flex items-center gap-1.5 text-xs text-emerald-200/80">
              <span className="w-2 h-2 rounded-full bg-green-400 block" />
              Active virtual assistant
            </div>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-emerald-800/60"
        >
          <X className="w-5 h-5 text-emerald-100" />
        </motion.button>
      </header>

      {/* Messages */}
      <main className="flex-1 p-5 space-y-6 overflow-y-auto bg-[#FAF7EE]/60" ref={scrollRef}>
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex items-start gap-3.5 ${message.sender === "user" ? "justify-end" : ""}`}
            >
              {message.sender === "bot" && (
                <div className="w-9 h-9 rounded-full bg-white border flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  {message.isError ? (
                    <Zap className="w-5 h-5 text-red-400" />
                  ) : (
                    <Bot className="w-5 h-5 text-slate-500" />
                  )}
                </div>
              )}

              <div
                className={`p-4 rounded-3xl max-w-[80%] shadow-sm ${
                  message.sender === "bot"
                    ? "bg-white rounded-bl-lg text-slate-800 border"
                    : "bg-[#124734] rounded-br-lg text-white"
                }`}
              >
                {message.isLoading ? (
                  <div className="flex items-center gap-2 text-slate-400">
                    <motion.div
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="w-2 h-2 rounded-full bg-slate-400"
                    />
                    <motion.div
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                      className="w-2 h-2 rounded-full bg-slate-400"
                    />
                    <motion.div
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                      className="w-2 h-2 rounded-full bg-slate-400"
                    />
                  </div>
                ) : (
                  <>
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    {message.time && (
                      <time className="block text-xs mt-2 opacity-60 font-mono">
                        {message.time}
                      </time>
                    )}

                    {message.hasPopular && (
                      <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                        {POPULAR_DISHES.map((item) => (
                          <div
                            key={item.dish}
                            className="p-3 bg-slate-50/50 rounded-xl border flex gap-3 items-center"
                          >
                            <MessageSquareHeart className="w-4 h-4 text-emerald-700" />
                            <div>
                              <p className="text-xs font-semibold text-emerald-950">
                                {item.dish}
                              </p>
                              <p className="text-[10px] text-slate-500 mt-0.5">
                                {item.desc}
                              </p>
                            </div>
                            <span className="text-xs font-bold text-slate-700 ml-auto flex items-center gap-1">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-500" />{" "}
                              {item.rating}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              {message.sender === "user" && (
                <div className="w-9 h-9 rounded-full bg-[#E5EAD1] flex items-center justify-center shrink-0 shadow-inner">
                  <User className="w-5 h-5 text-emerald-950" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="p-4 bg-white border-t space-y-3.5">
        <div className="flex flex-wrap gap-2.5">
          {suggestions.map((suggestion) => (
            <motion.button
              key={suggestion}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSend(suggestion)}
              disabled={isLoading}
              className="px-4 py-2 bg-[#F1F5F9] text-[#124734] text-xs font-semibold rounded-full border border-slate-200/60 hover:border-emerald-700 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {suggestion}
            </motion.button>
          ))}
        </div>

        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask about dishes, orders, delivery..."
            disabled={isLoading}
            className="w-full h-12 bg-[#FAF7EE] pl-5 pr-14 rounded-full border border-slate-100 focus:ring-2 focus:ring-emerald-300 focus:outline-none disabled:opacity-50 placeholder:text-slate-500 transition-all text-sm"
          />
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className={`absolute right-1.5 w-9 h-9 rounded-full flex items-center justify-center ${
              input.trim() && !isLoading ? "bg-[#124734]" : "bg-slate-300"
            }`}
          >
            <SendHorizontal className="w-4 h-4 text-white" />
          </motion.button>
        </div>
      </footer>
    </div>
  );
}
