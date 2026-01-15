import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useDraftAutosave } from '../src/hooks/useDraftAutosave';

const initialFormData = {
  title: '',
  description: '',
  status: 'TODO',
  deadline: ''
};

describe('useDraftAutosave', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('saves a draft after debounce and restores it', () => {
    vi.useFakeTimers();

    const { rerender, unmount } = renderHook(({ formData }) => {
      return useDraftAutosave('draft-key', formData, initialFormData, true);
    }, {
      initialProps: { formData: initialFormData }
    });

    rerender({
      formData: {
        ...initialFormData,
        title: 'Draft title'
      }
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    const stored = JSON.parse(localStorage.getItem('draft-key'));
    expect(stored.data.title).toBe('Draft title');

    unmount();
    const { result } = renderHook(() => {
      return useDraftAutosave('draft-key', initialFormData, initialFormData, true);
    });

    let restored;
    act(() => {
      restored = result.current.restoreDraft();
    });

    expect(restored.title).toBe('Draft title');
    expect(localStorage.getItem('draft-key')).toBeNull();
  });

  it('flags expired drafts and clears them', () => {
    vi.useFakeTimers();
    const now = new Date('2024-01-10T00:00:00.000Z');
    vi.setSystemTime(now);

    const oldTimestamp = now.getTime() - 8 * 24 * 60 * 60 * 1000;
    localStorage.setItem('expired-draft', JSON.stringify({
      data: { title: 'Old draft' },
      timestamp: oldTimestamp
    }));

    const { result } = renderHook(() => {
      return useDraftAutosave('expired-draft', initialFormData, initialFormData, true);
    });

    expect(result.current.hasDraft).toBe(false);
    expect(result.current.isDraftExpired).toBe(true);
    expect(localStorage.getItem('expired-draft')).toBeNull();
  });
});
