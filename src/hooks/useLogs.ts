import { collection, addDoc, updateDoc, doc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import type { MedicationLog, Medication } from '../types';
import { getTodayDateString } from '../utils/dateUtils';

export function useLogs() {
  const ensureTodayLogs = async (elderId: string, medications: Medication[]) => {
    const today = getTodayDateString();
    const logsQuery = query(
      collection(db, 'logs'),
      where('elderId', '==', elderId),
      where('scheduledDate', '==', today)
    );
    const existingLogs = await getDocs(logsQuery);
    const existingKeys = new Set(
      existingLogs.docs.map((d) => `${d.data().medicationId}_${d.data().scheduledTime}`)
    );

    const newLogs: Omit<MedicationLog, 'id'>[] = [];
    for (const med of medications) {
      if (!med.active) continue;
      for (const time of med.times) {
        const key = `${med.id}_${time}`;
        if (!existingKeys.has(key)) {
          newLogs.push({
            elderId,
            medicationId: med.id,
            medicationName: med.name,
            scheduledTime: time,
            scheduledDate: today,
            status: 'pending',
            actionTime: null,
            createdAt: new Date(),
          });
        }
      }
    }

    for (const log of newLogs) {
      await addDoc(collection(db, 'logs'), log);
    }
  };

  const updateLogStatus = async (logId: string, status: 'taken' | 'skipped') => {
    await updateDoc(doc(db, 'logs', logId), {
      status,
      actionTime: new Date(),
    });
  };

  const getTodayLogsForElder = async (elderId: string): Promise<MedicationLog[]> => {
    const today = getTodayDateString();
    const q = query(
      collection(db, 'logs'),
      where('elderId', '==', elderId),
      where('scheduledDate', '==', today)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      actionTime: d.data().actionTime?.toDate?.() || null,
      createdAt: d.data().createdAt?.toDate?.() || new Date(),
    })) as MedicationLog[];
  };

  return { ensureTodayLogs, updateLogStatus, getTodayLogsForElder };
}
