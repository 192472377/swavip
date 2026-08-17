const express = require("express");
const zonesRoutes = require("./routes/zones");

const app = express();
const PORT = process.env.PORT || 4002;

app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok", service: "warehouse-service" }));
app.use("/warehouse", zonesRoutes);

app.listen(PORT, () => {
  console.log(`warehouse-service listening on port ${PORT}`);
});
