export type UserProfile = {
  uid: string;
  name: string;
  email: string;
  online: boolean;
  lastSeen?: number;
};

export type Message = {
  id: string;
  senderId: string;
  type: 'text' | 'location';
  text?: string;
  location?: {latitude: number; longitude: number};
  createdAt: number;
};

export type Conversation = {
  peerId: string;
  lastMessage: string;
  lastTime: number;
  lastSenderId: string;
  unread: number;
};
