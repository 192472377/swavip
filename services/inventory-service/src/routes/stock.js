const express = require("express");
const router = express.Router();
const {
  createStock,
  getStock,
  listStock,
  updateStock,
  deleteStock,
} = require("../controllers/stockController");

router.get("/stock", listStock);
router.post("/stock", createStock);
router.get("/stock/:sku", getStock);
router.put("/stock/:sku", updateStock);
router.delete("/stock/:sku", deleteStock);

module.exports = router;
