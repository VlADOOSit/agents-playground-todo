const express = require('express');
const cors = require('cors');
const healthRoutes = require('./routes/healthRoutes');
const taskRoutes = require('./routes/taskRoutes');
const errorHandler = require('./middlewares/errorHandler');

const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';

const app = express();
app.use(cors({
    origin: allowedOrigin,
    credentials: true,
}));

app.use(express.json());
app.use('/api/health', healthRoutes);
app.use('/api/tasks', taskRoutes);

app.use(errorHandler);

module.exports = app;
