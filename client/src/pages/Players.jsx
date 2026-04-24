import { useState, useEffect } from 'react';
import { getPlayers, reorderPlayers, reorderCsPlayers, resetTurn } from '../api';
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
import { motion, AnimatePresence } from 'framer-motion';
import { GripVertical, RotateCcw, Save, Users, Flame, Swords, Shield } from 'lucide-react';
import Spinner from '../components/ui/Spinner';
import PageHeader from '../components/layout/PageHeader';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import s from './Players.module.css';

/* ─── Sortable Item ────────────────────────────────────────────────────── */
const SortableItem = ({ id, player, index, mode }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
  };

  const brColors = ['#ef4444', '#f97316', '#f59e0b'];
  const csColors = ['#6366f1', '#8b5cf6', '#3b82f6'];
  const rankColors = mode === 'CS' ? csColors : brColors;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={isDragging ? s.sortableItemDragging : s.sortableItem}
    >
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
        <div className={mode === 'CS' ? s.payingBadgeCs : s.payingBadge}>
          {mode === 'CS'
            ? <Shield size={10} fill="currentColor" />
            : <Flame   size={10} fill="currentColor" />}
          Paying Now
        </div>
      )}
    </div>
  );
};

/* ─── Reusable DnD List ────────────────────────────────────────────────── */
const DndList = ({ players, onDragEnd, mode }) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={players.map((p) => p._id)} strategy={verticalListSortingStrategy}>
        {players.map((player, index) => (
          <SortableItem key={player._id} id={player._id} player={player} index={index} mode={mode} />
        ))}
      </SortableContext>
    </DndContext>
  );
};

/* ─── Players Page ─────────────────────────────────────────────────────── */
const Players = () => {
  const { showAlert } = useAppContext();
  const [allPlayers, setAllPlayers] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [mode, setMode]             = useState('BR');   // 'BR' | 'CS'

  // Separate ordered lists for each mode
  const [brPlayers, setBrPlayers] = useState([]);
  const [csPlayers, setCsPlayers] = useState([]);

  const [saving,    setSaving]    = useState(false);
  const [resetting, setResetting] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const fetchPlayers = async () => {
    try {
      const res = await getPlayers();
      const players = res.data.players;
      setAllPlayers(players);

      // Sort BR list: use brOrder if set, else fall back to 'order'
      const br = [...players].sort((a, b) => {
        const ao = a.brOrder != null ? a.brOrder : a.order;
        const bo = b.brOrder != null ? b.brOrder : b.order;
        return ao - bo;
      });
      setBrPlayers(br);

      // Sort CS list: use csOrder if set, else fall back to 'order'
      const cs = [...players].sort((a, b) => {
        const ao = a.csOrder != null ? a.csOrder : a.order;
        const bo = b.csOrder != null ? b.csOrder : b.order;
        return ao - bo;
      });
      setCsPlayers(cs);
    } catch {
      showAlert('Failed to load players', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlayers(); }, []);

  // ── Drag handlers ──────────────────────────────────────────────────────
  const handleBrDragEnd = ({ active, over }) => {
    if (active.id !== over?.id) {
      setBrPlayers((items) => {
        const oi = items.findIndex((i) => i._id === active.id);
        const ni = items.findIndex((i) => i._id === over.id);
        return arrayMove(items, oi, ni);
      });
    }
  };

  const handleCsDragEnd = ({ active, over }) => {
    if (active.id !== over?.id) {
      setCsPlayers((items) => {
        const oi = items.findIndex((i) => i._id === active.id);
        const ni = items.findIndex((i) => i._id === over.id);
        return arrayMove(items, oi, ni);
      });
    }
  };

  // ── Save order ─────────────────────────────────────────────────────────
  const handleSaveOrder = async () => {
    setSaving(true);
    try {
      if (mode === 'BR') {
        await reorderPlayers(brPlayers.map((p, i) => ({ _id: p._id, order: i })));
        showAlert('Battle Royale order updated!', 'success');
      } else {
        await reorderCsPlayers(csPlayers.map((p, i) => ({ _id: p._id, order: i })));
        showAlert('Clash Squad order updated!', 'success');
      }
      fetchPlayers();
    } catch {
      showAlert('Failed to update order', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ── Reset turn ─────────────────────────────────────────────────────────
  const handleResetTurn = async () => {
    setResetting(true);
    try {
      await resetTurn(mode);
      showAlert(`${mode === 'BR' ? 'Battle Royale' : 'Clash Squad'} turn reset to first player`, 'success');
      setShowResetModal(false);
    } catch {
      showAlert('Failed to reset turn', 'error');
    } finally {
      setResetting(false);
    }
  };

  if (loading) return <div className={s.loadingWrap}><Spinner /></div>;

  const activeList     = mode === 'BR' ? brPlayers : csPlayers;
  const activeDragEnd  = mode === 'BR' ? handleBrDragEnd : handleCsDragEnd;

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

      {/* Mode Tabs */}
      <div className={s.modeTabs}>
        <button
          className={mode === 'BR' ? s.modeTabActive : s.modeTab}
          onClick={() => setMode('BR')}
        >
          <Swords size={15} />
          Battle Royale
        </button>
        <button
          className={mode === 'CS' ? s.modeTabActiveCs : s.modeTab}
          onClick={() => setMode('CS')}
        >
          <Shield size={15} />
          Clash Squad
        </button>
      </div>

      {/* Player List */}
      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22 }}
        >
          <p className={s.hint}>
            Drag to reorder · Top player is the current{' '}
            <strong>{mode === 'CS' ? 'Clash Squad' : 'Battle Royale'}</strong> payer
          </p>

          <div className={mode === 'CS' ? s.listCardCs : s.listCard}>
            <DndList players={activeList} onDragEnd={activeDragEnd} mode={mode} />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Reset Modal */}
      <Modal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        title={`Reset ${mode === 'BR' ? 'Battle Royale' : 'Clash Squad'} Cycle`}
        actions={
          <>
            <Button variant="ghost" size="sm" onClick={() => setShowResetModal(false)}>Cancel</Button>
            <Button variant="danger" size="sm" loading={resetting} onClick={handleResetTurn}>Reset</Button>
          </>
        }
      >
        <p className={s.modalText}>
          This will reset the <strong>{mode === 'BR' ? 'Battle Royale' : 'Clash Squad'}</strong> payment
          cycle back to player #1. This cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default Players;
