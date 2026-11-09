import {
  increment,
  limitToLast,
  onChildAdded,
  onValue,
  push,
  query,
  ref,
  update,
} from 'firebase/database';
import {db} from './firebase';
import {Conversation, Message} from '../types';

export const getChatId = (a: string, b: string) => [a, b].sort().join('_');

type Payload =
  | {type: 'text'; text: string}
  | {type: 'location'; latitude: number; longitude: number};

export async function sendMessage(me: string, peer: string, payload: Payload) {
  if (payload.type === 'text' && !payload.text.trim()) {
    return; // không gửi tin rỗng
  }
  const chatId = getChatId(me, peer);
  const key = push(ref(db, `chats/${chatId}/messages`)).key as string;
  const now = Date.now();

  const message =
    payload.type === 'text'
      ? {senderId: me, type: 'text', text: payload.text.trim(), createdAt: now}
      : {
          senderId: me,
          type: 'location',
          location: {latitude: payload.latitude, longitude: payload.longitude},
          createdAt: now,
        };
  const preview =
    payload.type === 'text' ? payload.text.trim() : '[Vị trí]';

  // 1 lần ghi atomic: tin nhắn + cập nhật danh sách hội thoại 2 phía + tăng unread cho người nhận
  await update(ref(db), {
    [`chats/${chatId}/messages/${key}`]: message,
    [`userChats/${me}/${peer}/lastMessage`]: preview,
    [`userChats/${me}/${peer}/lastTime`]: now,
    [`userChats/${me}/${peer}/lastSenderId`]: me,
    [`userChats/${me}/${peer}/unread`]: 0,
    [`userChats/${peer}/${me}/lastMessage`]: preview,
    [`userChats/${peer}/${me}/lastTime`]: now,
    [`userChats/${peer}/${me}/lastSenderId`]: me,
    [`userChats/${peer}/${me}/unread`]: increment(1),
  });
}

/** Lắng nghe tin nhắn mới (child_added). Trả về hàm hủy – PHẢI gọi trong cleanup của useEffect. */
export function subscribeMessages(
  me: string,
  peer: string,
  onMessage: (m: Message) => void,
): () => void {
  const q = query(
    ref(db, `chats/${getChatId(me, peer)}/messages`),
    limitToLast(200),
  );
  return onChildAdded(q, snap => {
    const v = snap.val();
    onMessage({
      id: snap.key as string,
      senderId: v.senderId,
      type: v.type ?? 'text',
      text: v.text,
      location: v.location,
      createdAt: v.createdAt ?? Date.now(),
    });
  });
}

export function markAsRead(me: string, peer: string) {
  return update(ref(db, `userChats/${me}/${peer}`), {unread: 0});
}

export function subscribeConversations(
  me: string,
  cb: (list: Conversation[]) => void,
): () => void {
  return onValue(ref(db, `userChats/${me}`), snap => {
    const list: Conversation[] = [];
    snap.forEach(child => {
      const v = child.val();
      if (child.key && v?.lastTime) {
        list.push({
          peerId: child.key,
          lastMessage: v.lastMessage ?? '',
          lastTime: v.lastTime,
          lastSenderId: v.lastSenderId ?? '',
          unread: v.unread ?? 0,
        });
      }
    });
    list.sort((a, b) => b.lastTime - a.lastTime); // mới nhất lên đầu
    cb(list);
  });
}
