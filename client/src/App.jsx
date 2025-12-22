import { Routes, Route } from 'react-router-dom';
import TasksPage from './pages/TasksPage';
import './App.css';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<TasksPage />} />
      </Routes>
    </div>
  );
}

export default App;
