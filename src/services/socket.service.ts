import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private connectionAttempts = 0;
  private maxConnectionAttempts = 3;
  private lastConnectionAttempt = 0;
  private connectionCooldown = 30000; // 30 seconds

  connect(userId: string) {
    if (this.socket?.connected) return this.socket;

    // Disconnect any existing socket first
    this.disconnect();

    const serverUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');
    
    console.log('Attempting to connect to socket server:', serverUrl);
    this.connectionAttempts++;
    this.lastConnectionAttempt = Date.now();
    
    this.socket = io(serverUrl, {
      path: '/socket.io/',
      auth: {
        userId
      },
      transports: ['websocket', 'polling'],
      upgrade: true,
      timeout: 10000,
      forceNew: true,
      reconnection: false, // Disable auto-reconnection to prevent issues
      autoConnect: true
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected successfully to:', serverUrl);
      this.isConnected = true;
      this.connectionAttempts = 0; // Reset on successful connection
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.log('❌ Socket connection error:', error.message || error);
      this.isConnected = false;
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  joinRoom(roomId: string, userId: string) {
    if (this.socket) {
      this.socket.emit('joinRoom', { roomId, userId });
    }
  }

  leaveRoom(roomId: string) {
    if (this.socket) {
      this.socket.emit('leaveRoom', { roomId });
    }
  }

  sendMessage(roomId: string, content: string, senderId: string) {
    if (this.socket) {
      this.socket.emit('sendMessage', { roomId, content, senderId });
    }
  }

  onNewMessage(callback: (message: any) => void) {
    if (this.socket) {
      this.socket.on('newMessage', callback);
    }
  }

  onMessageRead(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('messageRead', callback);
    }
  }

  onRoomRead(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('roomRead', callback);
    }
  }

  offNewMessage() {
    if (this.socket) {
      this.socket.off('newMessage');
    }
  }

  offMessageRead() {
    if (this.socket) {
      this.socket.off('messageRead');
    }
  }

  offRoomRead() {
    if (this.socket) {
      this.socket.off('roomRead');
    }
  }

  getSocket() {
    return this.socket;
  }

  isSocketConnected() {
    return this.isConnected && this.socket?.connected;
  }

  canAttemptConnection() {
    const now = Date.now();
    return this.connectionAttempts < this.maxConnectionAttempts || 
           now - this.lastConnectionAttempt >= this.connectionCooldown;
  }
}

export default new SocketService();