import { useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

function getWsUrl(): string {
  if (process.env.NEXT_PUBLIC_WS_URL) {
    return process.env.NEXT_PUBLIC_WS_URL;
  }
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.hostname}:3001`;
  }
  return 'ws://localhost:3001';
}

export function useSocket(
  branchId: string | null,
  onOrderUpdate: (data: any) => void,
) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!branchId) return;

    socketRef.current = io(`${getWsUrl()}/kds`, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });

    socketRef.current.on('connect', () => {
      socketRef.current?.emit('join-branch', { branchId });
    });

    socketRef.current.on('order-update', onOrderUpdate);
    socketRef.current.on('order-ready', onOrderUpdate);

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [branchId, onOrderUpdate]);

  const emit = useCallback((event: string, data: any) => {
    socketRef.current?.emit(event, data);
  }, []);

  return { socket: socketRef.current, emit };
}