import BaseRequestService from "./baseRequest.service";
import { getAuthHeader } from "@/utils/utils";

const ApiUrl = import.meta.env.VITE_API_URL;
const API_URL = ApiUrl.endsWith('/') ? ApiUrl : `${ApiUrl}/`;

export interface ChatRoom {
  id: string;
  name: string;
  type: string;
  participants: Array<{
    id: string;
    firstName: string;
    lastName: string;
  }>;
  messages?: ChatMessage[];
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  isRead: boolean;
  createdAt: string;
}

class ChatService extends BaseRequestService {
  /**
   * Start or get existing chat room with another user
   */
  startChat(targetUserId: string) {
    const url = `${API_URL}chat/start/${targetUserId}`;
    const headers = getAuthHeader();
    console.log('🚀 Starting chat API call:', { url, targetUserId, headers });
    
    return this.post(url, {}, { headers })
      .then(response => {
        console.log('✅ Chat API success:', response);
        return response;
      })
      .catch(error => {
        console.error('❌ Chat API error:', error);
        throw error;
      });
  }

  /**
   * Get all chat rooms for current user
   */
  getUserRooms() {
    return this.get(`${API_URL}chat/rooms`, {
      headers: getAuthHeader(),
    });
  }

  /**
   * Get all messages from a chat room
   */
  getRoomMessages(roomId: string) {
    return this.get(`${API_URL}chat/room/${roomId}/messages`, {
      headers: getAuthHeader(),
    });
  }

  /**
   * Send message to chat room (REST API)
   */
  sendMessage(roomId: string, content: string) {
    return this.post(`${API_URL}chat/room/${roomId}/message`, { content }, {
      headers: getAuthHeader(),
    });
  }

  /**
   * Mark single message as read
   */
  markMessageAsRead(messageId: string) {
    return this.post(`${API_URL}chat/message/${messageId}/read`, {}, {
      headers: getAuthHeader(),
    });
  }

  /**
   * Mark all room messages as read
   */
  markRoomMessagesAsRead(roomId: string) {
    return this.post(`${API_URL}chat/room/${roomId}/read-all`, {}, {
      headers: getAuthHeader(),
    });
  }

  /**
   * Get all users
   */
  getAllUsers() {
    console.log('Calling getAllUsers API:', `${API_URL}users`);
    return this.get(`${API_URL}users`, {
      headers: getAuthHeader(),
    });
  }
}

export default new ChatService();