const express = require("express");
const cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
const PORT = process.env.PORT || 4000;

const INVENTORY_URL = process.env.INVENTORY_URL || "http://inventory-service:4001";
const WAREHOUSE_URL = process.env.WAREHOUSE_URL || "http://warehouse-service:4002";

app.use(cors());

app.get("/health", (req, res) => res.json({ status: "ok", service: "api-gateway" }));

app.use(
  "/api/inventory",
  createProxyMiddleware({
    target: INVENTORY_URL,
    changeOrigin: true,
    pathRewrite: { "^/api/inventory": "/inventory" },
  })
);

app.use(
  "/api/warehouse",
  createProxyMiddleware({
    target: WAREHOUSE_URL,
    changeOrigin: true,
    pathRewrite: { "^/api/warehouse": "/warehouse" },
  })
);

app.listen(PORT, () => {
  console.log(`api-gateway listening on port ${PORT}`);
});
