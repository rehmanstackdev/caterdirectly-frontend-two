
import type { Chat } from '@/types/chat';

export const initialChats: Chat[] = [
  {
    id: '1',
    name: 'Support Team',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158',
    lastMessage: 'How can we help you today?',
    timestamp: '2h ago',
    unreadCount: 2,
    isSupport: true,
    messages: [
      {
        id: '1',
        senderId: 'support1',
        senderName: 'Support Team',
        senderImage: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158',
        content: 'Hello! How can we help you today?',
        timestamp: '10:32 AM',
        isSupport: true
      },
      {
        id: '2',
        senderId: 'user1',
        senderName: 'Me',
        senderImage: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7',
        content: 'I need help with my upcoming event booking.',
        timestamp: '10:35 AM'
      },
      {
        id: '3',
        senderId: 'support1',
        senderName: 'Support Team',
        senderImage: 'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1',
        content: 'Of course! I\'d be happy to help with your booking. Could you please provide more details about your event?',
        timestamp: '10:36 AM',
        isSupport: true
      }
    ]
  },
  {
    id: '2',
    name: 'Art Deco Lounge',
    image: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7',
    lastMessage: 'Perfect, see you then!',
    timestamp: 'Yesterday',
    messages: [
      {
        id: '1',
        senderId: 'vendor1',
        senderName: 'Art Deco Lounge',
        senderImage: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7',
        content: 'Looking forward to hosting your event!',
        timestamp: '2:15 PM'
      }
    ]
  },
  {
    id: '3',
    name: 'Exquisite Catering',
    image: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952',
    lastMessage: 'Thanks for your order!',
    timestamp: '3d ago',
    messages: [
      {
        id: '1',
        senderId: 'vendor2',
        senderName: 'Exquisite Catering',
        senderImage: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952',
        content: 'Thanks for your order!',
        timestamp: '3:45 PM'
      }
    ]
  }
];
