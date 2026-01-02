import { useState, useEffect } from 'react';
import TaskItem from '../../components/TaskItem/TaskItem';
import TaskForm from '../../components/TaskForm/TaskForm';
import TaskFilters from '../../components/TaskFilters/TaskFilters';
import PaginationControls from '../../components/PaginationControls/PaginationControls';
import ToastContainer from '../../components/Toast/ToastContainer';
import { useToast } from '../../hooks/useToast';
import tasksApi from '../../api/tasks';
import { TASKS_PER_PAGE } from '../../utils/constant';
import { getInitialState, updateQueryParams, getQueryParams } from '../../utils/urlUtils';
import './TasksPage.css';

const TasksPage = () => {
  const initialState = getInitialState();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(initialState.page);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);
  const [currentFilter, setCurrentFilter] = useState(initialState.status);
  const [currentSort, setCurrentSort] = useState(initialState.sort);
  const { toasts, addToast, dismissToast } = useToast();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await tasksApi.getAllTasks(currentPage, TASKS_PER_PAGE, currentFilter, currentSort);
        console.log('Fetched tasks data:', data);
        setTasks(data.tasks);
        setTotalPages(data.pagination.totalPages);
        setTotalTasks(data.pagination.totalTasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [currentPage, currentFilter, currentSort]);

  useEffect(() => {
    const handlePopState = () => {
      const params = getQueryParams();
      setCurrentPage(params.page);
      setCurrentFilter(params.status);
      setCurrentSort(params.sort);
      setLoading(true);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Periodic cleanup of old deleted tasks
  useEffect(() => {
    const cleanupInterval = setInterval(async () => {
      try {
        await tasksApi.cleanupDeletedTasks(5); // Clean tasks older than 5 minutes
      } catch (error) {
        console.error('Error during cleanup:', error);
      }
    }, 60000); // Run every minute

    return () => clearInterval(cleanupInterval);
  }, []);

  const handleDeleteTask = async (id) => {
    try {
      // Soft delete on backend
      await tasksApi.deleteTask(id);

      // Refetch data to get correct tasks for current page (including any that moved from next page)
      const data = await tasksApi.getAllTasks(currentPage, TASKS_PER_PAGE, currentFilter, currentSort);
      setTasks(data.tasks);
      setTotalPages(data.pagination.totalPages);
      setTotalTasks(data.pagination.totalTasks);

      // Show undo toast
      addToast('Task deleted', {
        onUndo: () => handleUndoDelete(id),
        onTimeout: () => handlePermanentDelete(id),
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      addToast('Failed to delete task. Please try again.', {
        duration: 3000,
        showCountdown: false,
      });
    }
  };

  const handleUndoDelete = async (id) => {
    try {
      // First restore the task in the database
      await tasksApi.restoreTask(id);

      // Then refresh the tasks list to get the restored task
      const data = await tasksApi.getAllTasks(currentPage, TASKS_PER_PAGE, currentFilter, currentSort);
      setTasks(data.tasks);
      setTotalPages(data.pagination.totalPages);
      setTotalTasks(data.pagination.totalTasks);

      addToast('Task restored successfully', {
        duration: 2000,
        showCountdown: false,
      });
    } catch (error) {
      console.error('Error restoring task:', error);
      addToast('Failed to restore task. It may have been permanently deleted.', {
        duration: 3000,
        showCountdown: false,
      });
    }
  };

  const handlePermanentDelete = async (id) => {
    try {
      await tasksApi.permanentDeleteTask(id);
    } catch (error) {
      console.error('Error permanently deleting task:', error);
      // This is a cleanup operation, so we don't show user errors for this
    }
  };

  const handleUpdateTaskStatus = async (id, newStatus) => {
    try {
      const updatedTask = await tasksApi.updateTask(id, { status: newStatus });
      setTasks(
        tasks.map((task) =>
          task.id === id ? { ...task, status: updatedTask.status, updatedAt: updatedTask.updatedAt } : task
        )
      );
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleTaskCreated = async (newTask) => {
    try {
      const data = await tasksApi.getAllTasks(currentPage, TASKS_PER_PAGE, currentFilter, currentSort);
      setTasks(data.tasks);
      setTotalPages(data.pagination.totalPages);
      setTotalTasks(data.pagination.totalTasks);
    } catch (error) {
      console.error('Error refetching tasks after creation:', error);
      setTasks([newTask, ...tasks]);
    }
  };

  const handleUpdateTask = async (id, updatedFields) => {
    try {
      const updatedTask = await tasksApi.updateTask(id, updatedFields);
      setTasks(
        tasks.map((task) =>
          task.id === id ? { ...task, ...updatedTask, updatedAt: updatedTask.updatedAt } : task
        )
      );
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    updateQueryParams({ page: newPage, status: currentFilter, sort: currentSort });
    setLoading(true);
  };

  const handleFilterChange = (newFilter) => {
    if (currentFilter === newFilter) {
      return;
    }
    setCurrentFilter(newFilter);
    setCurrentPage(1);
    updateQueryParams({ page: 1, status: newFilter, sort: currentSort });
    setLoading(true);
  };

  const handleSortChange = (newSort) => {
    setCurrentSort(newSort);
    setCurrentPage(1);
    updateQueryParams({ page: 1, status: currentFilter, sort: newSort });
    setLoading(true);
  };

  return (
    <div>
      <h1>My Tasks</h1>
      <TaskForm onTaskCreated={handleTaskCreated} />
      <TaskFilters
        currentFilter={currentFilter}
        onFilterChange={handleFilterChange}
        currentSort={currentSort}
        onSortChange={handleSortChange}
      />

      {loading && (
        <div className="loading-indicator">
          <div className="loading-spinner"></div>
          <p>Loading tasks...</p>
        </div>
      )}

      <div className="tasks-list">
        {tasks.length === 0 && !loading ? (
          <div className="no-tasks-message">
            <p>Tasks not found</p>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onDelete={handleDeleteTask}
              onUpdateStatus={handleUpdateTaskStatus}
              onUpdateTask={handleUpdateTask}
            />
          ))
        )}
      </div>

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        totalTasks={totalTasks}
        onPageChange={handlePageChange}
      />

      <ToastContainer toasts={toasts} onDismissToast={dismissToast} />
    </div>
  );
};

export default TasksPage;
