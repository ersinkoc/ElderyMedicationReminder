import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, updateDoc, doc, arrayUnion } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Link2, CheckCircle, ArrowLeft } from 'lucide-react';

export default function PairElder() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const code = digits.join('');

  const handleDigitChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);

    // Auto-focus next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length > 0) {
      const newDigits = [...digits];
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pasted[i] || '';
      }
      setDigits(newDigits);
      const focusIndex = Math.min(pasted.length, 5);
      inputRefs.current[focusIndex]?.focus();
    }
  };

  const handlePair = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || code.length !== 6) return;
    setError(''); setSuccess(''); setLoading(true);
    try {
      const snapshot = await getDocs(query(collection(db, 'elders'), where('pairingCode', '==', code)));
      if (snapshot.empty) { setError('Bu kodla eşleşen yaşlı bulunamadı'); setLoading(false); return; }
      const elderId = snapshot.docs[0].id;
      await updateDoc(doc(db, 'elders', elderId), { caretakers: arrayUnion(user.uid) });
      await updateDoc(doc(db, 'users', user.uid), { linkedTo: arrayUnion(elderId) });
      setSuccess('Eşleştirme başarılı!');
      setTimeout(() => navigate('/caretaker/dashboard'), 1500);
    } catch (err) { console.error(err); setError('Eşleştirme sırasında bir hata oluştu'); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen min-h-dvh px-6 relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #e3f2fd 0%, #f5f7fa 40%, #ede7f6 70%, #f0f2f5 100%)' }}>

      {/* Morphing blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-16 w-56 h-56 opacity-12 animate-morphBlob"
          style={{ background: 'linear-gradient(135deg, #2196F3, #64B5F6)', animationDuration: '10s' }} />
        <div className="absolute -bottom-24 -left-16 w-64 h-64 opacity-8 animate-morphBlob"
          style={{ background: 'linear-gradient(135deg, #9C27B0, #CE93D8)', animationDuration: '12s', animationDelay: '3s' }} />
      </div>

      <div className="animate-springIn bg-white rounded-[28px] shadow-premium-xl p-8 max-w-md w-full text-center relative z-10">
        {/* Animated icon */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full" style={{ animation: 'pulseGlowBlue 2.5s ease-in-out infinite' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-premium-lg animate-float3D transition-all duration-500 ${
              success ? 'bg-[#E8F5E9]' : 'bg-[#E3F2FD]'
            }`}>
              {success
                ? <CheckCircle className="w-10 h-10 text-[#4CAF50] animate-celebratePop" />
                : <Link2 className="w-10 h-10 text-[#2196F3]" />}
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-extrabold text-gradient-blue mb-2">Yaşlı Eşleştir</h1>
        <p className="text-[#9e9eb8] mb-8">Yaşlının telefonundaki 6 haneli kodu girin</p>

        {error && (
          <div className="animate-springIn bg-red-50 border border-red-100 text-red-600 rounded-[16px] p-3.5 mb-4 text-sm font-medium">
            {error}
          </div>
        )}
        {success && (
          <div className="animate-celebratePop bg-green-50 border border-green-100 text-green-700 rounded-[16px] p-3.5 mb-4 font-semibold flex items-center justify-center gap-2">
            <CheckCircle className="w-5 h-5" /> {success}
          </div>
        )}

        <form onSubmit={handlePair}>
          {/* 6-digit input boxes */}
          <div className="flex justify-center gap-2.5 mb-6" onPaste={handlePaste}>
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="animate-bounceIn w-13 h-16 md:w-14 md:h-[72px] text-center text-3xl font-mono font-extrabold rounded-[16px] bg-[#f8f9fc] border-2 border-transparent text-[#1a1a2e] transition-all focus:border-[#2196F3] focus:bg-white focus:shadow-lg"
                style={{ width: '3.25rem', animationDelay: `${0.1 + i * 0.08}s` }}
              />
            ))}
          </div>

          <button type="submit" disabled={loading || code.length !== 6}
            className="w-full min-h-[56px] text-lg font-extrabold rounded-[18px] text-white shadow-glow-blue btn-press ripple-effect disabled:opacity-40 relative overflow-hidden group">
            <div className="absolute inset-0 rounded-[18px] animate-gradientShift"
              style={{ background: 'linear-gradient(135deg, #0D47A1 0%, #1565C0 25%, #1976D2 50%, #42A5F5 75%, #1565C0 100%)', backgroundSize: '200% 200%' }} />
            <div className="absolute inset-0 animate-shimmer opacity-15" />
            <span className="relative z-10">{loading ? 'Eşleştiriliyor...' : 'Eşleştir'}</span>
          </button>
        </form>

        <button onClick={() => navigate('/caretaker/dashboard')}
          className="mt-5 inline-flex items-center gap-1.5 text-sm text-[#9e9eb8] hover:text-[#4a4a6a] font-medium transition-colors btn-press">
          <ArrowLeft className="w-4 h-4" /> Geri Dön
        </button>
      </div>
    </div>
  );
}
