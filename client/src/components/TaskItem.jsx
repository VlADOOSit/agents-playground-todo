import React, { useState } from 'react';

const TaskItem = ({ task, onDelete, onUpdateStatus, onUpdateTask }) => {
  console.log('Task received in TaskItem:', task);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDescription, setEditedDescription] = useState(task.description);
  const [editedStatus, setEditedStatus] = useState(task.status);

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
    onUpdateTask(task.id, { title: editedTitle, description: editedDescription, status: editedStatus });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedTitle(task.title);
    setEditedDescription(task.description);
    setEditedStatus(task.status);
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

  return (
    <div className="task-item">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>{task.title}</h3>
        <div>
          <button onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
          {!isEditing && <button onClick={handleEdit} style={{ marginLeft: '10px' }}>Edit</button>}
          <button onClick={handleDelete} style={{ marginLeft: '10px' }}>Delete</button>
        </div>
      </div>
      {isExpanded && (
        <div style={{ marginTop: '10px' }}>
          {isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                required
                style={{ padding: '8px', marginBottom: '10px' }}
              />
              <textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                style={{ padding: '8px', marginBottom: '10px' }}
              ></textarea>
              <select
                value={editedStatus}
                onChange={(e) => setEditedStatus(e.target.value)}
                style={{ padding: '8px', marginBottom: '10px' }}
              >
                <option value="TODO">TODO</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="DONE">DONE</option>
              </select>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={handleSaveEdit} style={{ marginRight: '10px' }}>Save</button>
                <button onClick={handleCancelEdit}>Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <p><strong>Description:</strong> {task.description}</p>
              <p>
                <strong>Status:</strong>
                <select value={task.status} onChange={handleChangeStatus} style={{ marginLeft: '10px' }}>
                  <option value="TODO">TODO</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="DONE">DONE</option>
                </select>
              </p>
          <p><strong>Created At:</strong> {formatDateTime(task.created_at)}</p>
          <p><strong>Updated At:</strong> {formatDateTime(task.updated_at)}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskItem;
