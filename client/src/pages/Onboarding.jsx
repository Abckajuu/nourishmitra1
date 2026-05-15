import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { speak } from "../hooks/useSpeech";
import { onboardUser } from "../utils/api";
import { useLang } from "../context/LanguageContext";

const STEPS = ["welcome", "conditions", "goal", "language", "done"];

export default function Onboarding() {
  const navigate = useNavigate();
  const { lang, setLang, t } = useLang();
  const [step, setStep] = useState("welcome");
  const [conditions, setConditions] = useState([]);
  const [goal, setGoal] = useState("");
  const [saving, setSaving] = useState(false);
  const [otherCondition, setOtherCondition] = useState("");

  const CONDITION_OPTIONS = ["Diabetes", "Thyroid", "Blood Pressure", "Asthma", "Other / None"];
  const GOAL_OPTIONS = [
    { key: "understand", label: lang === "hi" ? "अपना खाना समझना" : "Understand my diet" },
    { key: "manage", label: lang === "hi" ? "अपनी बीमारी संभालना" : "Manage my condition" },
    { key: "aware", label: lang === "hi" ? "बस जागरूक रहना" : "Just be more aware" },
  ];

  // Speak prompts when step changes
  useEffect(() => {
    const scripts = {
      welcome:
        lang === "hi"
          ? "नमस्ते। मैं NourishMitra हूं — आपका व्यक्तिगत खाना साथी। मैं आपको समझने में मदद करूंगा कि आप क्या खाते हैं और यह आपकी सेहत से कैसे जुड़ा है। मैं डॉक्टर की जगह नहीं लूंगा। बस वे पैटर्न दिखाऊंगा जो शायद आपने नोटिस नहीं किए। क्या मैं कुछ सवाल पूछ सकता हूं?"
          : "Namaste. I am NourishMitra — your personal food companion. I will help you understand how what you eat connects to how you feel. I will never replace your doctor. I will just help you see patterns you might be missing. Can I ask you a couple of things to get started?",
      conditions:
        lang === "hi"
          ? "क्या आपको कोई स्वास्थ्य समस्या है जो मुझे पता होनी चाहिए?"
          : "Do you have any health conditions I should know about?",
      goal:
        lang === "hi"
          ? "आपका मुख्य लक्ष्य क्या है?"
          : "What is your main goal?",
      language:
        lang === "hi"
          ? "आप किस भाषा में बात करना पसंद करेंगे?"
          : "Which language do you prefer?",
      done:
        lang === "hi"
          ? "बहुत अच्छा। मैं आपका NourishMitra बनने के लिए तैयार हूं।"
          : "Perfect. I am ready to be your NourishMitra.",
    };
    const timer = setTimeout(() => speak(scripts[step] || "", lang), 300);
    return () => clearTimeout(timer);
  }, [step, lang]);

  function toggleCondition(c) {
    setConditions((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  }

  async function finishOnboarding(chosenLang) {
    setSaving(true);
    try {
      const finalConditions = otherCondition
        ? conditions.filter(c => c !== "Other / None").concat(otherCondition).join(", ")
        : conditions.join(", ");
      await onboardUser({
        conditions: finalConditions || "None",
        goal: goal || "aware",
        language: chosenLang || lang,
      });
      setSaving(false);
      setStep("done");
      setTimeout(() => navigate("/app/log"), 2200);
    } catch (e) {
      console.error(e);
      setSaving(false);
      // Show error or retry
      alert("Failed to save preferences. Please try again.");
    }
  }

  // ── WELCOME ──────────────────────────────────────────────────────
  if (step === "welcome") return (
    <Screen>
      <PulseCircle />
      <p className="text-xl text-center text-gray-700 max-w-md leading-relaxed mt-6 px-4">
        {lang === "hi"
          ? "नमस्ते। मैं NourishMitra हूं — आपका व्यक्तिगत खाना साथी। मैं आपको यह समझने में मदद करूंगा कि आप क्या खाते हैं और यह आपकी सेहत से कैसे जुड़ा है।"
          : "Namaste. I am NourishMitra — your personal food companion. I will help you understand how what you eat connects to how you feel. I won't replace your doctor. I'll just help you see patterns you might be missing."}
      </p>
      <BigButton onClick={() => setStep("conditions")}>
        {lang === "hi" ? "हाँ, शुरू करते हैं" : "Yes, let's begin"}
      </BigButton>
    </Screen>
  );

  // ── CONDITIONS ────────────────────────────────────────────────────
  if (step === "conditions") return (
    <Screen>
      <Question>
        {lang === "hi"
          ? "क्या आपको कोई स्वास्थ्य समस्या है?"
          : "Do you have any health conditions I should know about?"}
      </Question>
      <p className="text-base text-gray-400 mb-6">
        {lang === "hi" ? "एक या अधिक चुनें" : "Select all that apply"}
      </p>
      <div className="flex flex-col gap-3 w-full max-w-sm">
        {CONDITION_OPTIONS.map((c) => (
          <button
            key={c}
            onClick={() => toggleCondition(c)}
            className="px-6 py-4 rounded-2xl border-2 text-lg font-medium transition-all"
            style={{
              borderColor: conditions.includes(c) ? "var(--teal)" : "#e5e7eb",
              background: conditions.includes(c) ? "#e8f7f5" : "white",
              color: conditions.includes(c) ? "var(--teal)" : "#374151",
            }}>
            {conditions.includes("Other / None") && (
              <input
              type="text"
              placeholder="Please describe your condition (optional)"
              className="w-full border-2 rounded-2xl px-5 py-4 text-lg outline-none mt-2"
              style={{ borderColor: "var(--teal)" }}
              onChange={(e) => setOtherCondition(e.target.value)}
              />
            )}
            {c}
          </button>
        ))}
      </div>
      <BigButton
        onClick={() => setStep("goal")}
        disabled={conditions.length === 0}
      >
        {lang === "hi" ? "आगे बढ़ें" : "Continue"}
      </BigButton>
    </Screen>
  );

  // ── GOAL ──────────────────────────────────────────────────────────
  if (step === "goal") return (
    <Screen>
      <Question>
        {lang === "hi" ? "आपका मुख्य लक्ष्य क्या है?" : "What is your main goal?"}
      </Question>
      <div className="flex flex-col gap-3 w-full max-w-sm">
        {GOAL_OPTIONS.map((g) => (
          <button
            key={g.key}
            onClick={() => { setGoal(g.key); setStep("language"); }}
            className="px-6 py-4 rounded-2xl border-2 text-lg font-medium transition-all hover:border-teal-500"
            style={{ borderColor: "#e5e7eb", background: "white", color: "#374151" }}
          >
            {g.label}
          </button>
        ))}
      </div>
    </Screen>
  );

  // ── LANGUAGE ──────────────────────────────────────────────────────
  if (step === "language") return (
    <Screen>
      <Question>
        {lang === "hi" ? "आप किस भाषा में बात करना पसंद करेंगे?" : "Which language do you prefer?"}
      </Question>
      <div className="flex gap-4">
        {[{ code: "en", label: "English" }, { code: "hi", label: "हिंदी" }].map((l) => (
          <button
            key={l.code}
            onClick={() => { setLang(l.code); finishOnboarding(l.code); }}
            className="px-10 py-5 rounded-2xl border-2 text-xl font-medium transition-all"
            style={{ borderColor: "var(--teal)", color: "var(--teal)", background: "white" }}
          >
            {l.label}
          </button>
        ))}
      </div>
    </Screen>
  );

  // ── DONE ──────────────────────────────────────────────────────────
  if (step === "done") return (
    <Screen>
      <div className="text-6xl mb-6">🌿</div>
      <p className="font-display text-3xl text-center" style={{ color: "var(--teal)" }}>
        {lang === "hi" ? "बढ़िया। मैं तैयार हूं।" : "Perfect. I am ready to be your NourishMitra."}
      </p>
      {saving && <p className="text-base text-gray-400 mt-4">Setting up...</p>}
    </Screen>
  );

  return null;
}

// ── Sub-components ─────────────────────────────────────────────────
function Screen({ children }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 animate-fade-in">
      <span className="font-display font-bold text-2xl mb-2" style={{ color: "var(--teal)" }}>
        NourishMitra
      </span>
      {children}
    </div>
  );
}

function PulseCircle() {
  return (
    <div className="relative flex items-center justify-center w-28 h-28">
      <div className="absolute w-28 h-28 rounded-full animate-pulse-slow opacity-20" style={{ background: "var(--teal)" }} />
      <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "var(--teal)" }}>
        <span className="text-3xl">🌿</span>
      </div>
    </div>
  );
}

function Question({ children }) {
  return (
    <h2 className="font-display text-2xl text-center max-w-sm leading-snug" style={{ color: "var(--night)" }}>
      {children}
    </h2>
  );
}

function BigButton({ children, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="mt-6 px-10 py-4 rounded-full text-white text-lg font-semibold transition-all hover:scale-105 disabled:opacity-40"
      style={{ background: "var(--teal)", minHeight: "auto" }}
    >
      {children}
    </button>
  );
}
