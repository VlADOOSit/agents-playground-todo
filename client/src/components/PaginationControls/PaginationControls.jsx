import './PaginationControls.css';

const PaginationControls = ({ currentPage, totalPages, totalTasks, onPageChange }) => {
  if (totalTasks === 0) return null;

  return (
    <div className="pagination-controls">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="pagination-button"
      >
        Previous
      </button>

      <span className="pagination-info">
        Page {currentPage} of {totalPages} ({totalTasks} total tasks)
      </span>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="pagination-button"
      >
        Next
      </button>
    </div>
  );
};

export default PaginationControls;
