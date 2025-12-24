import { useEffect, useMemo, useState } from 'react';
import { createTask, deleteTask, getTasks, updateTask } from '../api/tasks';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';

const TaskPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const dateValue = (value) => {
    const parsed = value ? new Date(value) : null;
    return parsed && !Number.isNaN(parsed.getTime()) ? parsed.getTime() : 0;
  };

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => dateValue(b.created_at ?? b.createdAt) - dateValue(a.created_at ?? a.createdAt));
  }, [tasks]);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true);
        const data = await getTasks();
        setTasks(data);
        setError('');
      } catch (err) {
        setError('Unable to load tasks right now.');
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, []);

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
      const created = await createTask(payload);
      setTasks((prev) => [created, ...prev]);
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
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
      setExpandedIds((prev) => {
        const next = new Set(prev);
        next.delete(taskId);
        return next;
      });
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
    setEditingTask(task);
    setIsFormVisible(true);
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
          <TaskForm initialValues={editingTask ?? undefined} onSubmit={handleFormSubmit} onCancel={() => setIsFormVisible(false)} />
        </div>
      ) : null}

      <div className="panel">
        {loading ? <p className="muted">Loading tasks...</p> : null}
        {error ? <p className="error-text">{error}</p> : null}
        {!loading && !error && sortedTasks.length === 0 ? <p className="muted">No tasks yet. Create the first one!</p> : null}

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
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaskPage;
