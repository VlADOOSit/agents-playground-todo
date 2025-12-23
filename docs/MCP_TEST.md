# Project Overview

## Key Project Folders

-   `server/`: Contains the Node.js backend application.
-   `client/`: Contains the React frontend application.

## Node.js API Routes

### Task Routes (`server/routes/taskRoutes.js`)

-   `POST /` - `createTask`
-   `GET /` - `getAllTasks`
-   `GET /:id` - `getTaskById`
-   `PUT /:id` - `updateTask`
-   `DELETE /:id` - `deleteTask`

### Health Routes (`server/routes/healthRoutes.js`)

-   `GET /` - `getHealth`

## Task Fields

The `tasks` table has the following fields:

-   `id`: SERIAL PRIMARY KEY
-   `title`: TEXT NOT NULL
-   `description`: TEXT
-   `status`: task_status NOT NULL DEFAULT 'TODO' (Enum: 'TODO', 'IN_PROGRESS', 'DONE')
-   `created_at`: TIMESTAMPTZ NOT NULL DEFAULT NOW()
-   `updated_at`: TIMESTAMPTZ NOT NULL DEFAULT NOW()

Generated with MCP filesystem tool
