# To-Do App

This is a full-stack to-do application built with React, Node.js (Express), and PostgreSQL. Features include task management with soft delete and undo functionality.

## Features

-   ✅ Create, read, update, and delete tasks
-   ✅ Task filtering by status (All, TODO, IN_PROGRESS, DONE)
-   ✅ Task sorting by creation date or deadline
-   ✅ Pagination support
-   ✅ **Soft delete with undo functionality** - Delete tasks with 5-second undo window
-   ✅ Responsive UI with modern design
-   ✅ Docker Compose support for easy deployment

## Running Locally

Follow these steps to set up and run the application locally:

### 1. Start the PostgreSQL Database

You can start a local PostgreSQL database using Docker. Make sure Docker is installed and running on your system.

First, **manually create** a `.env` file in the `server/` directory with the following content:

```
DATABASE_URL=postgres://postgres:postgres@localhost:5432/todo
```

Make sure the `DATABASE_URL` in the `.env` file matches the credentials used in the Docker command.

Then, run the following Docker command to start the PostgreSQL database:

```bash
docker run --name todo-postgres -e POSTGRES_DB=todo -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:13-alpine
```

### 2. Backend Setup (server/)

Navigate to the `server` directory, install dependencies, and run migrations.

```bash
cd server
npm install
npm run db:migrate
npm start
```

### 3. Frontend Setup (client/)

Navigate to the `client` directory and install dependencies.

```bash
cd client
npm install
npm run dev
```

Access the frontend application at `http://localhost:5173`.

## Running with Docker Compose

For a simpler setup using Docker Compose, follow these steps:

### Prerequisites

-   Docker and Docker Compose must be installed on your system

### Quick Start

1. **Clone the repository and navigate to the project directory**

2. **Start all services with Docker Compose:**

```bash
docker-compose up --build
```

This command will:

-   Build and start the PostgreSQL database
-   Build and start the Node.js backend server
-   Build and start the React frontend

3. **Access the application:**
    - Frontend: `http://localhost:5173`
    - Backend API: `http://localhost:3001`

### Docker Compose Commands

-   **Start in detached mode:** `docker-compose up -d --build`
-   **Stop services:** `docker-compose down`
-   **View logs:** `docker-compose logs -f`
-   **Rebuild and restart:** `docker-compose up --build --force-recreate`

### Development

For development with hot reloading, use the individual setup instructions above. Docker Compose is ideal for production deployment or quick testing.

## Undo Delete Feature

The application includes a soft delete system with undo functionality:

-   **Delete a task** → Task is marked as deleted (not permanently removed)
-   **Undo window** → 5-second countdown with "Undo" button
-   **Restore** → Click "Undo" to restore the task immediately
-   **Auto-cleanup** → Tasks deleted >5 minutes ago are permanently removed
-   **Background cleanup** → Automatic cleanup runs every minute

### API Endpoints

-   `DELETE /api/tasks/:id` - Soft delete task
-   `PATCH /api/tasks/:id/restore` - Restore soft-deleted task
-   `DELETE /api/tasks/:id/permanent` - Permanently delete task
-   `DELETE /api/tasks?olderThanMinutes=X` - Cleanup old deleted tasks
