import React from "react";
import { useLang } from "../context/LanguageContext";

export default function TopBar({ showBack, onBack }) {
  const { lang, toggleLang, t } = useLang();

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white sticky top-0 z-40">
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            onClick={onBack}
            className="text-teal-500 font-body font-medium text-base mr-1 min-h-0 h-auto px-0"
            style={{ minHeight: "auto" }}
          >
            ← Back
          </button>
        )}
        <span
          className="font-display font-bold text-xl"
          style={{ color: "var(--teal)" }}
        >
          {t.appName}
        </span>
        <span className="text-base text-gray-400 hidden sm:inline">
          {t.tagline}
        </span>
      </div>

      {/* Hindi / English toggle */}
      <button
        onClick={toggleLang}
        className="px-4 py-2 rounded-full border-2 font-body font-medium text-base transition-all"
        style={{
          borderColor: "var(--teal)",
          color: "var(--teal)",
          minHeight: "auto",
        }}
      >
        {lang === "en" ? "हिंदी" : "English"}
      </button>
    </header>
  );
}
