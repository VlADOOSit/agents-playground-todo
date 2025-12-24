import React, { useState } from 'react';
import tasksApi from '../api/tasks';

const TaskForm = ({ onTaskCreated }) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskStatus, setNewTaskStatus] = useState('TODO');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const newTask = await tasksApi.createTask({
        title: newTaskTitle,
        description: newTaskDescription,
        status: newTaskStatus,
      });
      onTaskCreated(newTask);
      setNewTaskTitle('');
      setNewTaskDescription('');
      setNewTaskStatus('TODO');
      setIsExpanded(false);
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleForm = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="task-form-container">
      <button
        type="button"
        onClick={toggleForm}
        className="create-task-button"
        disabled={isSubmitting}
      >
        {isExpanded ? 'Cancel' : 'Create Task'}
      </button>

      {isExpanded && (
        <form onSubmit={handleCreateTask} className="task-form">
          <input
            type="text"
            placeholder="Task Title"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            required
            disabled={isSubmitting}
          />
          <textarea
            placeholder="Task Description"
            value={newTaskDescription}
            onChange={(e) => setNewTaskDescription(e.target.value)}
            disabled={isSubmitting}
          ></textarea>
          <select
            value={newTaskStatus}
            onChange={(e) => setNewTaskStatus(e.target.value)}
            disabled={isSubmitting}
          >
            <option value="TODO">TODO</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="DONE">DONE</option>
          </select>
          <div className="form-actions">
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Task'}
            </button>
            <button type="button" onClick={toggleForm} className="cancel-button" disabled={isSubmitting}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default TaskForm;
