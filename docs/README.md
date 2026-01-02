# API Documentation

This directory contains the API documentation for the Todo application.

## OpenAPI Specification

The `openapi.yaml` file contains the complete OpenAPI 3.0 specification for the Todo API, including:

-   **Health Check Endpoint**: `/api/health` - Server health monitoring
-   **Task Management Endpoints**: `/api/tasks` - Full CRUD operations for tasks
-   **Soft Delete System**: Undo functionality with automatic cleanup

### Features Documented

-   **Task CRUD Operations**: Create, read, update, and delete tasks
-   **Soft Delete with Undo**: 5-second undo window for deleted tasks
-   **Automatic Cleanup**: Background removal of old soft-deleted tasks
-   **Deadline Management**: Set and track task deadlines with overdue indicators
-   **Pagination**: Support for paginated task listings
-   **Filtering**: Filter tasks by status (TODO, IN_PROGRESS, DONE)
-   **Sorting**: Sort tasks by creation date or deadline (nearest deadline first)
-   **Data Validation**: Proper request/response schemas with examples
-   **Error Handling**: Standardized error response formats

### Task Schema

Each task contains:

-   `id`: Unique identifier (integer)
-   `title`: Task title (required, string)
-   `description`: Task description (optional, string)
-   `status`: Task status (enum: TODO, IN_PROGRESS, DONE)
-   `deadline`: Task deadline (optional, ISO date-time string)
-   `deleted_at`: Soft delete timestamp (null if active, ISO date-time if deleted)
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

# Get tasks sorted by deadline (nearest first)
curl "http://localhost:3001/api/tasks?sort=deadline"

# Get tasks with pagination, filtering, and sorting
curl "http://localhost:3001/api/tasks?page=1&limit=5&status=TODO&sort=deadline"

# Create a new task
curl -X POST http://localhost:3001/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "New Task", "description": "Task description", "status": "TODO", "deadline": "2025-12-31T23:59:59.000Z"}'

# Soft delete a task (with 5-second undo window)
curl -X DELETE http://localhost:3001/api/tasks/1

# Restore a soft-deleted task (within 5 minutes)
curl -X PATCH http://localhost:3001/api/tasks/1/restore

# Permanently delete a task
curl -X DELETE http://localhost:3001/api/tasks/1/permanent

# Cleanup old soft-deleted tasks (older than 5 minutes)
curl -X DELETE "http://localhost:3001/api/tasks?olderThanMinutes=5"
```
