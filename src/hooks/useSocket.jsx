import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const newSocket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      newSocket.on('connect', () => {
        console.log('Socket connected');
        setConnected(true);
        // Join user-specific room
        newSocket.emit('user-connected', user._id);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setConnected(false);
      });

      // Listen for notifications
      newSocket.on('new-blood-request', (data) => {
        toast.custom((t) => (
          <div className="bg-red-600 text-white p-4 rounded-lg shadow-lg max-w-md">
            <p className="font-semibold">New Blood Request!</p>
            <p className="text-sm mt-1">{data.message}</p>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                window.location.href = '/donor-dashboard';
              }}
              className="mt-2 bg-white text-red-600 px-3 py-1 rounded text-sm font-semibold"
            >
              View Request
            </button>
          </div>
        ), { duration: 10000 });
      });

      newSocket.on('donor-accepted', (data) => {
        toast.success(data.message, { duration: 5000 });
      });

      newSocket.on('delivery-updated', (data) => {
        toast.info(`Delivery status: ${data.status}`, { duration: 4000 });
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [user]);

  return { socket, connected };
};
