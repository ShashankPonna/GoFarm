import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAt-X0Zspd4Wo3Txr3XLZ8B4UYfCIOGo48",
  authDomain: "gofarm-41550.firebaseapp.com",
  projectId: "gofarm-41550",
  storageBucket: "gofarm-41550.firebasestorage.app",
  messagingSenderId: "149293933843",
  appId: "1:149293933843:web:7ae003a857f1762c2c26e6",
  measurementId: "G-SV7F2WMT3B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

export default app;
