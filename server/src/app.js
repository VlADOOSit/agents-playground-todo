const express = require('express');
const cors = require('cors');
const healthRoutes = require('./routes/healthRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));

app.use(express.json());
app.use('/api/health', healthRoutes);
app.use('/api/tasks', taskRoutes);

module.exports = app;
