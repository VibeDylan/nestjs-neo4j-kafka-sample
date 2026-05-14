# Knowledge Graph Service

A NestJS microservice that manages a product knowledge graph using Neo4j as the graph database and Kafka for event-driven communication.

## Overview

This service stores products and their relationships (categories, brands, compatibility) in a Neo4j graph database. It listens to Kafka events from other services to keep the graph in sync, and exposes a REST API for querying graph-specific data such as similar or compatible products.

## Architecture

```
REST API (HTTP :3000)
        │
        ▼
ProductsController
        │
        ▼
ProductsService ──────────── KafkaService (producer)
        │                           │
        ▼                           ▼
ProductRepository            Kafka Broker
        │                    (product.created / updated / deleted)
        ▼
    Neo4j DB
        ◀────────────── ProductConsumer (Kafka consumer)
```

## Tech Stack

- **Framework**: NestJS 11
- **Graph Database**: Neo4j 6 (via `neo4j-driver`)
- **Message Broker**: Apache Kafka (via `kafkajs`)
- **Language**: TypeScript 5

## Prerequisites

- Node.js >= 18
- Neo4j instance running
- Kafka broker running

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file at the root:

```env
# Neo4j
NEO4J_SCHEME=neo4j
NEO4J_HOST=localhost
NEO4J_PORT=7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=password123
NEO4J_DATABASE=neo4j

# Kafka
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=knowledge-graph-service
KAFKA_GROUP_ID=kg-consumer-group
```

## Running the Service

```bash
# Development (watch mode)
npm run start:dev

# Production
npm run build
npm run start:prod
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/products` | Create a product |
| `GET` | `/products` | List all products (limit 20) |
| `GET` | `/products/:id` | Get a product by ID |
| `PATCH` | `/products/:id` | Update a product |
| `DELETE` | `/products/:id` | Delete a product |
| `GET` | `/products/:id/similar` | Get similar products (same category, close price) |
| `GET` | `/products/:id/compatible` | Get compatible products |

### Create Product — Request Body

```json
{
  "nom": "Product Name",
  "prix": 49.99,
  "stock": 100,
  "description": "Optional description",
  "categorieId": "optional-category-id",
  "marqueId": "optional-brand-id"
}
```

## Kafka Topics

| Topic | Direction | Description |
|-------|-----------|-------------|
| `product.created` | Produced | Published when a product is created |
| `product.updated` | Consumed | Consumed to sync product updates into Neo4j |
| `product.deleted` | Produced | Published when a product is deleted |
| `category.updated` | — | Reserved for category sync |
| `stock.changed` | — | Reserved for stock sync |

## Project Structure

```
src/
├── config/
│   ├── kafka.config.ts           # Kafka env configuration
│   └── neo4j.config.ts           # Neo4j env configuration
├── kafka/
│   ├── consumers/
│   │   └── product.consumer.ts   # Handles product.updated events
│   ├── kafka.module.ts
│   └── kakfa.service.ts          # Producer + consumer lifecycle
├── neo4j/
│   ├── repositories/
│   │   └── product.repository.ts # Cypher queries
│   ├── neo4j.module.ts
│   └── neo4j.service.ts          # Driver + session management
├── products/
│   ├── dto/
│   │   ├── create-product.dto.ts
│   │   └── update-product.dto.ts
│   ├── product.controller.ts
│   ├── product.module.ts
│   └── product.service.ts
└── shared/
    ├── constants/
    │   └── topics.constants.ts   # Kafka topic names
    └── interfaces/
        └── events.interface.ts
```

## Scripts

```bash
npm run start:dev     # Start in watch mode
npm run build         # Compile TypeScript
npm run start:prod    # Run compiled output
npm run lint          # Lint and auto-fix
npm run test          # Run unit tests
npm run test:cov      # Run tests with coverage
```
