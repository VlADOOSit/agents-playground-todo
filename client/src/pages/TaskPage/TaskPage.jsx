import { useEffect, useMemo, useState } from 'react';
import { createTask, deleteTask, getTasks, updateTask } from '../../api/tasks';
import TaskFilters from '../../components/TaskFilters/TaskFilters';
import TaskForm from '../../components/TaskForm/TaskForm';
import TaskList from '../../components/TaskList/TaskList';
import TaskPageHeader from '../../components/TaskPageHeader/TaskPageHeader';
import TaskPagination from '../../components/TaskPagination/TaskPagination';
import { sortTasks } from '../../utils/taskSort';
import './TaskPage.css';

const FILTERS = [
  { value: 'ALL', label: 'All' },
  { value: 'TODO', label: 'Todo' },
  { value: 'IN_PROGRESS', label: 'In progress' },
  { value: 'DONE', label: 'Done' },
];

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
  const [sort, setSort] = useState('createdAt');

  const sortedTasks = useMemo(() => sortTasks(tasks, sort), [tasks, sort]);

  const loadTasks = async (nextPage) => {
    const requestedPage = nextPage ?? page;
    try {
      setLoading(true);
      const status = activeFilter === 'ALL' ? undefined : activeFilter;
      const data = await getTasks({ page: requestedPage, status, sort });

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
  }, [activeFilter, sort]);

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
          onSortChange={setSort}
          filters={FILTERS}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
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
          <TaskPagination page={page} totalPages={totalPages} totalCount={totalCount} onPageChange={loadTasks} />
        ) : null}
      </div>
    </div>
  );
};

export default TaskPage;
