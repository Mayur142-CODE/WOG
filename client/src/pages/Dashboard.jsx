import { useState, useEffect } from 'react';
import { getSummary, createScrim } from '../api';
import { useAppContext } from '../context/AppContext';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { Trophy, TrendingUp, IndianRupee, Gamepad2, Flame, ChevronRight, Loader2, Calendar } from 'lucide-react';
import Spinner from '../components/ui/Spinner';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import s from './Dashboard.module.css';

/* ─── Animated Counter ─────────────────────────────────────────────────── */
const Counter = ({ value, prefix = '', suffix = '' }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const ctrl = animate(count, typeof value === 'number' ? value : 0, { duration: 1.1 });
    const unsub = rounded.on('change', setDisplay);
    return () => { ctrl.stop(); unsub(); };
  }, [value]);

  return <span>{prefix}{display}{suffix}</span>;
};

/* ─── Dashboard ────────────────────────────────────────────────────────── */
const Dashboard = () => {
  const { user, showAlert, refreshTrigger } = useAppContext();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [entryFee, setEntryFee] = useState(30);
  const [rank, setRank] = useState('1');
  const [prizes, setPrizes] = useState({ '1': '', '2': '', '3': '' });
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);

  const fetchSummary = async () => {
    try {
      const res = await getSummary();
      setSummary(res.data);
    } catch {
      showAlert('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSummary(); }, [refreshTrigger]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!summary?.currentPlayer || summary?.currentPlayer === 'N/A')
      return showAlert('No active player! Check Players setup.', 'error');

    setSubmitting(true);
    try {
      const winningAmount = ['1', '2', '3'].includes(rank) ? Number(prizes[rank]) || 0 : 0;
      await createScrim({ 
        player: summary.currentPlayer, 
        entryFee: Number(entryFee), 
        rank, 
        winningAmount,
        date
      });
      showAlert('Scrim saved! Turn passed to next player.', 'success');
      setRank('1');
      setPrizes({ '1': '', '2': '', '3': '' });
      fetchSummary();
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to save scrim', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className={s.loadingWrap}><Spinner /></div>
  );

  const pnlPositive = (summary?.totalProfitLoss ?? 0) >= 0;

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

      {/* Current Turn Banner */}
      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, type: 'spring', damping: 22 }}
        className={s.bannerOuter}
      >
        <div className={s.bannerInner}>
          <div className={s.bannerGlow} />
          <div className={s.bannerContent}>
            {/* Left: current player */}
            <div className={s.bannerLeft}>
              <div className={s.bannerIcon}>
                <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                  <Flame size={22} fill="currentColor" style={{ color: 'var(--color-primary)' }} />
                </motion.div>
              </div>
              <div>
                <p className={s.bannerLabel}>Current Turn — Pay Entry Fee</p>
                <p className={s.bannerPlayer}>{summary?.currentPlayer || 'No Players'}</p>
              </div>
            </div>

            {/* Right: up next */}
            <div className={s.bannerRight}>
              <div style={{ textAlign: 'right' }}>
                <p className={s.upNextLabel}>Up Next</p>
                <p className={s.upNextName}>
                  {summary?.players?.length > 1
                    ? summary.players[(summary.currentIndex + 1) % summary.players.length].name
                    : 'N/A'}
                </p>
              </div>
              <ChevronRight size={16} className={s.upNextArrow} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className={s.statsGrid}>
        <Card.Stat
          title="Total Matches"
          value={<Counter value={summary?.totalMatches || 0} />}
          icon={<Gamepad2 size={20} />}
          accentColor="accent"
          delay={0.08}
        />
        <Card.Stat
          title="Total Spending"
          value={<><span style={{ fontSize: '0.7em', marginRight: 1 }}>₹</span><Counter value={summary?.totalSpending || 0} /></>}
          icon={<IndianRupee size={20} />}
          accentColor="primary"
          delay={0.14}
        />
        <Card.Stat
          title="Total Winning"
          value={<><span style={{ fontSize: '0.7em', marginRight: 1 }}>₹</span><Counter value={summary?.totalWinning || 0} /></>}
          icon={<Trophy size={20} />}
          accentColor="warning"
          delay={0.20}
        />
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32, duration: 0.36 }}
          className={s.formCard}
        >
          {/* Form header */}
          <div className={s.formHeader}>
            <div>
              <h3 className={s.formTitle}>
                <Trophy size={20} className={s.formTitleIcon} />
                Add Scrim Entry
              </h3>
              <p className={s.formSubtitle}>
                Paying Player:{' '}
                <span className={s.playerBadge}>{summary?.currentPlayer}</span>
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className={s.form}>
            {/* Top row: Rank and Date */}
            <div className={s.formRow}>
              <Select
                label="Rank Secured"
                value={rank}
                onChange={(e) => setRank(e.target.value)}
                icon={<Trophy size={16} />}
              >
                <option value="1">🏆 Rank 1 — BOOYAH !</option>
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

            {/* Middle row: Entry Fee */}
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
              <div /> {/* Spacer */}
            </div>

            {/* Prize fields */}
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

            {/* Submit */}
            <div className={s.submitRow}>
              <Button
                type="submit"
                loading={submitting}
                size="lg"
                shimmer
                icon={!submitting && <Trophy size={16} />}
                fullWidth
              >
                {submitting ? 'Processing...' : 'Confirm & Next Turn'}
              </Button>
            </div>
          </form>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;
