import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { format, subDays } from 'date-fns';
import { tr } from 'date-fns/locale';
import type { MedicationLog } from '../../types';
import { Trophy } from 'lucide-react';

interface HistoryViewProps { elderId: string; }
interface DaySummary { date: string; dateLabel: string; taken: number; skipped: number; pending: number; total: number; }

export default function HistoryView({ elderId }: HistoryViewProps) {
  const [days, setDays] = useState<DaySummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const last7: string[] = [];
        for (let i = 0; i < 7; i++) last7.push(format(subDays(new Date(), i), 'yyyy-MM-dd'));
        const snap = await getDocs(query(collection(db, 'logs'), where('elderId', '==', elderId), where('scheduledDate', '>=', last7[last7.length - 1]), orderBy('scheduledDate', 'desc')));
        const all = snap.docs.map((d) => d.data()) as MedicationLog[];
        setDays(last7.map((date) => {
          const dl = all.filter((l) => l.scheduledDate === date);
          return { date, dateLabel: format(new Date(date + 'T00:00:00'), 'd MMM EEEE', { locale: tr }), taken: dl.filter((l) => l.status === 'taken').length, skipped: dl.filter((l) => l.status === 'skipped').length, pending: dl.filter((l) => l.status === 'pending').length, total: dl.length };
        }));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchHistory();
  }, [elderId]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-10 h-10 mx-auto rounded-full border-3 border-[#E3F2FD] border-t-[#2196F3] animate-spin" />
        <p className="text-[#9e9eb8] font-medium mt-3 text-sm">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div>
      {days.map((day, i) => {
        const pct = day.total > 0 ? Math.round((day.taken / day.total) * 100) : 0;
        const isToday = i === 0;
        const isComplete = pct === 100 && day.total > 0;

        return (
          <div key={day.date}
            className={`animate-slideIn3D bg-white rounded-[20px] p-4 mb-3 transition-all relative overflow-hidden ${
              isToday ? 'border-2 border-[#BBDEFB]' : 'border border-gray-100'
            }`}
            style={{
              animationDelay: `${i * 0.06}s`,
              boxShadow: isToday
                ? '0 4px 20px rgba(33,150,243,0.12)'
                : isComplete
                ? '0 4px 16px rgba(76,175,80,0.08)'
                : '0 1px 4px rgba(0,0,0,0.04)',
            }}>
            {/* Shimmer on complete */}
            {isComplete && <div className="absolute inset-0 animate-shimmer opacity-5" />}

            <div className="flex items-center justify-between mb-2.5 relative z-5">
              <div className="flex items-center gap-2">
                {isToday && (
                  <span className="text-[10px] font-bold text-white bg-[#2196F3] px-2.5 py-0.5 rounded-full animate-springScale">
                    Bugün
                  </span>
                )}
                <p className="font-bold text-[#1a1a2e] text-sm">{day.dateLabel}</p>
              </div>
              <div className="flex items-center gap-1.5">
                {isComplete && <Trophy className="w-3.5 h-3.5 text-[#FFD54F]" />}
                <span className="text-xs font-extrabold" style={{ color: pct === 100 ? '#4CAF50' : pct > 0 ? '#FF9800' : '#d4d4d8' }}>
                  {day.total > 0 ? `${pct}%` : '—'}
                </span>
              </div>
            </div>
            {day.total > 0 ? (
              <>
                <div className="flex gap-0.5 h-2.5 rounded-full overflow-hidden bg-[#f0f2f5] relative z-5">
                  {day.taken > 0 && (
                    <div className="rounded-full transition-all animate-progressFill"
                      style={{ width: `${(day.taken / day.total) * 100}%`, background: 'linear-gradient(90deg, #43A047, #66BB6A)' }} />
                  )}
                  {day.skipped > 0 && (
                    <div className="rounded-full transition-all"
                      style={{ width: `${(day.skipped / day.total) * 100}%`, background: 'linear-gradient(90deg, #E64A19, #FF7043)' }} />
                  )}
                  {day.pending > 0 && (
                    <div className="rounded-full transition-all bg-[#e0e0e0]"
                      style={{ width: `${(day.pending / day.total) * 100}%` }} />
                  )}
                </div>
                <div className="flex gap-3 mt-2.5 text-xs font-semibold relative z-5">
                  {day.taken > 0 && <span className="flex items-center gap-1 text-[#4CAF50]"><span className="w-1.5 h-1.5 rounded-full bg-[#4CAF50]" />{day.taken} alındı</span>}
                  {day.skipped > 0 && <span className="flex items-center gap-1 text-[#FF5722]"><span className="w-1.5 h-1.5 rounded-full bg-[#FF5722]" />{day.skipped} atlandı</span>}
                  {day.pending > 0 && <span className="flex items-center gap-1 text-[#9e9eb8]"><span className="w-1.5 h-1.5 rounded-full bg-[#d4d4d8]" />{day.pending} bekliyor</span>}
                </div>
              </>
            ) : <p className="text-xs text-[#c4c4d8] relative z-5">Kayıt yok</p>}
          </div>
        );
      })}
    </div>
  );
}
