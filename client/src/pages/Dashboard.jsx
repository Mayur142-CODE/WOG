import { useState, useEffect } from 'react';
import { getSummary, createScrim } from '../api';
import { useAppContext } from '../context/AppContext';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import {
  Trophy, TrendingUp, IndianRupee, Gamepad2, Flame,
  ChevronRight, Calendar, Swords, Shield,
} from 'lucide-react';
import Spinner from '../components/ui/Spinner';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import s from './Dashboard.module.css';

/* ─── Animated Counter ─────────────────────────────────────────────────── */
const Counter = ({ value, prefix = '', suffix = '' }) => {
  const count   = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const ctrl  = animate(count, typeof value === 'number' ? value : 0, { duration: 1.1 });
    const unsub = rounded.on('change', setDisplay);
    return () => { ctrl.stop(); unsub(); };
  }, [value]);

  return <span>{prefix}{display}{suffix}</span>;
};

/* ─── Mode Tab ─────────────────────────────────────────────────────────── */
const ModeTab = ({ active, onClick, icon, label, sub }) => (
  <button
    onClick={onClick}
    className={active ? s.modeTabActive : s.modeTab}
  >
    <span className={s.modeTabIcon}>{icon}</span>
    <span>
      <span className={s.modeTabLabel}>{label}</span>
      <span className={s.modeTabSub}>{sub}</span>
    </span>
  </button>
);

/* ─── Dashboard ────────────────────────────────────────────────────────── */
const Dashboard = () => {
  const { user, showAlert, refreshTrigger } = useAppContext();
  const [mode,    setMode]    = useState('BR');   // 'BR' | 'CS'
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // BR form state
  const [entryFee, setEntryFee] = useState(30);
  const [rank, setRank]         = useState('1');
  const [prizes, setPrizes]     = useState({ '1': '', '2': '', '3': '' });
  const [date,  setDate]        = useState(new Date().toISOString().split('T')[0]);

  // CS form state
  const [csEntryFee, setCsEntryFee]     = useState(30);
  const [csResult, setCsResult]         = useState('WIN');
  const [csWinning, setCsWinning]       = useState('');
  const [csDate, setCsDate]             = useState(new Date().toISOString().split('T')[0]);

  const [submitting, setSubmitting] = useState(false);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await getSummary(mode);
      setSummary(res.data);
    } catch {
      showAlert('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSummary(); }, [mode, refreshTrigger]);

  // ── BR submit ──────────────────────────────────────────────────────────
  const handleBrSubmit = async (e) => {
    e.preventDefault();
    if (!summary?.currentPlayer || summary.currentPlayer === 'N/A')
      return showAlert('No active player! Check Players setup.', 'error');

    setSubmitting(true);
    try {
      const winningAmount = ['1', '2', '3'].includes(rank) ? Number(prizes[rank]) || 0 : 0;
      await createScrim({
        player: summary.currentPlayer,
        entryFee: Number(entryFee),
        rank,
        winningAmount,
        date,
        mode: 'BR',
      });
      showAlert('BR scrim saved! Turn passed to next player.', 'success');
      setRank('1');
      setPrizes({ '1': '', '2': '', '3': '' });
      fetchSummary();
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to save scrim', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // ── CS submit ──────────────────────────────────────────────────────────
  const handleCsSubmit = async (e) => {
    e.preventDefault();
    if (!summary?.currentPlayer || summary.currentPlayer === 'N/A')
      return showAlert('No active player! Check Players setup.', 'error');

    setSubmitting(true);
    try {
      await createScrim({
        player:        summary.currentPlayer,
        entryFee:      Number(csEntryFee),
        result:        csResult,
        winningAmount: csResult === 'WIN' ? Number(csWinning) || 0 : 0,
        date:          csDate,
        mode:          'CS',
      });
      showAlert('CS scrim saved! Turn passed to next player.', 'success');
      setCsResult('WIN');
      setCsWinning('');
      fetchSummary();
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to save scrim', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className={s.loadingWrap}><Spinner /></div>;

  const pnlPositive = (summary?.totalProfitLoss ?? 0) >= 0;
  const nextPlayerName = summary?.players?.length > 1
    ? summary.players[(summary.currentIndex + 1) % summary.players.length]?.name
    : 'N/A';

  return (
    <div className={s.page}>

      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
        className={s.pageHeader}
      >
        <h1 className={s.pageTitle}>Dashboard</h1>
        <p className={s.pageSubtitle}>Overview of team scrims and financials</p>
      </motion.div>

      {/* Mode Selector */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.04 }}
        className={s.modeSwitcher}
      >
        <ModeTab
          active={mode === 'BR'}
          onClick={() => setMode('BR')}
          icon={<Swords size={16} />}
          label="Battle Royale"
          sub="BR"
        />
        <ModeTab
          active={mode === 'CS'}
          onClick={() => setMode('CS')}
          icon={<Shield size={16} />}
          label="Clash Squad"
          sub="CS"
        />
      </motion.div>

      {/* Current Turn Banner */}
      <motion.div
        key={mode}
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, type: 'spring', damping: 22 }}
        className={s.bannerOuter}
        style={mode === 'CS' ? { background: 'linear-gradient(135deg, rgba(99,102,241,0.55), rgba(139,92,246,0.30), rgba(59,130,246,0.15))' } : {}}
      >
        <div className={s.bannerInner}>
          <div className={s.bannerGlow} style={mode === 'CS' ? { background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)' } : {}} />
          <div className={s.bannerContent}>
            <div className={s.bannerLeft}>
              <div className={s.bannerIcon}>
                <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                  {mode === 'CS'
                    ? <Shield size={22} fill="currentColor" style={{ color: '#818cf8' }} />
                    : <Flame  size={22} fill="currentColor" style={{ color: 'var(--color-primary)' }} />}
                </motion.div>
              </div>
              <div>
                <p className={s.bannerLabel}>
                  {mode === 'CS' ? 'Clash Squad' : 'Battle Royale'} — Current Turn · Pay Entry Fee
                </p>
                <p className={s.bannerPlayer}>{summary?.currentPlayer || 'No Players'}</p>
              </div>
            </div>

            <div className={s.bannerRight}>
              <div style={{ textAlign: 'right' }}>
                <p className={s.upNextLabel}>Up Next</p>
                <p className={s.upNextName}>{nextPlayerName}</p>
              </div>
              <ChevronRight size={16} className={s.upNextArrow} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className={s.statsGrid}>
        <Card.Stat title="Total Matches"  value={<Counter value={summary?.totalMatches  || 0} />} icon={<Gamepad2 size={20} />}    accentColor="accent"  delay={0.08} />
        <Card.Stat title="Total Spending" value={<><span style={{ fontSize: '0.7em', marginRight: 1 }}>₹</span><Counter value={summary?.totalSpending  || 0} /></>} icon={<IndianRupee size={20} />} accentColor="primary" delay={0.14} />
        <Card.Stat title="Total Winning"  value={<><span style={{ fontSize: '0.7em', marginRight: 1 }}>₹</span><Counter value={summary?.totalWinning   || 0} /></>} icon={<Trophy size={20} />}      accentColor="warning" delay={0.20} />
        <Card.Stat
          title="Net P/L"
          value={
            <span style={{ color: pnlPositive ? 'var(--color-success)' : 'var(--color-primary)' }}>
              {(summary?.totalProfitLoss ?? 0) > 0 ? '+' : ''}₹<Counter value={Math.abs(summary?.totalProfitLoss || 0)} />
            </span>
          }
          icon={<TrendingUp size={20} />}
          accentColor={pnlPositive ? 'success' : 'danger'}
          delay={0.26}
        />
      </div>

      {/* Add Scrim Form (Admin Only) */}
      {user?.role === 'admin' && (
        <AnimatePresence mode="wait">
          {mode === 'BR' ? (
            <motion.div
              key="br-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className={s.formCard}
            >
              <div className={s.formHeader}>
                <div>
                  <h3 className={s.formTitle}>
                    <Swords size={20} className={s.formTitleIcon} />
                    Add Scrim Entry — Battle Royale
                  </h3>
                  <p className={s.formSubtitle}>
                    Paying Player:{' '}
                    <span className={s.playerBadge}>{summary?.currentPlayer}</span>
                  </p>
                </div>
              </div>

              <form onSubmit={handleBrSubmit} className={s.form}>
                <div className={s.formRow}>
                  <Select
                    label="Rank Secured"
                    value={rank}
                    onChange={(e) => setRank(e.target.value)}
                    icon={<Trophy size={16} />}
                  >
                    <option value="1">🏆 Rank 1 — BOOYAH!</option>
                    <option value="2">🥈 Rank 2</option>
                    <option value="3">🥉 Rank 3</option>
                    <option value="Below 3">💀 Below Rank 3</option>
                  </Select>
                  <Input
                    label="Scrim Date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    icon={<Calendar size={16} />}
                    required
                  />
                </div>

                <div className={s.formRow}>
                  <Input
                    label="Entry Fee (₹)"
                    type="number"
                    min="0"
                    value={entryFee}
                    onChange={(e) => setEntryFee(e.target.value)}
                    icon={<IndianRupee size={16} />}
                    required
                  />
                  <div />
                </div>

                <AnimatePresence>
                  {['1', '2', '3'].includes(rank) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div className={s.prizeSection}>
                        <p className={s.prizeLabel}>
                          <IndianRupee size={12} className={s.prizeLabelIcon} />
                          Prize Distribution
                        </p>
                        <div className={s.prizeGrid}>
                          {[1, 2, 3].map((r) => (
                            <motion.div
                              key={r}
                              animate={{ opacity: rank === String(r) ? 1 : 0.35, scale: rank === String(r) ? 1 : 0.97 }}
                              className={rank !== String(r) ? s.prizeInactive : undefined}
                            >
                              <Input
                                label={`Rank ${r} Prize (₹)`}
                                type="number"
                                min="0"
                                value={prizes[r]}
                                onChange={(e) => setPrizes({ ...prizes, [r]: e.target.value })}
                                placeholder="e.g. 150"
                                required={rank === String(r)}
                              />
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className={s.submitRow}>
                  <Button type="submit" loading={submitting} size="lg" shimmer icon={!submitting && <Trophy size={16} />} fullWidth>
                    {submitting ? 'Processing...' : 'Confirm & Next Turn'}
                  </Button>
                </div>
              </form>
            </motion.div>

          ) : (
            <motion.div
              key="cs-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className={`${s.formCard} ${s.formCardCs}`}
            >
              <div className={s.formHeader}>
                <div>
                  <h3 className={s.formTitle}>
                    <Shield size={20} className={s.formTitleIconCs} />
                    Add Scrim Entry — Clash Squad
                  </h3>
                  <p className={s.formSubtitle}>
                    Paying Player:{' '}
                    <span className={s.playerBadgeCs}>{summary?.currentPlayer}</span>
                  </p>
                </div>
              </div>

              <form onSubmit={handleCsSubmit} className={s.form}>
                <div className={s.formRow}>
                  <Select
                    label="Result"
                    value={csResult}
                    onChange={(e) => setCsResult(e.target.value)}
                    icon={<Shield size={16} />}
                  >
                    <option value="WIN">✅ WIN</option>
                    <option value="DEFEAT">❌ DEFEAT</option>
                  </Select>
                  <Input
                    label="Scrim Date"
                    type="date"
                    value={csDate}
                    onChange={(e) => setCsDate(e.target.value)}
                    icon={<Calendar size={16} />}
                    required
                  />
                </div>

                <div className={s.formRow}>
                  <Input
                    label="Entry Fee (₹)"
                    type="number"
                    min="0"
                    value={csEntryFee}
                    onChange={(e) => setCsEntryFee(e.target.value)}
                    icon={<IndianRupee size={16} />}
                    required
                  />
                  <AnimatePresence>
                    {csResult === 'WIN' && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <Input
                          label="Winning Amount (₹)"
                          type="number"
                          min="0"
                          value={csWinning}
                          onChange={(e) => setCsWinning(e.target.value)}
                          icon={<Trophy size={16} />}
                          placeholder="Prize won"
                          required
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className={s.submitRow}>
                  <Button type="submit" loading={submitting} size="lg" shimmer icon={!submitting && <Shield size={16} />} fullWidth>
                    {submitting ? 'Processing...' : 'Confirm & Next Turn'}
                  </Button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

export default Dashboard;
