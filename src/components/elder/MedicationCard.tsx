import { useState } from 'react';
import type { Medication, MedicationLog } from '../../types';
import PillIcon from '../common/PillIcon';
import { formatActionTime } from '../../utils/dateUtils';
import { Check, X } from 'lucide-react';

interface MedicationCardProps {
  medication: Medication;
  log: MedicationLog;
  scheduledTime: string;
  onTaken: (logId: string) => void;
  onSkipped: (logId: string) => void;
  isUpcoming: boolean;
  index: number;
}

// Animated checkmark SVG
function AnimatedCheck() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="14" fill="#4CAF50" opacity="0.15" />
      <path d="M9 16L14 21L23 11" stroke="#2E7D32" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray="24" style={{ animation: 'checkDraw 0.4s ease-out 0.1s both' }} />
    </svg>
  );
}

export default function MedicationCard({
  medication, log, scheduledTime, onTaken, onSkipped, isUpcoming, index,
}: MedicationCardProps) {
  const [justActioned, setJustActioned] = useState<'taken' | 'skipped' | null>(null);
  const [showSparkles, setShowSparkles] = useState(false);

  const handleTaken = () => {
    setJustActioned('taken');
    setShowSparkles(true);
    setTimeout(() => setShowSparkles(false), 1500);
    onTaken(log.id);
  };
  const handleSkipped = () => { setJustActioned('skipped'); onSkipped(log.id); };

  const isTaken = justActioned === 'taken' || log.status === 'taken';
  const isSkipped = justActioned === 'skipped' || log.status === 'skipped';

  const getCardStyle = (): React.CSSProperties => {
    if (isTaken) return {
      background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 50%, #A5D6A7 100%)',
      borderColor: '#81C784',
    };
    if (isSkipped) return {
      background: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 50%, #FFCC80 100%)',
      borderColor: '#FFB74D',
    };
    if (isUpcoming) return {
      background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 50%, #90CAF9 100%)',
      borderColor: '#64B5F6',
    };
    return {
      background: 'linear-gradient(135deg, #ffffff 0%, #fafbff 100%)',
      borderColor: '#e8e8ee',
    };
  };

  return (
    <div
      className="animate-slideIn3D rounded-[24px] p-5 md:p-6 mb-4 border-2 transition-all duration-500 relative overflow-hidden"
      style={{
        ...getCardStyle(),
        animationDelay: `${index * 0.1}s`,
        boxShadow: isTaken
          ? '0 8px 32px rgba(76,175,80,0.15), 0 2px 8px rgba(0,0,0,0.04)'
          : isSkipped
          ? '0 8px 32px rgba(255,152,0,0.12), 0 2px 8px rgba(0,0,0,0.04)'
          : '0 4px 20px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)',
      }}
    >
      {/* Sparkle effects on taken */}
      {showSparkles && (
        <div className="absolute inset-0 pointer-events-none z-10">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="absolute"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${10 + Math.random() * 80}%`,
                animation: `sparkle 0.8s ease-out ${i * 0.08}s both`,
              }}>
              <svg width="16" height="16" viewBox="0 0 16 16">
                <polygon points="8,0 9.5,6 16,8 9.5,10 8,16 6.5,10 0,8 6.5,6"
                  fill={['#FFD54F', '#4CAF50', '#66BB6A', '#81C784'][i % 4]} />
              </svg>
            </div>
          ))}
        </div>
      )}

      {/* Main content */}
      <div className="flex items-center gap-4 relative z-5">
        <div className={`flex-shrink-0 w-[72px] h-[72px] rounded-[20px] flex items-center justify-center transition-all duration-500 ${
          isTaken ? 'bg-white/70 shadow-glow-green' : 'bg-white/60'
        }`}
          style={{ boxShadow: isTaken ? undefined : '0 4px 12px rgba(0,0,0,0.06)' }}>
          <PillIcon shape={medication.pill.shape} color={medication.pill.color} size={medication.pill.size} elderMode />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[24px] md:text-[26px] font-extrabold text-[#1a1a2e] leading-tight truncate">
            {medication.name}
          </h3>
          <p className="text-lg text-[#4a4a6a] font-semibold mt-0.5">{medication.dosage}</p>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-base text-[#9e9eb8] font-medium flex items-center gap-1">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="opacity-60">
                <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 4.5V8L10.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              {scheduledTime}
            </span>
            {medication.notes && (
              <span className="text-base text-[#c4c4d8]">· {medication.notes}</span>
            )}
          </div>
        </div>
      </div>

      {/* Status: Taken */}
      {isTaken && (
        <div className={`mt-4 py-3.5 rounded-[16px] bg-white/50 flex items-center justify-center gap-2 ${justActioned === 'taken' ? 'animate-celebratePop' : ''}`}>
          <AnimatedCheck />
          <p className="text-xl font-extrabold text-[#2E7D32]">
            {log.actionTime ? `${formatActionTime(log.actionTime)}'de alındı` : 'Alındı'}
          </p>
        </div>
      )}

      {/* Status: Skipped */}
      {isSkipped && (
        <div className={`mt-4 py-3.5 rounded-[16px] bg-white/50 text-center ${justActioned === 'skipped' ? 'animate-stamp' : ''}`}>
          <p className="text-xl font-extrabold text-[#E65100]">Atlandı</p>
        </div>
      )}

      {/* Status: Upcoming */}
      {isUpcoming && log.status === 'pending' && (
        <div className="mt-4 py-3 rounded-[16px] bg-white/40 text-center">
          <p className="text-lg text-[#1565C0] font-bold flex items-center justify-center gap-2">
            <span className="animate-breathe inline-block">⏳</span> Henüz zamanı gelmedi
          </p>
        </div>
      )}

      {/* Action buttons */}
      {log.status === 'pending' && !isUpcoming && (
        <div className="flex gap-3 mt-5">
          <button onClick={handleTaken}
            className="flex-1 min-h-[80px] text-[22px] font-extrabold rounded-[20px] text-white btn-press ripple-effect flex items-center justify-center gap-2.5 relative overflow-hidden group"
            style={{ boxShadow: '0 8px 24px rgba(76,175,80,0.3)' }}>
            <div className="absolute inset-0 rounded-[20px] animate-gradientShift"
              style={{ background: 'linear-gradient(135deg, #2E7D32 0%, #43A047 25%, #66BB6A 50%, #43A047 75%, #2E7D32 100%)', backgroundSize: '200% 200%' }} />
            <div className="absolute inset-0 animate-shimmer opacity-15" />
            <span className="relative z-10 flex items-center gap-2.5">
              <Check className="w-7 h-7 group-hover:scale-125 transition-transform duration-300" strokeWidth={3} />
              İÇTİM
            </span>
          </button>
          <button onClick={handleSkipped}
            className="flex-1 min-h-[80px] text-[22px] font-extrabold rounded-[20px] text-white btn-press ripple-effect flex items-center justify-center gap-2.5 relative overflow-hidden group"
            style={{ boxShadow: '0 8px 24px rgba(230,74,25,0.25)' }}>
            <div className="absolute inset-0 rounded-[20px] animate-gradientShift"
              style={{ background: 'linear-gradient(135deg, #BF360C 0%, #E64A19 25%, #FF7043 50%, #E64A19 75%, #BF360C 100%)', backgroundSize: '200% 200%', animationDelay: '2s' }} />
            <div className="absolute inset-0 animate-shimmer opacity-15" />
            <span className="relative z-10 flex items-center gap-2.5">
              <X className="w-7 h-7 group-hover:scale-125 transition-transform duration-300" strokeWidth={3} />
              ATLADIM
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
