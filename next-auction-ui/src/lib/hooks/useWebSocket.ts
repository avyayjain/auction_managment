import { useState, useEffect, useCallback, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { createWebSocketConnection } from '@/api/websocket';
import { getToken } from '@/api/auth';

interface WebSocketHookOptions {
  path: string;
  autoConnect?: boolean;
  onConnect?: () => void;
  onDisconnect?: (reason: string) => void;
  onError?: (error: Error) => void;
  events?: Record<string, (data: any) => void>;
  dependencies?: any[];
}

/**
 * Custom hook for WebSocket connections
 */
export function useWebSocket(options: WebSocketHookOptions) {
  const {
    path,
    autoConnect = true,
    onConnect,
    onDisconnect,
    onError,
    events = {},
    dependencies = [],
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const socketRef = useRef<Socket | null>(null);
  
  // Connect to WebSocket
  const connect = useCallback(() => {
    // Close existing connection if any
    if (socketRef.current) {
      socketRef.current.close();
    }
    
    try {
      // Create new connection
      const token = getToken();
      
      const socket = createWebSocketConnection({
        path,
        token,
        onConnect: () => {
          setIsConnected(true);
          setError(null);
          onConnect?.();
        },
        onDisconnect: (reason) => {
          setIsConnected(false);
          onDisconnect?.(reason);
        },
        onError: (err) => {
          setError(err);
          onError?.(err);
        },
      });
      
      // Register events
      Object.entries(events).forEach(([event, handler]) => {
        socket.on(event, handler);
      });
      
      socketRef.current = socket;
      
      return socket;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to connect to WebSocket'));
      onError?.(err instanceof Error ? err : new Error('Failed to connect to WebSocket'));
      return null;
    }
  }, [path, onConnect, onDisconnect, onError, events]);
  
  // Connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }
    
    // Clean up on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [autoConnect, connect, ...dependencies]);
  
  // Method to send data
  const send = useCallback((event: string, data?: any) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(event, data);
      return true;
    }
    return false;
  }, [isConnected]);
  
  // Method to disconnect
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
      setIsConnected(false);
    }
  }, []);
  
  return {
    isConnected,
    error,
    socket: socketRef.current,
    connect,
    disconnect,
    send,
  };
}

export default useWebSocket; 