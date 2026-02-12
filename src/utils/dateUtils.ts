import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export function getTodayDateString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function getFormattedDate(): string {
  return format(new Date(), 'd MMMM EEEE', { locale: tr });
}

export function getFormattedTime(): string {
  return format(new Date(), 'HH:mm');
}

export function formatActionTime(date: Date): string {
  return format(date, 'HH:mm');
}
