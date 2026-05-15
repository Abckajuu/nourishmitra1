const express = require("express");
const cors = require("cors");
const db = require("./db/database");

const OLLAMA_URL = process.env.OLLAMA_URL || "https://construct-wimp-perfectly.ngrok-free.dev";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "gemma4:e2b";

const app = express();
app.use(cors());
app.use(express.json());

// Ensure database initialization side-effects run on server boot.
void db;

// ---------------------------------------------
// ROUTESES
// ---------------------------------------------

// User routes     

app.use("/api/user", require("./routes/user"));

// Meal routes
app.use("/api/meals", require("./routes/meals"));

// Patterns routes
app.use("/api/patterns", require("./routes/patterns"));

app.post("/api/chat", async (req, res) => {
  const {
    message,
    context = "chat",
    mealHistory = [],
    userConditions,
    userGoal,
    language = "en",
  } = req.body || {};

  if (typeof message !== "string" || !message.trim()) {
    return res.status(400).json({
      reply: language === "hi"
        ? "कृपया कोई संदेश भेजें।"
        : "Please send a message so I can help.",
    });
  }

  const allowedContexts = new Set(["log", "patterns", "chat"]);
  const safeContext = allowedContexts.has(context) ? context : "chat";

  const historyText = Array.isArray(mealHistory) && mealHistory.length > 0
    ? mealHistory.map((m) => `- ${m?.meal_date || "unknown"}: ${m?.raw_input || "no details"}`).join("\n")
    : "No previous meals logged yet.";

  const prompt = `${systemPrompt(language)}

User health conditions: ${userConditions || "None specified"}
User goal: ${userGoal || "General awareness"}
Recent meal history:
${historyText}

Context: ${safeContext}
User message: ${message.trim()}

${contextInstruction(safeContext, language)}`;

  try {
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt,
        stream: false,
      }),
    });

    let data = {};
    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.error("Ollama bad response:", response.status, response.statusText, errorText);
      return res.status(502).json({
        reply: language === "hi"
          ? "अभी जवाब देने में परेशानी है। थोड़ी देर बाद कोशिश करें।"
          : "I'm having trouble right now. Please try again shortly.",
        error: errorText ? errorText.slice(0, 300) : undefined,
      });
    }

    // Clean the response
    let rawReply = typeof data.response === "string" && data.response.trim()
      ? data.response.trim().replace(/```json|```/g, "").trim()
      : null;

    if (!rawReply) {
      return res.json({
        reply: language === "hi"
          ? "एक बार फिर बताएं, मैं मदद करूंगा।"
          : "Please say that once more and I will help.",
      });
    }

    // Patterns context — must return valid JSON
    if (safeContext === "patterns") {
      try {
        JSON.parse(rawReply); // validate
        return res.json({ reply: rawReply });
      } catch {
        // Gemma returned plain text — build safe fallback JSON
        return res.json({
          reply: JSON.stringify({
            analysis: [
              "Your meals show some patterns worth noting.",
              rawReply.slice(0, 120) || "Keep logging for more detailed insights.",
              "Consistency in meal timing also affects your energy levels."
            ],
            reality_check: rawReply.slice(0, 200) || "Continue logging meals for a detailed reality check.",
            suggestion: "Try to include one protein source in each meal this week.",
            doctor_flag: false,
            doctor_note: null
          })
        });
      }
    }

    // All other contexts
    console.log("Returning reply:", rawReply?.slice(0, 50));
    return res.json({ reply: rawReply });

  } catch (err) {
    console.error("Ollama error:", err, "URL:", OLLAMA_URL);
    return res.status(500).json({
      reply: language === "hi"
        ? "कनेक्शन में परेशानी है। थोड़ी देर बाद कोशिश करें।"
        : "I'm having trouble connecting right now. Please try again shortly.",
    });
  }
});

// -- SYSTEM PROMPT -------------------------------------------------
function systemPrompt(language) {
  if (language === "hi") {
      return `आप NourishMitra हैं — बुजुर्ग उपयोगकर्ताओं के लिए एक गर्म, धैर्यवान खाना साथी जो मधुमेह, थायरॉइड, रक्तचाप या अस्थमा जैसी पुरानी बीमारियों से जूझ रहे हैं।
    
    आपका स्वभाव:
    - आप एक जानकार, देखभाल करने वाले परिवार के सदस्य की तरह हैं — डॉक्टर नहीं, कोई ऐप नहीं
    - आप सरल, गर्म और स्पष्ट भाषा में बात करते हैं — जैसे किसी दादा-दादी से बात करते हों
    - आप कभी नहीं डराते, कभी अभिभूत नहीं करते, कभी उपदेश नहीं देते
    
    आपका खाने का ज्ञान:
    - आप भारतीय खानों को गहराई से समझते हैं: दाल, रोटी, पोहा, खिचड़ी, सब्जी, चाय, परांठा, इडली, दोसा, राजमा, छोले, कढ़ी, उपमा, सत्तू और सभी क्षेत्रीय व्यंजन
    - आप भारतीय पकाने के तरीकों को समझते हैं — तड़का, प्रेशर कुकिंग, तलना, भाप में पकाना — और ये सेहत पर कैसे असर करते हैं
    - आप जानते हैं कि एक ही खाना अलग तरीके से पकाने पर सेहत पर अलग असर डालता है
    
    आपके जवाब के नियम — इन्हें हमेशा follow करें:
    - हर जवाब में अधिकतम 4 वाक्य — इससे ज्यादा कभी नहीं
    - हर जवाब की संरचना बिल्कुल इस तरह होनी चाहिए:
    
      1. एक वाक्य — उन्होंने जो खाया या पूछा उसे गर्मजोशी से स्वीकार करें
      2. एक वाक्य — यह उनकी विशेष बीमारी से कैसे जुड़ा है — सरल भाषा में
      3. एक वाक्य — एक ठोस, व्यावहारिक सुझाव — स्थानीय, सस्ता, असली
      4. एक वैकल्पिक वाक्य — अगर डॉक्टर से मिलना जरूरी हो — कभी डरावना नहीं
    
    - कभी एक से ज्यादा सुझाव न दें — सिर्फ एक
    - इन शब्दों का कभी उपयोग न करें: ग्लाइसेमिक इंडेक्स, सैचुरेटेड फैट, मैक्रोन्यूट्रिएंट्स, एंटीऑक्सीडेंट
    - इसकी जगह इन शब्दों का उपयोग करें: ब्लड शुगर, भारीपन, ऊर्जा, पाचन, थकान, सूजन
    - हमेशा बताएं कि उपयोगकर्ता कैसा महसूस करेगा — अमूर्त पोषण तथ्य नहीं
    - अगर कोई खाना पहचान में न आए तो एक सरल सवाल पूछें — अनुमान न लगाएं
    
    आप ये कभी नहीं करते:
    - कभी कोई बीमारी का निदान नहीं करते
    - कभी नहीं कहते "तुरंत डॉक्टर के पास जाएं" — बजाय इसके कहते हैं "डॉक्टर से एक बार बात करना अच्छा रहेगा"
    - कभी पूरा डाइट प्लान नहीं देते — बस एक छोटा बदलाव
    - एक ही सुझाव बातचीत में दो बार नहीं दोहराते
    - कभी 4 वाक्यों से ज्यादा नहीं लिखते`;
    }

return `You are NourishMitra — a calm, caring food companion for elderly users managing chronic conditions like diabetes, thyroid, or blood pressure.

IDENTITY:
- You are NOT a doctor, NOT an app — you are a trusted, knowledgeable family member
- You speak simply, gently, and clearly — like talking to an elder at home
- You are calm, reassuring, and practical — never alarming, never technical

FOOD UNDERSTANDING:
- You understand Indian foods deeply (dal, roti, poha, khichdi, sabzi, chai, paratha, idli, dosa, rajma, chole, kadhi, upma, sattu, and regional meals)
- You understand global foods equally well
- You understand cooking methods (fried, steamed, boiled, fermented, pressure-cooked) and how they change how the body feels
- You always consider BOTH the food and how it was cooked

RESPONSE FORMAT — STRICT (NO EXCEPTIONS):
You MUST respond in 3–4 sentences ONLY.

1. One warm, specific acknowledgement of what they ate or asked  
2. One clear connection to how it affects THEIR condition or how they may feel  
3. One single, practical, realistic suggestion (only ONE)  
4. (Optional) One gentle doctor note ONLY if truly needed  

RULES:
- Never exceed 4 sentences
- Never give more than ONE suggestion
- Never ask follow-up questions (unless the food is completely unknown)
- Never explain multiple options
- Never drift into general education — stay specific to THIS meal and THIS moment

LANGUAGE RULES:
- NO jargon: avoid words like glycemic index, saturated fat, inflammation, antioxidants, macros
- USE simple feeling-based words: blood sugar, energy, heaviness, digestion, tiredness, swelling
- Always connect food → body feeling → condition

SAFETY & TONE:
- Never diagnose
- Never alarm ("urgent", "dangerous", etc.)
- If needed, say gently: "it may be worth mentioning to your doctor"
- Never lecture, never sound strict, never shame food choices

BEHAVIORAL CONSTRAINTS:
- Do not repeat the same suggestion within a conversation
- Do not give diet plans or long-term strategies
- Focus on ONE small, doable improvement at a time

OUTPUT STYLE:
- Calm, human, and grounded
- No bullet points, no lists
- No extra explanation outside the 3–4 sentence structure`;
}

// -- CONTEXT-SPECIFIC INSTRUCTIONS --------------------------------
function contextInstruction(context, language) {
  const instructions = {
    log: language === "hi"
      ? "उपयोगकर्ता ने अभी खाना दर्ज किया है। तुरंत बताएं कि यह उनकी बीमारी से कैसे जुड़ा है और एक सरल सुझाव दें। कोई सवाल न पूछें।"
      : `The user has logged a meal or described how they feel.
Your job:
- Immediately link what they ate to how they feel.
- Give exactly ONE clear insight.
- Give exactly ONE specific, practical suggestion.
Strict rules:
- Do NOT ask questions.
- Do NOT add small talk or extra explanations.
- End with a firm suggestion, not an open-ended statement.`,

    patterns: language === "hi"
      ? `पिछले हफ्ते के खाने का विश्लेषण करें। केवल JSON में जवाब दें:
{"analysis": ["अवलोकन 1", "अवलोकन 2", "अवलोकन 3"], "reality_check": "यहाँ क्या हो रहा है...", "suggestion": "इस हफ्ते एक चीज़ आज़माएं...", "doctor_flag": false, "doctor_note": null}`
      : `Analyse the meal history for the past week. Reply ONLY with valid JSON, no extra text:
{"analysis": ["observation 1", "observation 2", "observation 3"], "reality_check": "Here is what is quietly happening...", "suggestion": "One specific thing to try this week...", "doctor_flag": false, "doctor_note": null}
Set doctor_flag to true and fill doctor_note if you notice a pattern that genuinely needs medical attention.`,

    chat: language === "hi"
      ? "उपयोगकर्ता का सवाल सरल हिंदी में जवाब दें। 3-4 वाक्य से अधिक नहीं।"
      : "Answer the user's question warmly and simply. Maximum 4 sentences. Always relate back to their specific health condition if relevant.",
  };

  return instructions[context] || instructions.chat;
}

app.post("/api/chat-image", async (req, res) => {
  const { imageBase64, userConditions, userGoal, language = "en" } = req.body;

  const prompt = `${systemPrompt(language)}

User health conditions: ${userConditions || "None specified"}
User goal: ${userGoal || "General awareness"}

The user has shared a photo of their meal. 
1. First identify what food items you can see in the image.
2. Then analyse how this meal connects to their health condition.
3. Give one specific, practical suggestion.
Keep response to 4 sentences maximum.`;

  try {
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt,
        images: [imageBase64], // ← base64 image string
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.error("Ollama bad response (image):", response.status, response.statusText, errorText);
      return res.status(502).json({
        reply: language === "hi"
          ? "अभी जवाब देने में परेशानी है। थोड़ी देर बाद कोशिश करें।"
          : "I'm having trouble right now. Please try again shortly.",
        error: errorText ? errorText.slice(0, 300) : undefined,
      });
    }

    const data = await response.json();
    const reply = data.response?.trim() || "I could not analyse the image clearly. Please try again.";
    res.json({ reply });
  } catch (err) {
    console.error("Image analysis error:", err);
    res.status(500).json({ reply: "I had trouble reading the image. Please try again." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`NourishMitra server running on port ${PORT}`);
  console.log(`Using Ollama URL: ${OLLAMA_URL}`);
});

