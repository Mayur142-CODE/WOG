import { motion } from 'framer-motion';
import s from './Card.module.css';

/* ── Base Card ─────────────────────────────────────────────────────────── */
const Card = ({ children, hover = false, delay = 0, className = '', ...props }) => (
  <motion.div
    initial={{ opacity: 0, y: 18 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.30, delay, ease: 'easeOut' }}
    whileHover={hover ? { y: -3, transition: { duration: 0.18 } } : undefined}
    className={`${hover ? s.cardHover : s.card} ${className}`}
    {...props}
  >
    {children}
  </motion.div>
);

/* ── Stat Card ─────────────────────────────────────────────────────────── */
const glowMap = {
  primary: 'var(--shadow-glow-primary)',
  accent:  'var(--shadow-glow-accent)',
  warning: 'var(--shadow-glow-yellow)',
  danger:  'var(--shadow-glow-primary)',
  success: 'var(--shadow-glow-success)',
};

const colorMap = {
  primary: { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.20)', color: 'var(--color-primary)' },
  accent:  { bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.20)', color: 'var(--color-accent)' },
  warning: { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.20)', color: 'var(--color-secondary)' },
  danger:  { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.20)', color: 'var(--color-primary)' },
  success: { bg: 'rgba(34,197,94,0.08)',  border: 'rgba(34,197,94,0.20)',  color: 'var(--color-success)' },
};

const StatCard = ({ title, value, icon, accentColor = 'primary', delay = 0 }) => {
  const c = colorMap[accentColor] || colorMap.primary;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay, ease: 'easeOut' }}
      whileHover={{ y: -4, boxShadow: glowMap[accentColor], transition: { duration: 0.18 } }}
      className={s.statCard}
    >
      <div
        className={s.accentLine}
        style={{ background: `linear-gradient(90deg, ${c.color}, transparent)` }}
      />
      <div className={s.statContent}>
        <div className={s.statText}>
          <p className={s.statLabel}>{title}</p>
          <div className={s.statValue}>{value}</div>
        </div>
        <div
          className={s.statIcon}
          style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.color }}
        >
          {icon}
        </div>
      </div>
    </motion.div>
  );
};

Card.Stat = StatCard;

export default Card;
