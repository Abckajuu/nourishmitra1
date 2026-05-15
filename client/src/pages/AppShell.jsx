import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import DailyLog from "./DailyLog";
import Patterns from "./Patterns";
import { useLang } from "../context/LanguageContext";
import { getUser } from "../utils/api";

export default function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLang();
  const [checked, setChecked] = useState(false);
  const [onboarded, setOnboarded] = useState(false);

  // Check if user has onboarded
  useEffect(() => {
    getUser().then((user) => {
      setOnboarded(!!user?.onboarded);
      setChecked(true);
      if (!user?.onboarded) navigate("/onboard");
    }).catch(() => {
      setChecked(true);
      navigate("/onboard");
    });
  }, [navigate]);

  if (!checked) return null;
  if (!onboarded) return null;

  const tab = location.pathname.includes("patterns") ? "patterns" : "log";

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        <Routes>
          <Route path="log" element={<DailyLog />} />
          <Route path="patterns" element={<Patterns />} />
          <Route path="*" element={<Navigate to="log" replace />} />
        </Routes>
      </div>

      {/* Bottom navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 flex border-t bg-white z-30"
        style={{ borderColor: "#f3f4f6" }}
      >
        {[
          { key: "log", icon: "📋", label: t.myLog, path: "/app/log" },
          { key: "patterns", icon: "📊", label: t.myPatterns, path: "/app/patterns" },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => navigate(item.path)}
            className="flex-1 flex flex-col items-center justify-center py-4 gap-1 transition-all"
            style={{
              color: tab === item.key ? "var(--teal)" : "#9ca3af",
              borderTop: tab === item.key ? "2px solid var(--teal)" : "2px solid transparent",
              minHeight: "auto",
            }}
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
