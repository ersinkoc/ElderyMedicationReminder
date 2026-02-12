import { useNavigate } from 'react-router-dom';
import { Heart, Shield } from 'lucide-react';

// Floating pill SVG particles
function FloatingPills() {
  const pills = [
    { x: 8, y: 15, size: 28, color: '#4CAF50', delay: 0, dur: 7 },
    { x: 85, y: 10, size: 22, color: '#2196F3', delay: 1.5, dur: 9 },
    { x: 20, y: 75, size: 18, color: '#FF9800', delay: 3, dur: 8 },
    { x: 75, y: 70, size: 24, color: '#E91E63', delay: 0.8, dur: 10 },
    { x: 50, y: 5, size: 16, color: '#9C27B0', delay: 2, dur: 7.5 },
    { x: 92, y: 45, size: 20, color: '#00BCD4', delay: 4, dur: 9 },
    { x: 5, y: 50, size: 14, color: '#FFD54F', delay: 1, dur: 8.5 },
    { x: 60, y: 85, size: 26, color: '#4CAF50', delay: 2.5, dur: 11 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {pills.map((p, i) => (
        <svg key={i} className="absolute opacity-15"
          style={{
            left: `${p.x}%`, top: `${p.y}%`,
            width: p.size, height: p.size,
            animation: `float3D ${p.dur}s ease-in-out infinite`,
            animationDelay: `${p.delay}s`,
          }}
          viewBox="0 0 24 24" fill="none">
          <rect x="2" y="7" width="20" height="10" rx="5" fill={p.color} />
          <rect x="2" y="7" width="10" height="10" rx="5" fill="white" fillOpacity="0.3" />
        </svg>
      ))}

      {/* Morphing blob backgrounds */}
      <div className="absolute -top-20 -right-20 w-80 h-80 opacity-12 animate-morphBlob"
        style={{ background: 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)', animationDuration: '12s' }} />
      <div className="absolute -bottom-32 -left-24 w-96 h-96 opacity-8 animate-morphBlob"
        style={{ background: 'linear-gradient(135deg, #2196F3 0%, #64B5F6 100%)', animationDuration: '15s', animationDelay: '3s' }} />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-48 h-48 opacity-6 animate-morphBlob"
        style={{ background: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)', animationDuration: '10s', animationDelay: '6s' }} />
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen min-h-dvh px-6 py-10 relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #e8f5e9 0%, #f5f7fa 30%, #e3f2fd 60%, #f0f2f5 100%)' }}>

      <FloatingPills />

      {/* Logo & Title */}
      <div className="animate-springIn flex flex-col items-center gap-5 mb-14 relative z-10">
        {/* 3D animated logo */}
        <div className="relative perspective-container">
          <div className="w-32 h-32 rounded-[36px] flex items-center justify-center shadow-premium-xl animate-float3D relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 30%, #43A047 60%, #66BB6A 100%)' }}>
            {/* Shimmer overlay */}
            <div className="absolute inset-0 animate-shimmer" />
            {/* 3D pill icon */}
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="relative z-10">
              <defs>
                <linearGradient id="lp-pill-main" x1="8" y1="20" x2="56" y2="44">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="50%" stopColor="#f5f5f5" />
                  <stop offset="100%" stopColor="#e0e0e0" />
                </linearGradient>
                <radialGradient id="lp-pill-shine" cx="0.3" cy="0.3" r="0.5">
                  <stop offset="0%" stopColor="white" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="white" stopOpacity="0" />
                </radialGradient>
                <filter id="lp-pill-shadow">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#1B5E20" floodOpacity="0.3" />
                </filter>
              </defs>
              <g filter="url(#lp-pill-shadow)">
                <rect x="8" y="20" width="48" height="24" rx="12" fill="url(#lp-pill-main)" />
                <rect x="8" y="20" width="24" height="24" rx="12" fill="rgba(76,175,80,0.2)" />
                <line x1="32" y1="21" x2="32" y2="43" stroke="#bdbdbd" strokeWidth="0.5" strokeOpacity="0.5" />
                <ellipse cx="22" cy="28" rx="8" ry="4" fill="url(#lp-pill-shine)" />
              </g>
            </svg>
          </div>
          {/* Orbital sparkle */}
          <div className="absolute inset-0 animate-orbitSlow" style={{ animationDuration: '8s' }}>
            <div className="w-4 h-4 rounded-full bg-[#FFD54F] shadow-lg" style={{ boxShadow: '0 0 12px rgba(255,213,79,0.6)' }} />
          </div>
          {/* Glow ring */}
          <div className="absolute -inset-3 rounded-[42px] opacity-40"
            style={{ animation: 'pulseGlow 3s ease-in-out infinite' }} />
        </div>

        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-gradient-green">
            İlaç Takip
          </h1>
          <p className="text-lg text-[#4a4a6a] font-medium mt-3 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
            Sağlığınız güvende, her zaman
          </p>
        </div>
      </div>

      {/* 3D Buttons */}
      <div className="flex flex-col gap-5 w-full max-w-sm relative z-10 perspective-container">
        <button
          onClick={() => navigate('/elder')}
          className="animate-bounceIn group w-full rounded-[26px] text-white shadow-glow-green btn-press card-3d ripple-effect"
          style={{ animationDelay: '0.2s' }}
        >
          <div className="absolute inset-0 rounded-[26px] animate-gradientShift"
            style={{ background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 25%, #43A047 50%, #66BB6A 75%, #2E7D32 100%)', backgroundSize: '200% 200%' }} />
          <div className="absolute inset-0 rounded-[26px] animate-shimmer opacity-20" />
          <div className="relative flex flex-col items-center justify-center gap-2.5 py-8 px-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-[14px] bg-white/20 flex items-center justify-center group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300">
                <Heart className="w-6 h-6" strokeWidth={2.5} />
              </div>
              <span className="text-3xl font-extrabold tracking-tight">Ben Yaşlıyım</span>
            </div>
            <span className="text-sm text-white/70 font-medium">Günlük ilaç takibi yapın</span>
          </div>
        </button>

        <button
          onClick={() => navigate('/caretaker/login')}
          className="animate-bounceIn group w-full rounded-[26px] text-white shadow-glow-blue btn-press card-3d ripple-effect"
          style={{ animationDelay: '0.35s' }}
        >
          <div className="absolute inset-0 rounded-[26px] animate-gradientShift"
            style={{ background: 'linear-gradient(135deg, #0D47A1 0%, #1565C0 25%, #1976D2 50%, #42A5F5 75%, #1565C0 100%)', backgroundSize: '200% 200%', animationDelay: '2s' }} />
          <div className="absolute inset-0 rounded-[26px] animate-shimmer opacity-20" />
          <div className="relative flex flex-col items-center justify-center gap-2.5 py-8 px-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-[14px] bg-white/20 flex items-center justify-center group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300">
                <Shield className="w-6 h-6" strokeWidth={2.5} />
              </div>
              <span className="text-3xl font-extrabold tracking-tight">Refakatçiyim</span>
            </div>
            <span className="text-sm text-white/70 font-medium">İlaçları yönetin ve takip edin</span>
          </div>
        </button>
      </div>

      {/* Animated bottom tagline */}
      <div className="animate-fadeIn relative z-10 mt-16 flex items-center gap-4 text-sm" style={{ animationDelay: '0.7s' }}>
        {[
          { label: 'Güvenli', color: '#4CAF50' },
          { label: 'Kolay', color: '#2196F3' },
          { label: '7/24', color: '#FF9800' },
        ].map((item, i) => (
          <span key={i} className="flex items-center gap-1.5 text-[#9e9eb8]">
            <span className="w-2.5 h-2.5 rounded-full animate-breathe"
              style={{ backgroundColor: item.color, animationDelay: `${i * 0.5}s` }} />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}
