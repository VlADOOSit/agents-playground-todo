import './TaskFilters.css';

const TaskFilters = ({ sort, onSortChange, filters, activeFilter, onFilterChange }) => (
  <div className="filter-row">
    <div className="sort-control">
      <label className="filter-row__label" htmlFor="sort">
        Sort by
      </label>
      <select
        id="sort"
        className="status-select"
        value={sort}
        onChange={(event) => onSortChange(event.target.value)}
      >
        <option value="createdAt">Created date</option>
        <option value="deadline">Deadline</option>
      </select>
    </div>
    <div className="filter-row__filters">
      <div className="filter-row__chips">
        {filters.map((filter) => (
          <button
            key={filter.value}
            className={`filter-chip ${activeFilter === filter.value ? 'filter-chip--active' : ''}`}
            type="button"
            onClick={() => onFilterChange(filter.value)}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  </div>
);

export default TaskFilters;
