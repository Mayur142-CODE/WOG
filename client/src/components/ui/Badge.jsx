import s from './Badge.module.css';

const variantStyles = {
  success: { bg: 'rgba(34,197,94,0.10)',  border: 'rgba(34,197,94,0.25)',  color: '#22c55e' },
  warning: { bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.25)', color: '#f59e0b' },
  danger:  { bg: 'rgba(239,68,68,0.10)',  border: 'rgba(239,68,68,0.25)',  color: '#ef4444' },
  accent:  { bg: 'rgba(249,115,22,0.10)', border: 'rgba(249,115,22,0.25)', color: '#f97316' },
  neutral: { bg: 'rgba(42,42,42,0.80)',   border: 'rgba(60,60,60,0.60)',   color: '#9ca3af' },
  primary: { bg: 'rgba(239,68,68,0.10)',  border: 'rgba(239,68,68,0.25)',  color: '#ef4444' },
  gold:    { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.30)', color: '#fbbf24' },
  info:    { bg: 'rgba(249,115,22,0.10)', border: 'rgba(249,115,22,0.25)', color: '#f97316' },
};

const sizeClasses = {
  sm: s.sm,
  md: s.md,
  lg: s.lg,
};

const Badge = ({ children, variant = 'neutral', size = 'md', dot = false, className = '' }) => {
  const v = variantStyles[variant] || variantStyles.neutral;

  return (
    <span
      className={`${s.badge} ${sizeClasses[size]} ${className}`}
      style={{ background: v.bg, borderColor: v.border, color: v.color }}
    >
      {dot && <span className={s.dot} />}
      {children}
    </span>
  );
};

export default Badge;
