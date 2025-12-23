# TODO Application

A Node.js + React + Postgres TODO application scaffold. The backend follows an MVC-inspired layout with Express and `pg`, and the frontend is a React + Vite starter.

## Project structure
- `server/` – Express API following MVC patterns (controllers, routes, models). Includes a health endpoint at `/api/health`.
- `client/` – React + Vite frontend scaffold ready to consume the API.

## Running the app locally

### Prerequisites
- Node.js LTS installed.
- A running Postgres instance with a database available for the app. The default connection string expects `postgres:postgres@localhost:5432/todo`.

### Backend (server)
1. Navigate to `server/` and install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and adjust the values (especially `DATABASE_URL` if your Postgres connection differs):
   ```bash
   cp .env.example .env
   ```
3. Run database migrations against your Postgres instance:
   ```bash
   npm run db:migrate
   ```
4. Start the API (defaults to port `3001`):
   ```bash
   npm run dev
   ```

### Frontend (client)
1. In a separate terminal, navigate to `client/` and install dependencies:
   ```bash
   npm install
   ```
2. Run the development server (defaults to port `5173`):
   ```bash
   npm run dev
   ```
3. Open the printed local URL (for example, `http://localhost:5173/`). The frontend is preconfigured to call the API on `http://localhost:3001`.

## Health check
The API exposes a health check at `GET /api/health` returning `{ "status": "ok" }`.
