const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 3001;

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));

const healthRoutes = require('./routes/healthRoutes');
const taskRoutes = require('./routes/taskRoutes');
const errorHandler = require('./middlewares/errorHandler');

app.use('/api/health', healthRoutes);
app.use('/api/tasks', taskRoutes);

app.use(errorHandler);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

module.exports = app;

