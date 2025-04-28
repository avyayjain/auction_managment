/**
 * WebSocketService - Handles WebSocket connections for real-time features
 */

type MessageCallback = (data: any) => void;
type ErrorCallback = (error: Event) => void;
type ConnectCallback = () => void;
type DisconnectCallback = () => void;

class WebSocketService {
  private static instance: WebSocketService;
  private socket: WebSocket | null = null;
  private url: string;
  private messageCallbacks: MessageCallback[] = [];
  private errorCallbacks: ErrorCallback[] = [];
  private connectCallbacks: ConnectCallback[] = [];
  private disconnectCallbacks: DisconnectCallback[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeoutId: NodeJS.Timeout | null = null;

  /**
   * Create a new WebSocketService instance
   * @param url The WebSocket URL to connect to
   */
  constructor(url: string) {
    this.url = url;
    
    // Save as singleton instance
    if (!WebSocketService.instance) {
      WebSocketService.instance = this;
    }
    
    return WebSocketService.instance;
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): WebSocketService {
    return WebSocketService.instance;
  }

  /**
   * Connect to the WebSocket server
   */
  public connect(): void {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      console.log('WebSocket already connected or connecting');
      return;
    }

    try {
      this.socket = new WebSocket(this.url);

      this.socket.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.connectCallbacks.forEach(callback => callback());
      };

      this.socket.onmessage = (event) => {
        let data;
        try {
          data = JSON.parse(event.data);
        } catch (e) {
          data = event.data;
        }
        this.messageCallbacks.forEach(callback => callback(data));
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.errorCallbacks.forEach(callback => callback(error));
      };

      this.socket.onclose = () => {
        console.log('WebSocket disconnected');
        this.disconnectCallbacks.forEach(callback => callback());
        
        // Attempt to reconnect
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          const timeout = Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), 30000);
          
          console.log(`Attempting to reconnect in ${timeout / 1000} seconds...`);
          
          this.reconnectTimeoutId = setTimeout(() => {
            this.connect();
          }, timeout);
        }
      };
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
    }
  }

  /**
   * Disconnect from the WebSocket server
   */
  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = null;
    }
  }

  /**
   * Send a message to the WebSocket server
   * @param message The message to send
   */
  public send(message: string): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(message);
    } else {
      console.error('WebSocket not connected, cannot send message');
      this.errorCallbacks.forEach(callback => 
        callback(new Event('error', { bubbles: true, cancelable: false }))
      );
    }
  }

  /**
   * Register a callback for when a message is received
   * @param callback The callback to register
   */
  public onMessage(callback: MessageCallback): void {
    this.messageCallbacks.push(callback);
  }

  /**
   * Register a callback for when an error occurs
   * @param callback The callback to register
   */
  public onError(callback: ErrorCallback): void {
    this.errorCallbacks.push(callback);
  }

  /**
   * Register a callback for when the connection is established
   * @param callback The callback to register
   */
  public onConnect(callback: ConnectCallback): void {
    this.connectCallbacks.push(callback);
  }

  /**
   * Register a callback for when the connection is closed
   * @param callback The callback to register
   */
  public onDisconnect(callback: DisconnectCallback): void {
    this.disconnectCallbacks.push(callback);
  }

  /**
   * Check if the WebSocket is connected
   */
  public isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }
}

export default WebSocketService; 