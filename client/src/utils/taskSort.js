const parseDate = (value) => {
  const parsed = value ? new Date(value) : null;
  return parsed && !Number.isNaN(parsed.getTime()) ? parsed : null;
};

const createdTime = (task) => {
  const created = parseDate(task.created_at ?? task.createdAt);
  return created ? created.getTime() : 0;
};

export const sortTasks = (tasks, sort) => {
  if (sort === 'deadline') {
    return [...tasks].sort((a, b) => {
      const aDeadline = parseDate(a.deadline);
      const bDeadline = parseDate(b.deadline);

      if (aDeadline && bDeadline) {
        const diff = aDeadline.getTime() - bDeadline.getTime();
        return diff !== 0 ? diff : createdTime(b) - createdTime(a);
      }

      if (aDeadline) return -1;
      if (bDeadline) return 1;

      return createdTime(b) - createdTime(a);
    });
  }

  return [...tasks].sort((a, b) => createdTime(b) - createdTime(a));
};
