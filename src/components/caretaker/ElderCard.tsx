import { useNavigate } from 'react-router-dom';
import { ChevronRight, Trophy, Clock } from 'lucide-react';

interface ElderCardProps {
  elderId: string;
  name: string;
  takenCount: number;
  totalCount: number;
  lastActivity: string;
}

function CircularProgress({ pct, size = 56, stroke = 5, color }: { pct: number; size?: number; stroke?: number; color: string }) {
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="#f0f2f5" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.34, 1.56, 0.64, 1)' }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {pct === 100 ? (
          <Trophy className="w-5 h-5 text-[#FFD54F]" />
        ) : (
          <span className="text-sm font-extrabold" style={{ color }}>
            {pct > 0 ? `${pct}%` : '—'}
          </span>
        )}
      </div>
    </div>
  );
}

export default function ElderCard({ elderId, name, takenCount, totalCount, lastActivity }: ElderCardProps) {
  const navigate = useNavigate();
  const allTaken = totalCount > 0 && takenCount === totalCount;
  const pct = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 0;
  const color = allTaken ? '#4CAF50' : pct > 50 ? '#FF9800' : pct > 0 ? '#FF5722' : '#e0e0e0';

  return (
    <button
      onClick={() => navigate(`/caretaker/elder/${elderId}`)}
      className="w-full rounded-[22px] p-5 mb-3 text-left btn-press card-3d transition-all border-2 group relative overflow-hidden"
      style={{
        background: allTaken
          ? 'linear-gradient(135deg, #E8F5E9 0%, #f5fff6 50%, #E8F5E9 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #fafbff 100%)',
        borderColor: allTaken ? '#A5D6A7' : '#f0f0f5',
        boxShadow: allTaken
          ? '0 4px 20px rgba(76,175,80,0.12), 0 1px 4px rgba(0,0,0,0.04)'
          : '0 2px 12px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.03)',
      }}
    >
      {/* Shimmer on complete */}
      {allTaken && <div className="absolute inset-0 animate-shimmer opacity-10" />}

      <div className="flex items-center gap-4 relative z-5">
        <div className="flex-shrink-0">
          <CircularProgress pct={pct} color={color} />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-extrabold text-[#1a1a2e] truncate">{name}</h3>
          <p className="text-sm font-bold mt-0.5" style={{ color }}>
            {totalCount > 0 ? `${takenCount}/${totalCount} ilaç alındı` : 'Henüz ilaç yok'}
          </p>
          {lastActivity && (
            <p className="text-xs text-[#c4c4d8] mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Son: {lastActivity}
            </p>
          )}
        </div>

        <ChevronRight className="w-5 h-5 text-[#d4d4d8] group-hover:text-[#9e9eb8] group-hover:translate-x-1 transition-all flex-shrink-0" />
      </div>
    </button>
  );
}
