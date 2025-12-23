const express = require('express');

const healthRoutes = require('./routes/healthRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();

app.use(express.json());
app.use('/api/health', healthRoutes);
app.use('/api/tasks', taskRoutes);

module.exports = app;
