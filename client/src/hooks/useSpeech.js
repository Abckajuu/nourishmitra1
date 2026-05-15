import { useState, useRef, useCallback } from "react";

// ── Voice OUTPUT (text → speech) ──────────────────────────────────
export function speak(text, lang = "en") {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang === "hi" ? "hi-IN" : "en-IN";
  utter.rate = 0.88;
  utter.pitch = 1.05;

  // Prefer a female voice if available
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(
    (v) =>
      v.lang === utter.lang &&
      (v.name.toLowerCase().includes("female") ||
        v.name.toLowerCase().includes("woman") ||
        v.name.toLowerCase().includes("google"))
  );
  if (preferred) utter.voice = preferred;

  window.speechSynthesis.speak(utter);
}

export function stopSpeaking() {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
}

// ── Voice INPUT (speech → text) ───────────────────────────────────
export function useVoiceInput({ onResult, lang = "en" }) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef(null);
  const transcriptRef = useRef(""); // ← fixes the stale closure bug

  const startListening = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser. Please use Chrome.");
      return;
    }

    // Reset
    transcriptRef.current = "";
    setTranscript("");

    const recognition = new SpeechRecognition();
    recognition.lang = lang === "hi" ? "hi-IN" : "en-IN";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognitionRef.current = recognition;

    recognition.onstart = () => setListening(true);

    recognition.onresult = (e) => {
      let interim = "";
      let final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript;
        else interim += e.results[i][0].transcript;
      }
      const result = final || interim;
      transcriptRef.current = result; // ← always up to date
      setTranscript(result);
    };

    recognition.onend = () => {
      setListening(false);
      // Use ref instead of state — never stale
      if (transcriptRef.current && onResult) {
        onResult(transcriptRef.current);
        transcriptRef.current = "";
      }
    };

    recognition.onerror = (e) => {
      console.error("Speech recognition error:", e.error);
      setListening(false);
    };

    recognition.start();
  }, [lang, onResult]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) recognitionRef.current.stop();
    setListening(false);
  }, []);

  return { listening, transcript, startListening, stopListening, setTranscript };
}