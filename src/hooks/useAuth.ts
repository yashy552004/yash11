import { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { auth, db } from '../lib/firebase';
import { 
  onAuthStateChanged, 
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

export function useAuth() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = undefined;
      }

      if (firebaseUser) {
        // Fetch or create profile
        const profileRef = doc(db, 'users', firebaseUser.uid);
        const profilSnap = await getDoc(profileRef);

        if (profilSnap.exists()) {
          setProfile(profilSnap.data() as UserProfile);
        } else {
          const newProfile: UserProfile = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || 'New User',
            role: 'patient', // Default role
            avatarUrl: firebaseUser.photoURL || undefined,
            createdAt: new Date().toISOString(),
          };
          await setDoc(profileRef, newProfile);
          setProfile(newProfile);
        }

        // Listen for live profile changes (role updates, etc)
        unsubscribeProfile = onSnapshot(profileRef, (doc) => {
          if (doc.exists()) {
            setProfile(doc.data() as UserProfile);
          }
        });
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const loginAsAdmin = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    if (result.user) {
      const profileRef = doc(db, 'users', result.user.uid);
      await setDoc(profileRef, { role: 'admin' }, { merge: true });
    }
  };

  const logout = () => signOut(auth);

  return { user, profile, loading, login, loginAsAdmin, logout };
}
