import React, { useState, useEffect } from 'react';
import TaskItem from '../../components/TaskItem/TaskItem';
import TaskForm from '../../components/TaskForm/TaskForm';
import TaskFilters from '../../components/TaskFilters/TaskFilters';
import PaginationControls from '../../components/PaginationControls/PaginationControls';
import tasksApi from '../../api/tasks';
import { TASKS_PER_PAGE } from '../../utils/constant';
import './TasksPage.css';

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);
  const [currentFilter, setCurrentFilter] = useState('ALL');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await tasksApi.getAllTasks(currentPage, TASKS_PER_PAGE, currentFilter);
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
  }, [currentPage, currentFilter]);

  const handleDeleteTask = async (id) => {
    try {
      await tasksApi.deleteTask(id);

      const data = await tasksApi.getAllTasks(currentPage, TASKS_PER_PAGE, currentFilter);

      if (data.tasks.length === 0 && currentPage > 1) {
        const prevPage = currentPage - 1;
        const prevPageData = await tasksApi.getAllTasks(prevPage, TASKS_PER_PAGE, currentFilter);
        setCurrentPage(prevPage);
        setTasks(prevPageData.tasks);
        setTotalPages(prevPageData.pagination.totalPages);
        setTotalTasks(prevPageData.pagination.totalTasks);
      } else {
        setTasks(data.tasks);
        setTotalPages(data.pagination.totalPages);
        setTotalTasks(data.pagination.totalTasks);
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      setTasks(tasks.filter((task) => task.id !== id));
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
      const data = await tasksApi.getAllTasks(currentPage, TASKS_PER_PAGE, currentFilter);
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
    setLoading(true);
  };

  const handleFilterChange = (newFilter) => {
    setCurrentFilter(newFilter);
    setCurrentPage(1);
    setLoading(true);
  };

  return (
    <div>
      <h1>My Tasks</h1>
      <TaskForm onTaskCreated={handleTaskCreated} />
      <TaskFilters currentFilter={currentFilter} onFilterChange={handleFilterChange} />

      {loading && (
        <div className="loading-indicator">
          <div className="loading-spinner"></div>
          <p>Loading tasks...</p>
        </div>
      )}

      <div className="tasks-list">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onDelete={handleDeleteTask}
            onUpdateStatus={handleUpdateTaskStatus}
            onUpdateTask={handleUpdateTask}
          />
        ))}
      </div>

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        totalTasks={totalTasks}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default TasksPage;
