import type { TimeGroup } from '../types';

export function getTimeGroup(time: string): TimeGroup {
  const hour = parseInt(time.split(':')[0]);
  if (hour >= 6 && hour < 11) return 'sabah';
  if (hour >= 11 && hour < 14) return 'ogle';
  if (hour >= 14 && hour < 20) return 'aksam';
  return 'gece';
}

export const groupLabels: Record<TimeGroup, string> = {
  sabah: 'Sabah',
  ogle: 'Öğle',
  aksam: 'Akşam',
  gece: 'Gece',
};

export const groupEmojis: Record<TimeGroup, string> = {
  sabah: '☀️',
  ogle: '🌤️',
  aksam: '🌅',
  gece: '🌙',
};

export const groupOrder: TimeGroup[] = ['sabah', 'ogle', 'aksam', 'gece'];
