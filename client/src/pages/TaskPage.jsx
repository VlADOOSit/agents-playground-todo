import { useEffect, useMemo, useState } from 'react';
import { createTask, deleteTask, getTasks, updateTask } from '../api/tasks';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';

const TaskPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const filters = [
    { value: 'ALL', label: 'All' },
    { value: 'TODO', label: 'Todo' },
    { value: 'IN_PROGRESS', label: 'In progress' },
    { value: 'DONE', label: 'Done' },
  ];

  const dateValue = (value) => {
    const parsed = value ? new Date(value) : null;
    return parsed && !Number.isNaN(parsed.getTime()) ? parsed.getTime() : 0;
  };

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => dateValue(b.created_at ?? b.createdAt) - dateValue(a.created_at ?? a.createdAt));
  }, [tasks]);

  const loadTasks = async (nextPage) => {
    const requestedPage = nextPage ?? page;
    try {
      setLoading(true);
      const status = activeFilter === 'ALL' ? undefined : activeFilter;
      const data = await getTasks({ page: requestedPage, status });

      if (data.totalPages < requestedPage && requestedPage > 1) {
        await loadTasks(data.totalPages);
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
    loadTasks(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter]);

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
      await loadTasks(1);
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
    try {
      await deleteTask(taskId);
      setExpandedIds((prev) => {
        const next = new Set(prev);
        next.delete(taskId);
        return next;
      });
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

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <p className="eyebrow">Plan. Track. Deliver.</p>
          <h1>Your tasks</h1>
          <p className="lede">Create new tasks, update progress, and keep work in sync with the backend.</p>
        </div>
        <div className="page__actions">
          {!isFormVisible ? (
            <button
              className="btn btn--primary"
              type="button"
              onClick={() => {
                setEditingTask(null);
                setIsFormVisible(true);
              }}
            >
              + New task
            </button>
          ) : null}
          {isFormVisible ? (
            <button className="btn btn--ghost" onClick={() => setIsFormVisible(false)}>
              Close form
            </button>
          ) : null}
        </div>
      </div>

      {isFormVisible ? (
        <div className="panel">
          <TaskForm initialValues={undefined} onSubmit={handleFormSubmit} onCancel={() => setIsFormVisible(false)} />
        </div>
      ) : null}

      <div className="panel">
        <div className="filter-row">
          <span className="filter-row__label">Filter by status</span>
          <div className="filter-row__chips">
            {filters.map((filter) => (
              <button
                key={filter.value}
                className={`filter-chip ${activeFilter === filter.value ? 'filter-chip--active' : ''}`}
                type="button"
                onClick={() => setActiveFilter(filter.value)}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
        {loading ? <p className="muted">Loading tasks...</p> : null}
        {error ? <p className="error-text">{error}</p> : null}
        {!loading && !error && sortedTasks.length === 0 ? (
          <p className="muted">
            {activeFilter === 'ALL' ? 'No tasks yet. Create the first one!' : 'No tasks match this status yet.'}
          </p>
        ) : null}

        <div className="task-grid">
          {sortedTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              expanded={expandedIds.has(task.id)}
              onToggleExpand={() => toggleExpand(task.id)}
              onDelete={() => handleDelete(task.id)}
              onStatusChange={(status) => handleUpdate(task.id, { status })}
              onEdit={() => handleEditStart(task)}
              editForm={
                editingTask?.id === task.id ? (
                  <TaskForm
                    initialValues={editingTask}
                    onSubmit={handleFormSubmit}
                    onCancel={() => setEditingTask(null)}
                  />
                ) : null
              }
            />
          ))}
        </div>
        {!loading && !error && totalCount > 0 ? (
          <div className="pagination">
            <div className="pagination__info">
              Page {page} of {totalPages} · {totalCount} task{totalCount === 1 ? '' : 's'}
            </div>
            <div className="pagination__controls">
              <button className="btn btn--ghost" type="button" onClick={() => loadTasks(page - 1)} disabled={page <= 1}>
                Previous
              </button>
              <button
                className="btn btn--ghost"
                type="button"
                onClick={() => loadTasks(page + 1)}
                disabled={page >= totalPages}
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default TaskPage;
