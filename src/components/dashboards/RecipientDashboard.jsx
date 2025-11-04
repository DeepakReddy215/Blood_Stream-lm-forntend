import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiDroplet, FiAlertCircle, FiClock, FiMapPin, FiPhone, FiUser } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import BloodCard from '../cards/BloodCard';
import MapView from '../maps/MapView';
import { BLOOD_TYPES, URGENCY_LEVELS } from '../../utils/constants';

const RecipientDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [showBloodCard, setShowBloodCard] = useState(false);
  const [requestForm, setRequestForm] = useState({
    bloodType: user?.bloodType || '',
    units: 1,
    urgency: 'normal',
    reason: '',
    hospital: {
      name: '',
      address: '',
      contact: ''
    }
  });

  // Fetch my blood requests
  const { data: myRequests, refetch: refetchRequests } = useQuery({
    queryKey: ['myBloodRequests', user?._id],
    queryFn: async () => {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/blood/requests?recipient=${user._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.data.data;
    }
  });

  // Fetch nearby donors
  const { data: nearbyDonors } = useQuery({
    queryKey: ['nearbyDonors', user?.bloodType],
    queryFn: async () => {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/blood/nearby-donors?bloodType=${user?.bloodType}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.data.data;
    }
  });

  // Create blood request mutation
  const createRequestMutation = useMutation({
    mutationFn: async (data) => {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/blood/request`,
        data,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success('Blood request created successfully!');
      setRequestForm({
        bloodType: user?.bloodType || '',
        units: 1,
        urgency: 'normal',
        reason: '',
        hospital: { name: '', address: '', contact: '' }
      });
      refetchRequests();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create request');
    }
  });

  const handleCreateRequest = (e) => {
    e.preventDefault();
    createRequestMutation.mutate(requestForm);
  };

  const activeRequests = myRequests?.filter(r => r.status !== 'fulfilled' && r.status !== 'cancelled') || [];
  const completedRequests = myRequests?.filter(r => r.status === 'fulfilled') || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Recipient Dashboard
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
                <p className="text-gray-600 dark:text-gray-400 text-sm">Active Requests</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {activeRequests.length}
                </p>
              </div>
              <FiAlertCircle className="text-red-600 text-3xl" />
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
                <p className="text-gray-600 dark:text-gray-400 text-sm">Fulfilled Requests</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {completedRequests.length}
                </p>
              </div>
              <FiDroplet className="text-green-600 text-3xl" />
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
                <p className="text-gray-600 dark:text-gray-400 text-sm">Nearby Donors</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {nearbyDonors?.length || 0}
                </p>
              </div>
              <FiMapPin className="text-blue-600 text-3xl" />
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
                <p className="text-gray-600 dark:text-gray-400 text-sm">Response Time</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  &lt; 2 hrs
                </p>
              </div>
              <FiClock className="text-orange-600 text-3xl" />
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
              {['overview', 'request', 'active', 'history', 'donors'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-2 px-6 border-b-2 font-medium text-sm capitalize ${
                    activeTab === tab
                      ? 'border-red-600 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab === 'request' ? 'New Request' : tab}
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
                    Quick Actions
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => setActiveTab('request')}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
                    >
                      <FiAlertCircle className="text-red-600 text-2xl mb-2" />
                      <p className="font-semibold text-gray-900 dark:text-white">Create Request</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Request blood donation</p>
                    </button>
                    <button
                      onClick={() => setActiveTab('donors')}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
                    >
                      <FiMapPin className="text-blue-600 text-2xl mb-2" />
                      <p className="font-semibold text-gray-900 dark:text-white">Find Donors</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Locate nearby donors</p>
                    </button>
                    <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left">
                      <FiPhone className="text-green-600 text-2xl mb-2" />
                      <p className="font-semibold text-gray-900 dark:text-white">Emergency</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Call emergency hotline</p>
                    </button>
                  </div>
                </div>

                {activeRequests.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Recent Active Requests
                    </h3>
                    <div className="space-y-3">
                      {activeRequests.slice(0, 2).map((request) => (
                        <div key={request._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {request.bloodType} Blood - {request.units} Units
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {request.hospital?.name}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                Status: {request.status}
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
                )}
              </div>
            )}

            {/* New Request Tab */}
            {activeTab === 'request' && (
              <div className="max-w-2xl">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Create Blood Request
                </h3>
                <form onSubmit={handleCreateRequest} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Blood Type
                      </label>
                      <select
                        className="input-field"
                        value={requestForm.bloodType}
                        onChange={(e) => setRequestForm({...requestForm, bloodType: e.target.value})}
                        required
                      >
                        <option value="">Select Blood Type</option>
                        {BLOOD_TYPES.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Units Required
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        className="input-field"
                        value={requestForm.units}
                        onChange={(e) => setRequestForm({...requestForm, units: parseInt(e.target.value)})}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Urgency Level
                    </label>
                    <select
                      className="input-field"
                      value={requestForm.urgency}
                      onChange={(e) => setRequestForm({...requestForm, urgency: e.target.value})}
                      required
                    >
                      {Object.keys(URGENCY_LEVELS).map(level => (
                        <option key={level} value={level}>
                          {URGENCY_LEVELS[level].label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Reason for Request
                    </label>
                    <textarea
                      className="input-field"
                      rows="3"
                      value={requestForm.reason}
                      onChange={(e) => setRequestForm({...requestForm, reason: e.target.value})}
                      placeholder="Please describe why you need blood..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Hospital Name
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      value={requestForm.hospital.name}
                      onChange={(e) => setRequestForm({
                        ...requestForm,
                        hospital: {...requestForm.hospital, name: e.target.value}
                      })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Hospital Address
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      value={requestForm.hospital.address}
                      onChange={(e) => setRequestForm({
                        ...requestForm,
                        hospital: {...requestForm.hospital, address: e.target.value}
                      })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Contact Number
                    </label>
                    <input
                      type="tel"
                      className="input-field"
                      value={requestForm.hospital.contact}
                      onChange={(e) => setRequestForm({
                        ...requestForm,
                        hospital: {...requestForm.hospital, contact: e.target.value}
                      })}
                      required
                    />
                  </div>

                  <button type="submit" className="btn-primary w-full">
                    Submit Request
                  </button>
                </form>
              </div>
            )}

            {/* Active Requests Tab */}
            {activeTab === 'active' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Active Blood Requests
                </h3>
                {activeRequests.length > 0 ? (
                  <div className="space-y-4">
                    {activeRequests.map((request) => (
                      <div key={request._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                              {request.bloodType} Blood - {request.units} Units
                            </p>
                            <p className="text-gray-600 dark:text-gray-400">
                              {request.reason}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={`px-3 py-1 text-sm rounded-full ${
                              request.urgency === 'critical' 
                                ? 'bg-red-100 text-red-800' 
                                : request.urgency === 'urgent'
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {URGENCY_LEVELS[request.urgency].label}
                            </span>
                            <p className="text-sm text-gray-500 mt-2">
                              Status: {request.status}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">Hospital:</span>
                            <p className="text-gray-900 dark:text-white">{request.hospital?.name}</p>
                            <p className="text-gray-600 dark:text-gray-400">{request.hospital?.address}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">Contact:</span>
                            <p className="text-gray-900 dark:text-white">{request.hospital?.contact}</p>
                          </div>
                        </div>

                        {request.matchedDonors?.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Matched Donors: {request.matchedDonors.length}
                            </p>
                            <div className="flex gap-2">
                              {request.matchedDonors.map((match) => (
                                <span key={match.donor} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                  Donor {match.status}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="mt-4 flex gap-2">
                          <button className="btn-secondary">
                            Cancel Request
                          </button>
                          <button className="btn-primary">
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">No active requests.</p>
                )}
              </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Request History
                </h3>
                {completedRequests.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Blood Type
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Units
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Hospital
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {completedRequests.map((request) => (
                          <tr key={request._id}>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                              {new Date(request.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                              {request.bloodType}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                              {request.units}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                              {request.hospital?.name}
                            </td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                Fulfilled
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">No completed requests yet.</p>
                )}
              </div>
            )}

            {/* Donors Tab */}
            {activeTab === 'donors' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Nearby Donors
                </h3>
                
                <div className="mb-6">
                  <div className="h-64 bg-gray-200 rounded-lg">
                    <MapView centers={[]} />
                  </div>
                </div>

                {nearbyDonors?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {nearbyDonors.map((donor) => (
                      <div key={donor._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {donor.name}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Blood Type: {donor.bloodType}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Location: {donor.address?.city}
                            </p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            donor.badgeLevel === 'platinum' ? 'bg-purple-100 text-purple-800' :
                            donor.badgeLevel === 'gold' ? 'bg-yellow-100 text-yellow-800' :
                            donor.badgeLevel === 'silver' ? 'bg-gray-100 text-gray-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {donor.badgeLevel}
                          </span>
                        </div>
                        <button className="btn-primary w-full mt-3">
                          Contact Donor
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">No nearby donors found.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipientDashboard;
