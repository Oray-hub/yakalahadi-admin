import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getFunctions } from 'firebase/functions';
import { firebaseConfig, functionsRegion } from './firebaseConfig';

// Firebase'i başlat
const app = initializeApp(firebaseConfig);

// Firestore veritabanını al
export const db = getFirestore(app);

// Firebase Auth'u al
export const auth = getAuth(app);

// Firebase Functions'ı al (europe-west1 region'ında)
export const functions = getFunctions(app, functionsRegion);

export default app; 