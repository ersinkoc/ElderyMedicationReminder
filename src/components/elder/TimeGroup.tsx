import type { Medication, MedicationLog } from '../../types';
import MedicationCard from './MedicationCard';

interface TimeGroupProps {
  label: string;
  emoji: string;
  timeLabel: string;
  medications: (Medication & { log: MedicationLog; scheduledTime: string })[];
  onTaken: (logId: string) => void;
  onSkipped: (logId: string) => void;
  isUpcoming: boolean;
}

export default function TimeGroup({
  label,
  emoji,
  timeLabel,
  medications,
  onTaken,
  onSkipped,
  isUpcoming,
}: TimeGroupProps) {
  if (medications.length === 0) return null;

  const takenCount = medications.filter(m => m.log.status === 'taken').length;
  const allTaken = takenCount === medications.length;

  return (
    <div className="mb-7 animate-slideIn3D">
      {/* Group header */}
      <div className="flex items-center gap-3 mb-4 px-1">
        <div className={`w-12 h-12 rounded-[14px] shadow-premium flex items-center justify-center relative overflow-hidden ${
          isUpcoming ? 'bg-[#E3F2FD]' : allTaken ? 'bg-[#E8F5E9]' : 'bg-white'
        }`}>
          {allTaken && <div className="absolute inset-0 animate-shimmer opacity-20" />}
          <span className="text-2xl relative z-10">{emoji}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-xl md:text-2xl font-extrabold text-[#1a1a2e] leading-tight">{label}</h2>
            {allTaken && (
              <span className="text-[10px] font-bold text-[#4CAF50] bg-[#E8F5E9] px-2 py-0.5 rounded-full animate-springScale">
                Tamam
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#9e9eb8] font-semibold">{timeLabel}</span>
            <span className="text-xs text-[#c4c4d8]">·</span>
            <span className="text-xs font-bold" style={{ color: allTaken ? '#4CAF50' : '#9e9eb8' }}>
              {takenCount}/{medications.length}
            </span>
          </div>
        </div>
        <div className="flex-shrink-0 h-px w-8 bg-gradient-to-r from-gray-200 to-transparent" />
      </div>
      {medications.map((med, i) => (
        <MedicationCard
          key={`${med.id}_${med.scheduledTime}`}
          medication={med}
          log={med.log}
          scheduledTime={med.scheduledTime}
          onTaken={onTaken}
          onSkipped={onSkipped}
          isUpcoming={isUpcoming}
          index={i}
        />
      ))}
    </div>
  );
}
