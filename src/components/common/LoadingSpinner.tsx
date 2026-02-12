export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen min-h-dvh relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #e8f5e9 0%, #f5f7fa 50%, #e3f2fd 100%)' }}>

      {/* Animated background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-48 h-48 opacity-10 animate-morphBlob"
          style={{ background: 'linear-gradient(135deg, #4CAF50, #81C784)', animationDuration: '8s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 opacity-8 animate-morphBlob"
          style={{ background: 'linear-gradient(135deg, #2196F3, #64B5F6)', animationDuration: '10s', animationDelay: '2s' }} />
      </div>

      <div className="animate-springIn flex flex-col items-center gap-6 relative z-10">
        {/* Animated pill loader */}
        <div className="relative">
          <div className="w-24 h-24 rounded-[28px] bg-white shadow-premium-xl flex items-center justify-center">
            <svg width="48" height="48" viewBox="0 0 48 48" className="animate-float3D">
              <defs>
                <linearGradient id="spinner-grad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#66BB6A" />
                  <stop offset="100%" stopColor="#2E7D32" />
                </linearGradient>
                <radialGradient id="spinner-shine" cx="0.3" cy="0.3" r="0.5">
                  <stop offset="0%" stopColor="white" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="white" stopOpacity="0" />
                </radialGradient>
              </defs>
              <rect x="6" y="14" width="36" height="20" rx="10" fill="url(#spinner-grad)" />
              <rect x="6" y="14" width="18" height="20" rx="10" fill="rgba(255,255,255,0.25)" />
              <ellipse cx="16" cy="20" rx="6" ry="3" fill="url(#spinner-shine)" />
            </svg>
          </div>
          {/* Pulsing rings */}
          <div className="absolute -inset-2 rounded-[32px]"
            style={{ animation: 'pulseGlow 2s ease-in-out infinite' }} />
          <div className="absolute -inset-4 rounded-[36px]"
            style={{ animation: 'pulseGlow 2s ease-in-out infinite 0.5s' }} />
        </div>

        {/* Loading text */}
        <div className="flex items-center gap-1.5">
          <p className="text-lg text-[#4a4a6a] font-bold">Yükleniyor</p>
          <div className="flex gap-1 ml-0.5">
            {[0, 0.2, 0.4].map((delay, i) => (
              <span key={i} className="w-2 h-2 rounded-full bg-[#4CAF50]"
                style={{ animation: 'dotPulse 1.4s ease-in-out infinite', animationDelay: `${delay}s` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
