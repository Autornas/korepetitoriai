import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  updateProfile,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export async function registerUser({ name, email, password, role }) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName: name });
  await setDoc(doc(db, 'users', credential.user.uid), {
    name,
    email,
    role: role ?? 'student',
    createdAt: new Date().toISOString(),
  });
  return credential.user;
}

export async function loginUser({ email, password }) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function loginWithGoogle(role = 'student') {
  const provider = new GoogleAuthProvider();
  const credential = await signInWithPopup(auth, provider);
  const existing = await getUserProfile(credential.user.uid);
  if (!existing) {
    await setDoc(doc(db, 'users', credential.user.uid), {
      name: credential.user.displayName,
      email: credential.user.email,
      role,
      createdAt: new Date().toISOString(),
    });
  }
  return credential.user;
}

export async function signOut() {
  await fbSignOut(auth);
}

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
}

export function onAuthChanged(callback) {
  return onAuthStateChanged(auth, callback);
}
