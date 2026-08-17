const express = require("express");
const amqp = require("amqplib");

const app = express();
const PORT = process.env.PORT || 4003;
const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://rabbitmq:5672";
const QUEUE = "warehouse.events";

app.get("/health", (req, res) => res.json({ status: "ok", service: "notification-service" }));

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

async function startConsumer() {
  const conn = await connectWithRetry();
  const channel = await conn.createChannel();
  await channel.assertQueue(QUEUE, { durable: true });

  console.log(`notification-service listening on queue "${QUEUE}"`);

  channel.consume(QUEUE, (msg) => {
    if (!msg) return;
    const event = JSON.parse(msg.content.toString());
    console.log(`[notification] received event:`, event);

    if (event.type === "LOW_STOCK") {
      console.log(`ALERT: SKU ${event.sku} is low on stock (qty=${event.qty})`);
    } else if (event.type === "SCAN") {
      console.log(`INFO: scan event received for SKU ${event.sku} at bin ${event.binId}`);
    }

    channel.ack(msg);
  });
}

app.listen(PORT, () => {
  console.log(`notification-service HTTP health endpoint on port ${PORT}`);
});

startConsumer().catch((err) => {
  console.error("Failed to start RabbitMQ consumer:", err.message);
});
