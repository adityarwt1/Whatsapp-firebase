export interface User {
  fullName: string;
  email: string;
  photoURL: string;
  uid: string;
}

export type ChatUser = {
  email: string;
  fullName: string;
  photoURL: string;
  uid: string;
  lastmessage?: string;
  unseen: number;
  lastInteraction: number;
  chatId: string;
};
