import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, History, Users, User, LogOut, Flame, X } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import s from './Sidebar.module.css';

const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const { user, logout } = useAppContext();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, end: true },
    { name: 'History', path: '/history', icon: History },
    { name: 'Profile', path: '/profile', icon: User },
    ...(user?.role === 'admin'
      ? [{ name: 'Players', path: '/players', icon: Users }]
      : []),
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navContent = (
    <div className={s.sidebar}>
      {/* Brand Header */}
      <div className={s.brand}>
        <div className={s.brandInner}>
          <motion.div
            whileHover={{ scale: 1.1, rotate: 10 }}
            transition={{ type: 'spring', damping: 12 }}
            className={s.brandIcon}
          >
            <Flame size={18} fill="currentColor" />
          </motion.div>
          <div className={s.brandText}>
            <span className={s.brandName}>WRATH OF GOD</span>
            <span className={s.brandSub}>Scrim Manager</span>
          </div>
        </div>
        <button className={s.closeBtn} onClick={() => setIsMobileOpen(false)}>
          <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className={s.nav}>
        <p className={s.navLabel}>Navigation</p>
        <div className={s.navList}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={() => setIsMobileOpen(false)}
                className={({ isActive }) =>
                  isActive ? s.navLinkActive : s.navLink
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div
                        layoutId="sidebarActive"
                        className={s.activeIndicator}
                        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                      />
                    )}
                    <Icon
                      size={18}
                      className={isActive ? s.navIconActive : s.navIcon}
                    />
                    <span className={s.navText}>{item.name}</span>
                    {isActive && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={s.activeDot}
                      />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Divider */}
      <hr className={s.divider} />

      {/* Footer */}
      <div className={s.footer}>
        {/* User badge */}
        <div className={s.userBadge}>
          <div className={s.userAvatar}>
            {user?.displayName?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className={s.userInfo}>
            <p className={s.userName}>{user?.displayName || 'User'}</p>
            <p className={s.userRole}>{user?.role || 'member'}</p>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleLogout}
          className={s.logoutBtn}
        >
          <LogOut size={16} />
          <span>Logout</span>
        </motion.button>

        <p className={s.credit}>Developed by WoG.HERO</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={s.overlay}
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside className={s.sidebarDesktop}>{navContent}</aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={s.sidebarMobile}
          >
            {navContent}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
