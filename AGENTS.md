Project: a simple TODO application on the Node.js + React + Postgres stack (node-postgres/pg), without ORM.

## 1. Repository Structure

Recommended Structure

client/ React (Vite)
server/ Node.js API
README.md

## 2. Stack and Limitations

Backend:

-   Node.js (LTS), Express API
-   Database access only via `pg` (node-postgres): `Pool`, parameterized queries
-   Migrations via SQL files (simple and reproducible)
-   create a .env file

Frontend:

-   React + Vite
-   Simple component architecture, without unnecessary frameworks

Tasks Schema (minimal contract):

-   id: SERIAL primary key
-   title: text, not null
-   description: text, nullable
-   status: enum-like value from the set `TODO | IN_PROGRESS | DONE`
-   created_at: timestamptz, default now()
-   updated_at: timestamptz, default now() (and update at the application level during update)
