
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCLDkH2H1KrH_3OLun0SEhdqx9HviGI9_w",
  authDomain: "hospital-web-3cc12.firebaseapp.com",
  projectId: "hospital-web-3cc12",
  storageBucket: "hospital-web-3cc12.firebasestorage.app",
  messagingSenderId: "566290728288",
  appId: "1:566290728288:web:caa55361d1bc07e773ca05",
  measurementId: "G-WFENRFSWFF"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
