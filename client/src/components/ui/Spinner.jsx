import { motion } from 'framer-motion';
import s from './Spinner.module.css';

const Spinner = ({ fullScreen, size = 48 }) => {
  const spinner = (
    <div className={s.center}>
      <div className={s.spinnerBox} style={{ width: size, height: size }}>
        <div className={s.ring} style={{ width: size, height: size }} />
        <div className={s.ringInner} />
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={s.fullScreen}
      >
        {spinner}
      </motion.div>
    );
  }

  return spinner;
};

export default Spinner;
