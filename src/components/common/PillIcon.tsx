import { useMemo } from 'react';
import type { PillShape, PillColor, PillSize } from '../../types';

const PILL_COLORS: Record<PillColor, { main: string; dark: string; light: string; glow: string }> = {
  white:  { main: '#EEEEEE', dark: '#BDBDBD', light: '#FFFFFF', glow: 'rgba(255,255,255,0.6)' },
  red:    { main: '#EF5350', dark: '#B71C1C', light: '#FFCDD2', glow: 'rgba(239,83,80,0.4)' },
  orange: { main: '#FF9800', dark: '#E65100', light: '#FFE0B2', glow: 'rgba(255,152,0,0.4)' },
  yellow: { main: '#FDD835', dark: '#F9A825', light: '#FFF9C4', glow: 'rgba(253,216,53,0.4)' },
  green:  { main: '#4CAF50', dark: '#1B5E20', light: '#C8E6C9', glow: 'rgba(76,175,80,0.4)' },
  blue:   { main: '#2196F3', dark: '#0D47A1', light: '#BBDEFB', glow: 'rgba(33,150,243,0.4)' },
  purple: { main: '#9C27B0', dark: '#4A148C', light: '#E1BEE7', glow: 'rgba(156,39,176,0.4)' },
  brown:  { main: '#795548', dark: '#3E2723', light: '#D7CCC8', glow: 'rgba(121,85,72,0.3)' },
  black:  { main: '#424242', dark: '#111111', light: '#9E9E9E', glow: 'rgba(66,66,66,0.3)' },
};

interface PillIconProps {
  shape: PillShape;
  color: PillColor;
  size: PillSize;
  elderMode?: boolean;
  previewMode?: boolean;
  className?: string;
}

function getDim(size: PillSize, elderMode: boolean, previewMode: boolean): number {
  if (previewMode) return 80;
  if (elderMode) return size === 'small' ? 44 : size === 'medium' ? 56 : 68;
  return size === 'small' ? 32 : size === 'medium' ? 40 : 48;
}

export default function PillIcon({ shape, color, size, elderMode = false, previewMode = false, className = '' }: PillIconProps) {
  const dim = getDim(size, elderMode, previewMode);
  const c = PILL_COLORS[color];
  const id = useMemo(() => `pill-${Math.random().toString(36).slice(2, 8)}`, []);

  const cx = dim / 2;
  const cy = dim / 2;
  const r = dim * 0.4;

  const defs = (
    <defs>
      <linearGradient id={`${id}-grad`} x1="0.2" y1="0" x2="0.8" y2="1">
        <stop offset="0%" stopColor={c.light} />
        <stop offset="40%" stopColor={c.main} />
        <stop offset="100%" stopColor={c.dark} />
      </linearGradient>
      <radialGradient id={`${id}-shine`} cx="0.35" cy="0.3" r="0.5">
        <stop offset="0%" stopColor="white" stopOpacity="0.7" />
        <stop offset="100%" stopColor="white" stopOpacity="0" />
      </radialGradient>
      <linearGradient id={`${id}-capsL`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={c.light} />
        <stop offset="100%" stopColor={c.main} />
      </linearGradient>
      <linearGradient id={`${id}-capsR`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={c.main} />
        <stop offset="100%" stopColor={c.dark} />
      </linearGradient>
      <filter id={`${id}-shadow`}>
        <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor={c.dark} floodOpacity="0.25" />
      </filter>
    </defs>
  );

  const shine = (x: number, y: number, rx: number, ry: number) => (
    <ellipse cx={x} cy={y} rx={rx} ry={ry} fill={`url(#${id}-shine)`} />
  );

  const renderShape = () => {
    switch (shape) {
      case 'round':
        return (
          <g filter={`url(#${id}-shadow)`}>
            <circle cx={cx} cy={cy} r={r} fill={`url(#${id}-grad)`} stroke={c.dark} strokeWidth={0.8} strokeOpacity={0.3} />
            {shine(cx * 0.78, cy * 0.72, r * 0.38, r * 0.22)}
          </g>
        );
      case 'oval':
        return (
          <g filter={`url(#${id}-shadow)`}>
            <ellipse cx={cx} cy={cy} rx={r * 1.15} ry={r * 0.78} fill={`url(#${id}-grad)`} stroke={c.dark} strokeWidth={0.8} strokeOpacity={0.3} />
            {shine(cx * 0.78, cy * 0.78, r * 0.4, r * 0.18)}
          </g>
        );
      case 'square':
        return (
          <g filter={`url(#${id}-shadow)`}>
            <rect x={cx - r} y={cy - r} width={r * 2} height={r * 2} rx={r * 0.22} fill={`url(#${id}-grad)`} stroke={c.dark} strokeWidth={0.8} strokeOpacity={0.3} />
            {shine(cx * 0.8, cy * 0.75, r * 0.3, r * 0.16)}
          </g>
        );
      case 'capsule': {
        const hw = r * 1.2;
        const hh = r * 0.52;
        return (
          <g filter={`url(#${id}-shadow)`}>
            {/* Left half */}
            <clipPath id={`${id}-clipL`}>
              <rect x={cx - hw} y={cy - hh} width={hw} height={hh * 2} />
            </clipPath>
            <rect x={cx - hw} y={cy - hh} width={hw * 2} height={hh * 2} rx={hh} fill={`url(#${id}-capsL)`}
              clipPath={`url(#${id}-clipL)`} />
            {/* Right half */}
            <clipPath id={`${id}-clipR`}>
              <rect x={cx} y={cy - hh} width={hw} height={hh * 2} />
            </clipPath>
            <rect x={cx - hw} y={cy - hh} width={hw * 2} height={hh * 2} rx={hh} fill={`url(#${id}-capsR)`}
              clipPath={`url(#${id}-clipR)`} />
            {/* Divider line */}
            <line x1={cx} y1={cy - hh + 1} x2={cx} y2={cy + hh - 1} stroke={c.dark} strokeWidth={0.6} strokeOpacity={0.25} />
            {/* Full outline */}
            <rect x={cx - hw} y={cy - hh} width={hw * 2} height={hh * 2} rx={hh} fill="none" stroke={c.dark} strokeWidth={0.8} strokeOpacity={0.2} />
            {shine(cx * 0.72, cy * 0.82, r * 0.25, r * 0.12)}
          </g>
        );
      }
      case 'triangle': {
        const h = r * 1.7;
        const base = r * 1.6;
        const topY = cy - h * 0.45;
        const botY = cy + h * 0.45;
        return (
          <g filter={`url(#${id}-shadow)`}>
            <polygon
              points={`${cx},${topY} ${cx - base / 2},${botY} ${cx + base / 2},${botY}`}
              fill={`url(#${id}-grad)`}
              stroke={c.dark}
              strokeWidth={0.8}
              strokeOpacity={0.3}
              strokeLinejoin="round"
            />
            {shine(cx * 0.88, cy * 0.7, r * 0.18, r * 0.1)}
          </g>
        );
      }
    }
  };

  return (
    <svg
      width={dim}
      height={dim}
      viewBox={`0 0 ${dim} ${dim}`}
      className={className}
      style={{ filter: previewMode ? `drop-shadow(0 4px 12px ${c.glow})` : undefined }}
    >
      {defs}
      {renderShape()}
    </svg>
  );
}
