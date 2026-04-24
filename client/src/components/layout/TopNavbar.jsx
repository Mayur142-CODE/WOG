import { Menu, LogOut, Crown, Bell } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import s from './TopNavbar.module.css';

const TopNavbar = ({ setIsMobileOpen }) => {
  const { user, logout } = useAppContext();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <header className={s.header}>
      {/* Left */}
      <div className={s.left}>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsMobileOpen(true)}
          className={s.menuBtn}
        >
          <Menu size={20} />
        </motion.button>
        <span className={s.brandText}>Wrath of God</span>
      </div>

      {/* Right */}
      <div className={s.right}>
        {/* Notification */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={s.iconBtn}
        >
          <Bell size={16} />
          <span className={s.notifDot} />
        </motion.button>

        {/* Divider */}
        <div className={s.divider} />

        {/* User */}
        <div className={s.userSection}>
          <div className={s.userAvatar}>
            {(user?.displayName || user?.name || user?.username)?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className={s.userDetails}>
            <div className={s.userNameRow}>
              <span className={s.userNameText}>{user?.displayName || user?.name || user?.username || '...'}</span>
              {user?.role === 'admin' && (
                <Crown size={11} fill="currentColor" className={s.crownIcon} />
              )}
            </div>
            <p className={s.userRoleText}>
              {user?.role === 'admin' ? 'Admin' : 'Viewer'}
            </p>
          </div>
        </div>

        {/* Logout */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className={s.logoutBtn}
        >
          <LogOut size={15} />
          <span className={s.logoutLabel}>Logout</span>
        </motion.button>
      </div>
    </header>
  );
};

export default TopNavbar;
