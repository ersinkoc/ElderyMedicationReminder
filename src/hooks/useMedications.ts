import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import type { Medication } from '../types';

export function useMedications() {
  const addMedication = async (medication: Omit<Medication, 'id' | 'createdAt'>) => {
    await addDoc(collection(db, 'medications'), {
      ...medication,
      createdAt: new Date(),
    });
  };

  const updateMedication = async (id: string, data: Partial<Medication>) => {
    await updateDoc(doc(db, 'medications', id), data);
  };

  const deleteMedication = async (id: string) => {
    await deleteDoc(doc(db, 'medications', id));
  };

  const getMedicationsForElder = async (elderId: string): Promise<Medication[]> => {
    const q = query(collection(db, 'medications'), where('elderId', '==', elderId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate?.() || new Date(),
    })) as Medication[];
  };

  return { addMedication, updateMedication, deleteMedication, getMedicationsForElder };
}
