import './TaskPagination.css';

const TaskPagination = ({ page, totalPages, totalCount, onPageChange }) => (
  <div className="pagination">
    <div className="pagination__info">
      Page {page} of {totalPages} | {totalCount} task{totalCount === 1 ? '' : 's'}
    </div>
    <div className="pagination__controls">
      <button
        className="btn btn--ghost"
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
      >
        Previous
      </button>
      <button
        className="btn btn--ghost"
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
      >
        Next
      </button>
    </div>
  </div>
);

export default TaskPagination;
