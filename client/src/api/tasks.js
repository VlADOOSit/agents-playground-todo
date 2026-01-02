import axios from 'axios';
import { TASKS_PER_PAGE } from '../utils/constant';

const API_URL = `${import.meta.env.VITE_API_URL}/tasks`;

const tasksApi = {
    getAllTasks: async (page = 1, limit = TASKS_PER_PAGE, status = null, sort = 'createdAt') => {
        let url = `${API_URL}?page=${page}&limit=${limit}`;
        if (status && status !== 'ALL') {
            url += `&status=${status}`;
        }
        if (sort && sort !== 'createdAt') {
            url += `&sort=${sort}`;
        }
        const response = await axios.get(url);
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

    restoreTask: async (id) => {
        const response = await axios.patch(`${API_URL}/${id}/restore`);
        return response.data;
    },

    permanentDeleteTask: async (id) => {
        const response = await axios.delete(`${API_URL}/${id}/permanent`);
        return response.data;
    },

    cleanupDeletedTasks: async (olderThanMinutes = 5) => {
        const response = await axios.delete(`${API_URL}?olderThanMinutes=${olderThanMinutes}`);
        return response.data;
    },
};

export default tasksApi;

