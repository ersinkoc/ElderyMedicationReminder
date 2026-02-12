import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  color: string;
  size: number;
  delay: number;
  duration: number;
  rotation: number;
  shape: 'circle' | 'square' | 'star';
}

const COLORS = ['#4CAF50', '#66BB6A', '#FFD54F', '#FF9800', '#2196F3', '#E91E63', '#9C27B0', '#00BCD4'];

export default function Confetti({ active, duration = 3000 }: { active: boolean; duration?: number }) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!active) return;
    setVisible(true);

    const newParticles: Particle[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: Math.random() * 8 + 4,
      delay: Math.random() * 0.5,
      duration: Math.random() * 2 + 1.5,
      rotation: Math.random() * 360,
      shape: (['circle', 'square', 'star'] as const)[Math.floor(Math.random() * 3)],
    }));
    setParticles(newParticles);

    const timer = setTimeout(() => {
      setVisible(false);
      setParticles([]);
    }, duration);

    return () => clearTimeout(timer);
  }, [active, duration]);

  if (!visible || particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}%`,
            top: '-10px',
            width: p.size,
            height: p.size,
            backgroundColor: p.shape !== 'star' ? p.color : 'transparent',
            borderRadius: p.shape === 'circle' ? '50%' : p.shape === 'square' ? '2px' : '0',
            animation: `confettiFall ${p.duration}s ease-in ${p.delay}s both`,
            transform: `rotate(${p.rotation}deg)`,
          }}
        >
          {p.shape === 'star' && (
            <svg width={p.size} height={p.size} viewBox="0 0 10 10">
              <polygon points="5,0 6.5,3.5 10,4 7.5,6.5 8,10 5,8 2,10 2.5,6.5 0,4 3.5,3.5" fill={p.color} />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
}
