import React from 'react';
import './TaskFilters.css';

const TaskFilters = ({ currentFilter, onFilterChange }) => {
  const statusOptions = [
    { value: 'ALL', label: 'All' },
    { value: 'TODO', label: 'TODO' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'DONE', label: 'Done' }
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
    </div>
  );
};

export default TaskFilters;
