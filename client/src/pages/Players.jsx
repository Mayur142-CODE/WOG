import { useState, useEffect } from 'react';
import { getPlayers, reorderPlayers, resetTurn } from '../api';
import { useAppContext } from '../context/AppContext';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors,
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy, useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { GripVertical, RotateCcw, Save, Users, Flame } from 'lucide-react';
import Spinner from '../components/ui/Spinner';
import PageHeader from '../components/layout/PageHeader';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import s from './Players.module.css';

/* ─── Sortable Item ────────────────────────────────────────────────────── */
const SortableItem = ({ id, player, index }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
  };

  const rankColors = ['#ef4444', '#f97316', '#f59e0b'];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={isDragging ? s.sortableItemDragging : s.sortableItem}
    >
      {/* Left accent for top 3 */}
      {index < 3 && (
        <div className={s.rankAccent} style={{ background: rankColors[index] }} />
      )}

      <div {...attributes} {...listeners} className={s.gripHandle}>
        <GripVertical size={17} />
      </div>

      <div
        className={s.rankBadge}
        style={{
          background: index < 3 ? `${rankColors[index]}18` : 'var(--color-bg-elevated)',
          border: `1px solid ${index < 3 ? `${rankColors[index]}40` : 'var(--color-border-default)'}`,
          color: index < 3 ? rankColors[index] : 'var(--color-text-faint)',
        }}
      >
        {index + 1}
      </div>

      <span className={s.playerName}>{player.name}</span>

      {index === 0 && (
        <div className={s.payingBadge}>
          <Flame size={10} fill="currentColor" />
          Paying Now
        </div>
      )}
    </div>
  );
};

/* ─── Players Page ─────────────────────────────────────────────────────── */
const Players = () => {
  const { showAlert } = useAppContext();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetting, setResetting] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

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

  useEffect(() => { fetchPlayers(); }, [showAlert]);

  const handleDragEnd = ({ active, over }) => {
    if (active.id !== over?.id) {
      setPlayers((items) => {
        const oi = items.findIndex((i) => i._id === active.id);
        const ni = items.findIndex((i) => i._id === over.id);
        return arrayMove(items, oi, ni);
      });
    }
  };

  const handleSaveOrder = async () => {
    setSaving(true);
    try {
      await reorderPlayers(players.map((p, i) => ({ _id: p._id, order: i })));
      showAlert('Player order updated successfully', 'success');
      fetchPlayers();
    } catch {
      showAlert('Failed to update order', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleResetTurn = async () => {
    setResetting(true);
    try {
      await resetTurn();
      showAlert('Turn cycle reset successfully', 'success');
      setShowResetModal(false);
    } catch {
      showAlert('Failed to reset turn', 'error');
    } finally {
      setResetting(false);
    }
  };

  if (loading) return <div className={s.loadingWrap}><Spinner /></div>;

  return (
    <div className={s.page}>
      <PageHeader
        title="Roster & Pay Order"
        subtitle="Drag and drop to reconfigure the cyclic payment rotation"
        icon={<Users size={22} />}
        actions={
          <div className={s.actionsRow}>
            <Button variant="secondary" size="md" icon={<RotateCcw size={15} />} onClick={() => setShowResetModal(true)}>
              Reset Cycle
            </Button>
            <Button size="md" icon={<Save size={15} />} loading={saving} shimmer onClick={handleSaveOrder}>
              {saving ? 'Saving…' : 'Save Order'}
            </Button>
          </div>
        }
      />

      {/* Player list */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <p className={s.hint}>Drag to reorder · Top player is the current payer</p>

        <div className={s.listCard}>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={players.map((p) => p._id)} strategy={verticalListSortingStrategy}>
              {players.map((player, index) => (
                <SortableItem key={player._id} id={player._id} player={player} index={index} />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </motion.div>

      {/* Reset Modal */}
      <Modal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        title="Reset Turn Cycle"
        actions={
          <>
            <Button variant="ghost" size="sm" onClick={() => setShowResetModal(false)}>Cancel</Button>
            <Button variant="danger" size="sm" loading={resetting} onClick={handleResetTurn}>Reset</Button>
          </>
        }
      >
        <p className={s.modalText}>
          This will reset the payment cycle back to player #1. The current payer will change. This cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default Players;
