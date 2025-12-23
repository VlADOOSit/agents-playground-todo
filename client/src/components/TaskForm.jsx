import { useEffect, useState } from 'react';

const STATUS_OPTIONS = [
  { value: 'TODO', label: 'Todo' },
  { value: 'IN_PROGRESS', label: 'In progress' },
  { value: 'DONE', label: 'Done' },
];

const TaskForm = ({ initialValues, onSubmit, onCancel }) => {
  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [status, setStatus] = useState(initialValues?.status ?? 'TODO');

  useEffect(() => {
    setTitle(initialValues?.title ?? '');
    setDescription(initialValues?.description ?? '');
    setStatus(initialValues?.status ?? 'TODO');
  }, [initialValues]);

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({ title: title.trim(), description: description.trim(), status });
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <div className="task-form__row">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          name="title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="What needs to be done?"
          required
        />
      </div>

      <div className="task-form__row">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Add helpful context or steps."
          rows={4}
        />
      </div>

      <div className="task-form__row">
        <label htmlFor="status">Status</label>
        <select
          id="status"
          name="status"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="task-form__actions">
        <button type="submit" className="btn btn--primary">
          {initialValues ? 'Save changes' : 'Create task'}
        </button>
        {onCancel ? (
          <button type="button" className="btn btn--ghost" onClick={onCancel}>
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
};

export default TaskForm;
