import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiDroplet, FiCalendar, FiAward, FiClock, FiBell, FiUser, FiDownload, FiCheckCircle, FiXCircle, FiAlertCircle } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import BloodCard from '../cards/BloodCard';
import MapView from '../maps/MapView';
import { BLOOD_TYPES } from '../../utils/constants';
import { useSocket } from '../../hooks/useSocket';

const DonorDashboard = () => {
  const { user, updateProfile } = useAuth();
  const { socket } = useSocket();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [showBloodCard, setShowBloodCard] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [dialogAction, setDialogAction] = useState(null);
  const [appointmentData, setAppointmentData] = useState({
    date: '',
    time: '',
    bloodBank: ''
  });

  // Fetch donation history
  const { data: donations, isLoading: donationsLoading } = useQuery({
    queryKey: ['donations', user?._id],
    queryFn: async () => {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/blood/donations`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.data.data;
    }
  });

  // Fetch compatible blood requests
  const { data: bloodRequests, refetch: refetchRequests } = useQuery({
    queryKey: ['bloodRequests', user?.bloodType],
    queryFn: async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/blood/requests/compatible`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      return response.data.data;
    }
  });

  // Schedule donation mutation
  const scheduleDonationMutation = useMutation({
    mutationFn: async (data) => {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/blood/donate`,
        data,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success('Donation scheduled successfully!');
      setAppointmentData({ date: '', time: '', bloodBank: '' });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to schedule donation');
    }
  });

  // Accept blood request mutation
  const acceptRequestMutation = useMutation({
    mutationFn: async (requestId) => {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/blood/request/${requestId}/accept`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Blood request accepted! Donation scheduled for tomorrow.');
      setShowConfirmDialog(false);
      setSelectedRequest(null);
      refetchRequests();
      queryClient.invalidateQueries(['donations']);
      
      if (socket) {
        socket.emit('donor-accepted', {
          requestId: data.data.requestId,
          donorName: user.name,
          donorId: user._id,
          recipientId: data.data.recipientId
        });
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to accept request');
    }
  });

  // Decline blood request mutation
  const declineRequestMutation = useMutation({
    mutationFn: async (requestId) => {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/blood/request/${requestId}/decline`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success('Blood request declined.');
      setShowConfirmDialog(false);
      setSelectedRequest(null);
      refetchRequests();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to decline request');
    }
  });

  // Respond to blood request mutation
  const respondToRequestMutation = useMutation({
    mutationFn: async ({ requestId, response }) => {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/blood/respond/${requestId}`,
        { response },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Response sent successfully!');
      refetch(); // Refresh blood requests
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to respond to request');
    }
  });

  // Helper functions
  const isCompatibleDonor = (recipientBloodType) => {
    const compatibility = {
      'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
      'O+': ['O+', 'A+', 'B+', 'AB+'],
      'A-': ['A-', 'A+', 'AB-', 'AB+'],
      'A+': ['A+', 'AB+'],
      'B-': ['B-', 'B+', 'AB-', 'AB+'],
      'B+': ['B+', 'AB+'],
      'AB-': ['AB-', 'AB+'],
      'AB+': ['AB+']
    };
    
    return compatibility[user?.bloodType]?.includes(recipientBloodType);
  };

  const handleAcceptRequest = (request) => {
    setSelectedRequest(request);
    setDialogAction('accept');
    setShowConfirmDialog(true);
  };

  const handleDeclineRequest = (request) => {
    setSelectedRequest(request);
    setDialogAction('decline');
    setShowConfirmDialog(true);
  };

  const confirmAction = () => {
    if (dialogAction === 'accept') {
      acceptRequestMutation.mutate(selectedRequest._id);
    } else if (dialogAction === 'decline') {
      declineRequestMutation.mutate(selectedRequest._id);
    }
  };

  const handleRespondToRequest = (requestId, response) => {
    const action = response === 'accept' ? 'accept' : 'decline';
    if (window.confirm(`Are you sure you want to ${action} this blood donation request?`)) {
      respondToRequestMutation.mutate({ requestId, response });
    }
  };

  const handleScheduleDonation = (e) => {
    e.preventDefault();
    const scheduledDate = new Date(`${appointmentData.date} ${appointmentData.time}`);
    scheduleDonationMutation.mutate({
      scheduledDate,
      bloodBank: {
        name: appointmentData.bloodBank,
        address: 'Sample Address' // You can make this dynamic
      }
    });
  };

  const canDonateAgain = () => {
    if (!user?.lastDonationDate) return true;
    const lastDonation = new Date(user.lastDonationDate);
    const today = new Date();
    const daysSinceLastDonation = Math.floor((today - lastDonation) / (1000 * 60 * 60 * 24));
    return daysSinceLastDonation >= 56; // 56 days minimum between donations
  };

  const stats = {
    totalDonations: user?.donationCount || 0,
    liveSaved: (user?.donationCount || 0) * 3,
    nextEligible: canDonateAgain() ? 'Eligible Now' : 'Check Back Soon',
    badge: user?.badgeLevel || 'bronze'
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Blood Type: <span className="font-semibold text-red-600">{user?.bloodType}</span>
              </p>
            </div>
            <div className="flex gap-2 mt-4 md:mt-0">
              <button
                onClick={() => setShowBloodCard(!showBloodCard)}
                className="btn-primary flex items-center gap-2"
              >
                <FiDroplet /> My Blood Card
              </button>
              <button className="btn-secondary flex items-center gap-2">
                <FiDownload /> Download History
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
                <p className="text-gray-600 dark:text-gray-400 text-sm">Total Donations</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalDonations}
                </p>
              </div>
              <FiDroplet className="text-red-600 text-3xl" />
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
                <p className="text-gray-600 dark:text-gray-400 text-sm">Lives Saved</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.liveSaved}
                </p>
              </div>
              <FiAward className="text-green-600 text-3xl" />
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
                <p className="text-gray-600 dark:text-gray-400 text-sm">Next Eligible</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {stats.nextEligible}
                </p>
              </div>
              <FiClock className="text-blue-600 text-3xl" />
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
                <p className="text-gray-600 dark:text-gray-400 text-sm">Current Badge</p>
                <p className="text-lg font-bold capitalize text-gray-900 dark:text-white">
                  {stats.badge}
                </p>
              </div>
              <FiAward className={`text-3xl ${
                stats.badge === 'platinum' ? 'text-purple-600' :
                stats.badge === 'gold' ? 'text-yellow-600' :
                stats.badge === 'silver' ? 'text-gray-600' :
                'text-amber-600'
              }`} />
            </div>
          </motion.div>
        </div>

        {/* Show Blood Card */}
        {showBloodCard && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6"
          >
            <BloodCard user={user} />
          </motion.div>
        )}

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex -mb-px">
              {['overview', 'schedule', 'history', 'requests', 'profile'].map((tab) => (
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
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Recent Blood Requests in Your Area
                  </h3>
                  <div className="space-y-3">
                    {bloodRequests?.slice(0, 3).map((request) => (
                      <div key={request._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {request.bloodType} Blood Needed
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {request.hospital?.name || 'Local Hospital'}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              Units needed: {request.units}
                            </p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            request.urgency === 'critical' 
                              ? 'bg-red-100 text-red-800' 
                              : request.urgency === 'urgent'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {request.urgency}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Donation Guidelines
                  </h3>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      You must be at least 18 years old and weigh at least 50kg
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      Wait at least 56 days between whole blood donations
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      Stay hydrated and eat a healthy meal before donation
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      Bring a valid ID and your Blood Card to the donation center
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* Schedule Tab */}
            {activeTab === 'schedule' && (
              <div className="max-w-2xl">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Schedule Your Next Donation
                </h3>
                {canDonateAgain() ? (
                  <form onSubmit={handleScheduleDonation} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Preferred Date
                      </label>
                      <input
                        type="date"
                        className="input-field"
                        value={appointmentData.date}
                        onChange={(e) => setAppointmentData({...appointmentData, date: e.target.value})}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Preferred Time
                      </label>
                      <input
                        type="time"
                        className="input-field"
                        value={appointmentData.time}
                        onChange={(e) => setAppointmentData({...appointmentData, time: e.target.value})}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Blood Bank / Donation Center
                      </label>
                      <select
                        className="input-field"
                        value={appointmentData.bloodBank}
                        onChange={(e) => setAppointmentData({...appointmentData, bloodBank: e.target.value})}
                        required
                      >
                        <option value="">Select a location</option>
                        <option value="City Blood Bank">City Blood Bank</option>
                        <option value="Red Cross Center">Red Cross Center</option>
                        <option value="Community Hospital">Community Hospital</option>
                      </select>
                    </div>

                    <button type="submit" className="btn-primary w-full">
                      Schedule Appointment
                    </button>
                  </form>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800">
                      You're not eligible to donate yet. Please wait at least 56 days after your last donation.
                    </p>
                  </div>
                )}

                <div className="mt-8">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Nearby Donation Centers
                  </h4>
                  <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                    <MapView centers={[]} height="100%" />
                  </div>
                </div>
              </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Donation History
                </h3>
                {donationsLoading ? (
                  <p>Loading...</p>
                ) : donations?.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Location
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Units
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {donations.map((donation) => (
                          <tr key={donation._id}>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                              {new Date(donation.scheduledDate).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                              {donation.bloodBank?.name || 'N/A'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                              {donation.donationType}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                              {donation.units}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                donation.status === 'completed' 
                                  ? 'bg-green-100 text-green-800'
                                  : donation.status === 'scheduled'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {donation.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">No donation history yet.</p>
                )}
              </div>
            )}

            {/* Requests Tab */}
            {activeTab === 'requests' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Compatible Blood Requests
                </h3>
                {bloodRequests?.length > 0 ? (
                  <div className="space-y-4">
                    {bloodRequests.map((request) => {
                      const isCompatible = isCompatibleDonor(request.bloodType);
                      const myMatch = request.matchedDonors?.find(m => m.donor === user?._id || m.donor?._id === user?._id);
                      const hasResponded = myMatch?.status !== 'pending';
                      
                      return (
                        <div key={request._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                          {/* Request details */}
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <p className="font-semibold text-lg text-gray-900 dark:text-white">
                                {request.bloodType} Blood Required
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {request.reason}
                              </p>
                            </div>
                            <span className={`px-3 py-1 text-sm rounded-full ${
                              request.urgency === 'critical' 
                                ? 'bg-red-100 text-red-800' 
                                : request.urgency === 'urgent'
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {request.urgency}
                            </span>
                          </div>

                          {/* Status display if already responded */}
                          {myMatch && (
                            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <p className="text-sm">
                                Your Response: 
                                <span className={`ml-2 font-semibold ${
                                  myMatch.status === 'accepted' ? 'text-green-600' :
                                  myMatch.status === 'declined' ? 'text-red-600' :
                                  'text-orange-600'
                                }`}>
                                  {myMatch.status.charAt(0).toUpperCase() + myMatch.status.slice(1)}
                                </span>
                              </p>
                            </div>
                          )}

                          {/* Action buttons */}
                          {isCompatible && !hasResponded && canDonateAgain() && (
                            <div className="flex gap-3">
                              <button
                                onClick={() => handleAcceptRequest(request)}
                                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                              >
                                <FiCheckCircle /> Accept Request
                              </button>
                              <button
                                onClick={() => handleDeclineRequest(request)}
                                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                              >
                                <FiXCircle /> Decline
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">No compatible blood requests.</p>
                )}
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="max-w-2xl">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Profile Settings
                </h3>
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      defaultValue={user?.name}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      className="input-field"
                      defaultValue={user?.email}
                      disabled
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      className="input-field"
                      defaultValue={user?.phone}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Blood Type
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      defaultValue={user?.bloodType}
                      disabled
                    />
                  </div>

                  <button type="submit" className="btn-primary w-full">
                    Update Profile
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {dialogAction === 'accept' ? 'Confirm Acceptance' : 'Confirm Decline'}
            </h3>
            
            {dialogAction === 'accept' ? (
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Accepting will schedule a donation for tomorrow at 10 AM.
              </p>
            ) : (
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Are you sure you want to decline this request?
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                  dialogAction === 'accept'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {dialogAction === 'accept' ? 'Accept' : 'Decline'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default DonorDashboard;
