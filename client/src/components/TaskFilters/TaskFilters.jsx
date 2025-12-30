import './TaskFilters.css';

const TaskFilters = ({ currentFilter, onFilterChange, currentSort, onSortChange }) => {
  const statusOptions = [
    { value: 'ALL', label: 'All' },
    { value: 'TODO', label: 'TODO' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'DONE', label: 'Done' }
  ];

  const sortOptions = [
    { value: 'createdAt', label: 'Created Date' },
    { value: 'deadline', label: 'Deadline' }
  ];

  return (
    <div className="task-filters">
      <div className="filter-chips">
        {statusOptions.map((option) => (
          <button
            key={option.value}
            className={`filter-chip ${currentFilter === option.value ? 'active' : ''}`}
            onClick={() => onFilterChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="sort-controls">
        <label htmlFor="sort-select">Sort by:</label>
        <select
          id="sort-select"
          value={currentSort}
          onChange={(e) => onSortChange(e.target.value)}
          className="sort-select"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default TaskFilters;
