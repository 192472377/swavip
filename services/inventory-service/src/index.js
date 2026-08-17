const express = require("express");
const stockRoutes = require("./routes/stock");

const app = express();
const PORT = process.env.PORT || 4001;

app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok", service: "inventory-service" }));
app.use("/inventory", stockRoutes);

app.listen(PORT, () => {
  console.log(`inventory-service listening on port ${PORT}`);
});
