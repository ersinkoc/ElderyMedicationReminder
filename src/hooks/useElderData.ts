import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import type { Medication, MedicationLog } from '../types';
import { getTodayDateString } from '../utils/dateUtils';

export function useElderData(elderId: string | undefined) {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [logs, setLogs] = useState<MedicationLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!elderId) return;

    const medsQuery = query(
      collection(db, 'medications'),
      where('elderId', '==', elderId),
      where('active', '==', true)
    );

    const unsubMeds = onSnapshot(medsQuery, (snapshot) => {
      const meds = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      })) as Medication[];
      setMedications(meds);
      setLoading(false);
    });

    return () => unsubMeds();
  }, [elderId]);

  useEffect(() => {
    if (!elderId) return;

    const today = getTodayDateString();
    const logsQuery = query(
      collection(db, 'logs'),
      where('elderId', '==', elderId),
      where('scheduledDate', '==', today)
    );

    const unsubLogs = onSnapshot(logsQuery, (snapshot) => {
      const logData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        actionTime: doc.data().actionTime?.toDate?.() || null,
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      })) as MedicationLog[];
      setLogs(logData);
    });

    return () => unsubLogs();
  }, [elderId]);

  return { medications, logs, loading };
}
