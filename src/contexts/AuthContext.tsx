import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

interface AuthContextType {
  user: User | null;
  role: 'elder' | 'caretaker' | null;
  loading: boolean;
  loginAnonymous: () => Promise<User>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'elder' | 'caretaker' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const userDocSnap = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDocSnap.exists()) {
            setRole(userDocSnap.data().role as 'elder' | 'caretaker');
          } else if (firebaseUser.isAnonymous) {
            // Anonymous user without a Firestore doc (e.g. previous failed attempt)
            // Create the missing doc now
            await setDoc(doc(db, 'users', firebaseUser.uid), {
              role: 'elder',
              displayName: 'Yaşlı',
              linkedTo: [],
              createdAt: new Date(),
            });
            setRole('elder');
          } else {
            setRole(null);
          }
        } catch {
          setRole(null);
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const loginAnonymous = async (): Promise<User> => {
    const result = await signInAnonymously(auth);
    await setDoc(doc(db, 'users', result.user.uid), {
      role: 'elder',
      displayName: 'Yaşlı',
      linkedTo: [],
      createdAt: new Date(),
    });
    setRole('elder');
    return result.user;
  };

  const loginWithEmail = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, 'users', result.user.uid));
    if (userDoc.exists()) {
      setRole(userDoc.data().role as 'elder' | 'caretaker');
    }
  };

  const registerWithEmail = async (email: string, password: string, displayName: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName });
    await setDoc(doc(db, 'users', result.user.uid), {
      role: 'caretaker',
      displayName,
      linkedTo: [],
      createdAt: new Date(),
    });
    setRole('caretaker');
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const userDoc = await getDoc(doc(db, 'users', result.user.uid));
    if (!userDoc.exists()) {
      await setDoc(doc(db, 'users', result.user.uid), {
        role: 'caretaker',
        displayName: result.user.displayName || 'Refakatçi',
        linkedTo: [],
        createdAt: new Date(),
      });
    }
    setRole('caretaker');
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, role, loading, loginAnonymous, loginWithEmail, registerWithEmail, loginWithGoogle, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
