import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useMedications } from '../../hooks/useMedications';
import PillIcon from '../common/PillIcon';
import type { Medication } from '../../types';
import { Plus, Trash2, ToggleLeft, ToggleRight, Pencil } from 'lucide-react';

interface MedicationListProps { elderId: string; }

export default function MedicationList({ elderId }: MedicationListProps) {
  const navigate = useNavigate();
  const { deleteMedication } = useMedications();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'medications'), where('elderId', '==', elderId)), (snap) => {
      setMedications(snap.docs.map((d) => ({ id: d.id, ...d.data(), createdAt: d.data().createdAt?.toDate?.() || new Date() })) as Medication[]);
      setLoading(false);
    });
    return () => unsub();
  }, [elderId]);

  const handleToggle = async (med: Medication) => { await updateDoc(doc(db, 'medications', med.id), { active: !med.active }); };
  const handleDelete = async (id: string) => { await deleteMedication(id); };

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
      {medications.length === 0 ? (
        <div className="text-center py-12 animate-springIn">
          <div className="w-20 h-20 mx-auto rounded-full bg-[#E3F2FD] flex items-center justify-center mb-4 animate-float3D">
            <span className="text-3xl">💊</span>
          </div>
          <p className="text-lg font-bold text-[#4a4a6a] mb-1">Henüz ilaç eklenmemiş</p>
          <p className="text-xs text-[#c4c4d8] mb-6">Aşağıdaki butona tıklayarak ilaç ekleyin</p>
        </div>
      ) : (
        medications.map((med, i) => (
          <div key={med.id}
            className={`animate-slideIn3D bg-white rounded-[22px] border-2 p-4 mb-3 transition-all ${!med.active ? 'opacity-50' : ''}`}
            style={{
              animationDelay: `${i * 0.06}s`,
              borderColor: med.active ? '#f0f0f5' : '#e0e0e0',
              boxShadow: med.active ? '0 2px 12px rgba(0,0,0,0.05)' : '0 1px 4px rgba(0,0,0,0.03)',
            }}>
            <div className="flex items-center gap-3">
              <div className="w-13 h-13 rounded-[16px] bg-[#f8f9fc] flex items-center justify-center shadow-sm"
                style={{ width: '3.25rem', height: '3.25rem' }}>
                <PillIcon shape={med.pill.shape} color={med.pill.color} size={med.pill.size} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-[#1a1a2e] truncate">{med.name}</p>
                <p className="text-xs text-[#9e9eb8] font-medium">{med.dosage} · {med.times.join(', ')}</p>
                {med.notes && <p className="text-xs text-[#c4c4d8] truncate">{med.notes}</p>}
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-gray-50">
              <button onClick={() => handleToggle(med)}
                className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-[12px] hover:bg-gray-50 transition-all font-bold btn-press">
                {med.active ? <ToggleRight className="w-5 h-5 text-[#4CAF50]" /> : <ToggleLeft className="w-5 h-5 text-[#9e9eb8]" />}
                <span className={med.active ? 'text-[#4CAF50]' : 'text-[#9e9eb8]'}>{med.active ? 'Aktif' : 'Pasif'}</span>
              </button>
              <button onClick={() => navigate(`/caretaker/elder/${elderId}/add-med?edit=${med.id}`)}
                className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-[12px] hover:bg-blue-50 transition-all text-[#2196F3] font-bold btn-press">
                <Pencil className="w-3.5 h-3.5" /> Düzenle
              </button>
              <button onClick={() => handleDelete(med.id)}
                className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-[12px] hover:bg-red-50 transition-all text-[#FF5722] ml-auto font-bold btn-press">
                <Trash2 className="w-3.5 h-3.5" /> Sil
              </button>
            </div>
          </div>
        ))
      )}
      <button onClick={() => navigate(`/caretaker/elder/${elderId}/add-med`)}
        className="w-full min-h-[52px] text-base font-extrabold rounded-[20px] text-white shadow-glow-blue btn-press ripple-effect flex items-center justify-center gap-2 mt-4 relative overflow-hidden group">
        <div className="absolute inset-0 rounded-[20px] animate-gradientShift"
          style={{ background: 'linear-gradient(135deg, #0D47A1 0%, #1565C0 25%, #1976D2 50%, #42A5F5 75%, #1565C0 100%)', backgroundSize: '200% 200%' }} />
        <div className="absolute inset-0 animate-shimmer opacity-15" />
        <span className="relative z-10 flex items-center gap-2">
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" /> Yeni İlaç Ekle
        </span>
      </button>
    </div>
  );
}
