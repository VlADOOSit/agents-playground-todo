import { Navigate, Route, Routes } from 'react-router-dom';
import TaskPage from './pages/TaskPage/TaskPage';
import './App.css';

function App() {
  return (
    <div className="app-shell">
      <nav className="top-bar">
        <div className="brand">TODO</div>
        <div className="top-bar__links">
          <a href="https://vitejs.dev" target="_blank" rel="noreferrer">
            Vite
          </a>
          <a href="https://expressjs.com/" target="_blank" rel="noreferrer">
            Express
          </a>
        </div>
      </nav>

      <main className="app-shell__content">
        <Routes>
          <Route path="/" element={<TaskPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
