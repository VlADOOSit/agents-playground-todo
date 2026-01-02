import React, { useState } from 'react';
import { getStatusClass, isOverdue } from '../../utils/taskUtils';
import TaskDetails from '../TaskDetails/TaskDetails';
import TaskEditForm from '../TaskEditForm/TaskEditForm';
import './TaskItem.css';

const TaskItem = ({ task, onDelete, onUpdateStatus, onUpdateTask }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleDelete = () => {
    onDelete(task.id);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setIsExpanded(true);
  };

  const handleSaveEdit = (updatedTaskData) => {
    onUpdateTask(task.id, updatedTaskData);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  return (
    <div className={`task-item ${getStatusClass(task.status)} ${isOverdue(task) ? 'overdue' : ''}`}>
      <div className="task-item-header">
        <h3>{task.title}</h3>
        <div className="task-item-actions">
          {!isEditing && <button onClick={handleEdit}>Edit</button>}
          <button onClick={handleDelete} className="danger">Delete</button>
          <button onClick={() => setIsExpanded(!isExpanded)} className="expand-button">
            {isExpanded ? '∧' : '∨'}
          </button>
        </div>
      </div>
      {isExpanded && (
        <div className="task-item-details">
          {isEditing ? (
            <TaskEditForm
              task={task}
              onSave={handleSaveEdit}
              onCancel={handleCancelEdit}
            />
          ) : (
            <TaskDetails task={task} onUpdateStatus={onUpdateStatus} />
          )}
        </div>
      )}
    </div>
  );
};

export default TaskItem;
