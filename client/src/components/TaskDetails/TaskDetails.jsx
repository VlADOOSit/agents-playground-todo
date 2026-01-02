import React from 'react';
import { formatDateTime, getDeadlineStatus, TASK_STATUS_OPTIONS } from '../../utils/taskUtils';
import './TaskDetails.css';

const TaskDetails = ({ task, onUpdateStatus }) => {
  const handleChangeStatus = (e) => {
    onUpdateStatus(task.id, e.target.value);
  };

  const deadlineStatus = getDeadlineStatus(task);

  return (
    <div className="task-details">
      <p><strong>Description:</strong> {task.description}</p>

      <p>
        <strong>Status:</strong>
        <select
          value={task.status}
          onChange={handleChangeStatus}
          className="status-select"
        >
          {TASK_STATUS_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </p>

      <p><strong>Created At:</strong> {formatDateTime(task.created_at)}</p>
      <p><strong>Updated At:</strong> {formatDateTime(task.updated_at)}</p>

      {task.deadline && (
        <div className={`deadline-badge deadline-${deadlineStatus}`}>
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
    </div>
  );
};

export default TaskDetails;
