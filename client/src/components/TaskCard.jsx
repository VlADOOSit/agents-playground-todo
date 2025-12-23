import { useMemo } from 'react';

const STATUS_COLORS = {
  TODO: '#8a8f98',
  IN_PROGRESS: '#f59e0b',
  DONE: '#10b981',
};

const formatDate = (value) => {
  const parsed = value ? new Date(value) : null;
  if (!parsed || Number.isNaN(parsed.getTime())) {
    return '—';
  }

  return parsed.toLocaleString();
};

const TaskCard = ({
  task,
  expanded,
  onToggleExpand,
  onDelete,
  onStatusChange,
  onEdit,
}) => {
  const statusColor = useMemo(() => STATUS_COLORS[task.status] ?? '#8a8f98', [task.status]);

  return (
    <article className={`task-card ${expanded ? 'task-card--expanded' : ''}`}>
      <header className="task-card__header">
        <div>
          <p className="task-card__meta">Task #{task.id}</p>
          <h3 className="task-card__title">{task.title}</h3>
        </div>

        <div className="task-card__controls">
          <span className="status-pill" style={{ backgroundColor: statusColor }}>
            {task.status.replace('_', ' ')}
          </span>
          <select
            className="status-select"
            value={task.status}
            onChange={(event) => onStatusChange(event.target.value)}
          >
            <option value="TODO">Todo</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="DONE">Done</option>
          </select>
          <button className="icon-button" onClick={onToggleExpand} aria-label="Toggle task details">
            {expanded ? 'Collapse' : 'Expand'}
          </button>
        </div>
      </header>

      {expanded ? (
        <div className="task-card__body">
          <p className="task-card__description">
            {task.description?.trim() ? task.description : 'No description yet.'}
          </p>
          <div className="task-card__footer">
            <div className="task-card__timestamps">
              <span>Created: {formatDate(task.created_at ?? task.createdAt)}</span>
              <span>Updated: {formatDate(task.updated_at ?? task.updatedAt)}</span>
            </div>
            <div className="task-card__actions">
              <button className="btn btn--ghost" onClick={onEdit}>
                Edit
              </button>
              <button className="btn btn--danger" onClick={onDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
};

export default TaskCard;
