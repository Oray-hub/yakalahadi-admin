import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { firebaseConfig } from './firebaseConfig';

// Firebase'i başlat
const app = initializeApp(firebaseConfig);

// Firestore veritabanını al
export const db = getFirestore(app);

// Firebase Auth'u al
export const auth = getAuth(app);

export default app; 