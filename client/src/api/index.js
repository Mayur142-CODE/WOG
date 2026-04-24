import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('wog_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401 (except login), clear token and redirect
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !err.config.url.includes('/auth/login')) {
      localStorage.removeItem('wog_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────
export const loginApi = (data) => api.post('/auth/login', data);
export const getMe    = ()     => api.get('/auth/me');

// ── Players ───────────────────────────────────────────────────────────────
export const getPlayers     = ()       => api.get('/players');
export const reorderPlayers = (data)   => api.put('/players/reorder', data);
export const createPlayer   = (data)   => api.post('/players', data);
export const deletePlayer   = (id)     => api.delete(`/players/${id}`);

// ── Scrims ────────────────────────────────────────────────────────────────
export const getScrims    = ()         => api.get('/scrims');
export const createScrim  = (data)     => api.post('/scrims', data);
export const updateScrim  = (id, data) => api.put(`/scrims/${id}`, data);
export const deleteScrim  = (id)       => api.delete(`/scrims/${id}`);

// ── Summary ───────────────────────────────────────────────────────────────
export const getSummary = ()  => api.get('/summary');
export const resetTurn  = ()  => api.post('/summary/reset-turn');

// ── Users / Profile ─────────────────────────────────────────────────────
export const updateUsernameApi      = (data)     => api.put('/users/update-username', data);
export const updatePasswordApi      = (data)     => api.put('/users/update-password', data);
export const updateProfileApi       = (data)     => api.put('/users/update-profile', data);
export const createUserApi          = (data)     => api.post('/users', data);
export const updateUserEmailApi     = (id, data) => api.put(`/users/${id}/email`, data);
export const adminUpdatePlayerApi   = (id, data) => api.put(`/users/${id}/admin-update`, data);
export const adminChangePasswordApi = (id, data) => api.put(`/users/${id}/password`, data);

// ── Auth — Password Reset ──────────────────────────────────────────────
export const forgotPasswordApi = (data) => api.post('/auth/forgot-password', data);
export const resetPasswordApi  = (data) => api.post('/auth/reset-password',  data);

export default api;
