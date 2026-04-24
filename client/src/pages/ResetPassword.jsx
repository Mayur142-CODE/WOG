import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { resetPasswordApi } from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, AlertCircle, Loader2, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import AnimatedBackground from '../components/layout/AnimatedBackground';
import s from './ResetPassword.module.css';

const ResetPassword = () => {
  const [searchParams]          = useSearchParams();
  const token                   = searchParams.get('token') || '';

  const [newPassword, setNewPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew]                 = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);
  const [error, setError]                     = useState('');
  const [success, setSuccess]                 = useState(false);
  const [loading, setLoading]                 = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      return setError('Reset token is missing. Please use the link from your email.');
    }
    if (newPassword.length < 4) {
      return setError('Password must be at least 4 characters.');
    }
    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match.');
    }

    setLoading(true);
    try {
      await resetPasswordApi({ token, newPassword });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  // No token in URL — show error immediately
  if (!token) {
    return (
      <div className={s.page}>
        <AnimatedBackground />
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.45, type: 'spring', damping: 22 }}
          className={s.cardWrapper}
        >
          <div className={s.gradientBorder}>
            <div className={s.card}>
              <div className={s.innerGlow} />
              <div className={s.invalidBox}>
                <AlertCircle size={40} className={s.invalidIcon} />
                <h2 className={s.invalidTitle}>Invalid Reset Link</h2>
                <p className={s.invalidDesc}>
                  This link is missing the reset token. Please request a new
                  password reset from the login page.
                </p>
                <Link to="/forgot-password" className={s.actionLink}>
                  Request New Link
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={s.page}>
      <AnimatedBackground />

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
                New Password
              </motion.p>
            </motion.div>

            <AnimatePresence mode="wait">
              {success ? (
                /* ── Success ─────────────────────────────────────── */
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className={s.successBox}
                >
                  <div className={s.successIcon}>
                    <CheckCircle2 size={32} />
                  </div>
                  <h2 className={s.successTitle}>Password Reset!</h2>
                  <p className={s.successDesc}>
                    Your password has been updated. Redirecting you to login…
                  </p>
                  <Link to="/login" className={s.actionLink}>
                    Go to Login
                  </Link>
                </motion.div>
              ) : (
                /* ── Form ────────────────────────────────────────── */
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <p className={s.descriptor}>
                    Choose a new password for your account. Minimum 4 characters.
                  </p>

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

                  <form onSubmit={handleSubmit} className={s.form}>
                    {/* New Password */}
                    <motion.div
                      initial={{ opacity: 0, x: -14 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.42 }}
                      className={s.fieldGroup}
                    >
                      <label className={s.fieldLabel}>New Password</label>
                      <div className={s.fieldInputWrapper}>
                        <div className={s.fieldIcon}><Lock size={15} /></div>
                        <input
                          id="reset-new-password"
                          type={showNew ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          minLength={4}
                          className={s.fieldInput}
                        />
                        <button
                          type="button"
                          className={s.eyeBtn}
                          onClick={() => setShowNew((v) => !v)}
                          tabIndex={-1}
                          aria-label={showNew ? 'Hide password' : 'Show password'}
                        >
                          {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </motion.div>

                    {/* Confirm Password */}
                    <motion.div
                      initial={{ opacity: 0, x: -14 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.50 }}
                      className={s.fieldGroup}
                    >
                      <label className={s.fieldLabel}>Confirm Password</label>
                      <div className={s.fieldInputWrapper}>
                        <div className={s.fieldIcon}><Lock size={15} /></div>
                        <input
                          id="reset-confirm-password"
                          type={showConfirm ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          className={s.fieldInput}
                        />
                        <button
                          type="button"
                          className={s.eyeBtn}
                          onClick={() => setShowConfirm((v) => !v)}
                          tabIndex={-1}
                          aria-label={showConfirm ? 'Hide password' : 'Show password'}
                        >
                          {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.58 }}
                      className={s.submitWrapper}
                    >
                      <motion.button
                        type="submit"
                        id="reset-submit"
                        disabled={loading}
                        whileHover={{ scale: loading ? 1 : 1.02 }}
                        whileTap={{ scale: loading ? 1 : 0.98 }}
                        className={loading ? s.submitBtnLoading : s.submitBtnActive}
                      >
                        {!loading && <div className={s.submitShimmer} />}
                        <span className={s.submitContent}>
                          {loading && <Loader2 size={16} className={s.submitSpinner} />}
                          {loading ? 'Resetting...' : 'Reset Password'}
                        </span>
                      </motion.button>
                    </motion.div>
                  </form>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.65 }}
                    className={s.backWrapper}
                  >
                    <Link to="/login" className={s.backLink}>
                      Back to Login
                    </Link>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

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

export default ResetPassword;
