const express = require("express");
const { Pool } = require("pg");

const router = express.Router();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgres://swaivp:swaivp@postgres:5432/swaivp",
});

router.get("/warehouses", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM warehouses ORDER BY id");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal error" });
  }
});

router.post("/warehouses", async (req, res) => {
  try {
    const { name, location } = req.body;
    if (!name) return res.status(400).json({ error: "name is required" });
    const result = await pool.query(
      "INSERT INTO warehouses (name, location) VALUES ($1, $2) RETURNING *",
      [name, location || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal error" });
  }
});

router.get("/zones", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM zones ORDER BY id");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal error" });
  }
});

router.post("/zones", async (req, res) => {
  try {
    const { warehouseId, code, description } = req.body;
    if (!warehouseId || !code) {
      return res.status(400).json({ error: "warehouseId and code are required" });
    }
    const result = await pool.query(
      "INSERT INTO zones (warehouse_id, code, description) VALUES ($1, $2, $3) RETURNING *",
      [warehouseId, code, description || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal error" });
  }
});

module.exports = router;
