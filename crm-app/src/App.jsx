import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Devis from './pages/Devis';
import Factures from './pages/Factures';
import Contrats from './pages/Contrats';
import Projets from './pages/Projets';
import VIP from './pages/VIP';
import Evenements from './pages/Evenements';
import Parametres from './pages/Parametres';
import Login from './pages/Login';
import Athletes from './pages/Athletes';
import ConfirmModal from './components/ui/ConfirmModal';

function RequireAuth({ children }) {
  const isAuth = localStorage.getItem('isAuthenticated') === 'true';
  const location = useLocation();
  
  if (!isAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-page)', color: 'var(--text-1)' }}>
        <ConfirmModal />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RequireAuth><Layout /></RequireAuth>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="devis" element={<Devis />} />
            <Route path="factures" element={<Factures />} />
            <Route path="contrats" element={<Contrats />} />
            <Route path="projets" element={<Projets />} />
            <Route path="evenements" element={<Evenements />} />
            <Route path="clients" element={<Clients />} />
            <Route path="athletes" element={<Athletes />} />
            <Route path="vip" element={<VIP />} />
            <Route path="parametres" element={<Parametres />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
