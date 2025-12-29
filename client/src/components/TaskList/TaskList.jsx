import TaskCard from '../TaskCard/TaskCard';
import TaskForm from '../TaskForm/TaskForm';
import './TaskList.css';

const TaskList = ({
  tasks,
  expandedIds,
  onToggleExpand,
  onDelete,
  onStatusChange,
  onEditStart,
  editingTask,
  onSubmitEdit,
  onCancelEdit,
}) => (
  <div className="task-grid">
    {tasks.map((task) => (
      <TaskCard
        key={task.id}
        task={task}
        expanded={expandedIds.has(task.id)}
        onToggleExpand={() => onToggleExpand(task.id)}
        onDelete={() => onDelete(task.id)}
        onStatusChange={(status) => onStatusChange(task.id, status)}
        onEdit={() => onEditStart(task)}
        editForm={
          editingTask?.id === task.id ? (
            <TaskForm initialValues={editingTask} onSubmit={onSubmitEdit} onCancel={onCancelEdit} />
          ) : null
        }
      />
    ))}
  </div>
);

export default TaskList;
