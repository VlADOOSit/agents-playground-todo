import axios from 'axios';

const apiBaseUrl = (import.meta.env.VITE_API_URL === 'http://server:3001/api') ? 'http://localhost:3001/api' : import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api';

const client = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default client;
