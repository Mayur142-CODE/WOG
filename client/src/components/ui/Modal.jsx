import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import s from './Modal.module.css';

const Modal = ({ isOpen, onClose, title, children, actions }) => (
  <AnimatePresence>
    {isOpen && (
      <div className={s.overlay}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={s.backdrop}
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className={s.panel}
        >
          <div className={s.accentLine} />

          {/* Header */}
          <div className={s.header}>
            <h3 className={s.title}>{title}</h3>
            <button onClick={onClose} className={s.closeBtn}>
              <X size={17} />
            </button>
          </div>

          {/* Body */}
          <div className={s.body}>{children}</div>

          {/* Actions */}
          {actions && <div className={s.actions}>{actions}</div>}
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

export default Modal;
