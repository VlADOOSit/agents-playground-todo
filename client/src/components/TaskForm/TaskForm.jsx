import { useEffect, useRef, useState } from 'react';
import './TaskForm.css';

const STATUS_OPTIONS = [
  { value: 'TODO', label: 'Todo' },
  { value: 'IN_PROGRESS', label: 'In progress' },
  { value: 'DONE', label: 'Done' },
];

const DRAFT_KEY_PREFIX = 'task-form-draft';
const DRAFT_VERSION = 1;
const DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const formatDeadlineValue = (value) => {
  const parsed = value ? new Date(value) : null;
  if (!parsed || Number.isNaN(parsed.getTime())) {
    return '';
  }

  const pad = (part) => String(part).padStart(2, '0');
  const year = parsed.getFullYear();
  const month = pad(parsed.getMonth() + 1);
  const day = pad(parsed.getDate());
  const hours = pad(parsed.getHours());
  const minutes = pad(parsed.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const canUseStorage = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const buildDraftKey = (initialValues) =>
  initialValues?.id ? `${DRAFT_KEY_PREFIX}:edit:${initialValues.id}` : `${DRAFT_KEY_PREFIX}:create`;

const getCreateDraftKey = () => buildDraftKey(undefined);

const normalizeDraftValues = (raw) => {
  const values = raw?.values ?? {};
  const statusValues = new Set(STATUS_OPTIONS.map((option) => option.value));
  return {
    title: values.title ?? '',
    description: values.description ?? '',
    status: statusValues.has(values.status) ? values.status : 'TODO',
    deadline: formatDeadlineValue(values.deadline),
  };
};

const isDraftEmpty = ({ title, description, deadline }) =>
  !title?.trim() && !description?.trim() && !deadline?.trim();

const loadDraft = (key) => {
  if (!canUseStorage() || !key) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    const isValidVersion = parsed?.version === DRAFT_VERSION;
    const savedAt = typeof parsed?.savedAt === 'number' ? parsed.savedAt : null;
    const isFresh = savedAt && Date.now() - savedAt <= DRAFT_TTL_MS;
    if (!isValidVersion || !isFresh) {
      window.localStorage.removeItem(key);
      return null;
    }

    const values = normalizeDraftValues(parsed);
    if (isDraftEmpty(values)) {
      window.localStorage.removeItem(key);
      return null;
    }

    return { values, savedAt };
  } catch {
    window.localStorage.removeItem(key);
    return null;
  }
};

const clearDraft = (key) => {
  if (!canUseStorage() || !key) {
    return;
  }
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Best-effort cleanup; ignore failures to keep the form usable.
  }
};

const TaskForm = ({ initialValues, onSubmit, onCancel }) => {
  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [status, setStatus] = useState(initialValues?.status ?? 'TODO');
  const [deadline, setDeadline] = useState(formatDeadlineValue(initialValues?.deadline));
  const [pendingDraft, setPendingDraft] = useState(null);
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const draftKey = buildDraftKey(initialValues);

  const isMountedRef = useRef(true);

  useEffect(
    () => () => {
      isMountedRef.current = false;
    },
    [],
  );

  useEffect(() => {
    setTitle(initialValues?.title ?? '');
    setDescription(initialValues?.description ?? '');
    setStatus(initialValues?.status ?? 'TODO');
    setDeadline(formatDeadlineValue(initialValues?.deadline));
    setHasRestoredDraft(false);
    setHasInteracted(false);
  }, [initialValues]);

  useEffect(() => {
    setPendingDraft(loadDraft(draftKey));
    setHasRestoredDraft(false);
    setHasInteracted(false);
  }, [draftKey]);

  useEffect(() => {
    if (!canUseStorage()) {
      return;
    }

    if (!hasRestoredDraft && !hasInteracted) {
      return;
    }

    const trimmedDeadline = deadline.trim();
    const valuesToSave = {
      title,
      description,
      status,
      deadline: trimmedDeadline,
    };

    if (isDraftEmpty(valuesToSave)) {
      clearDraft(draftKey);
      setPendingDraft(null);
      return;
    }

    try {
      window.localStorage.setItem(
        draftKey,
        JSON.stringify({
          version: DRAFT_VERSION,
          savedAt: Date.now(),
          values: valuesToSave,
        }),
      );
    } catch {
      // Ignore storage errors to avoid breaking the form.
    }
  }, [title, description, status, deadline, draftKey, hasRestoredDraft, hasInteracted]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmedDeadline = deadline.trim();
    const deadlineValue = trimmedDeadline ? new Date(trimmedDeadline) : null;
    const deadlinePayload = deadlineValue && !Number.isNaN(deadlineValue.getTime()) ? deadlineValue.toISOString() : null;

    Promise.resolve(
      onSubmit({
        title: title.trim(),
        description: description.trim(),
        status,
        deadline: deadlinePayload,
      }),
    )
      .then((result) => {
        if (result === false) {
          return;
        }
        clearDraft(draftKey);
        clearDraft(getCreateDraftKey());
        if (isMountedRef.current) {
          setPendingDraft(null);
          setHasInteracted(false);
          setHasRestoredDraft(false);
        }
      })
      .catch(() => {
        // Keep draft so the user can retry; errors are handled upstream.
      });
  };

  const handleRestoreDraft = () => {
    if (!pendingDraft?.values) {
      return;
    }
    setTitle(pendingDraft.values.title ?? '');
    setDescription(pendingDraft.values.description ?? '');
    setStatus(pendingDraft.values.status ?? 'TODO');
    setDeadline(pendingDraft.values.deadline ?? '');
    setHasRestoredDraft(true);
    setHasInteracted(true);
    setPendingDraft(null);
  };

  const handleDiscardDraft = () => {
    clearDraft(draftKey);
    clearDraft(getCreateDraftKey());
    setPendingDraft(null);
  };

  const handleCancel = () => {
    handleDiscardDraft();
    setHasInteracted(false);
    setHasRestoredDraft(false);
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      {pendingDraft ? (
        <div className="task-form__draft">
          <div className="task-form__draft-text">
            <strong>Draft available</strong>
            <span>We found saved changes for this form.</span>
          </div>
          <div className="task-form__draft-buttons">
            <button type="button" className="btn btn--ghost" onClick={handleRestoreDraft}>
              Restore draft
            </button>
            <button type="button" className="btn btn--danger" onClick={handleDiscardDraft}>
              Discard draft
            </button>
          </div>
        </div>
      ) : null}

      <div className="task-form__row">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          name="title"
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
            setHasInteracted(true);
          }}
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
          onChange={(event) => {
            setDescription(event.target.value);
            setHasInteracted(true);
          }}
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
          onChange={(event) => {
            setStatus(event.target.value);
            setHasInteracted(true);
          }}
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="task-form__row">
        <label htmlFor="deadline">Deadline</label>
        <input
          id="deadline"
          name="deadline"
          type="datetime-local"
          value={deadline}
          onChange={(event) => {
            setDeadline(event.target.value);
            setHasInteracted(true);
          }}
        />
      </div>

      <div className="task-form__actions">
        <button type="submit" className="btn btn--primary">
          {initialValues ? 'Save changes' : 'Create task'}
        </button>
        {onCancel ? (
          <button type="button" className="btn btn--ghost" onClick={handleCancel}>
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
};

export default TaskForm;
