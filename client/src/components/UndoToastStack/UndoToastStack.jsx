import './UndoToastStack.css';

const UndoToastStack = ({ items, onUndo, onDismiss, secondsLeftFor }) => (
  <div className="toast-stack">
    {items.map((entry) => (
      <div key={entry.id} className="toast">
        <div className="toast__content">
          <p className="toast__title">Task deleted</p>
          <p className="toast__meta">
            {entry.task?.title ?? 'Task'} will vanish in {secondsLeftFor(entry.expiresAt)}s
          </p>
        </div>
        <div className="toast__actions">
          <button className="btn btn--ghost" onClick={() => onUndo(entry.id)}>
            Undo
          </button>
          <button className="icon-button" onClick={() => onDismiss(entry.id)} aria-label="Dismiss undo toast">
            x
          </button>
        </div>
      </div>
    ))}
  </div>
);

export default UndoToastStack;
