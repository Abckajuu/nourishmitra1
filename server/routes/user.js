const express = require("express");
const router = express.Router();
const db = require("../db/database");

// Get user profile (always user id=1 for single-user app)
router.get("/", (req, res) => {
  const user = db.prepare("SELECT * FROM users WHERE id = 1").get();
  res.json(user || null);
});

// Create or update user after onboarding
router.post("/onboard", (req, res) => {
  const { name, conditions, goal, language } = req.body;
  const existing = db.prepare("SELECT * FROM users WHERE id = 1").get();

  if (existing) {
    db.prepare(`
      UPDATE users SET name=?, conditions=?, goal=?, language=?, onboarded=1
      WHERE id=1
    `).run(name || "", conditions, goal, language || "en");
  } else {
    db.prepare(`
      INSERT INTO users (name, conditions, goal, language, onboarded)
      VALUES (?, ?, ?, ?, 1)
    `).run(name || "", conditions, goal, language || "en");
  }

  const user = db.prepare("SELECT * FROM users WHERE id = 1").get();
  res.json(user);
});

// Update language preference
router.patch("/language", (req, res) => {
  const { language } = req.body;
  db.prepare("UPDATE users SET language=? WHERE id=1").run(language);
  res.json({ success: true });
});

module.exports = router;
