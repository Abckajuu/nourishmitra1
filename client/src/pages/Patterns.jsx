import React, { useState, useEffect, useCallback } from "react";
import TopBar from "../components/TopBar";
import FloatingChat from "../components/FloatingChat";
import { useLang } from "../context/LanguageContext";
import { speak } from "../hooks/useSpeech";
import { getDaysCount, getMealsRange, getLatestPattern, savePattern, chat, getUser } from "../utils/api";

export default function Patterns() {
  const { lang, t } = useLang();
  const [daysCount, setDaysCount] = useState(0);
  const [pattern, setPattern] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [{ count }, latest] = await Promise.all([getDaysCount(), getLatestPattern()]);
      setDaysCount(count);
      if (latest) { setPattern(latest); setGenerated(true); }
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  async function generateAnalysis() {
    setLoading(true);
    try {
      const [meals, user] = await Promise.all([getMealsRange(7), getUser()]);
      const mealSummary = meals.map((m) => m.raw_input).join("; ");

      const res = await chat({
        message: `Analyse these meals from the past week and provide a reality check: ${mealSummary}`,
        context: "patterns",
        mealHistory: meals,
        userConditions: user?.conditions || "",
        userGoal: user?.goal || "",
        language: lang,
      });

      // Parse structured response from AI
      // Your /api/chat should return JSON with these fields when context=patterns
      // { analysis: [], reality_check: string, suggestion: string, doctor_flag: bool, doctor_note: string }
      let parsed;
      try {
      parsed = JSON.parse(res.reply);
      } catch {
        parsed = {
          analysis: [
              "Not enough data for full analysis yet.",
              "Keep logging your meals for more insights.",
              "Your meal patterns are being observed."
            ],
          reality_check: res.reply || "Continue logging for your reality check.",
          suggestion: "Try adding one protein source to your meals this week.",
          doctor_flag: false,
          doctor_note: null
        };
      }

      const saved = await savePattern(parsed);
      setPattern(saved);
      setGenerated(true);
      speak(parsed.reality_check, lang);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // ── Not enough data ────────────────────────────────────────────
  if (daysCount < 3) {
    return (
      <div className="min-h-screen bg-white pb-32">
        <TopBar />
        <main className="max-w-xl mx-auto px-6 py-12 flex flex-col items-center text-center gap-6">
          <div className="text-6xl">🌱</div>
          <h1 className="font-display text-2xl" style={{ color: "var(--night)" }}>
            {t.keepLogging}
          </h1>
          {/* Progress dots */}
          <div className="flex gap-3 mt-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="w-12 h-12 rounded-full flex items-center justify-center text-base font-semibold"
                style={{
                  background: n <= daysCount ? "var(--teal)" : "#f3f4f6",
                  color: n <= daysCount ? "white" : "#9ca3af",
                }}
              >
                {n <= daysCount ? "✓" : n}
              </div>
            ))}
          </div>
          <p className="text-base text-gray-400">
            {daysCount} / 3 {t.daysLogged}
          </p>
        </main>
        <FloatingChat />
      </div>
    );
  }

  // ── Has data ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white pb-32">
      <TopBar />
      <main className="max-w-xl mx-auto px-6 py-8">

        <h1 className="font-display text-3xl mb-8" style={{ color: "var(--night)" }}>
          {t.myPatterns}
        </h1>

        {/* Generate / Refresh button */}
        {!generated && (
          <button
            onClick={generateAnalysis}
            disabled={loading}
            className="w-full py-5 rounded-2xl text-white text-lg font-semibold mb-8 disabled:opacity-50"
            style={{ background: "var(--teal)" }}
          >
            {loading ? t.thinking : (lang === "hi" ? "मेरे पैटर्न देखें" : "See my patterns")}
          </button>
        )}

        {loading && (
          <div className="text-center py-12">
            <p className="text-base text-teal-500 animate-pulse">{t.thinking}</p>
          </div>
        )}

        {pattern && !loading && (
          <div className="flex flex-col gap-6 animate-fade-in">

            {/* What I noticed */}
            {pattern.analysis && (
              <section>
                <h2 className="font-display text-xl mb-4" style={{ color: "var(--night)" }}>
                  {t.whatINot}
                </h2>
                <div className="flex flex-col gap-3">
                {(typeof pattern.analysis === "string"
                ? (() => { try { return JSON.parse(pattern.analysis || "[]"); } catch { return [pattern.analysis]; } })()
                : pattern.analysis || []
                ).map((obs, i) => (
                    <ObservationCard key={i} text={obs} index={i} />
                  ))}
                </div>
              </section>
            )}

            {/* Reality check */}
            {pattern.reality_check && (
              <section>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-display text-xl" style={{ color: "var(--night)" }}>
                    {t.realityCheck}
                  </h2>
                  <button
                    onClick={() => speak(pattern.reality_check, lang)}
                    className="text-2xl"
                    style={{ minHeight: "auto", height: "auto" }}
                    title="Listen"
                  >
                    🔊
                  </button>
                </div>
                <div
                  className="rounded-2xl p-6"
                  style={{ background: "#e8f7f5", borderLeft: "4px solid var(--teal)" }}
                >
                  <p className="text-base text-gray-700 leading-relaxed">
                    {pattern.reality_check}
                  </p>
                </div>
              </section>
            )}

            {/* One thing to try */}
            {pattern.suggestion && (
              <section>
                <h2 className="font-display text-xl mb-3" style={{ color: "var(--night)" }}>
                  {t.oneThingToTry}
                </h2>
                <div
                  className="rounded-2xl p-6"
                  style={{ background: "#fff8f0" }}
                >
                  <p className="text-base text-gray-700 leading-relaxed">
                    {pattern.suggestion}
                  </p>
                </div>
              </section>
            )}

            {/* Doctor flag */}
            {pattern.doctor_flag === 1 && (
              <section>
                <div
                  className="rounded-2xl p-6"
                  style={{ background: "#fffbeb", border: "2px solid #F4A261" }}
                >
                  <p className="text-base text-gray-700 leading-relaxed mb-4">
                    ⚠️ {t.doctorFlag}
                  </p>
                  {pattern.doctor_note && (
                    <details className="text-base text-gray-600">
                      <summary className="cursor-pointer font-medium" style={{ color: "var(--saffron)" }}>
                        {t.getSummary}
                      </summary>
                      <div className="mt-3 p-4 bg-white rounded-xl text-sm leading-relaxed whitespace-pre-wrap">
                        {pattern.doctor_note}
                      </div>
                    </details>
                  )}
                </div>
              </section>
            )}

            {/* Refresh */}
            <button
              onClick={generateAnalysis}
              className="w-full py-4 rounded-2xl text-base font-medium border-2"
              style={{ borderColor: "var(--teal)", color: "var(--teal)", background: "white" }}
            >
              {lang === "hi" ? "फिर से देखें" : "Refresh analysis"}
            </button>
          </div>
        )}
      </main>
      <FloatingChat />
    </div>
  );
}

const COLORS = ["#ef4444", "#F4A261", "#22c55e"];

function ObservationCard({ text, index }) {
  const color = COLORS[index % COLORS.length];
  return (
    <div
      className="rounded-2xl p-5 border border-gray-100 flex items-start gap-4"
      style={{ background: "white" }}
    >
      <span
        className="w-3 h-3 rounded-full flex-shrink-0 mt-2"
        style={{ background: color }}
      />
      <p className="text-base text-gray-700 leading-relaxed">{text}</p>
    </div>
  );
}
