# API Documentation

This directory contains the API documentation for the Todo application.

## OpenAPI Specification

The `openapi.yaml` file contains the complete OpenAPI 3.0 specification for the Todo API, including:

-   **Health Check Endpoint**: `/api/health` - Server health monitoring
-   **Task Management Endpoints**: `/api/tasks` - Full CRUD operations for tasks

### Features Documented

-   **Task CRUD Operations**: Create, read, update, and delete tasks
-   **Pagination**: Support for paginated task listings
-   **Filtering**: Filter tasks by status (TODO, IN_PROGRESS, DONE)
-   **Data Validation**: Proper request/response schemas with examples
-   **Error Handling**: Standardized error response formats

### Task Schema

Each task contains:

-   `id`: Unique identifier (integer)
-   `title`: Task title (required, string)
-   `description`: Task description (optional, string)
-   `status`: Task status (enum: TODO, IN_PROGRESS, DONE)
-   `created_at`: Creation timestamp
-   `updated_at`: Last update timestamp

### Using the Documentation

You can view and interact with this API documentation using tools like:

-   **Swagger UI**: Import the `openapi.yaml` file
-   **Postman**: Import the OpenAPI spec
-   **Insomnia**: Import the OpenAPI spec
-   **Redoc**: Generate HTML documentation from the YAML file

### Server Information

-   **Development**: `http://localhost:3001/api`
-   **Production**: `https://api.todoapp.com/api`

### Example Usage

```bash
# Health check
curl http://localhost:3001/api/health

# Get all tasks (paginated)
curl "http://localhost:3001/api/tasks?page=1&limit=10"

# Get tasks by status
curl "http://localhost:3001/api/tasks?status=TODO"

# Create a new task
curl -X POST http://localhost:3001/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "New Task", "description": "Task description", "status": "TODO"}'
```
