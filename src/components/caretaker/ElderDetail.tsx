import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import TodayStatus from './TodayStatus';
import MedicationList from './MedicationList';
import HistoryView from './HistoryView';
import { ArrowLeft } from 'lucide-react';

type Tab = 'today' | 'medications' | 'history';

export default function ElderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('today');
  const [elderName, setElderName] = useState('Yaşlı');

  useEffect(() => {
    if (!id) return;
    const fetchName = async () => {
      const elderDoc = await getDoc(doc(db, 'elders', id));
      if (elderDoc.exists()) setElderName(elderDoc.data().name || 'Yaşlı');
    };
    fetchName();
  }, [id]);

  if (!id) return null;

  const tabs: { key: Tab; label: string; emoji: string }[] = [
    { key: 'today', label: 'Bugün', emoji: '📋' },
    { key: 'medications', label: 'İlaçlar', emoji: '💊' },
    { key: 'history', label: 'Geçmiş', emoji: '📊' },
  ];

  return (
    <div className="min-h-screen min-h-dvh"
      style={{ background: 'linear-gradient(180deg, #0D47A1 0%, #1565C0 8%, #1976D2 14%, #f0f2f5 14%)' }}>

      {/* Header */}
      <div className="relative p-4 pb-12 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-3 right-10 w-2.5 h-2.5 rounded-full bg-white/10 animate-float" style={{ animationDelay: '0.5s' }} />
          <div className="absolute top-6 right-28 w-2 h-2 rounded-full bg-white/15 animate-float" style={{ animationDelay: '1.5s' }} />
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)' }} />
        </div>
        <div className="max-w-lg mx-auto relative z-10">
          <button onClick={() => navigate('/caretaker/dashboard')}
            className="flex items-center gap-1.5 text-white/60 hover:text-white mb-2 transition-colors text-sm font-medium btn-press">
            <ArrowLeft className="w-4 h-4" /> Geri
          </button>
          <h1 className="text-2xl font-extrabold text-white animate-fadeInUp">{elderName}</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-6">
        {/* Tab bar - pill style with gradient active */}
        <div className="animate-springIn bg-white rounded-[20px] shadow-premium-xl p-1.5 flex gap-1 mb-4">
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-3.5 rounded-[16px] text-center font-bold text-sm transition-all relative overflow-hidden ${
                activeTab === tab.key
                  ? 'text-white shadow-glow-blue'
                  : 'text-[#9e9eb8] hover:text-[#4a4a6a] hover:bg-gray-50'
              }`}>
              {activeTab === tab.key && (
                <div className="absolute inset-0 rounded-[16px] animate-gradientShift"
                  style={{ background: 'linear-gradient(135deg, #1565C0 0%, #1976D2 50%, #42A5F5 100%)', backgroundSize: '200% 200%' }} />
              )}
              <span className="relative z-10">{tab.emoji} {tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="animate-fadeIn pb-8" key={activeTab}>
          {activeTab === 'today' && <TodayStatus elderId={id} />}
          {activeTab === 'medications' && <MedicationList elderId={id} />}
          {activeTab === 'history' && <HistoryView elderId={id} />}
        </div>
      </div>
    </div>
  );
}
