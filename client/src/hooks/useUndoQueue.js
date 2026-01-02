import { useEffect, useRef, useState } from 'react';

const useUndoQueue = (windowMs) => {
  const [queue, setQueue] = useState([]);
  const [now, setNow] = useState(Date.now());
  const timersRef = useRef(new Map());

  useEffect(() => {
    if (queue.length === 0) {
      return undefined;
    }

    const intervalId = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(intervalId);
  }, [queue.length]);

  useEffect(
    () => () => {
      timersRef.current.forEach((timerId) => clearTimeout(timerId));
      timersRef.current.clear();
    },
    [],
  );

  const clearTimer = (taskId) => {
    const timer = timersRef.current.get(taskId);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(taskId);
    }
  };

  const dismiss = (taskId) => {
    clearTimer(taskId);
    setQueue((prev) => prev.filter((entry) => entry.id !== taskId));
  };

  const add = (taskId, task) => {
    const expiresAt = Date.now() + windowMs;
    setQueue((prev) => [...prev, { id: taskId, task, expiresAt }]);
    const timeoutId = setTimeout(() => dismiss(taskId), windowMs);
    timersRef.current.set(taskId, timeoutId);
  };

  const secondsLeftFor = (expiresAt) => Math.max(0, Math.ceil((expiresAt - now) / 1000));

  return { queue, add, dismiss, secondsLeftFor };
};

export default useUndoQueue;
