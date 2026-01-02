import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { createTask, deleteTask, getTasks, undoDeleteTask, updateTask } from '../../api/tasks';
import TaskFilters from '../../components/TaskFilters/TaskFilters';
import TaskForm from '../../components/TaskForm/TaskForm';
import TaskList from '../../components/TaskList/TaskList';
import TaskPageHeader from '../../components/TaskPageHeader/TaskPageHeader';
import TaskPagination from '../../components/TaskPagination/TaskPagination';
import { sortTasks } from '../../utils/taskSort';
import UndoToastStack from '../../components/UndoToastStack/UndoToastStack';
import useUndoQueue from '../../hooks/useUndoQueue';
import './TaskPage.css';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 5;
const DEFAULT_SORT = 'createdAt';
const VALID_SORTS = new Set(['createdAt', 'deadline']);
const UNDO_WINDOW_MS = 5000;

const FILTERS = [
  { value: 'ALL', label: 'All' },
  { value: 'TODO', label: 'Todo' },
  { value: 'IN_PROGRESS', label: 'In progress' },
  { value: 'DONE', label: 'Done' },
];

const readNumberParam = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) || parsed < 1 ? fallback : parsed;
};

const readFilterParam = (value) => (FILTERS.some((filter) => filter.value === value) ? value : FILTERS[0].value);
const readSortParam = (value) => (value && VALID_SORTS.has(value) ? value : DEFAULT_SORT);

const parseSearchParams = (searchParams) => ({
  filter: readFilterParam(searchParams.get('status') ?? searchParams.get('filter')),
  sort: readSortParam(searchParams.get('sort')),
  page: readNumberParam(searchParams.get('page'), DEFAULT_PAGE),
  limit: readNumberParam(searchParams.get('limit'), DEFAULT_LIMIT),
});

const buildSearchParams = ({ filter, sort, page, limit }) => {
  const params = new URLSearchParams();
  params.set('status', filter);
  params.set('sort', sort);
  params.set('page', String(page));
  params.set('limit', String(limit));
  return params;
};

const TaskPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { filter: initialFilter, sort: initialSort, page: initialPage, limit: initialLimit } = useMemo(
    () => parseSearchParams(searchParams),
    [searchParams],
  );

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [activeFilter, setActiveFilter] = useState(initialFilter);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sort, setSort] = useState(initialSort);
  const [limit, setLimit] = useState(initialLimit);
  const { queue: undoQueue, add: enqueueUndo, dismiss: dismissUndo, secondsLeftFor } = useUndoQueue(UNDO_WINDOW_MS);

  useEffect(() => {
    setActiveFilter((prev) => (prev === initialFilter ? prev : initialFilter));
    setSort((prev) => (prev === initialSort ? prev : initialSort));
    setPage((prev) => (prev === initialPage ? prev : initialPage));
    setLimit((prev) => (prev === initialLimit ? prev : initialLimit));
  }, [initialFilter, initialSort, initialPage, initialLimit]);

  useEffect(() => {
    const nextParams = buildSearchParams({ filter: activeFilter, sort, page, limit });
    const currentParams = new URLSearchParams(searchParams);

    if (nextParams.toString() !== currentParams.toString()) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [activeFilter, sort, page, limit, searchParams, setSearchParams]);

  const sortedTasks = useMemo(() => sortTasks(tasks, sort), [tasks, sort]);

  const loadTasks = async (nextPage) => {
    const requestedPage = nextPage ?? page;
    try {
      setLoading(true);
      const status = activeFilter === 'ALL' ? undefined : activeFilter;
      const data = await getTasks({ page: requestedPage, status, sort, limit });

      if (data.totalPages < requestedPage && requestedPage > 1) {
        setPage(data.totalPages);
        return;
      }

      setTasks(data.tasks);
      setPage(data.page);
      setTotalPages(data.totalPages);
      setTotalCount(data.totalCount);
      setError('');
    } catch (err) {
      setError('Unable to load tasks right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter, sort, page, limit]);

  const handleFilterChange = (nextFilter) => {
    setActiveFilter(nextFilter);
    setPage(DEFAULT_PAGE);
  };

  const handleSortChange = (nextSort) => {
    setSort(nextSort);
    setPage(DEFAULT_PAGE);
  };

  const handlePageChange = (nextPage) => {
    setPage(nextPage);
  };

  const toggleExpand = (taskId) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  const handleCreate = async (payload) => {
    try {
      await createTask(payload);
      setPage(DEFAULT_PAGE);
      await loadTasks(DEFAULT_PAGE);
      setIsFormVisible(false);
      setError('');
    } catch (err) {
      setError('Could not create the task.');
    }
  };

  const handleUpdate = async (taskId, payload) => {
    try {
      const updated = await updateTask(taskId, payload);
      setTasks((prev) => prev.map((task) => (task.id === taskId ? updated : task)));
      setEditingTask(null);
      setIsFormVisible(false);
      setError('');
    } catch (err) {
      setError('Could not update the task.');
    }
  };

  const handleDelete = async (taskId) => {
    const deletedTask = tasks.find((task) => task.id === taskId);
    try {
      await deleteTask(taskId);
      setExpandedIds((prev) => {
        const next = new Set(prev);
        next.delete(taskId);
        return next;
      });
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
      setTotalCount((prev) => Math.max(0, prev - 1));

      if (deletedTask) {
        enqueueUndo(taskId, deletedTask);
      }

      await loadTasks(page);
      setError('');
    } catch (err) {
      setError('Could not delete the task.');
    }
  };

  const handleFormSubmit = async (payload) => {
    if (editingTask) {
      await handleUpdate(editingTask.id, payload);
      return;
    }

    await handleCreate(payload);
  };

  const handleEditStart = (task) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.add(task.id);
      return next;
    });
    setEditingTask(task);
    setIsFormVisible(false);
  };

  const handleUndoDelete = async (taskId) => {
    dismissUndo(taskId);
    try {
      await undoDeleteTask(taskId);
      await loadTasks(page);
      setError('');
    } catch (err) {
      setError('Could not undo the delete.');
    }
  };

  return (
    <div className="page">
      <TaskPageHeader
        isFormVisible={isFormVisible}
        onOpenForm={() => {
          setEditingTask(null);
          setIsFormVisible(true);
        }}
        onCloseForm={() => setIsFormVisible(false)}
      />

      {isFormVisible ? (
        <div className="panel">
          <TaskForm initialValues={undefined} onSubmit={handleFormSubmit} onCancel={() => setIsFormVisible(false)} />
        </div>
      ) : null}

      <div className="panel">
        <TaskFilters
          sort={sort}
          onSortChange={handleSortChange}
          filters={FILTERS}
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
        />
        {loading ? <p className="muted">Loading tasks...</p> : null}
        {error ? <p className="error-text">{error}</p> : null}
        {!loading && !error && sortedTasks.length === 0 ? (
          <p className="muted">
            {activeFilter === 'ALL' ? 'No tasks yet. Create the first one!' : 'No tasks match this status yet.'}
          </p>
        ) : null}

        <TaskList
          tasks={sortedTasks}
          expandedIds={expandedIds}
          onToggleExpand={toggleExpand}
          onDelete={handleDelete}
          onStatusChange={(taskId, status) => handleUpdate(taskId, { status })}
          onEditStart={handleEditStart}
          editingTask={editingTask}
          onSubmitEdit={handleFormSubmit}
          onCancelEdit={() => setEditingTask(null)}
        />
        {!loading && !error && totalCount > 0 ? (
          <TaskPagination page={page} totalPages={totalPages} totalCount={totalCount} onPageChange={handlePageChange} />
        ) : null}
      </div>

      <UndoToastStack items={undoQueue} onUndo={handleUndoDelete} onDismiss={dismissUndo} secondsLeftFor={secondsLeftFor} />
    </div>
  );
};

export default TaskPage;
