import { useEffect } from "react";
import { speak } from "./useSpeech";
import { getMealsRange } from "../utils/api";

const STORAGE_KEY = "nm_last_weekly_summary";

export function useWeeklySummary(lang = "en") {
  useEffect(() => {
    async function maybeSpeak() {
      const now = new Date();
      const isSunday = now.getDay() === 0;
      const hour = now.getHours();
      const isMorning = hour >= 7 && hour < 11;

      if (!isSunday || !isMorning) return;

      const lastFired = localStorage.getItem(STORAGE_KEY);
      const todayKey = now.toISOString().split("T")[0];
      if (lastFired === todayKey) return;

      try {
        const meals = await getMealsRange(7);
        if (!meals || meals.length === 0) return;

        const count = meals.length;
        const days = [...new Set(meals.map((m) => m.meal_date))].length;

        const message =
          lang === "hi"
            ? `??????? ?? ????? ???? ${days} ??? ${count} ??? ???? ???? ????? NourishMitra ???? ?????? ??? ??? ??? ?? ????? ???? ??????? ??????`
            : `Good morning. This week you logged ${count} meals across ${days} days. NourishMitra has been watching your patterns. Open the app to see your weekly reality check.`;

        speak(message, lang);
        localStorage.setItem(STORAGE_KEY, todayKey);
      } catch (e) {
        console.error("Weekly summary error:", e);
      }
    }

    const timer = setTimeout(maybeSpeak, 1500);
    return () => clearTimeout(timer);
  }, [lang]);
}
