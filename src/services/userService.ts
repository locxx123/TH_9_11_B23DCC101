import {AppState} from 'react-native';
import {
  get,
  onDisconnect,
  onValue,
  ref,
  serverTimestamp,
  set,
  update,
} from 'firebase/database';
import {db} from './firebase';
import {UserProfile} from '../types';

export function saveUserProfile(uid: string, name: string, email: string) {
  return set(ref(db, `users/${uid}`), {
    name,
    email,
    online: true,
    lastSeen: serverTimestamp(),
    createdAt: serverTimestamp(),
  });
}

/** Tài khoản tạo từ Console (không qua màn Đăng ký) chưa có hồ sơ -> tự tạo khi đăng nhập. */
export async function ensureUserProfile(
  uid: string,
  displayName: string | null,
  email: string | null,
) {
  const snap = await get(ref(db, `users/${uid}/name`));
  if (snap.exists()) {
    return;
  }
  const mail = (email ?? '').toLowerCase();
  await update(ref(db, `users/${uid}`), {
    name: displayName || mail.split('@')[0] || 'Người dùng',
    email: mail,
    createdAt: serverTimestamp(),
  });
}

export function setOffline(uid: string) {
  return update(ref(db, `users/${uid}`), {
    online: false,
    lastSeen: serverTimestamp(),
  });
}

/** Theo dõi kết nối Firebase + AppState để cập nhật online/offline. Trả về hàm hủy. */
export function startPresence(uid: string): () => void {
  const userRef = ref(db, `users/${uid}`);
  const unsubConn = onValue(ref(db, '.info/connected'), snap => {
    if (snap.val() === true) {
      // Khi mất kết nối (kill app, mất mạng) server tự đặt offline
      onDisconnect(userRef)
        .update({online: false, lastSeen: serverTimestamp()})
        .then(() => update(userRef, {online: true}))
        .catch(() => {});
    }
  });
  const appStateSub = AppState.addEventListener('change', state => {
    update(userRef, {
      online: state === 'active',
      lastSeen: serverTimestamp(),
    }).catch(() => {});
  });
  return () => {
    unsubConn();
    appStateSub.remove();
  };
}

function toProfile(uid: string, v: any): UserProfile {
  return {
    uid,
    name: v?.name ?? 'Người dùng',
    email: v?.email ?? '',
    online: !!v?.online,
    lastSeen: typeof v?.lastSeen === 'number' ? v.lastSeen : undefined,
  };
}

/** Danh sách mọi user trừ bản thân, realtime. */
export function subscribeUsers(
  myUid: string,
  cb: (users: UserProfile[]) => void,
): () => void {
  return onValue(ref(db, 'users'), snap => {
    const list: UserProfile[] = [];
    snap.forEach(child => {
      if (child.key && child.key !== myUid) {
        list.push(toProfile(child.key, child.val()));
      }
    });
    list.sort((a, b) => a.name.localeCompare(b.name));
    cb(list);
  });
}

export function subscribeUser(
  uid: string,
  cb: (user: UserProfile | null) => void,
): () => void {
  return onValue(ref(db, `users/${uid}`), snap => {
    cb(snap.exists() ? toProfile(uid, snap.val()) : null);
  });
}
