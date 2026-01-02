# TODO Application

A Node.js + React + Postgres TODO application scaffold. The backend follows an MVC-inspired layout with Express and `pg`, and the frontend is a React + Vite starter.

## Project structure

-   `server/` - Express API following MVC patterns (controllers, routes, models). Includes a health endpoint at `/api/health`.
-   `client/` - React + Vite frontend scaffold ready to consume the API.

## Running the app locally

### Prerequisites

-   Node.js LTS installed.
-   A running Postgres instance with a database available for the app. The default connection string expects `postgres:postgres@localhost:5432/todo`.

To run db in docker

```
docker run --name todo-postgres -e POSTGRES_DB=todo -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:13-alpine
```

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

## Running the stack with Docker Compose

1. Build and start the services from the project root:
    ```bash
    docker compose up --build
    ```
    This starts three containers:
    - `postgres` on port `5432`
    - `server` on port `3001` (runs migrations automatically on start)
    - `client` on port `5173`
2. Open `http://localhost:5173` to access the React frontend. The frontend talks to the API via `http://server:3001/api` inside the Compose network.
3. To stop the stack, press `Ctrl+C` and optionally remove containers and the Postgres volume:
    ```bash
    docker compose down -v
    ```

## Task schema

-   `id`: serial primary key
-   `title`: text, required
-   `description`: text, nullable
-   `status`: enum-like string `TODO | IN_PROGRESS | DONE`
-   `deadline`: optional ISO 8601 datetime (stored as `timestamptz`); send `null` to clear it
-   `deleted_at`: nullable timestamp used for soft deletes. `DELETE /api/tasks/:id` sets this to `now()`, all list/count queries exclude deleted tasks, and `POST /api/tasks/:id/undo` clears it if called within 5 seconds of deletion.
-   `created_at` / `updated_at`: timestamps managed by the API (update sets `updated_at`)

## Health check

The API exposes a health check at `GET /api/health` returning `{ "status": "ok" }`.
