import React, { useState, useEffect } from 'react';
import TaskItem from '../components/TaskItem';
import tasksApi from '../api/tasks';

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskStatus, setNewTaskStatus] = useState('TODO');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await tasksApi.getAllTasks();
        console.log('Fetched tasks data:', data);
        setTasks(data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };
    fetchTasks();
  }, []);

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

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const newTask = await tasksApi.createTask({
        title: newTaskTitle,
        description: newTaskDescription,
        status: newTaskStatus,
      });
      setTasks([...tasks, newTask]);
      setNewTaskTitle('');
      setNewTaskDescription('');
      setNewTaskStatus('TODO');
    } catch (error) {
      console.error('Error creating task:', error);
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

  return (
    <div>
      <h1>My Tasks</h1>
      <form onSubmit={handleCreateTask} style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', maxWidth: '400px', margin: '0 auto' }}>
        <input
          type="text"
          placeholder="Task Title"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          required
          style={{ padding: '8px', marginBottom: '10px' }}
        />
        <textarea
          placeholder="Task Description"
          value={newTaskDescription}
          onChange={(e) => setNewTaskDescription(e.target.value)}
          style={{ padding: '8px', marginBottom: '10px' }}
        ></textarea>
        <select
          value={newTaskStatus}
          onChange={(e) => setNewTaskStatus(e.target.value)}
          style={{ padding: '8px', marginBottom: '10px' }}
        >
          <option value="TODO">TODO</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="DONE">DONE</option>
        </select>
        <button type="submit" style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>Add Task</button>
      </form>
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
    </div>
  );
};

export default TasksPage;

