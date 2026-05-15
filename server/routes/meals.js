const express = require("express");
const router = express.Router();
const db = require("../db/database");

// Get all meals (last 7 days)
router.get("/", (req, res) => {
  const meals = db.prepare(`
    SELECT * FROM meals
    WHERE user_id = 1
    ORDER BY logged_at DESC
    LIMIT 20
  `).all();
  res.json(meals);
});

// Get meals by date range (for pattern analysis)
router.get("/range", (req, res) => {
  const { days = 7 } = req.query;
  const meals = db.prepare(`
    SELECT * FROM meals
    WHERE user_id = 1
    AND meal_date >= date('now', '-' || ? || ' days')
    ORDER BY logged_at DESC
  `).all(days);
  res.json(meals);
});

// Get count of days logged
router.get("/days-count", (req, res) => {
  const result = db.prepare(`
    SELECT COUNT(DISTINCT meal_date) as count
    FROM meals WHERE user_id = 1
  `).get();
  res.json({ count: result.count });
});

// Log a new meal
router.post("/", (req, res) => {
  const { raw_input, parsed_summary } = req.body;
  if (!raw_input) return res.status(400).json({ error: "raw_input is required" });

  const stmt = db.prepare(`
    INSERT INTO meals (user_id, raw_input, parsed_summary)
    VALUES (1, ?, ?)
  `);
  const info = stmt.run(raw_input, parsed_summary || null);
  const meal = db.prepare("SELECT * FROM meals WHERE id=?").get(info.lastInsertRowid);
  res.json(meal);
});

// Update parsed summary after AI analysis
router.patch("/:id/summary", (req, res) => {
  const { parsed_summary } = req.body;
  db.prepare("UPDATE meals SET parsed_summary=? WHERE id=?")
    .run(parsed_summary, req.params.id);
  res.json({ success: true });
});

// Delete a meal
router.delete("/:id", (req, res) => {
  db.prepare("DELETE FROM meals WHERE id=? AND user_id=1").run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
