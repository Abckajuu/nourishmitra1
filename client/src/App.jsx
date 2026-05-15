import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "./context/LanguageContext";
import Landing from "./pages/Landing";
import Onboarding from "./pages/Onboarding";
import AppShell from "./pages/AppShell";

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          {/* Landing page */}
          <Route path="/" element={<Landing />} />

          {/* Onboarding */}
          <Route path="/onboard" element={<Onboarding />} />

          {/* Main app (log + patterns) */}
          <Route path="/app/*" element={<AppShell />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}
