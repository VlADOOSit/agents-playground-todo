import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  DRAFT_TTL_MS,
  buildDraftKey,
  formatDeadlineValue,
  getCreateDraftKey,
  isDraftEmpty,
  loadDraft,
  saveDraft,
} from '../src/utils/taskDraft';

const allowedStatuses = new Set(['TODO', 'IN_PROGRESS', 'DONE']);

describe('taskDraft helpers', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it('formats a deadline value for input[type=datetime-local]', () => {
    expect(formatDeadlineValue('2024-05-10T14:30:00Z')).toMatch(/^2024-05-10T/);
    expect(formatDeadlineValue('invalid')).toBe('');
  });

  it('builds draft keys for create and edit', () => {
    expect(getCreateDraftKey()).toContain('task-form-draft:create');
    expect(buildDraftKey({ id: 42 })).toContain('task-form-draft:edit:42');
  });

  it('detects empty drafts', () => {
    expect(isDraftEmpty({ title: '', description: '', deadline: '' })).toBe(true);
    expect(isDraftEmpty({ title: 'Hi', description: '', deadline: '' })).toBe(false);
  });

  it('saves and loads a fresh draft', () => {
    const now = Date.now();
    vi.spyOn(Date, 'now').mockReturnValue(now);

    const key = getCreateDraftKey();
    const values = { title: 'Plan', description: 'Write tests', status: 'TODO', deadline: '' };
    expect(saveDraft(key, values)).toBe(true);

    const loaded = loadDraft(key, allowedStatuses);
    expect(loaded?.values).toEqual(values);
    expect(loaded?.savedAt).toBe(now);
  });

  it('removes stale drafts', () => {
    const now = Date.now();
    vi.spyOn(Date, 'now').mockReturnValue(now);

    const key = getCreateDraftKey();
    window.localStorage.setItem(
      key,
      JSON.stringify({
        version: 1,
        savedAt: now - DRAFT_TTL_MS - 1000,
        values: { title: 'Old', description: '', status: 'TODO', deadline: '' },
      }),
    );

    expect(loadDraft(key, allowedStatuses)).toBeNull();
    expect(window.localStorage.getItem(key)).toBeNull();
  });
});
