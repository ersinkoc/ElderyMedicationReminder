import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { auth, db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import { generatePairingCode } from '../../utils/pairingCode';
import LoadingSpinner from '../common/LoadingSpinner';
import { Copy, Check, ArrowRight, Link2 } from 'lucide-react';

// Animated connection SVG
function ConnectionVisual() {
  return (
    <div className="relative w-32 h-32 mx-auto mb-6">
      {/* Outer pulsing rings */}
      <div className="absolute inset-0 rounded-full" style={{ animation: 'pulseGlow 2.5s ease-in-out infinite' }} />
      <div className="absolute -inset-3 rounded-full" style={{ animation: 'pulseGlow 2.5s ease-in-out infinite 0.8s' }} />
      <div className="absolute -inset-6 rounded-full" style={{ animation: 'pulseGlow 2.5s ease-in-out infinite 1.6s' }} />

      {/* Center icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-24 h-24 rounded-[28px] flex items-center justify-center shadow-premium-xl relative overflow-hidden animate-float3D"
          style={{ background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 40%, #43A047 70%, #66BB6A 100%)' }}>
          <div className="absolute inset-0 animate-shimmer" />
          <Link2 className="w-11 h-11 text-white relative z-10" strokeWidth={2.5} />
        </div>
      </div>

      {/* Orbiting dots */}
      <div className="absolute inset-0 animate-orbitSlow" style={{ animationDuration: '10s' }}>
        <div className="w-3 h-3 rounded-full bg-[#66BB6A] shadow-lg" style={{ boxShadow: '0 0 12px rgba(102,187,106,0.6)' }} />
      </div>
      <div className="absolute inset-0 animate-orbitSlow" style={{ animationDuration: '12s', animationDelay: '4s', animationDirection: 'reverse' }}>
        <div className="w-2.5 h-2.5 rounded-full bg-[#FFD54F] shadow-lg" style={{ boxShadow: '0 0 10px rgba(255,213,79,0.5)' }} />
      </div>
    </div>
  );
}

export default function ElderSetup() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [pairingCode, setPairingCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const didRun = useRef(false);

  useEffect(() => {
    if (authLoading) return;
    if (didRun.current) return;
    didRun.current = true;

    const setup = async () => {
      try {
        let uid: string;
        if (user) {
          uid = user.uid;
        } else {
          const result = await signInAnonymously(auth);
          uid = result.user.uid;
        }

        const userDocRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userDocRef);
        if (!userSnap.exists()) {
          await setDoc(userDocRef, {
            role: 'elder',
            displayName: 'Yaşlı',
            linkedTo: [],
            createdAt: new Date(),
          });
        }

        const elderDocRef = doc(db, 'elders', uid);
        const elderSnap = await getDoc(elderDocRef);
        let code: string;
        if (elderSnap.exists()) {
          code = elderSnap.data().pairingCode || generatePairingCode();
        } else {
          code = generatePairingCode();
          await setDoc(elderDocRef, {
            name: 'Yaşlı',
            pairingCode: code,
            caretakers: [],
          });
        }

        setPairingCode(code);
        setLoading(false);
      } catch (err) {
        console.error('Elder setup failed:', err);
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes('configuration-not-found') || msg.includes('auth/configuration-not')) {
          setError('Firebase Authentication etkinleştirilmemiş.');
        } else if (msg.includes('Missing or insufficient permissions') || msg.includes('PERMISSION_DENIED')) {
          setError('Firestore izinleri eksik.');
        } else {
          setError(`Hata: ${msg}`);
        }
        setLoading(false);
      }
    };

    setup();
  }, [authLoading, user]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pairingCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard might not be available */ }
  };

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen min-h-dvh px-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #fce4ec 0%, #f5f7fa 50%, #ffebee 100%)' }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-48 h-48 opacity-10 animate-morphBlob"
            style={{ background: 'linear-gradient(135deg, #FF5722, #FF8A65)', animationDuration: '8s' }} />
        </div>
        <div className="animate-springIn bg-white rounded-[28px] shadow-premium-xl p-8 max-w-md w-full text-center relative z-10">
          <div className="w-20 h-20 mx-auto rounded-full bg-red-50 flex items-center justify-center mb-5 animate-breathe">
            <span className="text-4xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#1a1a2e] mb-3">Bağlantı Hatası</h1>
          <p className="text-base text-[#FF5722] mb-8 leading-relaxed">{error}</p>
          <button onClick={() => window.location.reload()}
            className="w-full min-h-[60px] text-xl font-extrabold rounded-[20px] text-white btn-press ripple-effect relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #E64A19 0%, #FF7043 100%)', boxShadow: '0 8px 24px rgba(230,74,25,0.25)' }}>
            <div className="absolute inset-0 animate-shimmer opacity-20" />
            <span className="relative z-10">Tekrar Dene</span>
          </button>
        </div>
      </div>
    );
  }

  const digits = pairingCode.split('');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen min-h-dvh px-6 relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #e8f5e9 0%, #f5f7fa 40%, #e3f2fd 70%, #f0f2f5 100%)' }}>

      {/* Morphing blob backgrounds */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-64 h-64 opacity-12 animate-morphBlob"
          style={{ background: 'linear-gradient(135deg, #4CAF50, #81C784)', animationDuration: '10s' }} />
        <div className="absolute -bottom-24 -right-16 w-56 h-56 opacity-8 animate-morphBlob"
          style={{ background: 'linear-gradient(135deg, #2196F3, #64B5F6)', animationDuration: '12s', animationDelay: '3s' }} />
        <div className="absolute top-1/3 right-1/4 w-40 h-40 opacity-6 animate-morphBlob"
          style={{ background: 'linear-gradient(135deg, #FFD54F, #FFF176)', animationDuration: '8s', animationDelay: '6s' }} />
      </div>

      <div className="animate-springIn bg-white rounded-[32px] shadow-premium-xl p-8 md:p-12 max-w-md w-full text-center relative z-10">
        <ConnectionVisual />

        <h1 className="text-3xl md:text-4xl font-extrabold text-gradient-green mb-2">
          Eşleştirme Kodu
        </h1>
        <p className="text-base text-[#9e9eb8] mb-8">
          Bu kodu refakatçinize verin — birden fazla kişi aynı kodla eşleşebilir
        </p>

        {/* Code display - 3D digit boxes */}
        <div className="flex justify-center gap-2.5 mb-6">
          {digits.map((digit, i) => (
            <div key={i} className="w-14 h-16 md:w-16 md:h-[72px] rounded-[16px] flex items-center justify-center animate-bounceIn relative overflow-hidden"
              style={{
                background: 'linear-gradient(145deg, #E8F5E9 0%, #C8E6C9 100%)',
                boxShadow: '0 4px 16px rgba(76,175,80,0.2), 0 1px 3px rgba(0,0,0,0.05)',
                animationDelay: `${0.3 + i * 0.1}s`,
              }}>
              <div className="absolute inset-0 animate-shimmer opacity-30" />
              <span className="text-3xl md:text-4xl font-mono font-extrabold text-[#2E7D32] relative z-10">{digit}</span>
            </div>
          ))}
        </div>

        {/* Copy button */}
        <button
          onClick={handleCopy}
          className={`animate-fadeIn inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all mb-8 btn-press ${
            copied ? 'bg-[#E8F5E9] text-[#2E7D32] shadow-glow-green' : 'bg-[#f8f9fc] text-[#9e9eb8] hover:bg-[#f0f2f5]'
          }`}
          style={{ animationDelay: '0.8s' }}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Kopyalandı!' : 'Kodu Kopyala'}
        </button>

        {/* Continue button */}
        <button
          onClick={() => navigate('/elder/home')}
          className="w-full min-h-[68px] text-2xl font-extrabold rounded-[20px] text-white shadow-glow-green btn-press ripple-effect flex items-center justify-center gap-3 relative overflow-hidden group"
        >
          <div className="absolute inset-0 rounded-[20px] animate-gradientShift"
            style={{ background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 25%, #43A047 50%, #66BB6A 75%, #2E7D32 100%)', backgroundSize: '200% 200%' }} />
          <div className="absolute inset-0 animate-shimmer opacity-15" />
          <span className="relative z-10 flex items-center gap-3">
            Devam Et
            <ArrowRight className="w-7 h-7 group-hover:translate-x-1 transition-transform duration-300" />
          </span>
        </button>
      </div>
    </div>
  );
}
