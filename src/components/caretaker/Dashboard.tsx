import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import { getTodayDateString, formatActionTime } from '../../utils/dateUtils';
import type { MedicationLog } from '../../types';
import ElderCard from './ElderCard';
import LoadingSpinner from '../common/LoadingSpinner';
import { LogOut, Plus, UserPlus } from 'lucide-react';

interface ElderSummary {
  id: string;
  name: string;
  takenCount: number;
  totalCount: number;
  lastActivity: string;
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [elders, setElders] = useState<ElderSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchElders = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const linkedTo: string[] = userDoc.exists() ? userDoc.data().linkedTo || [] : [];
        const today = getTodayDateString();
        const summaries: ElderSummary[] = [];

        for (const elderId of linkedTo) {
          const elderDoc = await getDoc(doc(db, 'elders', elderId));
          const elderName = elderDoc.exists() ? elderDoc.data().name || 'Yaşlı' : 'Yaşlı';
          const logsSnap = await getDocs(query(collection(db, 'logs'), where('elderId', '==', elderId), where('scheduledDate', '==', today)));
          const logs = logsSnap.docs.map((d) => ({ ...d.data(), actionTime: d.data().actionTime?.toDate?.() || null })) as MedicationLog[];
          const totalCount = logs.length;
          const takenCount = logs.filter((l) => l.status === 'taken').length;
          const lastAction = logs.filter((l) => l.actionTime).sort((a, b) => (b.actionTime?.getTime() || 0) - (a.actionTime?.getTime() || 0))[0];
          summaries.push({ id: elderId, name: elderName, takenCount, totalCount, lastActivity: lastAction?.actionTime ? formatActionTime(lastAction.actionTime) : '' });
        }
        setElders(summaries);
      } catch (err) { console.error('Failed to fetch elders:', err); }
      finally { setLoading(false); }
    };
    fetchElders();
  }, [user]);

  const handleLogout = async () => { await logout(); navigate('/'); };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen min-h-dvh"
      style={{ background: 'linear-gradient(180deg, #0D47A1 0%, #1565C0 8%, #1976D2 14%, #f0f2f5 14%)' }}>

      {/* Header */}
      <div className="relative p-5 md:p-6 pb-16 overflow-hidden">
        {/* Animated header particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-4 right-8 w-3 h-3 rounded-full bg-white/10 animate-float" style={{ animationDelay: '0s' }} />
          <div className="absolute top-8 right-24 w-2 h-2 rounded-full bg-white/15 animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute top-2 right-40 w-4 h-4 rounded-full bg-white/8 animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)' }} />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full opacity-8"
            style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)' }} />
        </div>

        <div className="max-w-lg mx-auto flex items-center justify-between relative z-10">
          <div className="animate-fadeInUp">
            <p className="text-white/60 text-sm font-semibold flex items-center gap-1.5">
              <span className="text-lg">👋</span> Hoş geldiniz
            </p>
            <h1 className="text-2xl font-extrabold text-white mt-1 flex items-center gap-2">
              İlaç Takip
            </h1>
          </div>
          <button onClick={handleLogout}
            className="w-10 h-10 rounded-[12px] bg-white/15 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/25 transition-all btn-press">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 -mt-10 pb-8">
        <div className="animate-springIn bg-white rounded-[24px] shadow-premium-xl p-5 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-extrabold text-[#1a1a2e]">Yaşlılarım</h2>
            {elders.length > 0 && (
              <span className="text-xs font-bold text-white bg-[#2196F3] px-3 py-1.5 rounded-full animate-springScale"
                style={{ animationDelay: '0.3s' }}>
                {elders.length} kişi
              </span>
            )}
          </div>

          {elders.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto rounded-full bg-[#E3F2FD] flex items-center justify-center mb-5 animate-float3D">
                <UserPlus className="w-11 h-11 text-[#2196F3]" />
              </div>
              <p className="text-xl font-extrabold text-[#4a4a6a] mb-2">Henüz yaşlı eklenmemiş</p>
              <p className="text-sm text-[#9e9eb8] mb-8 max-w-xs mx-auto">
                Yaşlınızın telefonundaki eşleştirme kodunu girerek başlayın
              </p>
              <button onClick={() => navigate('/caretaker/pair')}
                className="min-h-[56px] px-10 text-lg font-extrabold rounded-[20px] text-white shadow-glow-blue btn-press ripple-effect relative overflow-hidden group">
                <div className="absolute inset-0 rounded-[20px] animate-gradientShift"
                  style={{ background: 'linear-gradient(135deg, #0D47A1 0%, #1565C0 25%, #1976D2 50%, #42A5F5 75%, #1565C0 100%)', backgroundSize: '200% 200%' }} />
                <div className="absolute inset-0 animate-shimmer opacity-20" />
                <span className="relative z-10 flex items-center gap-2.5">
                  <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" /> Yaşlı Eşleştir
                </span>
              </button>
            </div>
          ) : (
            <div>
              {elders.map((elder, i) => (
                <div key={elder.id} className="animate-slideIn3D" style={{ animationDelay: `${i * 0.1}s` }}>
                  <ElderCard elderId={elder.id} name={elder.name} takenCount={elder.takenCount} totalCount={elder.totalCount} lastActivity={elder.lastActivity} />
                </div>
              ))}
              <button onClick={() => navigate('/caretaker/pair')}
                className="w-full min-h-[52px] text-sm font-bold rounded-[18px] border-2 border-dashed border-[#BBDEFB] text-[#2196F3] hover:bg-[#E3F2FD] hover:border-[#90CAF9] btn-press flex items-center justify-center gap-2 mt-2 transition-all group">
                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" /> Yeni Yaşlı Ekle
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
