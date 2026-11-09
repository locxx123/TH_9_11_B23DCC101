import React, {createContext, useContext, useEffect, useState} from 'react';
import {onAuthStateChanged, User} from 'firebase/auth';
import {auth} from '../services/firebase';
import {ensureUserProfile, startPresence} from '../services/userService';

type Ctx = {user: User | null; initializing: boolean};
const AuthContext = createContext<Ctx>({user: null, initializing: true});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({children}: {children: React.ReactNode}) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, u => {
      setUser(u);
      setInitializing(false);
    });
  }, []);

  // Bật theo dõi online/offline khi đã đăng nhập
  useEffect(() => {
    if (!user) {
      return;
    }
    ensureUserProfile(user.uid, user.displayName, user.email).catch(() => {});
    return startPresence(user.uid);
  }, [user?.uid]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AuthContext.Provider value={{user, initializing}}>
      {children}
    </AuthContext.Provider>
  );
}
