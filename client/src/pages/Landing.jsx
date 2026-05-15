import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useLang } from "../context/LanguageContext";

export default function Landing() {
  const navigate = useNavigate();
  const { lang, toggleLang, t } = useLang();
  const howRef = useRef(null);

  useEffect(() => {
    document.title = "NourishMitra — Your Personal Food Companion";
  }, []);

  return (
    <div className="font-body">

      {/* NAV */}
      <nav className="fixed top-0 w-full z-50 flex items-center justify-between px-8 py-4 bg-transparent">
        <span className="font-display font-bold text-xl text-white drop-shadow">
          NourishMitra
        </span>
        <div className="flex gap-4">
          <button
            onClick={toggleLang}
            className="px-4 py-2 rounded-full border-2 border-white text-white text-base font-medium"
            style={{ minHeight: "auto" }}
          >
            {lang === "en" ? "हिंदी" : "English"}
          </button>
        </div>
      </nav>

      {/* SECTION 1 — HOOK */}
      <section
        className="min-h-screen flex flex-col items-center justify-center text-center px-6"
        style={{ background: "var(--night)" }}
      >
        <p className="text-white text-2xl md:text-3xl font-display leading-snug max-w-2xl animate-fade-in">
          "She's had thyroid for 11 years.
          <br />
          <span style={{ color: "var(--saffron)" }}>
            Nobody told her cauliflower was making it worse.
          </span>"
        </p>
        <div className="mt-10 animate-slide-up" style={{ animationDelay: "0.8s", opacity: 0 }}>
          <h1 className="font-display font-bold text-4xl text-white mb-2">NourishMitra</h1>
          <p className="text-xl" style={{ color: "var(--saffron)" }}>
            {t.tagline}
          </p>
        </div>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 animate-slide-up" style={{ animationDelay: "1.2s", opacity: 0 }}>
          <button
            onClick={() => navigate("/app")}
            className="px-8 py-4 rounded-full text-white font-semibold text-lg transition-transform hover:scale-105"
            style={{ background: "var(--teal)", minHeight: "auto" }}
          >
            {t.tryNourish}
          </button>
          <button
            onClick={() => howRef.current?.scrollIntoView({ behavior: "smooth" })}
            className="px-8 py-4 rounded-full border-2 border-white text-white font-semibold text-lg"
            style={{ minHeight: "auto" }}
          >
            See How It Works
          </button>
        </div>
      </section>

      {/* SECTION 2 — THE PROBLEM */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-3xl text-center mb-4" style={{ color: "var(--night)" }}>
            The gap nobody talks about
          </h2>
          <p className="text-center text-gray-500 text-lg mb-14 max-w-xl mx-auto">
            Millions of elderly Indians manage chronic conditions every day —
            with no bridge between their food and their health.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: "👴",
                title: "An elderly person",
                desc: "Managing diabetes or thyroid for years, eating what the family eats, not knowing what's quietly making it worse.",
              },
              {
                icon: "🍛",
                title: "Local Indian food",
                desc: "Dal, roti, chai, poha — nutritious but complex. No app understands these the way they're actually eaten.",
              },
              {
                icon: "🔗",
                title: "No bridge",
                desc: "Doctor has 8 minutes. Family doesn't have the knowledge. Nutrition apps don't speak their language.",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="rounded-2xl p-8 border-2 transition-transform hover:-translate-y-1"
                style={{ borderColor: "var(--saffron)" }}
              >
                <div className="text-4xl mb-4">{card.icon}</div>
                <h3 className="font-display font-bold text-xl mb-3" style={{ color: "var(--night)" }}>
                  {card.title}
                </h3>
                <p className="text-gray-500 text-base leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3 — HOW IT WORKS */}
      <section
        ref={howRef}
        className="py-24 px-6"
        style={{ background: "var(--teal)" }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-3xl text-white mb-14">Three simple steps</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: "🎤", step: "01", title: "You talk", desc: "Just say what you ate. No typing, no scanning, no calorie counting." },
              { icon: "👁️", step: "02", title: "We observe", desc: "Patterns emerge over a few days. We connect your food to how you feel." },
              { icon: "💡", step: "03", title: "Reality check", desc: "Plain language. What's wrong. What to change. A gentle nudge, not a lecture." },
            ].map((s) => (
              <div key={s.step} className="text-white">
                <div className="text-5xl mb-4">{s.icon}</div>
                <div className="text-sm font-medium opacity-60 mb-1 tracking-widest">{s.step}</div>
                <h3 className="font-display font-bold text-2xl mb-3">{s.title}</h3>
                <p className="text-base opacity-80 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4 — LIVE PROOF */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-3xl text-center mb-4" style={{ color: "var(--night)" }}>
            Real person. Real result.
          </h2>
          <p className="text-center text-gray-500 text-lg mb-14">
            67-year-old with thyroid and asthma. Had no idea what her daily food was doing.
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Meal log */}
            <div className="rounded-2xl border border-gray-100 p-6 shadow-sm">
              <p className="text-base font-semibold text-gray-400 mb-4">3-Day Meal Log</p>
              {[
                { day: "Day 1", meals: "Poha with sev, chai × 3, dal-chawal, khichdi" },
                { day: "Day 2", meals: "Paratha with butter, chai × 2, rajma-rice, sabzi-roti" },
                { day: "Day 3", meals: "Upma, chai × 3, cauliflower sabzi, roti, curd" },
              ].map((d) => (
                <div key={d.day} className="mb-3 pb-3 border-b border-gray-100 last:border-0">
                  <span className="font-semibold text-base" style={{ color: "var(--teal)" }}>{d.day}: </span>
                  <span className="text-base text-gray-600">{d.meals}</span>
                </div>
              ))}
            </div>

            {/* AI response */}
            <div className="rounded-2xl p-6" style={{ background: "#f0faf8", borderLeft: "4px solid var(--teal)" }}>
              <p className="text-base font-semibold mb-3" style={{ color: "var(--teal)" }}>
                NourishMitra noticed:
              </p>
              <p className="text-base text-gray-700 leading-relaxed mb-4">
                "Your chai habit adds about <strong>18g of sugar</strong> before you've eaten a single meal. 
                For thyroid management, cauliflower eaten lightly cooked <strong>3 times in one week</strong> can 
                interfere with thyroid hormone production. And your meals are low in protein most days — 
                which may explain the afternoon fatigue."
              </p>
              <p className="text-base text-gray-700 leading-relaxed">
                <strong>One thing to try:</strong> Switch one chai to plain warm water with a small piece of jaggery. 
                And try cooking cauliflower thoroughly rather than lightly stir-fried.
              </p>
            </div>
          </div>

          {/* Video placeholder */}
          <div
            className="mt-10 rounded-2xl flex items-center justify-center"
            style={{ background: "#f3f4f6", height: "280px" }}
          >
            <div className="text-center">
              <div className="text-5xl mb-3">▶️</div>
              <p className="text-gray-400 text-base">Demo video — coming soon</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5 — WHY OFFLINE */}
      <section className="py-24 px-6" style={{ background: "#fff8f0" }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-3xl mb-4" style={{ color: "var(--night)" }}>
            Your data never leaves your device
          </h2>
          <p className="text-gray-500 text-lg mb-14">
            Built for areas with unreliable internet. Built for people who value their privacy.
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="rounded-2xl bg-white p-8 shadow-sm text-left">
              <p className="text-4xl mb-4">🤖</p>
              <h3 className="font-display font-bold text-xl mb-2" style={{ color: "var(--night)" }}>
                Gemma 4 by Google
              </h3>
              <p className="text-base text-gray-500 leading-relaxed">
                An open-source AI model that runs entirely on your device — 
                no cloud calls, no API keys, no subscription.
              </p>
            </div>
            <div className="rounded-2xl bg-white p-8 shadow-sm text-left">
              <p className="text-4xl mb-4">📴</p>
              <h3 className="font-display font-bold text-xl mb-2" style={{ color: "var(--night)" }}>
                Powered by Ollama
              </h3>
              <p className="text-base text-gray-500 leading-relaxed">
                Ollama runs large language models locally. 
                Your meals, your conditions, your conversations — stay on your machine.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6 — CTA */}
      <section
        className="py-24 px-6 text-center"
        style={{ background: "var(--night)" }}
      >
        <h2 className="font-display text-3xl text-white mb-4">
          Ready to understand your food?
        </h2>
        <p className="text-xl mb-10" style={{ color: "var(--saffron)" }}>
          {t.builtForBharat}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate("/app")}
            className="px-10 py-4 rounded-full text-white font-semibold text-lg transition-transform hover:scale-105"
            style={{ background: "var(--teal)", minHeight: "auto" }}
          >
            {t.tryNourish}
          </button>
          <a
            href="https://github.com/Abckajuu/nourishmitra-copy.git"
            target="_blank"
            rel="noreferrer"
            className="px-10 py-4 rounded-full border-2 border-white text-white font-semibold text-lg inline-flex items-center justify-center"
            style={{ minHeight: "auto" }}
          >
            {t.viewGithub}
          </a>
        </div>
      </section>

    </div>
  );
}
