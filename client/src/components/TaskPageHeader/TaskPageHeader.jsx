import './TaskPageHeader.css';

const TaskPageHeader = ({ isFormVisible, onOpenForm, onCloseForm }) => (
  <div className="page__header">
    <div>
      <p className="eyebrow">Plan. Track. Deliver.</p>
      <h1>Your tasks</h1>
      <p className="lede">Create new tasks, update progress, and keep work in sync with the backend.</p>
    </div>
    <div className="page__actions">
      {!isFormVisible ? (
        <button className="btn btn--primary" type="button" onClick={onOpenForm}>
          + New task
        </button>
      ) : null}
      {isFormVisible ? (
        <button className="btn btn--ghost" onClick={onCloseForm}>
          Close form
        </button>
      ) : null}
    </div>
  </div>
);

export default TaskPageHeader;
