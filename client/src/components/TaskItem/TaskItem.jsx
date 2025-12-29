import React, { useState } from 'react';
import './TaskItem.css';

const TaskItem = ({ task, onDelete, onUpdateStatus, onUpdateTask }) => {
  console.log('Task received in TaskItem:', task);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDescription, setEditedDescription] = useState(task.description);
  const [editedStatus, setEditedStatus] = useState(task.status);
  const [editedDeadline, setEditedDeadline] = useState(task.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : '');

  const handleDelete = () => {
    onDelete(task.id);
  };

  const handleChangeStatus = (e) => {
    onUpdateStatus(task.id, e.target.value);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setIsExpanded(true); // Expand when editing
  };

  const handleSaveEdit = () => {
    onUpdateTask(task.id, {
      title: editedTitle,
      description: editedDescription,
      status: editedStatus,
      deadline: editedDeadline || null
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedTitle(task.title);
    setEditedDescription(task.description);
    setEditedStatus(task.status);
    setEditedDeadline(task.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : '');
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString();
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return 'Invalid Date';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'TODO':
        return 'status-todo';
      case 'IN_PROGRESS':
        return 'status-in_progress';
      case 'DONE':
        return 'status-done';
      default:
        return '';
    }
  };

  const isOverdue = () => {
    if (!task.deadline || task.status === 'DONE') return false;
    return new Date(task.deadline) < new Date();
  };

  const getDeadlineStatus = () => {
    if (!task.deadline) return null;
    if (task.status === 'DONE') return 'completed';
    const now = new Date();
    const deadline = new Date(task.deadline);
    const timeDiff = deadline - now;
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    if (timeDiff < 0) return 'overdue';
    if (hoursDiff <= 24) return 'urgent';
    if (hoursDiff <= 72) return 'warning';
    return 'normal';
  };

  return (
    <div className={`task-item ${getStatusClass(task.status)} ${isOverdue() ? 'overdue' : ''}`}>
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
            <div className="task-edit-form">
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                required
              />
              <textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
              ></textarea>
              <select
                value={editedStatus}
                onChange={(e) => setEditedStatus(e.target.value)}
              >
                <option value="TODO">TODO</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="DONE">DONE</option>
              </select>
              <input
                type="datetime-local"
                value={editedDeadline}
                onChange={(e) => setEditedDeadline(e.target.value)}
                placeholder="Deadline (optional)"
              />
              <div className="edit-form-actions">
                <button onClick={handleSaveEdit}>Save</button>
                <button onClick={handleCancelEdit} className="secondary">Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <p><strong>Description:</strong> {task.description}</p>
              <p>
                <strong>Status:</strong>
                <select value={task.status} onChange={handleChangeStatus} className="status-select">
                  <option value="TODO">TODO</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="DONE">DONE</option>
                </select>
              </p>
          <p><strong>Created At:</strong> {formatDateTime(task.created_at)}</p>
          <p><strong>Updated At:</strong> {formatDateTime(task.updated_at)}</p>
          {task.deadline && (
            <div className={`deadline-badge deadline-${getDeadlineStatus()}`}>
              <span className="deadline-icon">⏰</span>
              <span className="deadline-text">
                <strong>Deadline:</strong> {formatDateTime(task.deadline)}
              </span>
            </div>
          )}
          {!task.deadline && (
            <div className="deadline-badge deadline-none">
              <span className="deadline-icon">📅</span>
              <span className="deadline-text">No deadline set</span>
            </div>
          )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskItem;
