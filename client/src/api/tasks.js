import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/tasks`;

const tasksApi = {
    getAllTasks: async (page = 1, limit = 5) => {
        const response = await axios.get(`${API_URL}?page=${page}&limit=${limit}`);
        return response.data;
    },

    createTask: async (task) => {
        const response = await axios.post(API_URL, task);
        return response.data;
    },

    updateTask: async (id, task) => {
        const response = await axios.put(`${API_URL}/${id}`, task);
        return response.data;
    },

    deleteTask: async (id) => {
        const response = await axios.delete(`${API_URL}/${id}`);
        return response.data;
    },
};

export default tasksApi;

