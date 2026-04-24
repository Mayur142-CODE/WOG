import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User, Lock, Save, Key, ShieldCheck, Mail, Crown,
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { updateProfileApi, updatePasswordApi } from '../api';
import PageHeader from '../components/layout/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import s from './Profile.module.css';

const Profile = () => {
  const { user, setUser, loginState, showAlert } = useAppContext();

  // ── Profile fields ────────────────────────────────────────────────────────
  const [newUsername, setNewUsername] = useState('');
  const [newEmail,    setNewEmail]    = useState('');
  const [profLoading, setProfLoading] = useState(false);

  // ── Password fields ───────────────────────────────────────────────────────
  const [passForm, setPassForm] = useState({
    currentPassword: '', newPassword: '', confirmPassword: '',
  });
  const [passLoading, setPassLoading] = useState(false);

  // ── Handle profile update ─────────────────────────────────────────────────
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!newUsername.trim() && !newEmail.trim())
      return showAlert('Enter a new username or email to update', 'error');

    setProfLoading(true);
    try {
      const payload = {};
      if (newUsername.trim()) payload.username = newUsername.trim();
      if (newEmail.trim())    payload.email    = newEmail.trim();

      const res = await updateProfileApi(payload);
      showAlert(res.data.message, 'success');

      // Refresh token + user in context and localStorage
      loginState(res.data.token, res.data.user);
      setUser(res.data.user);
      setNewUsername('');
      setNewEmail('');
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setProfLoading(false);
    }
  };

  // ── Handle password update ─────────────────────────────────────────────────
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passForm;
    if (!currentPassword || !newPassword)
      return showAlert('All fields are required', 'error');
    if (newPassword.length < 4)
      return showAlert('New password must be at least 4 characters', 'error');
    if (newPassword !== confirmPassword)
      return showAlert('Passwords do not match', 'error');

    setPassLoading(true);
    try {
      const res = await updatePasswordApi({ currentPassword, newPassword });
      showAlert(res.data.message, 'success');
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to update password', 'error');
    } finally {
      setPassLoading(false);
    }
  };

  const displayName = user?.displayName || user?.name || user?.username || 'User';
  const isAdmin     = user?.role === 'admin';

  return (
    <div className={s.page}>
      <PageHeader
        title="Account Settings"
        subtitle="Manage your credentials and security"
        icon={<ShieldCheck size={22} />}
      />

      {/* Identity Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className={s.identityCard}
      >
        <div className={s.avatarCircle}>
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div className={s.identityInfo}>
          <div className={s.identityNameRow}>
            <h2 className={s.identityName}>{displayName}</h2>
            {isAdmin && (
              <span className={s.adminBadge}>
                <Crown size={11} fill="currentColor" /> Admin
              </span>
            )}
          </div>
          <div className={s.identityMeta}>
            <span className={s.metaItem}>
              <User size={12} />
              {user?.username || '—'}
            </span>
            <span className={s.metaItem}>
              <Mail size={12} />
              {user?.email || 'No email set'}
            </span>
          </div>
        </div>
      </motion.div>

      <div className={s.grid}>
        {/* Profile Update Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
        >
          <Card className={s.card}>
            <div className={s.cardHeader}>
              <div className={s.headerIcon}><User size={20} /></div>
              <div>
                <h3 className={s.cardTitle}>Update Profile</h3>
                <p className={s.cardSubtitle}>Change your username or email address</p>
              </div>
            </div>

            <form onSubmit={handleProfileUpdate} className={s.form}>
              <Input
                label="Current Username"
                value={user?.username || ''}
                disabled
                icon={<User size={14} />}
              />
              <Input
                label="Current Email"
                value={user?.email || 'Not set'}
                disabled
                icon={<Mail size={14} />}
              />
              <Input
                label="New Username"
                placeholder="Leave blank to keep current…"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                icon={<User size={14} />}
              />
              <Input
                label="New Email"
                type="email"
                placeholder="Leave blank to keep current…"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                icon={<Mail size={14} />}
              />
              <div className={s.submitRow}>
                <Button
                  type="submit"
                  loading={profLoading}
                  icon={<Save size={16} />}
                  fullWidth
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>

        {/* Password Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.12 }}
        >
          <Card className={s.card}>
            <div className={s.cardHeader}>
              <div className={s.headerIcon}><Lock size={20} /></div>
              <div>
                <h3 className={s.cardTitle}>Security</h3>
                <p className={s.cardSubtitle}>Change your account password</p>
              </div>
            </div>

            <form onSubmit={handlePasswordUpdate} className={s.form}>
              <Input
                label="Current Password"
                type="password"
                placeholder="••••••••"
                value={passForm.currentPassword}
                onChange={(e) => setPassForm({ ...passForm, currentPassword: e.target.value })}
                icon={<Key size={14} />}
                required
              />
              <Input
                label="New Password"
                type="password"
                placeholder="At least 4 chars…"
                value={passForm.newPassword}
                onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })}
                icon={<Lock size={14} />}
                required
              />
              <Input
                label="Confirm New Password"
                type="password"
                placeholder="Repeat new password…"
                value={passForm.confirmPassword}
                onChange={(e) => setPassForm({ ...passForm, confirmPassword: e.target.value })}
                icon={<ShieldCheck size={14} />}
                required
              />
              <div className={s.submitRow}>
                <Button
                  type="submit"
                  loading={passLoading}
                  variant="primary"
                  icon={<Save size={16} />}
                  fullWidth
                >
                  Update Password
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
