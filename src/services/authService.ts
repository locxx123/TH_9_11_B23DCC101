import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import {auth} from './firebase';
import {saveUserProfile, setOffline} from './userService';

export async function register(name: string, email: string, password: string) {
  const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
  await updateProfile(cred.user, {displayName: name.trim()});
  await saveUserProfile(cred.user.uid, name.trim(), email.trim().toLowerCase());
  return cred.user;
}

export async function login(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
  return cred.user;
}

export async function logout() {
  const uid = auth.currentUser?.uid;
  if (uid) {
    try {
      await setOffline(uid); // phải ghi trước khi signOut (còn quyền ghi)
    } catch {}
  }
  await signOut(auth);
}

export function authErrorMessage(code?: string): string {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-login-credentials':
      return 'Sai tài khoản hoặc mật khẩu.';
    case 'auth/invalid-email':
      return 'Email không hợp lệ.';
    case 'auth/email-already-in-use':
      return 'Email này đã được đăng ký.';
    case 'auth/weak-password':
      return 'Mật khẩu quá yếu (tối thiểu 6 ký tự).';
    case 'auth/too-many-requests':
      return 'Thử quá nhiều lần, vui lòng thử lại sau.';
    case 'auth/network-request-failed':
      return 'Lỗi mạng, kiểm tra kết nối internet.';
    default:
      return 'Đã có lỗi xảy ra, vui lòng thử lại.';
  }
}
