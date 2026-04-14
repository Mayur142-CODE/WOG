import { Navigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import Spinner from './ui/Spinner';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, token, isLoading } = useAppContext();
  const location = useLocation();

  if (isLoading) return <Spinner fullScreen />;
  if (!token || !user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (requireAdmin && user.role !== 'admin') return <Navigate to="/" replace />;

  return children;
};

export default ProtectedRoute;
