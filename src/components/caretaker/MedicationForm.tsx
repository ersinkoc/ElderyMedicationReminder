import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useMedications } from '../../hooks/useMedications';
import PillShapePicker from './PillShapePicker';
import type { PillShape, PillColor, PillSize } from '../../types';
import { ArrowLeft, Plus, X, Clock, FileText, Pill as PillLucide, Save } from 'lucide-react';

export default function MedicationForm() {
  const { id: elderId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addMedication, updateMedication } = useMedications();

  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [notes, setNotes] = useState('');
  const [times, setTimes] = useState<string[]>(['08:00']);
  const [shape, setShape] = useState<PillShape>('round');
  const [color, setColor] = useState<PillColor>('white');
  const [size, setSize] = useState<PillSize>('medium');
  const [loading, setLoading] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(!!editId);

  useEffect(() => {
    if (!editId) return;
    const fetch = async () => {
      const snap = await getDoc(doc(db, 'medications', editId));
      if (snap.exists()) {
        const d = snap.data();
        setName(d.name || ''); setDosage(d.dosage || ''); setNotes(d.notes || '');
        setTimes(d.times || ['08:00']); setShape(d.pill?.shape || 'round');
        setColor(d.pill?.color || 'white'); setSize(d.pill?.size || 'medium');
      }
      setLoadingEdit(false);
    };
    fetch();
  }, [editId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!elderId || !user) return;
    setLoading(true);
    try {
      const data = { elderId, name, dosage, notes, times, pill: { shape, color, size }, active: true, createdBy: user.uid };
      if (editId) await updateMedication(editId, data);
      else await addMedication(data);
      navigate(`/caretaker/elder/${elderId}`);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  if (loadingEdit) {
    return (
      <div className="flex items-center justify-center min-h-screen min-h-dvh bg-[#f0f2f5]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-3 border-[#E3F2FD] border-t-[#2196F3] animate-spin" />
          <p className="text-[#9e9eb8] font-medium text-sm">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-h-dvh bg-[#f0f2f5]">
      {/* Header */}
      <div className="text-white p-4 pb-5 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0D47A1 0%, #1565C0 40%, #42A5F5 100%)' }}>
        {/* Header particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-3 right-8 w-2 h-2 rounded-full bg-white/10 animate-float" />
          <div className="absolute top-6 right-20 w-1.5 h-1.5 rounded-full bg-white/15 animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)' }} />
        </div>
        <div className="max-w-lg mx-auto relative z-10">
          <button onClick={() => navigate(`/caretaker/elder/${elderId}`)}
            className="flex items-center gap-1.5 text-white/70 hover:text-white mb-3 transition-colors text-sm font-medium btn-press">
            <ArrowLeft className="w-4 h-4" /> Geri
          </button>
          <h1 className="text-2xl font-extrabold flex items-center gap-2 animate-fadeInUp">
            {editId ? '✏️' : '➕'} {editId ? 'İlacı Düzenle' : 'Yeni İlaç Ekle'}
          </h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 -mt-2">
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Section: Medication Info */}
          <div className="animate-springIn bg-white rounded-[22px] p-5 border-2 border-gray-50 shadow-premium-lg">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-[12px] bg-[#E3F2FD] flex items-center justify-center shadow-sm">
                <PillLucide className="w-4.5 h-4.5 text-[#2196F3]" />
              </div>
              <h2 className="text-sm font-extrabold text-[#1a1a2e]">İlaç Bilgileri</h2>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-[#9e9eb8] uppercase tracking-wider mb-1.5">İlaç Adı</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
                  placeholder="Aspirin 100mg"
                  className="w-full px-4 py-3.5 bg-[#f8f9fc] border-2 border-transparent rounded-[16px] text-base font-medium text-[#1a1a2e] placeholder-[#c4c4d8] focus:bg-white focus:border-[#2196F3]/30 focus:shadow-md transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#9e9eb8] uppercase tracking-wider mb-1.5">Doz</label>
                  <input type="text" value={dosage} onChange={(e) => setDosage(e.target.value)} required
                    placeholder="1 tablet"
                    className="w-full px-4 py-3.5 bg-[#f8f9fc] border-2 border-transparent rounded-[16px] text-base font-medium text-[#1a1a2e] placeholder-[#c4c4d8] focus:bg-white focus:border-[#2196F3]/30 focus:shadow-md transition-all" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#9e9eb8] uppercase tracking-wider mb-1.5">Notlar</label>
                  <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)}
                    placeholder="Yemekten sonra"
                    className="w-full px-4 py-3.5 bg-[#f8f9fc] border-2 border-transparent rounded-[16px] text-base font-medium text-[#1a1a2e] placeholder-[#c4c4d8] focus:bg-white focus:border-[#2196F3]/30 focus:shadow-md transition-all" />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Schedule */}
          <div className="animate-springIn bg-white rounded-[22px] p-5 border-2 border-gray-50 shadow-premium-lg"
            style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-[12px] bg-[#FFF3E0] flex items-center justify-center shadow-sm">
                  <Clock className="w-4.5 h-4.5 text-[#FF9800]" />
                </div>
                <h2 className="text-sm font-extrabold text-[#1a1a2e]">Saatler</h2>
              </div>
              <button type="button" onClick={() => setTimes([...times, '12:00'])}
                className="flex items-center gap-1 text-xs font-bold text-[#2196F3] bg-[#E3F2FD] px-3.5 py-2 rounded-full hover:bg-[#BBDEFB] transition-colors btn-press">
                <Plus className="w-3.5 h-3.5" /> Ekle
              </button>
            </div>
            <div className="space-y-2">
              {times.map((time, i) => (
                <div key={i} className="flex items-center gap-2 animate-fadeInUp" style={{ animationDelay: `${i * 0.05}s` }}>
                  <div className="flex-1 relative">
                    <input type="time" value={time}
                      onChange={(e) => { const n = [...times]; n[i] = e.target.value; setTimes(n); }}
                      className="w-full px-4 py-3.5 bg-[#f8f9fc] border-2 border-transparent rounded-[16px] text-lg font-bold text-[#1a1a2e] focus:bg-white focus:border-[#FF9800]/30 focus:shadow-md transition-all" />
                  </div>
                  {times.length > 1 && (
                    <button type="button" onClick={() => setTimes(times.filter((_, j) => j !== i))}
                      className="w-11 h-11 rounded-[14px] bg-red-50 flex items-center justify-center hover:bg-red-100 transition-colors btn-press">
                      <X className="w-5 h-5 text-[#FF5722]" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section: Pill Appearance */}
          <div className="animate-springIn bg-white rounded-[22px] p-5 border-2 border-gray-50 shadow-premium-lg"
            style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-[12px] bg-[#E8F5E9] flex items-center justify-center shadow-sm">
                <FileText className="w-4.5 h-4.5 text-[#4CAF50]" />
              </div>
              <h2 className="text-sm font-extrabold text-[#1a1a2e]">İlaç Görünümü</h2>
            </div>
            <PillShapePicker shape={shape} color={color} size={size}
              onShapeChange={setShape} onColorChange={setColor} onSizeChange={setSize} />
          </div>

          {/* Buttons */}
          <div className="animate-bounceIn flex gap-3 pt-2 pb-10" style={{ animationDelay: '0.3s' }}>
            <button type="button" onClick={() => navigate(`/caretaker/elder/${elderId}`)}
              className="flex-1 min-h-[56px] text-base font-bold rounded-[18px] bg-white border-2 border-gray-200 text-[#4a4a6a] hover:bg-gray-50 btn-press transition-all">
              İptal
            </button>
            <button type="submit" disabled={loading}
              className="flex-[2] min-h-[56px] text-base font-extrabold rounded-[18px] text-white shadow-glow-blue btn-press ripple-effect disabled:opacity-50 relative overflow-hidden group">
              <div className="absolute inset-0 rounded-[18px] animate-gradientShift"
                style={{ background: 'linear-gradient(135deg, #0D47A1 0%, #1565C0 25%, #1976D2 50%, #42A5F5 75%, #1565C0 100%)', backgroundSize: '200% 200%' }} />
              <div className="absolute inset-0 animate-shimmer opacity-15" />
              <span className="relative z-10 flex items-center justify-center gap-2">
                <Save className="w-5 h-5" />
                {loading ? 'Kaydediliyor...' : 'Kaydet'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
