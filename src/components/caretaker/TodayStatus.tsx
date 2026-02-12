import { useElderData } from '../../hooks/useElderData';
import { getTimeGroup, groupLabels, groupEmojis, groupOrder } from '../../utils/timeGroups';
import { formatActionTime } from '../../utils/dateUtils';
import PillIcon from '../common/PillIcon';
import type { MedicationLog, TimeGroup } from '../../types';

interface TodayStatusProps {
  elderId: string;
}

// Mini circular progress for summary
function MiniProgress({ pct }: { pct: number }) {
  const size = 44;
  const stroke = 4;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (pct / 100) * circumference;
  const color = pct === 100 ? '#4CAF50' : pct > 50 ? '#FF9800' : '#FF5722';

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f0f2f5" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.34, 1.56, 0.64, 1)' }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-extrabold" style={{ color }}>{pct}%</span>
      </div>
    </div>
  );
}

export default function TodayStatus({ elderId }: TodayStatusProps) {
  const { medications, logs, loading } = useElderData(elderId);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-10 h-10 mx-auto rounded-full border-3 border-[#E3F2FD] border-t-[#2196F3] animate-spin" />
        <p className="text-[#9e9eb8] font-medium mt-3 text-sm">Yükleniyor...</p>
      </div>
    );
  }

  const logMap = new Map<string, MedicationLog>();
  for (const log of logs) logMap.set(`${log.medicationId}_${log.scheduledTime}`, log);

  const groups = groupOrder.map((group) => ({
    group,
    items: medications.flatMap((med) =>
      med.times.filter((time) => getTimeGroup(time) === group).map((time) => ({ med, time, log: logMap.get(`${med.id}_${time}`) }))
    ),
  })).filter((g) => g.items.length > 0);

  if (groups.length === 0) {
    return (
      <div className="text-center py-12 animate-springIn">
        <div className="w-20 h-20 mx-auto rounded-full bg-[#f0f2f5] flex items-center justify-center mb-4 animate-float3D">
          <span className="text-3xl">📋</span>
        </div>
        <p className="text-lg font-bold text-[#4a4a6a]">Bugün için kayıt yok</p>
        <p className="text-sm text-[#9e9eb8] mt-1">İlaçlar eklendiğinde burada görünecek</p>
      </div>
    );
  }

  // Summary
  const totalCount = logs.length;
  const takenCount = logs.filter(l => l.status === 'taken').length;
  const skippedCount = logs.filter(l => l.status === 'skipped').length;
  const pendingCount = logs.filter(l => l.status === 'pending').length;
  const pct = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 0;

  const badge = (status: string | undefined) => {
    switch (status) {
      case 'taken': return (
        <span className="text-[11px] font-bold text-[#2E7D32] bg-[#E8F5E9] px-2.5 py-1 rounded-full whitespace-nowrap shadow-sm">
          Alındı
        </span>
      );
      case 'skipped': return (
        <span className="text-[11px] font-bold text-[#E65100] bg-[#FFF3E0] px-2.5 py-1 rounded-full whitespace-nowrap shadow-sm">
          Atlandı
        </span>
      );
      default: return (
        <span className="text-[11px] font-bold text-[#9e9eb8] bg-gray-100 px-2.5 py-1 rounded-full whitespace-nowrap">
          Bekliyor
        </span>
      );
    }
  };

  return (
    <div>
      {/* Summary card */}
      <div className="animate-springIn bg-white rounded-[22px] shadow-premium-lg p-5 mb-5 relative overflow-hidden">
        <div className="absolute inset-0 animate-shimmer opacity-5" />
        <div className="flex items-center gap-4 relative z-5">
          <MiniProgress pct={pct} />
          <div className="flex-1">
            <p className="text-sm font-extrabold text-[#1a1a2e]">Günlük Özet</p>
            <div className="h-3 rounded-full bg-[#f0f2f5] overflow-hidden mt-2 mb-2">
              <div className="h-full rounded-full animate-progressFill relative overflow-hidden"
                style={{
                  width: `${pct}%`,
                  background: pct === 100 ? 'linear-gradient(90deg, #43A047, #66BB6A)' : 'linear-gradient(90deg, #FF9800, #FFB74D)',
                }}>
                <div className="absolute inset-0 animate-shimmer" />
              </div>
            </div>
            <div className="flex gap-3 text-xs font-semibold">
              {takenCount > 0 && <span className="flex items-center gap-1 text-[#4CAF50]"><span className="w-2 h-2 rounded-full bg-[#4CAF50] animate-breathe" />{takenCount} alındı</span>}
              {skippedCount > 0 && <span className="flex items-center gap-1 text-[#FF5722]"><span className="w-2 h-2 rounded-full bg-[#FF5722]" />{skippedCount} atlandı</span>}
              {pendingCount > 0 && <span className="flex items-center gap-1 text-[#9e9eb8]"><span className="w-2 h-2 rounded-full bg-[#d4d4d8]" />{pendingCount} bekliyor</span>}
            </div>
          </div>
        </div>
      </div>

      {groups.map(({ group, items }, gi) => (
        <div key={group} className="mb-5 animate-slideIn3D" style={{ animationDelay: `${gi * 0.08}s` }}>
          <div className="flex items-center gap-2.5 mb-2.5 px-1">
            <div className="w-9 h-9 rounded-[10px] bg-white shadow-sm flex items-center justify-center">
              <span className="text-base">{groupEmojis[group as TimeGroup]}</span>
            </div>
            <h3 className="text-sm font-extrabold text-[#1a1a2e]">{groupLabels[group as TimeGroup]}</h3>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent ml-1" />
          </div>
          {items.map(({ med, time, log }, i) => (
            <div key={`${med.id}_${time}`}
              className="animate-fadeInUp flex items-center gap-3 p-3.5 rounded-[18px] mb-2 border-2 transition-all"
              style={{
                animationDelay: `${(gi * 0.08) + (i * 0.05)}s`,
                background: log?.status === 'taken' ? 'linear-gradient(135deg, #E8F5E9 0%, #f5fff6 100%)'
                  : log?.status === 'skipped' ? 'linear-gradient(135deg, #FFF3E0 0%, #fffaf5 100%)'
                  : '#ffffff',
                borderColor: log?.status === 'taken' ? '#C8E6C9'
                  : log?.status === 'skipped' ? '#FFE0B2'
                  : '#f0f0f5',
                boxShadow: log?.status === 'taken' ? '0 2px 8px rgba(76,175,80,0.08)' : '0 1px 4px rgba(0,0,0,0.03)',
              }}>
              <div className="w-10 h-10 rounded-[12px] bg-white/80 flex items-center justify-center shadow-sm">
                <PillIcon shape={med.pill.shape} color={med.pill.color} size={med.pill.size} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[#1a1a2e] text-sm truncate">{med.name}</p>
                <p className="text-xs text-[#9e9eb8]">
                  {time} · {med.dosage}{log?.actionTime ? ` · ${formatActionTime(log.actionTime)}` : ''}
                </p>
              </div>
              {badge(log?.status)}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
