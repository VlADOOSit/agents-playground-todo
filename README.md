# TODO Application

A Node.js + React + Postgres TODO application scaffold. The backend follows an MVC-inspired layout with Express and `pg`, and the frontend is a React + Vite starter.

## Project structure
- `server/` – Express API following MVC patterns (controllers, routes, models). Includes a health endpoint at `/api/health`.
- `client/` – React + Vite frontend scaffold ready to consume the API.

## Getting started

### Backend (server)
1. Navigate to `server/` and install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and adjust the values:
   ```bash
   cp .env.example .env
   ```
3. Start the API:
   ```bash
   npm run dev
   ```

### Frontend (client)
1. Navigate to `client/` and install dependencies:
   ```bash
   npm install
   ```
2. Run the development server:
   ```bash
   npm run dev
   ```

## Health check
The API exposes a health check at `GET /api/health` returning `{ "status": "ok" }`.
