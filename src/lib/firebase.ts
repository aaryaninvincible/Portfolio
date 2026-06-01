import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyBlnFJsISYdAn6XFiV-Zac8BaidNj8c4RY',
  authDomain: 'portfolio-923c7.firebaseapp.com',
  databaseURL: 'https://portfolio-923c7-default-rtdb.firebaseio.com',
  projectId: 'portfolio-923c7',
  storageBucket: 'portfolio-923c7.firebasestorage.app',
  messagingSenderId: '7632313367',
  appId: '1:7632313367:web:54c413b52131abc9da9052',
  measurementId: 'G-FW2M7JRKWH',
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export const storage = getStorage(app);

if (typeof window !== 'undefined') {
  isSupported()
    .then((supported) => {
      if (supported) getAnalytics(app);
    })
    .catch(() => undefined);
}
