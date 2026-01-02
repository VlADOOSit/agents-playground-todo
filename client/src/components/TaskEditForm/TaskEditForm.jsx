import React from 'react';
import { useTaskForm } from '../../hooks/useTaskForm';
import { useDraftAutosave } from '../../hooks/useDraftAutosave';
import { TASK_STATUS_OPTIONS, createInitialFormData } from '../../utils/taskUtils';
import './TaskEditForm.css';

const TaskEditForm = ({
  task,
  onSave,
  onCancel
}) => {
  const draftKey = `task-edit-draft-${task.id}`;
  const initialFormData = createInitialFormData(task);

  const {
    title,
    description,
    status,
    deadline,
    isSubmitting,
    setTitle,
    setDescription,
    setStatus,
    setDeadline,
    handleSubmit,
    handleCancel,
    setFormData
  } = useTaskForm(task, {
    onSubmit: onSave,
    onCancel
  });

  const formData = { title, description, status, deadline };

  const { hasDraft, restoreDraft, clearDraft } = useDraftAutosave(
    draftKey,
    formData,
    initialFormData,
    true
  );

  const handleRestoreDraftClick = () => {
    const draft = restoreDraft();
    if (draft) {
      setFormData(draft);
    }
    if (onRestoreDraft) onRestoreDraft();
  };

  const handleDiscardDraftClick = () => {
    clearDraft();
    if (onDiscardDraft) onDiscardDraft();
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    clearDraft();
    await handleSubmit();
  };

  const handleFormCancel = () => {
    clearDraft();
    handleCancel();
  };

  return (
    <div className="task-edit-form">
      {hasDraft && (
        <div className="draft-notice">
          <p>You have an unsaved draft for this task. Would you like to restore it?</p>
          <div className="draft-actions">
            <button
              type="button"
              onClick={handleRestoreDraftClick}
              className="restore-draft-button"
            >
              Restore Draft
            </button>
            <button
              type="button"
              onClick={handleDiscardDraftClick}
              className="discard-draft-button"
            >
              Discard Draft
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleFormSubmit}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task Title"
          required
          disabled={isSubmitting}
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Task Description"
          disabled={isSubmitting}
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          disabled={isSubmitting}
        >
          {TASK_STATUS_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <input
          type="datetime-local"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          placeholder="Deadline (optional)"
          disabled={isSubmitting}
        />

        <div className="edit-form-actions">
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
          <button type="button" onClick={handleFormCancel} className="secondary" disabled={isSubmitting}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskEditForm;
