import { useState, useEffect, useMemo } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useElderData } from '../../hooks/useElderData';
import { useLogs } from '../../hooks/useLogs';
import { getFormattedDate, getFormattedTime } from '../../utils/dateUtils';
import { getTimeGroup, groupLabels, groupEmojis, groupOrder } from '../../utils/timeGroups';
import type { GroupedMedications, MedicationLog, TimeGroup as TimeGroupType } from '../../types';
import TimeGroup from './TimeGroup';
import Confetti from '../common/Confetti';
import LoadingSpinner from '../common/LoadingSpinner';
import { Settings, Copy, Check, Trophy } from 'lucide-react';

const GREETINGS: Record<string, { text: string; emoji: string; color: string }> = {
  sabah: { text: 'Günaydın', emoji: '🌅', color: '#FF9800' },
  ogle: { text: 'İyi günler', emoji: '☀️', color: '#FDD835' },
  aksam: { text: 'İyi akşamlar', emoji: '🌆', color: '#E91E63' },
  gece: { text: 'İyi geceler', emoji: '🌙', color: '#5C6BC0' },
};

// Animated circular progress for header
function CircleProgress({ pct, size = 56 }: { pct: number; size?: number }) {
  const stroke = 5;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (pct / 100) * circumference;
  const progressColor = pct === 100 ? '#A5D6A7' : pct > 50 ? '#FFE082' : '#EF9A9A';

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={progressColor} strokeWidth={stroke}
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.34, 1.56, 0.64, 1)' }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-white text-sm font-extrabold">{pct}%</span>
      </div>
    </div>
  );
}

export default function ElderHome() {
  const { user } = useAuth();
  const { medications, logs, loading } = useElderData(user?.uid);
  const { ensureTodayLogs, updateLogStatus } = useLogs();
  const [currentTime, setCurrentTime] = useState(getFormattedTime());
  const [pairingCode, setPairingCode] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [prevPct, setPrevPct] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(getFormattedTime()), 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchCode = async () => {
      const elderDoc = await getDoc(doc(db, 'elders', user.uid));
      if (elderDoc.exists()) setPairingCode(elderDoc.data().pairingCode || '');
    };
    fetchCode();
  }, [user]);

  useEffect(() => {
    if (!user || medications.length === 0) return;
    ensureTodayLogs(user.uid, medications);
  }, [user, medications]); // eslint-disable-line react-hooks/exhaustive-deps

  const currentHour = new Date().getHours();
  const currentTimeGroup = useMemo((): TimeGroupType => {
    if (currentHour >= 6 && currentHour < 11) return 'sabah';
    if (currentHour >= 11 && currentHour < 14) return 'ogle';
    if (currentHour >= 14 && currentHour < 20) return 'aksam';
    return 'gece';
  }, [currentHour]);

  const greeting = GREETINGS[currentTimeGroup];

  const grouped = useMemo((): GroupedMedications[] => {
    const logMap = new Map<string, MedicationLog>();
    for (const log of logs) logMap.set(`${log.medicationId}_${log.scheduledTime}`, log);

    const groups: GroupedMedications[] = groupOrder.map((group) => ({
      group, label: groupLabels[group], emoji: groupEmojis[group], medications: [],
    }));

    for (const med of medications) {
      for (const time of med.times) {
        const tg = getTimeGroup(time);
        const log = logMap.get(`${med.id}_${time}`);
        if (log) {
          const groupItem = groups.find((g) => g.group === tg);
          if (groupItem) groupItem.medications.push({ ...med, log, scheduledTime: time });
        }
      }
    }
    return groups.filter((g) => g.medications.length > 0);
  }, [medications, logs]);

  // Stats
  const totalMeds = logs.length;
  const takenMeds = logs.filter(l => l.status === 'taken').length;
  const pct = totalMeds > 0 ? Math.round((takenMeds / totalMeds) * 100) : 0;
  const allDone = totalMeds > 0 && pct === 100;

  // Celebrate when all done
  useEffect(() => {
    if (allDone && prevPct < 100) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 100);
    }
    setPrevPct(pct);
  }, [pct, allDone]); // eslint-disable-line react-hooks/exhaustive-deps

  const isGroupUpcoming = (group: TimeGroupType): boolean => {
    return groupOrder.indexOf(group) > groupOrder.indexOf(currentTimeGroup);
  };

  const handleTaken = async (logId: string) => { await updateLogStatus(logId, 'taken'); };
  const handleSkipped = async (logId: string) => { await updateLogStatus(logId, 'skipped'); };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(pairingCode);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    } catch { /* */ }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen min-h-dvh"
      style={{ background: 'linear-gradient(180deg, #1B5E20 0%, #2E7D32 8%, #43A047 14%, #f0f2f5 14%)' }}>

      <Confetti active={showConfetti} />

      {/* Header */}
      <div className="relative p-5 pb-16 overflow-hidden">
        {/* Animated header background particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-4 right-8 w-3 h-3 rounded-full bg-white/10 animate-float" style={{ animationDelay: '0s' }} />
          <div className="absolute top-8 right-24 w-2 h-2 rounded-full bg-white/15 animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute top-2 right-40 w-4 h-4 rounded-full bg-white/8 animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)' }} />
        </div>

        <div className="max-w-lg mx-auto flex items-center justify-between relative z-10">
          <div className="animate-fadeInUp">
            <p className="text-white/70 text-sm font-semibold flex items-center gap-1.5">
              <span className="text-lg">{greeting.emoji}</span> {greeting.text}
            </p>
            <p className="text-2xl font-extrabold text-white mt-1">{getFormattedDate()}</p>
            <p className="text-white/50 text-sm font-medium mt-0.5">{currentTime}</p>
          </div>

          <div className="flex items-center gap-3">
            {totalMeds > 0 && (
              <div className="animate-springScale" style={{ animationDelay: '0.3s' }}>
                <CircleProgress pct={pct} />
              </div>
            )}
            <button onClick={() => setShowCode(!showCode)}
              className="w-10 h-10 rounded-[12px] bg-white/15 flex items-center justify-center hover:bg-white/25 transition-all text-white">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 -mt-10 pb-8">
        {/* Pairing code */}
        {showCode && pairingCode && (
          <div className="animate-springIn bg-white rounded-[22px] shadow-premium-lg p-4 mb-4 text-center">
            <p className="text-xs font-bold text-[#9e9eb8] uppercase tracking-wider mb-2">Eşleştirme Kodunuz</p>
            <div className="flex items-center justify-center gap-2">
              <p className="text-2xl font-mono font-extrabold text-[#2E7D32] tracking-widest">{pairingCode}</p>
              <button onClick={handleCopyCode}
                className="w-9 h-9 rounded-lg bg-[#E8F5E9] flex items-center justify-center hover:bg-[#C8E6C9] transition-colors">
                {codeCopied ? <Check className="w-4 h-4 text-[#2E7D32]" /> : <Copy className="w-4 h-4 text-[#4CAF50]" />}
              </button>
            </div>
          </div>
        )}

        {/* All done celebration card */}
        {allDone && (
          <div className="animate-celebratePop bg-white rounded-[22px] shadow-premium-lg p-6 mb-5 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-5"
              style={{ background: 'linear-gradient(135deg, #4CAF50, #FFD54F, #4CAF50)', backgroundSize: '200% 200%', animation: 'gradientShift 3s ease infinite' }} />
            <div className="relative z-10">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#E8F5E9] flex items-center justify-center mb-3">
                <Trophy className="w-8 h-8 text-[#FFD54F] animate-float3D" />
              </div>
              <p className="text-xl font-extrabold text-gradient-green">Tebrikler!</p>
              <p className="text-sm text-[#4a4a6a] mt-1">Bugünkü tüm ilaçlarınızı aldınız</p>
            </div>
          </div>
        )}

        {/* Progress card (when not all done) */}
        {totalMeds > 0 && !allDone && (
          <div className="animate-slideIn3D bg-white rounded-[22px] shadow-premium-lg p-5 mb-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-[#4a4a6a]">Bugünkü İlerleme</p>
              <span className="text-sm font-extrabold animate-fadeIn" key={pct}
                style={{ color: pct > 70 ? '#4CAF50' : pct > 30 ? '#FF9800' : '#FF5722' }}>
                {takenMeds}/{totalMeds}
              </span>
            </div>
            <div className="h-3.5 rounded-full bg-[#f0f2f5] overflow-hidden">
              <div className="h-full rounded-full animate-progressFill relative overflow-hidden"
                style={{
                  width: `${pct}%`,
                  background: pct > 70 ? 'linear-gradient(90deg, #43A047, #66BB6A)' : 'linear-gradient(90deg, #FF9800, #FFB74D)',
                }}>
                <div className="absolute inset-0 animate-shimmer" />
              </div>
            </div>
          </div>
        )}

        {/* Medication groups */}
        {grouped.length === 0 ? (
          <div className="animate-springIn bg-white rounded-[24px] shadow-premium-lg p-10 text-center">
            <div className="w-24 h-24 mx-auto rounded-full bg-[#E8F5E9] flex items-center justify-center mb-5">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="animate-float3D">
                <defs>
                  <linearGradient id="empty-pill" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#66BB6A" />
                    <stop offset="100%" stopColor="#2E7D32" />
                  </linearGradient>
                </defs>
                <rect x="6" y="16" width="36" height="16" rx="8" fill="url(#empty-pill)" />
                <rect x="6" y="16" width="18" height="16" rx="8" fill="rgba(255,255,255,0.3)" />
                <ellipse cx="16" cy="21" rx="5" ry="2.5" fill="rgba(255,255,255,0.3)" />
              </svg>
            </div>
            <p className="text-xl font-extrabold text-[#4a4a6a] mb-2">Henüz ilaç eklenmemiş</p>
            <p className="text-sm text-[#9e9eb8] max-w-xs mx-auto mb-6">
              Refakatçiniz ilaçlarınızı ekledikten sonra burada görünecek
            </p>
            {pairingCode && (
              <div className="p-4 rounded-[18px] inline-block relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)' }}>
                <div className="absolute inset-0 animate-shimmer opacity-20" />
                <p className="text-xs text-[#4a4a6a] mb-1 relative z-10">Kodunuz</p>
                <p className="text-2xl font-mono font-extrabold text-[#2E7D32] tracking-widest relative z-10">{pairingCode}</p>
              </div>
            )}
          </div>
        ) : (
          grouped.map((group) => (
            <TimeGroup
              key={group.group}
              label={group.label}
              emoji={group.emoji}
              timeLabel={
                group.group === 'sabah' ? '06-11'
                  : group.group === 'ogle' ? '11-14'
                  : group.group === 'aksam' ? '14-20'
                  : '20-06'
              }
              medications={group.medications}
              onTaken={handleTaken}
              onSkipped={handleSkipped}
              isUpcoming={isGroupUpcoming(group.group)}
            />
          ))
        )}
      </div>
    </div>
  );
}
