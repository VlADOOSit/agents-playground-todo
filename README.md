# To-Do App

This is a simple full-stack to-do application built with React, Node.js (Express), and PostgreSQL.

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
