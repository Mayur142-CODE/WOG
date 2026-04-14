import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Save, Key, ShieldCheck } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { updateUsernameApi, updatePasswordApi } from '../api';
import PageHeader from '../components/layout/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import s from './Profile.module.css';

const Profile = () => {
  const { user, loginState, showAlert, refreshData } = useAppContext();
  
  // Username state
  const [newUsername, setNewUsername] = useState('');
  const [userLoading, setUserLoading] = useState(false);

  // Password state
  const [passForm, setPassForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passLoading, setPassLoading] = useState(false);

  const handleUsernameUpdate = async (e) => {
    e.preventDefault();
    if (!newUsername.trim()) return showAlert('Username cannot be empty', 'error');
    if (newUsername.trim().toLowerCase() === user.username) return showAlert('This is already your username', 'error');

    setUserLoading(true);
    try {
      const res = await updateUsernameApi({ newUsername: newUsername.trim() });
      showAlert(res.data.message, 'success');
      
      // Update local context/storage with new token and user data
      loginState(res.data.token, res.data.user);
      
      setNewUsername('');
      
      // Notify other components to refresh their data
      refreshData();
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to update username', 'error');
    } finally {
      setUserLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passForm;

    if (!currentPassword || !newPassword) return showAlert('All fields are required', 'error');
    if (newPassword.length < 4) return showAlert('New password must be at least 4 characters', 'error');
    if (newPassword !== confirmPassword) return showAlert('Passwords do not match', 'error');

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

  return (
    <div className={s.page}>
      <PageHeader
        title="Account Settings"
        subtitle="Manage your credentials and security"
        icon={<ShieldCheck size={22} />}
      />

      <div className={s.grid}>
        {/* Username Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className={s.card}>
            <div className={s.cardHeader}>
              <div className={s.headerIcon}><User size={20} /></div>
              <div>
                <h3 className={s.cardTitle}>Change Username</h3>
                <p className={s.cardSubtitle}>Update your public identifier</p>
              </div>
            </div>

            <form onSubmit={handleUsernameUpdate} className={s.form}>
              <Input
                label="Current Username"
                value={user?.username || ''}
                disabled
                icon={<User size={14} />}
              />
              <Input
                label="New Username"
                placeholder="Enter new username…"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                icon={<User size={14} />}
                required
              />
              <div className={s.submitRow}>
                <Button 
                  type="submit" 
                  loading={userLoading} 
                  icon={<Save size={16} />}
                  fullWidth
                >
                  Update Username
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>

        {/* Password Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
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
