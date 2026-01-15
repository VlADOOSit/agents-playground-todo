import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import TaskFilters from '../src/components/TaskFilters/TaskFilters';

describe('TaskFilters', () => {
  it('calls handlers for filter and sort changes', async () => {
    const onFilterChange = vi.fn();
    const onSortChange = vi.fn();

    render(
      <TaskFilters
        currentFilter="ALL"
        onFilterChange={onFilterChange}
        currentSort="createdAt"
        onSortChange={onSortChange}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: 'Done' }));
    expect(onFilterChange).toHaveBeenCalledWith('DONE');
    expect(screen.getByRole('button', { name: 'All' })).toHaveClass('active');

    await userEvent.selectOptions(screen.getByLabelText(/sort by/i), 'deadline');
    expect(onSortChange).toHaveBeenCalledWith('deadline');
  });
});
