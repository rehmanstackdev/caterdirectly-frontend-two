
export type ChatMessage = {
  id: string;
  senderId: string;
  senderName: string;
  senderImage: string;
  content: string;
  timestamp: string;
  isSupport?: boolean;
};

export type Chat = {
  id: string;
  name: string;
  image: string;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
  isSupport?: boolean;
  messages: ChatMessage[];
};
