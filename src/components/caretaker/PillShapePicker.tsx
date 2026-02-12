import PillIcon from '../common/PillIcon';
import type { PillShape, PillColor, PillSize } from '../../types';

const SHAPES: { value: PillShape; label: string }[] = [
  { value: 'round', label: 'Yuvarlak' },
  { value: 'oval', label: 'Oval' },
  { value: 'square', label: 'Kare' },
  { value: 'capsule', label: 'Kapsül' },
  { value: 'triangle', label: 'Üçgen' },
];

const COLORS: { value: PillColor; hex: string; label: string }[] = [
  { value: 'white', hex: '#EEEEEE', label: 'Beyaz' },
  { value: 'red', hex: '#EF5350', label: 'Kırmızı' },
  { value: 'orange', hex: '#FF9800', label: 'Turuncu' },
  { value: 'yellow', hex: '#FDD835', label: 'Sarı' },
  { value: 'green', hex: '#4CAF50', label: 'Yeşil' },
  { value: 'blue', hex: '#2196F3', label: 'Mavi' },
  { value: 'purple', hex: '#9C27B0', label: 'Mor' },
  { value: 'brown', hex: '#795548', label: 'Kahve' },
  { value: 'black', hex: '#424242', label: 'Siyah' },
];

const SIZES: { value: PillSize; label: string; desc: string }[] = [
  { value: 'small', label: 'S', desc: 'Küçük' },
  { value: 'medium', label: 'M', desc: 'Orta' },
  { value: 'large', label: 'L', desc: 'Büyük' },
];

interface Props {
  shape: PillShape; color: PillColor; size: PillSize;
  onShapeChange: (s: PillShape) => void;
  onColorChange: (c: PillColor) => void;
  onSizeChange: (s: PillSize) => void;
}

export default function PillShapePicker({ shape, color, size, onShapeChange, onColorChange, onSizeChange }: Props) {
  return (
    <div className="space-y-4">
      {/* Live Preview - TOP */}
      <div className="rounded-[20px] p-6 flex flex-col items-center gap-3"
        style={{ background: 'linear-gradient(135deg, #f8f9ff 0%, #eef1f8 100%)' }}>
        <p className="text-xs font-bold text-[#9e9eb8] uppercase tracking-wider">Önizleme</p>
        <div className="animate-float">
          <PillIcon shape={shape} color={color} size={size} previewMode />
        </div>
        <p className="text-sm font-semibold text-[#4a4a6a] capitalize">
          {SHAPES.find(s => s.value === shape)?.label} · {COLORS.find(c => c.value === color)?.label} · {SIZES.find(s => s.value === size)?.desc}
        </p>
      </div>

      {/* Shape */}
      <div className="bg-white rounded-[16px] p-4 border border-gray-100" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <p className="text-xs font-bold text-[#9e9eb8] uppercase tracking-wider mb-3">Şekil</p>
        <div className="grid grid-cols-5 gap-2">
          {SHAPES.map((s) => (
            <button key={s.value} type="button" onClick={() => onShapeChange(s.value)}
              className={`flex flex-col items-center gap-1.5 py-3 rounded-[14px] border-2 transition-all ${
                shape === s.value
                  ? 'border-[#2196F3] bg-[#E3F2FD] shadow-sm scale-105'
                  : 'border-transparent bg-gray-50 hover:bg-gray-100'
              }`}>
              <PillIcon shape={s.value} color={shape === s.value ? color : 'white'} size="small" />
              <span className={`text-[10px] font-bold ${shape === s.value ? 'text-[#2196F3]' : 'text-[#9e9eb8]'}`}>{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Color */}
      <div className="bg-white rounded-[16px] p-4 border border-gray-100" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <p className="text-xs font-bold text-[#9e9eb8] uppercase tracking-wider mb-3">Renk</p>
        <div className="flex flex-wrap gap-2.5 justify-center">
          {COLORS.map((c) => (
            <button key={c.value} type="button" onClick={() => onColorChange(c.value)}
              className="relative group"
              title={c.label}>
              <div className={`w-11 h-11 rounded-full border-[3px] transition-all flex items-center justify-center ${
                color === c.value
                  ? 'border-[#2196F3] scale-110 shadow-lg'
                  : 'border-white shadow-md hover:scale-105'
              }`}
                style={{ backgroundColor: c.hex }}>
                {color === c.value && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8L6.5 11.5L13 4.5" stroke={c.value === 'white' || c.value === 'yellow' ? '#333' : 'white'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span className={`absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] font-bold transition-opacity ${color === c.value ? 'text-[#2196F3] opacity-100' : 'text-[#9e9eb8] opacity-0 group-hover:opacity-100'}`}>
                {c.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Size */}
      <div className="bg-white rounded-[16px] p-4 border border-gray-100" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <p className="text-xs font-bold text-[#9e9eb8] uppercase tracking-wider mb-3">Boyut</p>
        <div className="flex gap-2">
          {SIZES.map((s) => (
            <button key={s.value} type="button" onClick={() => onSizeChange(s.value)}
              className={`flex-1 py-3.5 rounded-[12px] border-2 transition-all flex flex-col items-center gap-0.5 ${
                size === s.value
                  ? 'border-[#2196F3] bg-[#E3F2FD] shadow-sm'
                  : 'border-transparent bg-gray-50 hover:bg-gray-100'
              }`}>
              <span className={`text-lg font-extrabold ${size === s.value ? 'text-[#2196F3]' : 'text-[#9e9eb8]'}`}>{s.label}</span>
              <span className={`text-[10px] font-semibold ${size === s.value ? 'text-[#2196F3]' : 'text-[#c4c4d8]'}`}>{s.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
