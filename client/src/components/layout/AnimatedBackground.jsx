import { memo } from 'react';
import { motion } from 'framer-motion';
import s from './AnimatedBackground.module.css';

const AnimatedBackground = memo(() => (
  <div className={s.wrapper}>
    <div className={s.gradient} />

    {/* Red orb top-left */}
    <motion.div
      animate={{ x: [0, 60, 0], y: [0, -60, 0], scale: [1, 1.2, 1] }}
      transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      className={s.orbRed}
    />

    {/* Orange orb center-right */}
    <motion.div
      animate={{ x: [0, -70, 0], y: [0, 70, 0], scale: [1, 1.15, 1] }}
      transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      className={s.orbOrange}
    />

    {/* Yellow orb bottom */}
    <motion.div
      animate={{ x: [0, 40, 0], y: [0, -40, 0], scale: [1, 1.1, 1] }}
      transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      className={s.orbYellow}
    />

    {/* Subtle grid */}
    <div className={s.grid} />
  </div>
));

AnimatedBackground.displayName = 'AnimatedBackground';
export default AnimatedBackground;
