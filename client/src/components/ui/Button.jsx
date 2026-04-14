import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import s from './Button.module.css';

const variants = {
  primary: s.primary,
  secondary: s.secondary,
  ghost: s.ghost,
  danger: s.danger,
};

const sizes = {
  sm: s.sm,
  md: s.md,
  lg: s.lg,
  xl: s.xl,
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  shimmer = false,
  fullWidth = false,
  className = '',
  ...props
}) => {
  const isDisabled = disabled || loading;

  const classNames = [
    s.btn,
    variants[variant],
    sizes[size],
    fullWidth ? s.fullWidth : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <motion.button
      whileHover={{ scale: isDisabled ? 1 : 1.02 }}
      whileTap={{ scale: isDisabled ? 1 : 0.97 }}
      disabled={isDisabled}
      className={classNames}
      {...props}
    >
      {shimmer && !isDisabled && variant === 'primary' && (
        <div className={s.shimmer} />
      )}
      <span className={s.content}>
        {loading && <Loader2 size={size === 'sm' ? 13 : 16} className={s.spinner} />}
        {!loading && icon && <span className={s.iconSlot}>{icon}</span>}
        {children}
      </span>
    </motion.button>
  );
};

export default Button;
