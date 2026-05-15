import React, { useState, useEffect, useCallback, useRef } from "react";
import TopBar from "../components/TopBar";
import FloatingChat from "../components/FloatingChat";
import Waveform from "../components/Waveform";
import { useLang } from "../context/LanguageContext";
import { useVoiceInput, speak } from "../hooks/useSpeech";
import { logMeal, getMeals, updateMealSummary, chat, getUser, chatImage } from "../utils/api";
import { useWeeklySummary } from "../hooks/useWeeklySummary";

export default function DailyLog() {
  const { lang, t } = useLang();
  useWeeklySummary(lang);
  const [meals, setMeals] = useState([]);
  const [typingMode, setTypingMode] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [toast, setToast] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const silenceTimer = useRef(null);

  const loadMeals = useCallback(async () => {
    try {
      const data = await getMeals();
      setMeals(data);
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { loadMeals(); }, [loadMeals]);

  // 10-second silence prompt
  useEffect(() => {
    silenceTimer.current = setTimeout(() => {
      speak(t.askAgain, lang);
    }, 10000);
    return () => clearTimeout(silenceTimer.current);
  }, [meals, lang, t.askAgain]);

  function resetSilenceTimer() {
    clearTimeout(silenceTimer.current);
  }

  async function submitMeal(rawText) {
    if (!rawText.trim()) return;
    resetSilenceTimer();
    setTypingMode(false);
    setTextInput("");

    try {
      // 1. Save raw input immediately
      const meal = await logMeal(rawText);
      setMeals((prev) => [meal, ...prev]);

      // 2. Ask AI to parse and summarise it
      setProcessingId(meal.id);
      const user = await getUser();
      const res = await chat({
        message: rawText,
        context: "log",
        mealHistory: [],
        userConditions: user?.conditions || "",
        userGoal: user?.goal || "",
        language: lang,
      });

      if (res?.reply) {
        await updateMealSummary(meal.id, res.reply);
        setMeals((prev) =>
          prev.map((m) => m.id === meal.id ? { ...m, parsed_summary: res.reply } : m)
        );
        speak(res.reply, lang);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingId(null);
    }
  }

  const { listening, transcript, startListening, stopListening } = useVoiceInput({
    lang,
    onResult: (text) => submitMeal(text),
  }); 

  /*const { listening, transcript, startListening, stopListening } = useVoiceInput({
    lang,
    onResult: (text) => {
      console.log("Voice result received:", text); // ← add this
      submitMeal(text);
    },
  });*/

  // Replace the photo button handler
  async function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

  // Convert to base64
  const reader = new FileReader();
  reader.onload = async () => {
    const base64 = reader.result.split(",")[1]; // remove data:image/jpeg;base64,
    
    // Save raw entry immediately
    const meal = await logMeal("📷 Photo meal");
    setMeals((prev) => [meal, ...prev]);
    setProcessingId(meal.id);

    try {
      const user = await getUser();
      const res = await chatImage({
        imageBase64: base64,
        userConditions: user?.conditions || "",
        userGoal: user?.goal || "",
        language: lang,
      });

      if (res?.reply) {
        await updateMealSummary(meal.id, res.reply);
        setMeals((prev) =>
          prev.map((m) => m.id === meal.id ? { ...m, parsed_summary: res.reply } : m)
        );
        speak(res.reply, lang);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingId(null);
    }
  };
  reader.readAsDataURL(file);
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return t.goodMorning;
    if (h < 17) return t.goodAfternoon;
    return t.goodEvening;
  };

  // Group meals by date
  const today = new Date().toISOString().split("T")[0];
  const todayMeals = meals.filter((m) => m.meal_date === today);
  const pastMeals = meals.filter((m) => m.meal_date !== today).slice(0, 6);

  return (
    <div className="min-h-screen bg-white pb-32">
      <TopBar />

      <main className="max-w-xl mx-auto px-6 py-8">

        {/* Greeting */}
        <div className="mb-8 animate-fade-in">
          <h1 className="font-display text-3xl" style={{ color: "var(--night)" }}>
            {greeting()} 👋
          </h1>
          <p className="text-base text-gray-400 mt-1">
            {new Date().toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", {
              weekday: "long", day: "numeric", month: "long",
            })}
          </p>
        </div>

        {/* PRIMARY — Voice button */}
        <div className="mb-6 animate-slide-up">
          {listening ? (
            <div
              className="w-full rounded-3xl py-8 flex flex-col items-center gap-4"
              style={{ background: "#e8f7f5", border: "2px solid var(--teal)" }}
            >
              <Waveform active />
              <p className="text-base font-medium" style={{ color: "var(--teal)" }}>
                {t.listening}
              </p>
              <button
                onClick={stopListening}
                className="px-6 py-3 rounded-full text-white text-base font-medium"
                style={{ background: "#ef4444", minHeight: "auto" }}
              >
                Stop
              </button>
            </div>
          ) : (
            <button
              onClick={startListening}
              className="w-full rounded-3xl py-8 flex flex-col items-center gap-4 transition-transform hover:scale-[1.01] active:scale-[0.99]"
              style={{ background: "var(--teal)" }}
            >
              <span className="text-5xl">🎤</span>
              <span className="text-white text-xl font-semibold">{t.tapToSpeak}</span>
            </button>
          )}
        </div>

        {/* Secondary buttons */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {/* Photo button */}
        {<input
          type="file"
          accept="image/*"
          capture="environment"
          id="photo-input"
          className="hidden"
          onChange={handlePhotoUpload} // TODO: Implement this function
          />}
        <button
          onClick={() => document.getElementById("photo-input").click()}
          className="rounded-2xl py-5 flex flex-col items-center gap-2 border-2 text-base font-medium"
          style={{ borderColor: "#e5e7eb" }}
        >
         <span className="text-3xl">📷</span>
         {t.takePhoto}
        </button>
          <button
            onClick={() => setTypingMode(!typingMode)}
            className="rounded-2xl py-5 flex flex-col items-center gap-2 border-2 text-base font-medium transition-all"
            style={{
              borderColor: typingMode ? "var(--teal)" : "#e5e7eb",
              color: typingMode ? "var(--teal)" : "#6b7280",
              background: typingMode ? "#e8f7f5" : "white",
            }}
          >
            <span className="text-3xl">✏️</span>
            {t.typeInstead}
          </button>
        </div>

        {/* Text input */}
        {typingMode && (
          <div className="mb-8 animate-slide-up">
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={lang === "hi" ? "आपने क्या खाया? यहाँ लिखें..." : "What did you eat? Write here..."}
              rows={3}
              className="w-full border-2 rounded-2xl px-5 py-4 text-lg outline-none resize-none"
              style={{ borderColor: "var(--teal)", fontFamily: "DM Sans, sans-serif" }}
            />
            <button
              onClick={() => submitMeal(textInput)}
              className="mt-3 w-full py-4 rounded-2xl text-white text-lg font-semibold"
              style={{ background: "var(--teal)" }}
            >
              {lang === "hi" ? "दर्ज करें" : "Log this meal"}
            </button>
          </div>
        )}

        {/* Today's meals */}
        <div className="mb-8">
          <h2 className="font-display text-xl mb-4" style={{ color: "var(--night)" }}>
            {t.whatYouLogged}
          </h2>
          {todayMeals.length === 0 ? (
            <p className="text-gray-400 text-base leading-relaxed">{t.noMealsYet}</p>
          ) : (
            <div className="flex flex-col gap-3">
              {todayMeals.map((m) => (
                <MealCard key={m.id} meal={m} processing={processingId === m.id} t={t} />
              ))}
            </div>
          )}
        </div>

        {/* Past meals */}
        {pastMeals.length > 0 && (
          <div>
            <h2 className="font-display text-xl mb-4" style={{ color: "var(--night)" }}>
              {lang === "hi" ? "पिछले दिन" : "Previous days"}
            </h2>
            <div className="flex flex-col gap-3">
              {pastMeals.map((m) => (
                <MealCard key={m.id} meal={m} processing={false} t={t} />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full text-white text-base shadow-lg z-40"
          style={{ background: "var(--night)" }}>
          {toast}
        </div>
      )}

      <FloatingChat />
    </div>
  );
}

function MealCard({ meal, processing, t }) {
  return (
    <div
      className="rounded-2xl p-5 border border-gray-100 shadow-sm animate-fade-in"
      style={{ background: "white" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-base font-medium text-gray-800 leading-relaxed">
            {meal.raw_input}
          </p>
          {processing && (
            <p className="text-base text-teal-500 mt-2 animate-pulse">{t.thinking}</p>
          )}
          {!processing && meal.parsed_summary && (
            <p className="text-base text-gray-500 mt-2 leading-relaxed border-l-2 pl-3"
              style={{ borderColor: "var(--teal)" }}>
              {meal.parsed_summary}
            </p>
          )}
        </div>
        {!processing && meal.parsed_summary && (
          <span className="text-teal-500 text-sm flex-shrink-0">✓ {t.analysed}</span>
        )}
      </div>
      <p className="text-sm text-gray-300 mt-3">
        {t.loggedAt} {new Date(meal.logged_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </p>
    </div>
  );
}
