const express = require("express");
const router = express.Router();
const db = require("../db/database");

// Get latest pattern analysis
router.get("/latest", (req, res) => {
  const pattern = db.prepare(`
    SELECT * FROM patterns
    WHERE user_id = 1
    ORDER BY generated_at DESC
    LIMIT 1
  `).get();
  res.json(pattern || null);
});

// Save a new pattern analysis (called after AI generates it)
router.post("/", (req, res) => {
  const { analysis, reality_check, suggestion, doctor_flag, doctor_note } = req.body;

  // Convert analysis array to JSON string for SQLite storage
  const analysisString = Array.isArray(analysis)
    ? JSON.stringify(analysis)
    : typeof analysis === "string"
    ? analysis
    : JSON.stringify([]);

  const stmt = db.prepare(`
    INSERT INTO patterns (user_id, analysis, reality_check, suggestion, doctor_flag, doctor_note)
    VALUES (1, ?, ?, ?, ?, ?)
  `);

  const info = stmt.run(
    analysisString,
    reality_check || "",
    suggestion || "",
    doctor_flag ? 1 : 0,
    doctor_note || null
  );

  const pattern = db.prepare("SELECT * FROM patterns WHERE id=?").get(info.lastInsertRowid);
  res.json(pattern);
});

module.exports = router;
