import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useSocket } from './useSocket';
import useStore from '../store/useStore';

export const useNotification = () => {
  const { socket } = useSocket();
  const addNotification = useStore((state) => state.addNotification);

  useEffect(() => {
    if (!socket) return;

    socket.on('new-blood-request', (data) => {
      toast.custom((t) => (
        <div className="bg-red-600 text-white p-4 rounded-lg shadow-lg">
          <p className="font-semibold">New Blood Request!</p>
          <p className="text-sm">{data.message}</p>
        </div>
      ));
      
      addNotification({
        id: Date.now(),
        type: 'blood-request',
        message: data.message,
        data: data.request
      });
    });

    socket.on('delivery-updated', (data) => {
      toast.info(`Delivery ${data.deliveryId} status updated to ${data.status}`);
    });

    socket.on('donation-completed', (data) => {
      toast.success('Donation completed successfully!');
    });

    return () => {
      socket.off('new-blood-request');
      socket.off('delivery-updated');
      socket.off('donation-completed');
    };
  }, [socket, addNotification]);
};
