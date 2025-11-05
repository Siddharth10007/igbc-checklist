const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const PORT = 3000;

// --- NEW: Point Map (Total 100 Points) ---
// This map defines the "weight" of each checkbox.
const pointMap = {
  // Site (15 pts)
  s1: 3,
  s2: 3,
  s3: 3,
  s4: 6, // Reduced site disturbance is higher impact

  // Water (25 pts)
  w1: 7, // On-site treatment is high impact
  w2: 3,
  w3: 6, // Rainwater harvesting is high impact
  w4: 3,
  w5: 6, // Recycled water use is high impact

  // Energy (26 pts)
  e1: 7, // Renewable energy is high impact
  e2: 3,
  e3: 3,
  e4: 6, // Insulation is high impact
  e5: 7, // HVAC is high impact

  // Materials (20 pts)
  m1: 3,
  m2: 3,
  m3: 3,
  m4: 4,
  m5: 7, // Diverting waste is high impact

  // Indoor (10 pts)
  i1: 4, // Daylighting is high impact
  i2: 2,
  i3: 2,
  i4: 2,

  // Innovation (4 pts)
  in1: 2,
  in2: 1,
  in3: 1,
};
// Note: I rebalanced the points to be more realistic.
// Site(15) + Water(25) + Energy(26) + Materials(20) + Indoor(10) + Innovation(4) = 100

// Middleware
app.use(cors());
app.use(express.json());
// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// Initialize SQLite database
const db = new sqlite3.Database("./database.db", (err) => {
  if (err) console.error("❌ Database connection failed:", err.message);
  else console.log("✅ Connected to SQLite database.");
});

// Create table if not exists (Updated to store total_points)
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

  // --- NEW AGGREGATE SCORING LOGIC ---
  let totalScore = 0;
  inputs.forEach((input) => {
    // If the box was selected AND the id exists in our pointMap
    if (input.selected && pointMap[input.id]) {
      totalScore += pointMap[input.id];
    }
  });

  // --- FIX: Cap the total score at 100 ---
  // This prevents any errors from exceeding the maximum.
  if (totalScore > 100) {
    totalScore = 100;
  }

  // Rating logic based on new 100-point aggregate score
  let rating = "Not Certified";
  if (totalScore >= 75) rating = "Platinum";
  else if (totalScore >= 60) rating = "Gold";
  else if (totalScore >= 50) rating = "Silver";
  else if (totalScore >= 40) rating = "Certified";
  // --- END OF NEW LOGIC ---

  // Save to DB (Updated to save total_points)
  db.run(
    `INSERT INTO evaluations (name, type, area, total_points, rating)
     VALUES (?, ?, ?, ?, ?)`,
    [name, type, area, totalScore, rating],
    function (err) {
      if (err) {
        console.error("Database insert failed:", err.message);
        return res.status(500).json({ error: "Database insert failed" });
      }

      console.log(`✅ Evaluation saved with ID: ${this.lastID}`);

      // Return the new data structure (total_points)
      res.json({
        id: this.lastID,
        name,
        type,
        area,
        total_points: totalScore,
        rating,
      });
    }
  );
});

// Serve the main HTML file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});