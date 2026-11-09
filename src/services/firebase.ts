import {getApp, getApps, initializeApp} from 'firebase/app';
import {getAuth, initializeAuth, getReactNativePersistence} from 'firebase/auth';
import {getDatabase} from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyDCAIBotBJ0zkfKfODbo4fD6hwsEaUoRpA',
  authDomain: 'chat-91de9.firebaseapp.com',
  databaseURL: 'https://chat-91de9-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'chat-91de9',
  storageBucket: 'chat-91de9.firebasestorage.app',
  messagingSenderId: '578534009456',
  appId: '1:578534009456:web:2f979d72caaa7619cda2b5',
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

function createAuth() {
  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    return getAuth(app);
  }
}

export const auth = createAuth();
export const db = getDatabase(app);
