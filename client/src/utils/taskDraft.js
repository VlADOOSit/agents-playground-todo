export const DRAFT_KEY_PREFIX = 'task-form-draft';
export const DRAFT_VERSION = 1;
export const DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export const formatDeadlineValue = (value) => {
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

export const canUseStorage = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

export const buildDraftKey = (initialValues) =>
  initialValues?.id ? `${DRAFT_KEY_PREFIX}:edit:${initialValues.id}` : `${DRAFT_KEY_PREFIX}:create`;

export const getCreateDraftKey = () => buildDraftKey(undefined);

export const isDraftEmpty = ({ title, description, deadline }) =>
  !title?.trim() && !description?.trim() && !deadline?.trim();

const normalizeDraftValues = (raw, allowedStatuses) => {
  const values = raw?.values ?? {};
  return {
    title: values.title ?? '',
    description: values.description ?? '',
    status: allowedStatuses.has(values.status) ? values.status : 'TODO',
    deadline: formatDeadlineValue(values.deadline),
  };
};

export const loadDraft = (key, allowedStatuses) => {
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

    const values = normalizeDraftValues(parsed, allowedStatuses);
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

export const saveDraft = (key, values) => {
  if (!canUseStorage() || !key) {
    return false;
  }

  try {
    window.localStorage.setItem(
      key,
      JSON.stringify({
        version: DRAFT_VERSION,
        savedAt: Date.now(),
        values,
      }),
    );
    return true;
  } catch {
    return false;
  }
};

export const clearDraft = (key) => {
  if (!canUseStorage() || !key) {
    return;
  }
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore storage failures.
  }
};
