import React, { useState, useRef, useEffect } from "react";
import { useLang } from "../context/LanguageContext";
import { useVoiceInput, speak } from "../hooks/useSpeech";
import { chat, getMeals, getUser } from "../utils/api";
import Waveform from "./Waveform";

export default function FloatingChat() {
  const { lang, t } = useLang();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const { listening, startListening, stopListening, transcript, setTranscript } =
    useVoiceInput({
      lang,
      onResult: (text) => handleSend(text),
    });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(text) {
    const msg = text || input;
    if (!msg.trim()) return;
    setInput("");
    setTranscript("");

    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setLoading(true);

    try {
      const [meals, user] = await Promise.all([getMeals(), getUser()]);
      const res = await chat({
        message: msg,
        context: "chat",
        mealHistory: meals.slice(0, 10),
        userConditions: user?.conditions || "",
        userGoal: user?.goal || "",
        language: lang,
      });
      const reply = res.reply || "I'm sorry, I couldn't respond right now.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      speak(reply, lang);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-8 right-6 z-50 w-16 h-16 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
        style={{ background: "var(--teal)", minHeight: "auto" }}
        aria-label="Open chat"
      >
        <span className="text-white text-2xl">🎙️</span>
      </button>

      {/* Chat drawer */}
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white animate-fade-in">
          {/* Header */}
          <div
            className="flex items-center justify-between px-6 py-4 border-b"
            style={{ borderColor: "#e5e7eb" }}
          >
            <div>
              <p className="font-display font-bold text-xl" style={{ color: "var(--teal)" }}>
                Ask NourishMitra
              </p>
              <p className="text-base text-gray-400">Ask me anything about your food & health</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-400 text-2xl font-light"
              style={{ minHeight: "auto", height: "auto" }}
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {messages.length === 0 && (
              <p className="text-gray-400 text-center mt-8 text-base">
                {lang === "hi"
                  ? "कुछ भी पूछें — खाने, सेहत, अपनी बीमारी के बारे में।"
                  : "Ask me anything — about food, health, or your condition."}
              </p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className="max-w-xs px-4 py-3 rounded-2xl text-base"
                  style={{
                    background:
                      m.role === "user" ? "var(--teal)" : "#f3f4f6",
                    color: m.role === "user" ? "white" : "#1a1a2e",
                  }}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="px-4 py-3 rounded-2xl bg-gray-100 text-base text-gray-500">
                  {t.thinking}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-6 py-4 border-t flex items-center gap-3">
            <input
              value={listening ? transcript : input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={t.typeMessage}
              className="flex-1 border rounded-full px-5 py-3 text-base outline-none"
              style={{ borderColor: "#d1d5db" }}
            />
            {listening ? (
              <button
                onClick={stopListening}
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: "#ef4444", minHeight: "auto" }}
              >
                <Waveform active color="white" />
              </button>
            ) : (
              <button
                onClick={startListening}
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: "var(--teal)", minHeight: "auto" }}
              >
                <span className="text-white text-xl">🎤</span>
              </button>
            )}
            <button
              onClick={() => handleSend()}
              className="px-5 py-3 rounded-full text-white text-base font-medium"
              style={{ background: "var(--saffron)", minHeight: "auto" }}
            >
              {t.sendMessage}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
