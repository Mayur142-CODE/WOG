import { useState, useEffect } from 'react';
import { getScrims, deleteScrim, updateScrim } from '../api';
import { useAppContext } from '../context/AppContext';
import { motion } from 'framer-motion';
import {
  Search, Download, Trash2, History as HistoryIcon,
  Filter, ChevronLeft, ChevronRight, Pencil, Calendar, Swords, Shield
} from 'lucide-react';
import Spinner from '../components/ui/Spinner';
import PageHeader from '../components/layout/PageHeader';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { Input, Select } from '../components/ui/Input';
import s from './History.module.css';

const ITEMS_PER_PAGE = 15;

const History = () => {
  const { user, showAlert, refreshTrigger } = useAppContext();
  const [scrims, setScrims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch]           = useState('');
  const [playerFilter, setPlayerFilter] = useState('All');
  const [modeFilter, setModeFilter]   = useState('All');   // 'All' | 'BR' | 'CS'
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  
  // Edit state
  const [editTarget, setEditTarget] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [editForm, setEditForm] = useState({
    player: '',
    rank: '1',
    result: 'WIN',
    entryFee: 30,
    winningAmount: 0,
    date: '',
    mode: 'BR',
  });

  const fetchHistory = async () => {
    try {
      const res = await getScrims();
      setScrims(res.data);
    } catch {
      showAlert('Failed to load history', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, [refreshTrigger, showAlert]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteScrim(deleteTarget);
      showAlert('Record deleted successfully', 'success');
      setScrims((prev) => prev.filter((s) => s._id !== deleteTarget));
      setDeleteTarget(null);
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to delete', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleEditInit = (scrim) => {
    setEditTarget(scrim._id);
    setEditForm({
      player:        scrim.player,
      rank:          scrim.rank || '1',
      result:        scrim.result || 'WIN',
      entryFee:      scrim.entryFee,
      winningAmount: scrim.winningAmount,
      date:          new Date(scrim.date).toISOString().split('T')[0],
      mode:          scrim.mode || 'BR',
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await updateScrim(editTarget, editForm);
      showAlert('Record updated successfully', 'success');
      setEditTarget(null);
      fetchHistory();
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to update', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const exportCSV = () => {
    if (scrims.length === 0) return showAlert('No data to export', 'error');
    const headers = ['Date', 'Player', 'Entry Fee', 'Rank', 'Winning', 'Profit/Loss'];
    const rows = filteredScrims.map((scrim) => [
      new Date(scrim.date).toLocaleDateString(),
      scrim.player, scrim.entryFee, scrim.rank, scrim.winningAmount, scrim.profitLoss,
    ]);
    const csv = 'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csv));
    link.setAttribute('download', `WOG_History_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const uniquePlayers = ['All', ...new Set(scrims.map((s) => s.player))];

  const filteredScrims = scrims.filter((scrim) => {
    const matchSearch = scrim.player.toLowerCase().includes(search.toLowerCase()) ||
      (scrim.rank || scrim.result || '').toLowerCase().includes(search.toLowerCase());
    const matchPlayer = playerFilter === 'All' || scrim.player === playerFilter;
    const matchMode   = modeFilter   === 'All' || (scrim.mode || 'BR') === modeFilter;
    return matchSearch && matchPlayer && matchMode;
  });

  const totalPages = Math.ceil(filteredScrims.length / ITEMS_PER_PAGE);
  const paginatedScrims = filteredScrims.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => { setCurrentPage(1); }, [search, playerFilter, modeFilter]);

  if (loading) return <div className={s.loadingWrap}><Spinner /></div>;

  const rankBadge = (scrim) => {
    if ((scrim.mode || 'BR') === 'CS') {
      const isWin = scrim.result === 'WIN';
      return <Badge variant={isWin ? 'success' : 'neutral'} size="sm">{isWin ? '✅ WIN' : '❌ DEFEAT'}</Badge>;
    }
    const map = { '1': ['warning', '🥇 #1'], '2': ['neutral', '🥈 #2'], '3': ['accent', '🥉 #3'] };
    const [variant, label] = map[scrim.rank] || ['neutral', '> #3'];
    return <Badge variant={variant} size="sm">{label}</Badge>;
  };

  const columns = [
    { key: 'date', label: 'Date',
      render: (_, row) => new Date(row.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
      cellClassName: s.fontMedium,
    },
    { key: 'player', label: 'Player', cellClassName: s.fontBold },
    {
      key: 'mode', label: 'Mode', align: 'center',
      render: (_, row) => (
        <span className={(row.mode || 'BR') === 'CS' ? s.badgeCs : s.badgeBr}>
          {row.mode || 'BR'}
        </span>
      ),
    },
    { key: 'result', label: 'Result', align: 'center', render: (_, row) => rankBadge(row) },
    {
      key: 'entryFee', label: 'Fee (₹)', align: 'right',
      render: (val) => <span className={s.feeText}>₹{val}</span>,
    },
    {
      key: 'winningAmount', label: 'Prize (₹)', align: 'right',
      render: (val) => val > 0
        ? <span className={s.prizeMoney}>+₹{val}</span>
        : <span className={s.dashText}>—</span>,
    },
    {
      key: 'profitLoss', label: 'P/L', align: 'right',
      render: (val) => (
        <span className={`${s.profitText} ${val >= 0 ? s.profitPositive : s.profitNegative}`}>
          {val > 0 ? '+' : ''}₹{val}
        </span>
      ),
    },
    ...(user?.role === 'admin' ? [{
      key: 'actions', label: 'Actions', align: 'center',
      render: (_, row) => (
        <div className={s.actionCell}>
          <button onClick={(e) => { e.stopPropagation(); handleEditInit(row); }} className={s.editBtn}>
            <Pencil size={14} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(row._id); }} className={s.deleteBtn}>
            <Trash2 size={14} />
          </button>
        </div>
      ),
    }] : []),
  ];

  return (
    <div className={s.page}>
      <PageHeader
        title="Match History"
        subtitle="Complete ledger of all team scrims and P/L"
        icon={<HistoryIcon size={22} />}
        actions={
          <Button variant="secondary" size="md" icon={<Download size={15} />} onClick={exportCSV}>
            Export CSV
          </Button>
        }
      />

      {/* Mode Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06 }}
        className={s.modeTabs}
      >
        <button
          className={modeFilter === 'All' ? s.modeTabActive : s.modeTab}
          onClick={() => setModeFilter('All')}
        >
          All Modes
        </button>
        <button
          className={modeFilter === 'BR' ? s.modeTabActive : s.modeTab}
          onClick={() => setModeFilter('BR')}
        >
          <Swords size={14} />
          Battle Royale
        </button>
        <button
          className={modeFilter === 'CS' ? s.modeTabActiveCs : s.modeTab}
          onClick={() => setModeFilter('CS')}
        >
          <Shield size={14} />
          Clash Squad
        </button>
      </motion.div>

      {/* Search + Player Filter */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={s.filters}
      >
        <div className={s.searchField}>
          <Input
            placeholder="Search player…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search size={15} />}
          />
        </div>
        <div className={s.filterField}>
          <Select value={playerFilter} onChange={(e) => setPlayerFilter(e.target.value)} icon={<Filter size={15} />}>
            {uniquePlayers.map((p) => (
              <option key={p} value={p}>{p === 'All' ? 'All Players' : p}</option>
            ))}
          </Select>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Table columns={columns} data={paginatedScrims} emptyMessage="No scrim records found." />
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={s.pagination}
        >
          <p className={s.paginationInfo}>
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredScrims.length)} of {filteredScrims.length}
          </p>
          <div className={s.paginationControls}>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={s.pageArrow}
            >
              <ChevronLeft size={17} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={page === currentPage ? s.pageNumActive : s.pageNum}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={s.pageArrow}
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </motion.div>
      )}

      {/* Delete Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Record"
        actions={
          <>
            <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" size="sm" loading={deleting} onClick={handleDelete}>Delete</Button>
          </>
        }
      >
        <p className={s.modalText}>
          Are you sure you want to permanently delete this scrim record? This cannot be undone.
        </p>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="Edit Scrim Record"
        size="md"
        actions={
          <>
            <Button variant="ghost" size="sm" onClick={() => setEditTarget(null)}>Cancel</Button>
            <Button variant="primary" size="sm" loading={updating} onClick={handleUpdate}>Save Changes</Button>
          </>
        }
      >
        <form className={s.editForm} onSubmit={handleUpdate}>
          <div className={s.formGrid}>
            <div className={s.colFull}>
              <Input label="Date" type="date" value={editForm.date}
                onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                icon={<Calendar size={14} />} required />
            </div>
            <div className={s.colFull}>
              <Input label="Player Name" value={editForm.player}
                onChange={(e) => setEditForm({ ...editForm, player: e.target.value })}
                icon={<HistoryIcon size={14} />} required />
            </div>

            {(editForm.mode || 'BR') === 'BR' ? (
              <>
                <div className={s.colHalf}>
                  <Select label="Rank" value={editForm.rank}
                    onChange={(e) => setEditForm({ ...editForm, rank: e.target.value })}>
                    <option value="1">Rank 1</option>
                    <option value="2">Rank 2</option>
                    <option value="3">Rank 3</option>
                    <option value="Below 3">Below 3</option>
                  </Select>
                </div>
                <div className={s.colHalf}>
                  <Input label="Entry Fee (₹)" type="number" value={editForm.entryFee}
                    onChange={(e) => setEditForm({ ...editForm, entryFee: e.target.value })} required />
                </div>
                {['1','2','3'].includes(editForm.rank) && (
                  <div className={s.colFull}>
                    <Input label="Winning Amount (₹)" type="number" value={editForm.winningAmount}
                      onChange={(e) => setEditForm({ ...editForm, winningAmount: e.target.value })} required />
                  </div>
                )}
              </>
            ) : (
              <>
                <div className={s.colHalf}>
                  <Select label="Result" value={editForm.result}
                    onChange={(e) => setEditForm({ ...editForm, result: e.target.value })}>
                    <option value="WIN">WIN</option>
                    <option value="DEFEAT">DEFEAT</option>
                  </Select>
                </div>
                <div className={s.colHalf}>
                  <Input label="Entry Fee (₹)" type="number" value={editForm.entryFee}
                    onChange={(e) => setEditForm({ ...editForm, entryFee: e.target.value })} required />
                </div>
                {editForm.result === 'WIN' && (
                  <div className={s.colFull}>
                    <Input label="Winning Amount (₹)" type="number" value={editForm.winningAmount}
                      onChange={(e) => setEditForm({ ...editForm, winningAmount: e.target.value })} required />
                  </div>
                )}
              </>
            )}
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default History;
