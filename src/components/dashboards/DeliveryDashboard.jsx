import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiTruck, FiMapPin, FiClock, FiCheckCircle, FiNavigation, FiPhone, FiPackage } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import MapView from '../maps/MapView';
import { DELIVERY_STATUS } from '../../utils/constants';
import io from 'socket.io-client';

const DeliveryDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('active');
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Connect to socket
    const newSocket = io(import.meta.env.VITE_SOCKET_URL);
    setSocket(newSocket);

    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => console.error('Error getting location:', error),
        { enableHighAccuracy: true }
      );
    }

    return () => newSocket.close();
  }, []);

  // Fetch assigned deliveries
  const { data: deliveries, refetch: refetchDeliveries } = useQuery({
    queryKey: ['deliveries', user?._id],
    queryFn: async () => {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/delivery/assigned`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.data.data;
    }
  });

  // Update delivery status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ deliveryId, status, location }) => {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/delivery/status/${deliveryId}`,
        { status, location },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success('Delivery status updated!');
      refetchDeliveries();
      
      // Emit socket event
      if (socket) {
        socket.emit('delivery-status-update', {
          deliveryId: selectedDelivery._id,
          status: selectedDelivery.status,
          location: currentLocation
        });
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  });

  const handleStatusUpdate = (deliveryId, newStatus) => {
    updateStatusMutation.mutate({
      deliveryId,
      status: newStatus,
      location: currentLocation
    });
  };

  const activeDeliveries = deliveries?.filter(d => 
    ['assigned', 'picked-up', 'in-transit'].includes(d.status)
  ) || [];
  
  const completedDeliveries = deliveries?.filter(d => 
    d.status === 'delivered'
  ) || [];

  const stats = {
    active: activeDeliveries.length,
    completed: completedDeliveries.length,
    todayDeliveries: deliveries?.filter(d => {
      const today = new Date().toDateString();
      return new Date(d.createdAt).toDateString() === today;
    }).length || 0,
    avgDeliveryTime: '45 mins'
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Delivery Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Status: <span className="font-semibold text-green-600">Online</span>
              </p>
            </div>
            <div className="flex gap-2 mt-4 md:mt-0">
              <button className="btn-primary flex items-center gap-2">
                <FiNavigation /> Start Navigation
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Active Deliveries</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.active}
                </p>
              </div>
              <FiTruck className="text-blue-600 text-3xl" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Completed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.completed}
                </p>
              </div>
              <FiCheckCircle className="text-green-600 text-3xl" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Today's Deliveries</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.todayDeliveries}
                </p>
              </div>
              <FiPackage className="text-orange-600 text-3xl" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Avg. Delivery Time</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {stats.avgDeliveryTime}
                </p>
              </div>
              <FiClock className="text-purple-600 text-3xl" />
            </div>
          </motion.div>
        </div>

        {/* Map View */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Delivery Map
          </h3>
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
            <MapView 
              centers={activeDeliveries.map(d => ({
                ...d.dropLocation,
                type: 'delivery'
              }))}
              currentLocation={currentLocation}
              height="100%"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex -mb-px">
              {['active', 'completed', 'routes'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-2 px-6 border-b-2 font-medium text-sm capitalize ${
                    activeTab === tab
                      ? 'border-red-600 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Active Deliveries Tab */}
            {activeTab === 'active' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Active Deliveries
                </h3>
                {activeDeliveries.length > 0 ? (
                  <div className="space-y-4">
                    {activeDeliveries.map((delivery) => (
                      <div key={delivery._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                              Delivery #{delivery._id.slice(-6)}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400">
                              Blood Request: {delivery.bloodRequest?.bloodType} - {delivery.bloodRequest?.units} units
                            </p>
                          </div>
                          <span className={`px-3 py-1 text-sm rounded-full ${
                            DELIVERY_STATUS[delivery.status]?.color === 'blue' 
                              ? 'bg-blue-100 text-blue-800'
                              : DELIVERY_STATUS[delivery.status]?.color === 'yellow'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {DELIVERY_STATUS[delivery.status]?.label}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Pickup Location
                            </p>
                            <div className="flex items-start gap-2">
                              <FiMapPin className="text-gray-500 mt-1" />
                              <div>
                                <p className="text-gray-900 dark:text-white">
                                  {delivery.pickupLocation?.name}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {delivery.pickupLocation?.address}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Drop Location
                            </p>
                            <div className="flex items-start gap-2">
                              <FiMapPin className="text-red-500 mt-1" />
                              <div>
                                <p className="text-gray-900 dark:text-white">
                                  {delivery.dropLocation?.name}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {delivery.dropLocation?.address}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {delivery.estimatedDeliveryTime && (
                          <div className="mb-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Estimated Delivery: {new Date(delivery.estimatedDeliveryTime).toLocaleString()}
                            </p>
                          </div>
                        )}

                        <div className="flex gap-2">
                          {delivery.status === 'assigned' && (
                            <button 
                              onClick={() => handleStatusUpdate(delivery._id, 'picked-up')}
                              className="btn-primary flex items-center gap-2"
                            >
                              <FiPackage /> Mark as Picked Up
                            </button>
                          )}
                          {delivery.status === 'picked-up' && (
                            <button 
                              onClick={() => handleStatusUpdate(delivery._id, 'in-transit')}
                              className="btn-primary flex items-center gap-2"
                            >
                              <FiTruck /> Start Delivery
                            </button>
                          )}
                          {delivery.status === 'in-transit' && (
                            <button 
                              onClick={() => handleStatusUpdate(delivery._id, 'delivered')}
                              className="btn-primary flex items-center gap-2"
                            >
                              <FiCheckCircle /> Mark as Delivered
                            </button>
                          )}
                          <button className="btn-secondary flex items-center gap-2">
                            <FiPhone /> Contact
                          </button>
                          <button 
                            onClick={() => setSelectedDelivery(delivery)}
                            className="btn-secondary flex items-center gap-2"
                          >
                            <FiNavigation /> Navigate
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">No active deliveries.</p>
                )}
              </div>
            )}

            {/* Completed Deliveries Tab */}
            {activeTab === 'completed' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Completed Deliveries
                </h3>
                {completedDeliveries.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Delivery ID
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            From
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            To
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Delivery Time
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {completedDeliveries.map((delivery) => (
                          <tr key={delivery._id}>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                              #{delivery._id.slice(-6)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                              {new Date(delivery.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                              {delivery.pickupLocation?.name}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                              {delivery.dropLocation?.name}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                              {delivery.actualDeliveryTime 
                                ? new Date(delivery.actualDeliveryTime).toLocaleTimeString()
                                : 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">No completed deliveries yet.</p>
                )}
              </div>
            )}

            {/* Routes Tab */}
            {activeTab === 'routes' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Optimized Routes
                </h3>
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                      Route Optimization Tips
                    </h4>
                    <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-400">
                      <li>• Group deliveries by area to minimize travel time</li>
                      <li>• Prioritize critical deliveries first</li>
                      <li>• Check traffic conditions before starting</li>
                      <li>• Keep blood products at proper temperature during transit</li>
                    </ul>
                  </div>

                  {activeDeliveries.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                        Suggested Route Order
                      </h4>
                      <div className="space-y-2">
                        {activeDeliveries.map((delivery, index) => (
                          <div key={delivery._id} className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 dark:text-white">
                                {delivery.dropLocation?.name}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {delivery.dropLocation?.address}
                              </p>
                            </div>
                            <span className="text-sm text-gray-500">
                              ~{15 * (index + 1)} mins
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryDashboard;
