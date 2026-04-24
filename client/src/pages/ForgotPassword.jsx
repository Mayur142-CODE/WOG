import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPasswordApi } from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, AlertCircle, Loader2, Mail, CheckCircle2, ArrowLeft } from 'lucide-react';
import AnimatedBackground from '../components/layout/AnimatedBackground';
import s from './ForgotPassword.module.css';

const ForgotPassword = () => {
  const [email, setEmail]       = useState('');
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState(false);
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await forgotPasswordApi({ email });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
                Reset Password
              </motion.p>
            </motion.div>

            <AnimatePresence mode="wait">
              {success ? (
                /* ── Success State ───────────────────────────────── */
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
                  <h2 className={s.successTitle}>Check your inbox</h2>
                  <p className={s.successDesc}>
                    If <strong>{email}</strong> is registered, we've sent a password
                    reset link. It expires in <strong>1 hour</strong>.
                  </p>
                  <p className={s.successTip}>
                    Don't see it? Check your spam folder.
                  </p>
                  <Link to="/login" className={s.backLink}>
                    <ArrowLeft size={14} />
                    Back to Login
                  </Link>
                </motion.div>
              ) : (
                /* ── Form State ──────────────────────────────────── */
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <p className={s.descriptor}>
                    Enter your registered email address and we'll send you a
                    secure link to reset your password.
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
                    <motion.div
                      initial={{ opacity: 0, x: -14 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.42 }}
                      className={s.fieldGroup}
                    >
                      <label className={s.fieldLabel}>Email Address</label>
                      <div className={s.fieldInputWrapper}>
                        <div className={s.fieldIcon}>
                          <Mail size={15} />
                        </div>
                        <input
                          id="forgot-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your@email.com"
                          required
                          className={s.fieldInput}
                        />
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.50 }}
                      className={s.submitWrapper}
                    >
                      <motion.button
                        type="submit"
                        id="forgot-submit"
                        disabled={loading}
                        whileHover={{ scale: loading ? 1 : 1.02 }}
                        whileTap={{ scale: loading ? 1 : 0.98 }}
                        className={loading ? s.submitBtnLoading : s.submitBtnActive}
                      >
                        {!loading && <div className={s.submitShimmer} />}
                        <span className={s.submitContent}>
                          {loading && <Loader2 size={16} className={s.submitSpinner} />}
                          {loading ? 'Sending...' : 'Send Reset Link'}
                        </span>
                      </motion.button>
                    </motion.div>
                  </form>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.60 }}
                    className={s.backWrapper}
                  >
                    <Link to="/login" className={s.backLink}>
                      <ArrowLeft size={14} />
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

export default ForgotPassword;
