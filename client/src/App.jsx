import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider } from './context/AppContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Profile from './pages/Profile';
import Players from './pages/Players';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

const toastOptions = {
  style: {
    background: '#1a1a1a',
    color: '#ffffff',
    border: '1px solid #2a2a2a',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
  },
  success: {
    iconTheme: { primary: '#f97316', secondary: '#fff' },
  },
  error: {
    iconTheme: { primary: '#ef4444', secondary: '#fff' },
  },
};

const NotFound = () => (
  <div
    style={{
      display: 'flex',
      height: '100vh',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.5rem',
      fontWeight: 900,
      background: 'var(--color-bg-base)',
      color: 'var(--color-text-primary)',
    }}
  >
    404 — Page Not Found
  </div>
);

const AppContent = () => (
  <>
    <Toaster position="top-right" toastOptions={toastOptions} />
    <Routes>
      <Route path="/login"           element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password"  element={<ResetPassword />} />

      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/history" element={<History />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/players" element={<ProtectedRoute requireAdmin><Players /></ProtectedRoute>} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  </>
);

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
