const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgres://swaivp:swaivp@postgres:5432/swaivp",
});

module.exports = { pool };
