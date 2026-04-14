import { motion } from 'framer-motion';
import s from './PageHeader.module.css';

const PageHeader = ({ title, subtitle, icon, actions }) => (
  <motion.div
    initial={{ opacity: 0, y: -8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.28 }}
    className={s.wrapper}
  >
    <div className={s.inner}>
      <div className={s.titleSection}>
        {icon && <div className={s.iconBox}>{icon}</div>}
        <div className={s.textBlock}>
          <h1 className={s.title}>{title}</h1>
          {subtitle && <p className={s.subtitle}>{subtitle}</p>}
        </div>
      </div>
      {actions && <div className={s.actions}>{actions}</div>}
    </div>
  </motion.div>
);

export default PageHeader;
