import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import TaskFilters from '../src/components/TaskFilters/TaskFilters';

describe('TaskFilters', () => {
  it('renders filters and notifies about interactions', async () => {
    const onSortChange = vi.fn();
    const onFilterChange = vi.fn();
    const filters = [
      { value: 'all', label: 'All' },
      { value: 'done', label: 'Done' },
    ];

    render(
      <TaskFilters
        sort="createdAt"
        onSortChange={onSortChange}
        filters={filters}
        activeFilter="all"
        onFilterChange={onFilterChange}
      />,
    );

    const user = userEvent.setup();
    await user.selectOptions(screen.getByLabelText(/sort by/i), 'deadline');
    expect(onSortChange).toHaveBeenCalledWith('deadline');

    const doneButton = screen.getByRole('button', { name: 'Done' });
    await user.click(doneButton);
    expect(onFilterChange).toHaveBeenCalledWith('done');

    const activeButton = screen.getByRole('button', { name: 'All' });
    expect(activeButton.className).toContain('filter-chip--active');
  });
});
