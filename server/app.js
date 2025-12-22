const express = require('express');
const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

const healthRoutes = require('./routes/healthRoutes');
const taskRoutes = require('./routes/taskRoutes');

app.use('/api/health', healthRoutes);
app.use('/api/tasks', taskRoutes);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

module.exports = app;

