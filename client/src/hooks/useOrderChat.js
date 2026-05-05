import { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';

export const useOrderChat = (orderId) => {
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [piiWarning, setPiiWarning] = useState(null);

  // PII regex for client-side check (UX only)
  const piiRegex = /(\+91[\-\s]?)?[0]?[6789]\d{9}|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|(https?:\/\/[^\s]+|www\.[^\s]+)/;

  useEffect(() => {
    // Check for various possible tokens in localStorage
    const token = localStorage.getItem('userToken') || 
                  localStorage.getItem('deliveryToken') || 
                  localStorage.getItem('adminToken');

    const newSocket = io(import.meta.env.VITE_CHAT_SERVER_URL || 'http://localhost:5001', {
      auth: { token },
      query: { orderId, type: 'chat' },
    });

    newSocket.on('connect', () => setIsConnected(true));
    newSocket.on('disconnect', () => setIsConnected(false));
    newSocket.on('error', (msg) => setPiiWarning(msg)); // Reuse warning state or add new one

    newSocket.on('history', (history) => {
      setMessages(history);
    });

    newSocket.on('message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [orderId]);

  const send = useCallback((text) => {
    if (!socket || !text.trim()) return;

    // Client-side PII/Vulgarity warning
    const vulgarities = ['fuck', 'shit', 'bitch', 'asshole', 'chutiya', 'madarchod', 'gandu'];
    const vulgarRegex = new RegExp(`\\b(${vulgarities.join('|')})\\b`, 'i');

    if (piiRegex.test(text)) {
      setPiiWarning('Personal contact info is not allowed.');
      return;
    }
    
    if (vulgarRegex.test(text)) {
      setPiiWarning('Please refrain from using inappropriate language.');
      return;
    }

    setPiiWarning(null);
    socket.emit('message', text);
  }, [socket]);

  return { messages, send, isConnected, piiWarning };
};
