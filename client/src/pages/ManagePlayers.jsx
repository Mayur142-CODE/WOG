import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, Edit3, Key, Trash2, Crown, Eye,
  EyeOff, Save, X, Users,
} from 'lucide-react';
import { getPlayers, deletePlayer } from '../api';
import { adminUpdatePlayerApi, adminChangePasswordApi } from '../api';
import { useAppContext } from '../context/AppContext';
import PageHeader from '../components/layout/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import s from './ManagePlayers.module.css';

/* ─── Edit Player Modal ────────────────────────────────────────────────── */
const EditModal = ({ player, onClose, onSaved, showAlert }) => {
  const [form, setForm]     = useState({
    name:     player.name     || '',
    username: player.username || '',
    email:    player.email    || '',
    role:     player.role     || 'viewer',
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminUpdatePlayerApi(player._id, form);
      showAlert('Player updated successfully', 'success');
      onSaved();
      onClose();
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to update player', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`Edit — ${player.name}`}
      actions={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} icon={<X size={14} />}>Cancel</Button>
          <Button size="sm" loading={loading} icon={<Save size={14} />} onClick={handleSave}>Save</Button>
        </>
      }
    >
      <form onSubmit={handleSave} className={s.modalForm}>
        <Input
          label="Display Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <Input
          label="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <Select
          label="Role"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="viewer">Viewer</option>
          <option value="admin">Admin</option>
        </Select>
      </form>
    </Modal>
  );
};

/* ─── Change Password Modal ────────────────────────────────────────────── */
const PasswordModal = ({ player, onClose, showAlert }) => {
  const [newPassword, setNewPassword] = useState('');
  const [show,        setShow]        = useState(false);
  const [loading,     setLoading]     = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (newPassword.length < 4)
      return showAlert('Password must be at least 4 characters', 'error');
    setLoading(true);
    try {
      await adminChangePasswordApi(player._id, { newPassword });
      showAlert(`Password updated for ${player.name}`, 'success');
      onClose();
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to update password', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`Change Password — ${player.name}`}
      actions={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} icon={<X size={14} />}>Cancel</Button>
          <Button size="sm" loading={loading} icon={<Key size={14} />} onClick={handleSave}>Update</Button>
        </>
      }
    >
      <form onSubmit={handleSave} className={s.modalForm}>
        <div className={s.passRow}>
          <Input
            label="New Password"
            type={show ? 'text' : 'password'}
            placeholder="Min 4 characters…"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <button type="button" className={s.eyeBtn} onClick={() => setShow((v) => !v)} tabIndex={-1}>
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </form>
    </Modal>
  );
};

/* ─── Delete Confirm Modal ─────────────────────────────────────────────── */
const DeleteModal = ({ player, onClose, onDeleted, showAlert }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deletePlayer(player._id);
      showAlert(`${player.name} deleted`, 'success');
      onDeleted();
      onClose();
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to delete player', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Delete Player"
      actions={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="danger" size="sm" loading={loading} onClick={handleDelete}>Delete</Button>
        </>
      }
    >
      <p className={s.deleteText}>
        Are you sure you want to permanently delete <strong>{player.name}</strong>?
        This will remove them from the roster. This cannot be undone.
      </p>
    </Modal>
  );
};

/* ─── Main Page ────────────────────────────────────────────────────────── */
const ManagePlayers = () => {
  const { showAlert } = useAppContext();
  const [players, setPlayers]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [editTarget,   setEditTarget]   = useState(null);
  const [passTarget,   setPassTarget]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchPlayers = async () => {
    try {
      const res = await getPlayers();
      setPlayers(res.data.players);
    } catch {
      showAlert('Failed to load players', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlayers(); }, []);

  return (
    <div className={s.page}>
      <PageHeader
        title="Manage Users"
        subtitle="Admin controls — edit credentials, roles, and passwords"
        icon={<ShieldCheck size={22} />}
      />

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
      >
        <Card className={s.tableCard}>
          {loading ? (
            <div className={s.loadingText}>Loading players…</div>
          ) : (
            <div className={s.tableWrapper}>
              <table className={s.table}>
                <thead>
                  <tr>
                    <th className={s.th}>Player</th>
                    <th className={s.th}>Username</th>
                    <th className={s.th}>Email</th>
                    <th className={s.th}>Role</th>
                    <th className={s.th + ' ' + s.thActions}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((p, i) => (
                    <motion.tr
                      key={p._id}
                      className={s.tr}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <td className={s.td}>
                        <div className={s.playerCell}>
                          <div className={s.avatar}>{p.name.charAt(0)}</div>
                          <span className={s.playerName}>{p.name}</span>
                        </div>
                      </td>
                      <td className={s.td}>
                        <span className={s.mono}>{p.username || '—'}</span>
                      </td>
                      <td className={s.td}>
                        <span className={s.emailText}>{p.email || '—'}</span>
                      </td>
                      <td className={s.td}>
                        <span className={p.role === 'admin' ? s.roleAdmin : s.roleViewer}>
                          {p.role === 'admin' && <Crown size={10} fill="currentColor" />}
                          {p.role}
                        </span>
                      </td>
                      <td className={s.td}>
                        <div className={s.actions}>
                          <button
                            className={s.actionBtn}
                            onClick={() => setEditTarget(p)}
                            title="Edit credentials"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            className={s.actionBtn}
                            onClick={() => setPassTarget(p)}
                            title="Change password"
                          >
                            <Key size={15} />
                          </button>
                          <button
                            className={s.actionBtnDanger}
                            onClick={() => setDeleteTarget(p)}
                            title="Delete player"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {editTarget && (
          <EditModal
            player={editTarget}
            onClose={() => setEditTarget(null)}
            onSaved={fetchPlayers}
            showAlert={showAlert}
          />
        )}
        {passTarget && (
          <PasswordModal
            player={passTarget}
            onClose={() => setPassTarget(null)}
            showAlert={showAlert}
          />
        )}
        {deleteTarget && (
          <DeleteModal
            player={deleteTarget}
            onClose={() => setDeleteTarget(null)}
            onDeleted={fetchPlayers}
            showAlert={showAlert}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManagePlayers;
