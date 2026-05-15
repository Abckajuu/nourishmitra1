import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const LanguageContext = createContext();

export const translations = {
  en: {
    appName: "NourishMitra",
    tagline: "Your personal food companion",
    goodMorning: "Good morning",
    goodAfternoon: "Good afternoon",
    goodEvening: "Good evening",
    tapToSpeak: "Tap to speak what you ate",
    typeInstead: "Type instead",
    takePhoto: "Take a photo of your meal",
    whatYouLogged: "What you've logged",
    myLog: "My Log",
    myPatterns: "My Patterns",
    whatINot: "What I noticed",
    realityCheck: "Your Reality Check",
    oneThingToTry: "One thing to try this week",
    keepLogging: "Keep logging for 3 days and I'll show you your patterns.",
    daysLogged: "days logged",
    thinking: "NourishMitra is thinking...",
    listening: "Listening...",
    askAgain: "Should I ask you what you ate today?",
    doctorFlag: "Some of what I noticed is worth discussing with your doctor.",
    getSummary: "Get summary for doctor",
    tryNourish: "Try NourishMitra",
    viewGithub: "View on GitHub",
    builtForBharat: "Built for Bharat. Free. Offline. Always.",
    sendMessage: "Send",
    typeMessage: "Ask me anything...",
    photoComingSoon: "Photo input coming soon!",
    loggedAt: "Logged",
    noMealsYet: "Nothing logged yet today. Tap the mic and tell me what you ate.",
    analysed: "Analysed",
  },
  hi: {
    appName: "NourishMitra",
    tagline: "आपका व्यक्तिगत खाना साथी",
    goodMorning: "सुप्रभात",
    goodAfternoon: "नमस्कार",
    goodEvening: "शुभ संध्या",
    tapToSpeak: "बोलें — आपने क्या खाया",
    typeInstead: "टाइप करें",
    takePhoto: "खाने की फोटो लें",
    whatYouLogged: "आपने क्या दर्ज किया",
    myLog: "मेरा लॉग",
    myPatterns: "मेरे पैटर्न",
    whatINot: "मैंने क्या नोटिस किया",
    realityCheck: "आपका रियलिटी चेक",
    oneThingToTry: "इस हफ्ते एक चीज़ आज़माएं",
    keepLogging: "3 दिन लॉग करें और मैं आपके पैटर्न दिखाऊंगा।",
    daysLogged: "दिन दर्ज",
    thinking: "NourishMitra सोच रहा है...",
    listening: "सुन रहा हूं...",
    askAgain: "क्या मैं पूछूं कि आपने आज क्या खाया?",
    doctorFlag: "कुछ बातें डॉक्टर से साझा करना उचित होगा।",
    getSummary: "डॉक्टर के लिए सारांश",
    tryNourish: "NourishMitra आज़माएं",
    viewGithub: "GitHub पर देखें",
    builtForBharat: "भारत के लिए। मुफ्त। ऑफलाइन। हमेशा।",
    sendMessage: "भेजें",
    typeMessage: "कुछ भी पूछें...",
    photoComingSoon: "फोटो सुविधा जल्द आएगी!",
    loggedAt: "दर्ज",
    noMealsYet: "आज अभी कुछ दर्ज नहीं। माइक दबाएं और बताएं कि आपने क्या खाया।",
    analysed: "विश्लेषित",
  },
};

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState("en");

  useEffect(() => {
    // Sync with server on mount
    axios.get("/api/user").then((res) => {
      if (res.data?.language) setLang(res.data.language);
    }).catch(() => {});
  }, []);

  const toggleLang = () => {
    const next = lang === "en" ? "hi" : "en";
    setLang(next);
    axios.patch("/api/user/language", { language: next }).catch(() => {});
  };

  const t = translations[lang];

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
