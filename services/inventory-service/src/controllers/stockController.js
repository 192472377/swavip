const { pool } = require("../models/db");
const { getClient } = require("../models/cache");

const LOW_STOCK_THRESHOLD_DEFAULT = 10;

async function createStock(req, res) {
  try {
    const { sku, qty, binId, reorderLevel } = req.body;
    if (!sku || qty === undefined) {
      return res.status(400).json({ error: "sku and qty are required" });
    }
    const result = await pool.query(
      `INSERT INTO stock (sku, qty, bin_id, reorder_level)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (sku) DO UPDATE SET qty = $2, bin_id = $3, last_updated = now()
       RETURNING *`,
      [sku, qty, binId || null, reorderLevel || LOW_STOCK_THRESHOLD_DEFAULT]
    );
    const row = result.rows[0];

    const redis = await getClient();
    await redis.set(`stock:${sku}`, JSON.stringify(row), { EX: 60 });

    if (row.qty <= row.reorder_level) {
      console.warn(`LOW STOCK ALERT: ${sku} at ${row.qty} units (reorder level ${row.reorder_level})`);
    }

    res.status(201).json({ status: "created", sku: row.sku, qty: row.qty });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal error" });
  }
}

async function getStock(req, res) {
  try {
    const { sku } = req.params;
    const redis = await getClient();
    const cached = await redis.get(`stock:${sku}`);
    if (cached) return res.json(JSON.parse(cached));

    const result = await pool.query("SELECT * FROM stock WHERE sku = $1", [sku]);
    if (result.rows.length === 0) return res.status(404).json({ error: "not found" });

    const row = result.rows[0];
    await redis.set(`stock:${sku}`, JSON.stringify(row), { EX: 60 });
    res.json(row);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal error" });
  }
}

async function listStock(req, res) {
  try {
    const result = await pool.query("SELECT * FROM stock ORDER BY last_updated DESC LIMIT 100");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal error" });
  }
}

async function updateStock(req, res) {
  try {
    const { sku } = req.params;
    const { qty, binId } = req.body;
    const result = await pool.query(
      `UPDATE stock SET qty = COALESCE($2, qty), bin_id = COALESCE($3, bin_id), last_updated = now()
       WHERE sku = $1 RETURNING *`,
      [sku, qty, binId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "not found" });

    const redis = await getClient();
    await redis.del(`stock:${sku}`);

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal error" });
  }
}

async function deleteStock(req, res) {
  try {
    const { sku } = req.params;
    await pool.query("DELETE FROM stock WHERE sku = $1", [sku]);
    const redis = await getClient();
    await redis.del(`stock:${sku}`);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal error" });
  }
}
async function listLowStock(req, res) {
  try {
    const result = await pool.query(
      "SELECT * FROM stock WHERE qty <= reorder_level ORDER BY qty ASC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal error" });
  }
}
module.exports = { createStock, getStock, listStock, updateStock, deleteStock, listLowStock };
