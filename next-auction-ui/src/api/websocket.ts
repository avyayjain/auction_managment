// WebSocket service for real-time auction updates
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export class WebSocketService {
  private activeItemsSocket: WebSocket | null = null;
  private bidSockets: Map<number, WebSocket> = new Map();
  private reconnectTimers: Map<string, NodeJS.Timeout> = new Map();
  private messageHandlers: Map<string, Array<(data: any) => void>> = new Map();
  private isServerDown: boolean = false;

  constructor() {
    this.messageHandlers.set('activeItems', []);
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
  }

  private handleOnline() {
    this.isServerDown = false;
    // Attempt to reconnect all open sockets
    this.reconnectActiveItemsSocket();
    this.bidSockets.forEach((_, itemId) => {
      this.reconnectBidSocket(itemId);
    });
  }

  private handleOffline() {
    this.closeAllSockets();
  }

  private closeAllSockets() {
    if (this.activeItemsSocket) {
      this.activeItemsSocket.close();
      this.activeItemsSocket = null;
    }

    this.bidSockets.forEach(socket => {
      socket.close();
    });
    this.bidSockets.clear();
  }

  connect() {
    // General connection method, currently empty as specific connections are handled by specific methods
    console.log('WebSocket service initialized');
  }

  disconnect() {
    this.closeAllSockets();
    
    // Clear all reconnect timers
    this.reconnectTimers.forEach(timer => clearTimeout(timer));
    this.reconnectTimers.clear();
    
    console.log('All WebSocket connections closed');
  }

  connectToActiveItemsSocket() {
    if (this.isServerDown) {
      console.log('Server appears to be down, not attempting connection');
      return;
    }
    
    try {
      if (this.activeItemsSocket?.readyState === WebSocket.OPEN) {
        console.log('Active items socket already connected');
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const wsUrl = `${API_URL.replace('http', 'ws')}/ws/active-items?token=${token}`;
      
      this.activeItemsSocket = new WebSocket(wsUrl);
      
      this.activeItemsSocket.onopen = () => {
        console.log('Connected to active items WebSocket');
        if (this.reconnectTimers.has('activeItems')) {
          clearTimeout(this.reconnectTimers.get('activeItems')!);
          this.reconnectTimers.delete('activeItems');
        }
      };
      
      this.activeItemsSocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const handlers = this.messageHandlers.get('activeItems') || [];
          handlers.forEach(handler => handler(data));
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      };
      
      this.activeItemsSocket.onerror = (error) => {
        console.error('Active items WebSocket error:', error);
      };
      
      this.activeItemsSocket.onclose = () => {
        console.log('Active items WebSocket closed');
        this.activeItemsSocket = null;
        this.scheduleReconnect('activeItems', this.reconnectActiveItemsSocket.bind(this));
      };
    } catch (error) {
      console.error('Error connecting to active items WebSocket:', error);
      this.scheduleReconnect('activeItems', this.reconnectActiveItemsSocket.bind(this));
    }
  }

  private reconnectActiveItemsSocket() {
    console.log('Attempting to reconnect to active items socket...');
    this.connectToActiveItemsSocket();
  }

  private scheduleReconnect(key: string, reconnectFn: () => void) {
    if (this.reconnectTimers.has(key)) {
      clearTimeout(this.reconnectTimers.get(key)!);
    }
    
    // Try to reconnect after 5 seconds
    const timerId = setTimeout(() => {
      reconnectFn();
    }, 5000);
    
    this.reconnectTimers.set(key, timerId);
  }

  disconnectActiveItemsSocket() {
    if (this.activeItemsSocket) {
      this.activeItemsSocket.close();
      this.activeItemsSocket = null;
    }
    
    if (this.reconnectTimers.has('activeItems')) {
      clearTimeout(this.reconnectTimers.get('activeItems')!);
      this.reconnectTimers.delete('activeItems');
    }
    
    console.log('Disconnected from active items socket');
  }

  connectToBidSocket(itemId: number) {
    if (this.isServerDown) {
      console.log('Server appears to be down, not attempting connection');
      return;
    }
    
    try {
      if (this.bidSockets.has(itemId) && this.bidSockets.get(itemId)?.readyState === WebSocket.OPEN) {
        console.log(`Bid socket for item ${itemId} already connected`);
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const wsUrl = `${API_URL.replace('http', 'ws')}/ws/bid/${itemId}?token=${token}`;
      
      const socket = new WebSocket(wsUrl);
      
      socket.onopen = () => {
        console.log(`Connected to bid WebSocket for item ${itemId}`);
        if (this.reconnectTimers.has(`bid-${itemId}`)) {
          clearTimeout(this.reconnectTimers.get(`bid-${itemId}`)!);
          this.reconnectTimers.delete(`bid-${itemId}`);
        }
      };
      
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const handlers = this.messageHandlers.get(`bid-${itemId}`) || [];
          handlers.forEach(handler => handler(data));
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      };
      
      socket.onerror = (error) => {
        console.error(`Bid WebSocket error for item ${itemId}:`, error);
      };
      
      socket.onclose = () => {
        console.log(`Bid WebSocket closed for item ${itemId}`);
        this.bidSockets.delete(itemId);
        this.scheduleReconnect(`bid-${itemId}`, () => this.reconnectBidSocket(itemId));
      };
      
      this.bidSockets.set(itemId, socket);
    } catch (error) {
      console.error(`Error connecting to bid WebSocket for item ${itemId}:`, error);
      this.scheduleReconnect(`bid-${itemId}`, () => this.reconnectBidSocket(itemId));
    }
  }

  private reconnectBidSocket(itemId: number) {
    console.log(`Attempting to reconnect to bid socket for item ${itemId}...`);
    this.connectToBidSocket(itemId);
  }

  disconnectBidSocket(itemId: number) {
    const socket = this.bidSockets.get(itemId);
    if (socket) {
      socket.close();
      this.bidSockets.delete(itemId);
    }
    
    if (this.reconnectTimers.has(`bid-${itemId}`)) {
      clearTimeout(this.reconnectTimers.get(`bid-${itemId}`)!);
      this.reconnectTimers.delete(`bid-${itemId}`);
    }
    
    console.log(`Disconnected from bid socket for item ${itemId}`);
  }

  onActiveItemsMessage(callback: (data: any) => void) {
    const handlers = this.messageHandlers.get('activeItems') || [];
    handlers.push(callback);
    this.messageHandlers.set('activeItems', handlers);
    
    return () => {
      const currentHandlers = this.messageHandlers.get('activeItems') || [];
      this.messageHandlers.set('activeItems', currentHandlers.filter(h => h !== callback));
    };
  }

  onBidMessage(itemId: number, callback: (data: any) => void) {
    const key = `bid-${itemId}`;
    const handlers = this.messageHandlers.get(key) || [];
    handlers.push(callback);
    this.messageHandlers.set(key, handlers);
    
    return () => {
      const currentHandlers = this.messageHandlers.get(key) || [];
      this.messageHandlers.set(key, currentHandlers.filter(h => h !== callback));
    };
  }

  placeBid(itemId: number, amount: number) {
    const socket = this.bidSockets.get(itemId);
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.error(`Cannot place bid: No open connection for item ${itemId}`);
      return false;
    }
    
    try {
      socket.send(JSON.stringify({ amount }));
      return true;
    } catch (error) {
      console.error(`Error sending bid for item ${itemId}:`, error);
      return false;
    }
  }

  setServerDown(isDown: boolean) {
    this.isServerDown = isDown;
    if (isDown) {
      this.closeAllSockets();
    } else {
      // Try to reconnect
      this.connectToActiveItemsSocket();
    }
  }
}

export const websocketService = new WebSocketService();