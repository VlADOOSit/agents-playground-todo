import { describe, expect, it } from 'vitest';
import { sortTasks } from '../src/utils/taskSort';

describe('sortTasks', () => {
  it('sorts by created date descending when no sort is provided', () => {
    const tasks = [
      { id: 1, created_at: '2024-01-10T10:00:00Z' },
      { id: 2, created_at: '2024-01-12T10:00:00Z' },
      { id: 3, created_at: '2024-01-11T10:00:00Z' },
    ];

    const result = sortTasks(tasks);
    expect(result.map((task) => task.id)).toEqual([2, 3, 1]);
  });

  it('prioritizes earlier deadlines and falls back to created time', () => {
    const tasks = [
      { id: 1, created_at: '2024-01-10T10:00:00Z', deadline: '2024-01-20T10:00:00Z' },
      { id: 2, created_at: '2024-01-12T10:00:00Z', deadline: null },
      { id: 3, created_at: '2024-01-11T10:00:00Z', deadline: '2024-01-18T10:00:00Z' },
      { id: 4, created_at: '2024-01-09T10:00:00Z', deadline: null },
    ];

    const result = sortTasks(tasks, 'deadline');
    expect(result.map((task) => task.id)).toEqual([3, 1, 2, 4]);
  });
});
