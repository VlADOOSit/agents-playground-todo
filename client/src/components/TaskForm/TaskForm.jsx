import { useState } from 'react';
import tasksApi from '../../api/tasks';
import { useDraftAutosave } from '../../hooks/useDraftAutosave';
import { useTaskForm } from '../../hooks/useTaskForm';
import { DEFAULT_TASK_FORM_DATA } from '../../utils/taskUtils';
import './TaskForm.css';

const TaskForm = ({ onTaskCreated }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const draftKey = 'task-create-draft';

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
    resetToDefault,
    setFormData
  } = useTaskForm();

  const formData = { title, description, status, deadline };

  const { hasDraft, restoreDraft, clearDraft } = useDraftAutosave(
    draftKey,
    formData,
    DEFAULT_TASK_FORM_DATA,
    isExpanded,
    isResetting
  );

  const showRestoreDraft = isExpanded && hasDraft;

  const handleCreateTask = async (taskData) => {
    const newTask = await tasksApi.createTask(taskData);
    clearDraft();
    onTaskCreated(newTask);
    resetToDefault();
    setIsExpanded(false);
  };

  const handleRestoreDraft = () => {
    const draft = restoreDraft();
    if (draft) {
      setFormData(draft);
    }
  };

  const handleDiscardDraft = () => {
    clearDraft();
  };

  const toggleForm = () => {
    const willExpand = !isExpanded;
    setIsExpanded(willExpand);

    if (!willExpand) {
      clearDraft();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      await handleCreateTask({
        title,
        description,
        status,
        deadline: deadline || null
      });
    } catch (error) {
      console.error('Error creating task:', error);
    }
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
        <form onSubmit={handleSubmit} className="task-form">
          {showRestoreDraft && (
            <div className="draft-notice">
              <p>You have an unsaved draft. Would you like to restore it?</p>
              <div className="draft-actions">
                <button
                  type="button"
                  onClick={handleRestoreDraft}
                  className="restore-draft-button"
                  disabled={isSubmitting}
                >
                  Restore Draft
                </button>
                <button
                  type="button"
                  onClick={handleDiscardDraft}
                  className="discard-draft-button"
                  disabled={isSubmitting}
                >
                  Discard Draft
                </button>
              </div>
            </div>
          )}
          <input
            type="text"
            placeholder="Task Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={isSubmitting}
          />
          <textarea
            placeholder="Task Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitting}
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            disabled={isSubmitting}
          >
            <option value="TODO">TODO</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="DONE">DONE</option>
          </select>
          <input
            type="datetime-local"
            placeholder="Deadline (optional)"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            disabled={isSubmitting}
          />
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
