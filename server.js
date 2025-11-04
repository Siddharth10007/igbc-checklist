const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Initialize SQLite database
const db = new sqlite3.Database("./database.db", (err) => {
  if (err) console.error("❌ Database connection failed:", err.message);
  else console.log("✅ Connected to SQLite database.");
});

// Create table if not exists
db.run(`
  CREATE TABLE IF NOT EXISTS evaluations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    type TEXT,
    area REAL,
    total_points INTEGER,
    rating TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Handle evaluation requests
app.post("/api/evaluate", (req, res) => {
  const { name, type, area, inputs } = req.body;

  if (!name || !type || !area || !inputs) {
    return res.status(400).json({ error: "Missing data" });
  }

  // Simple scoring
  const totalPoints = inputs.filter((i) => i.selected).length * 10;

  // Rating logic
  let rating = "Certified";
  if (totalPoints >= 80) rating = "Platinum";
  else if (totalPoints >= 60) rating = "Gold";
  else if (totalPoints >= 40) rating = "Silver";

  // Save to DB
  db.run(
    `INSERT INTO evaluations (name, type, area, total_points, rating)
     VALUES (?, ?, ?, ?, ?)`,
    [name, type, area, totalPoints, rating],
    function (err) {
      if (err) return res.status(500).json({ error: "Database insert failed" });

      res.json({
        id: this.lastID,
        name,
        type,
        area,
        total_points: totalPoints,
        rating,
      });
    }
  );
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
