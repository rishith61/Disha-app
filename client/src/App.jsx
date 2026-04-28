import { Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import Assessment from './pages/Assessment';
import Simulation from './pages/Simulation';
import Results from './pages/Results';

function App() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <NavBar />
      <main className="px-4 py-6 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/assessment" element={<Assessment />} />
          <Route path="/simulation" element={<Simulation />} />
          <Route path="/results" element={<Results />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
