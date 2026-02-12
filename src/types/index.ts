export interface AppUser {
  id: string;
  role: 'elder' | 'caretaker';
  displayName: string;
  linkedTo: string[];
  createdAt: Date;
}

export interface Elder {
  id: string;
  name: string;
  pairingCode: string;
  caretakers: string[];
}

export interface Medication {
  id: string;
  elderId: string;
  name: string;
  dosage: string;
  times: string[];
  notes: string;
  pill: {
    shape: PillShape;
    color: PillColor;
    size: PillSize;
  };
  active: boolean;
  createdBy: string;
  createdAt: Date;
}

export type PillShape = 'round' | 'oval' | 'square' | 'capsule' | 'triangle';
export type PillColor = 'white' | 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'brown' | 'black';
export type PillSize = 'small' | 'medium' | 'large';

export interface MedicationLog {
  id: string;
  elderId: string;
  medicationId: string;
  medicationName: string;
  scheduledTime: string;
  scheduledDate: string;
  status: 'taken' | 'skipped' | 'pending';
  actionTime: Date | null;
  createdAt: Date;
}

export type TimeGroup = 'sabah' | 'ogle' | 'aksam' | 'gece';

export interface GroupedMedications {
  group: TimeGroup;
  label: string;
  emoji: string;
  medications: (Medication & { log: MedicationLog; scheduledTime: string })[];
}
