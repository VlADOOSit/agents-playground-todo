import React, { useState, useEffect } from 'react';
import TaskItem from '../components/TaskItem';
import TaskForm from '../components/TaskForm';
import PaginationControls from '../components/PaginationControls';
import tasksApi from '../api/tasks';

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await tasksApi.getAllTasks(currentPage, 5);
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
  }, [currentPage]);

  const handleDeleteTask = async (id) => {
    try {
      await tasksApi.deleteTask(id);
      setTasks(tasks.filter((task) => task.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
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

  const handleTaskCreated = (newTask) => {
    setTasks([newTask, ...tasks]);
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

  return (
    <div>
      <h1>My Tasks</h1>
      <TaskForm onTaskCreated={handleTaskCreated} />

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

