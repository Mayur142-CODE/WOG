import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getMe } from '../api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user,      setUser]      = useState(null);
  const [token,     setToken]     = useState(() => localStorage.getItem('wog_token'));
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Validate token on mount / token change
  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await getMe();
          setUser(res.data);
        } catch {
          logout();
        }
      }
      setIsLoading(false);
    };
    fetchUser();
  }, [token]);

  const loginState = (newToken, userData) => {
    localStorage.setItem('wog_token', newToken);
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('wog_token');
    setToken(null);
    setUser(null);
  };

  const showAlert = (message, type = 'success') => {
    type === 'error' ? toast.error(message) : toast.success(message);
  };

  const refreshData = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <AppContext.Provider value={{ 
      user, token, isLoading, loginState, logout, showAlert, 
      refreshTrigger, refreshData 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
