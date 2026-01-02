export const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleString();
    } catch (error) {
        console.error('Error formatting date:', dateString, error);
        return 'Invalid Date';
    }
};

export const getStatusClass = (status) => {
    switch (status) {
        case 'TODO':
            return 'status-todo';
        case 'IN_PROGRESS':
            return 'status-in_progress';
        case 'DONE':
            return 'status-done';
        default:
            return '';
    }
};

export const isOverdue = (task) => {
    if (!task.deadline || task.status === 'DONE') return false;
    return new Date(task.deadline) < new Date();
};

export const getDeadlineStatus = (task) => {
    if (!task.deadline) return null;
    if (task.status === 'DONE') return 'completed';

    const now = new Date();
    const deadline = new Date(task.deadline);
    const timeDiff = deadline - now;
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    if (timeDiff < 0) return 'overdue';
    if (hoursDiff <= 24) return 'urgent';
    if (hoursDiff <= 72) return 'warning';
    return 'normal';
};

export const TASK_STATUS_OPTIONS = [
    { value: 'TODO', label: 'TODO' },
    { value: 'IN_PROGRESS', label: 'IN_PROGRESS' },
    { value: 'DONE', label: 'DONE' }
];

export const DEFAULT_TASK_FORM_DATA = {
    title: '',
    description: '',
    status: 'TODO',
    deadline: ''
};

export const prepareTaskData = (formData) => ({
    title: formData.title,
    description: formData.description,
    status: formData.status,
    deadline: formData.deadline || null
});

export const createInitialFormData = (task) => ({
    title: task.title,
    description: task.description,
    status: task.status,
    deadline: task.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : ''
});
