const express = require("express");
const amqp = require("amqplib");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4004;
const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://rabbitmq:5672";
const QUEUE = "warehouse.events";

let channel;

async function connectWithRetry(retries = 10, delayMs = 3000) {
  for (let i = 0; i < retries; i++) {
    try {
      const conn = await amqp.connect(RABBITMQ_URL);
      return conn;
    } catch (err) {
      console.warn(`RabbitMQ not ready (attempt ${i + 1}/${retries}), retrying in ${delayMs}ms...`);
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw new Error("Could not connect to RabbitMQ after retries");
}

async function init() {
  const conn = await connectWithRetry();
  channel = await conn.createChannel();
  await channel.assertQueue(QUEUE, { durable: true });
  console.log("iot-ingestion-service connected to RabbitMQ");
}

app.get("/health", (req, res) => res.json({ status: "ok", service: "iot-ingestion-service" }));

// Simulates a barcode/RFID scan event from a warehouse device
app.post("/scan", async (req, res) => {
  try {
    const { sku, binId, qty } = req.body;
    if (!sku) return res.status(400).json({ error: "sku is required" });

    const event = { type: "SCAN", sku, binId, qty, timestamp: new Date().toISOString() };
    channel.sendToQueue(QUEUE, Buffer.from(JSON.stringify(event)), { persistent: true });

    res.status(202).json({ status: "queued", event });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal error" });
  }
});

app.listen(PORT, () => {
  console.log(`iot-ingestion-service listening on port ${PORT}`);
});

init().catch((err) => console.error("Failed to init RabbitMQ:", err.message));
