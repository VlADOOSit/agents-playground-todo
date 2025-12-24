import client from './client';

export const getTasks = async (page = 1) => {
  const { data } = await client.get('/tasks', { params: { page } });
  return data;
};

export const createTask = async (payload) => {
  const { data } = await client.post('/tasks', payload);
  return data;
};

export const updateTask = async (id, payload) => {
  const { data } = await client.put(`/tasks/${id}`, payload);
  return data;
};

export const deleteTask = async (id) => {
  await client.delete(`/tasks/${id}`);
  return id;
};
