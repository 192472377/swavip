# SWAIVP — Smart Warehouse Automation and Inventory Visibility Platform

A containerized, microservice-based platform for real-time warehouse inventory
tracking, automated stock alerts, and multi-warehouse visibility.

## Architecture

- **api-gateway** (port 8080) — single entry point, routes requests to services
- **inventory-service** (port 4001) — stock CRUD, low-stock alerts, Postgres + Redis
- **warehouse-service** (port 4002) — warehouses, zones, bins, Postgres
- **notification-service** (port 4003) — consumes RabbitMQ events, sends alerts
- **iot-ingestion-service** (port 4004) — receives scanner/sensor events, publishes to RabbitMQ
- **frontend** (port 3000) — React dashboard served via Nginx
- **postgres**, **redis**, **rabbitmq** — infrastructure

## Prerequisites

- Docker Desktop / Docker Engine + Compose plugin
- Git

## Quick start

```bash
git clone https://github.com/<your-username>/swaivp.git
cd swaivp
cp .env.example .env
docker compose up -d --build
docker compose ps
```

- Dashboard: http://localhost:3000
- API Gateway: http://localhost:8080
- RabbitMQ management UI: http://localhost:15672 (guest/guest)

## Test the API

```bash
curl -X POST http://localhost:8080/api/inventory/stock \
  -H "Content-Type: application/json" \
  -d '{"sku":"WH-1029","qty":150,"binId":"A1-04"}'

curl http://localhost:8080/api/inventory/stock/WH-1029
```

## Stop everything

```bash
docker compose down        # keep data
docker compose down -v     # wipe volumes too
```

## Branching strategy

This repo follows Gitflow: `main` (production), `develop` (integration),
`feature/*`, `release/*`, `hotfix/*`. See the technical report in `docs/`
for full details.
