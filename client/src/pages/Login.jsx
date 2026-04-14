import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { loginApi } from '../api';
import { useAppContext } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, AlertCircle, Loader2, User, Lock } from 'lucide-react';
import AnimatedBackground from '../components/layout/AnimatedBackground';
import s from './Login.module.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { loginState } = useAppContext();
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await loginApi({ username, password });
      loginState(res.data.token, res.data.user);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={s.page}>
      <AnimatedBackground />

      {/* Centered card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.45, type: 'spring', damping: 22 }}
        className={s.cardWrapper}
      >
        <div className={s.gradientBorder}>
          <div className={s.card}>
            <div className={s.innerGlow} />

            {/* Logo */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.15, type: 'spring', damping: 14 }}
              className={s.logoSection}
            >
              <motion.div
                whileHover={{ scale: 1.08, rotate: 5 }}
                transition={{ type: 'spring', damping: 12 }}
                className={s.logoIcon}
              >
                <div className={s.logoShine} />
                <Flame size={30} fill="currentColor" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28 }}
                className={s.logoTitle}
              >
                WRATH OF GOD
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className={s.logoSubtitle}
              >
                Scrim Manager · Login
              </motion.p>
            </motion.div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  className={s.errorAlert}
                >
                  <AlertCircle size={15} className={s.errorIcon} />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit} className={s.form}>
              {/* Username */}
              <motion.div
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.42 }}
                className={s.fieldGroup}
              >
                <label className={s.fieldLabel}>Username</label>
                <div className={s.fieldInputWrapper}>
                  <div className={s.fieldIcon}>
                    <User size={15} />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. mayur"
                    required
                    className={s.fieldInput}
                  />
                </div>
              </motion.div>

              {/* Password */}
              <motion.div
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.50 }}
                className={s.fieldGroup}
              >
                <label className={s.fieldLabel}>Password</label>
                <div className={s.fieldInputWrapper}>
                  <div className={s.fieldIcon}>
                    <Lock size={15} />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className={s.fieldInput}
                  />
                </div>
              </motion.div>

              {/* Submit */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.58 }}
                className={s.submitWrapper}
              >
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className={loading ? s.submitBtnLoading : s.submitBtnActive}
                >
                  {!loading && <div className={s.submitShimmer} />}
                  <span className={s.submitContent}>
                    {loading && <Loader2 size={16} className={s.submitSpinner} />}
                    {loading ? 'Authenticating...' : 'Login'}
                  </span>
                </motion.button>
              </motion.div>
            </form>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.72 }}
              className={s.footer}
            >
              Developed by WoG.HERO · v2.0
            </motion.p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
