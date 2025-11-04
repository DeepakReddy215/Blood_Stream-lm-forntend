import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FiUsers, FiDroplet, FiTruck, FiActivity, 
  FiTrendingUp, FiAlertCircle, FiDatabase, FiSettings 
} from 'react-icons/fi';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BLOOD_TYPES } from '../../utils/constants';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('week');

  // Fetch dashboard stats
  const { data: stats } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.data.data;
    }
  });

  // Fetch analytics data
  const { data: analytics } = useQuery({
    queryKey: ['analytics', dateRange],
    queryFn: async () => {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/analytics`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.data.data;
    }
  });

  // Fetch all users
  const { data: users } = useQuery({
    queryKey: ['allUsers'],
    queryFn: async () => {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.data.data;
    }
  });

  const bloodInventoryData = stats?.bloodInventory 
    ? Object.entries(stats.bloodInventory).map(([type, count]) => ({
        name: type,
        value: count
      }))
    : [];

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                System Overview & Management
              </p>
            </div>
            <div className="flex gap-2 mt-4 md:mt-0">
              <select 
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="day">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
              <button className="btn-primary flex items-center gap-2">
                <FiSettings /> Settings
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
                <p className="text-gray-600 dark:text-gray-400 text-sm">Total Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.totalUsers || 0}
                </p>
                <p className="text-xs text-green-600 mt-1">+12% from last month</p>
              </div>
              <FiUsers className="text-blue-600 text-3xl" />
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
                <p className="text-gray-600 dark:text-gray-400 text-sm">Total Donations</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.totalDonations || 0}
                </p>
                <p className="text-xs text-green-600 mt-1">+8% from last month</p>
              </div>
              <FiDroplet className="text-red-600 text-3xl" />
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
                <p className="text-gray-600 dark:text-gray-400 text-sm">Active Requests</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.totalRequests || 0}
                </p>
                <p className="text-xs text-orange-600 mt-1">5 critical</p>
              </div>
              <FiAlertCircle className="text-orange-600 text-3xl" />
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
                <p className="text-gray-600 dark:text-gray-400 text-sm">Active Deliveries</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.activeDeliveries || 0}
                </p>
                <p className="text-xs text-blue-600 mt-1">On track</p>
              </div>
              <FiTruck className="text-green-600 text-3xl" />
            </div>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Blood Inventory Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Blood Inventory by Type
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={bloodInventoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {bloodInventoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Donation Trends Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Donation Trends
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics?.donationTrends || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#ef4444" name="Donations" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex -mb-px">
              {['overview', 'users', 'blood-bank', 'requests', 'reports'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-2 px-6 border-b-2 font-medium text-sm capitalize ${
                    activeTab === tab
                      ? 'border-red-600 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.replace('-', ' ')}
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
                    System Health
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-600 dark:text-gray-400">Server Status</span>
                        <span className="text-green-600">●</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">Online</p>
                      <p className="text-sm text-gray-500">Uptime: 99.9%</p>
                    </div>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-600 dark:text-gray-400">Database</span>
                        <span className="text-green-600">●</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">Healthy</p>
                      <p className="text-sm text-gray-500">Response: 45ms</p>
                    </div>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-600 dark:text-gray-400">API Status</span>
                        <span className="text-green-600">●</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">Active</p>
                      <p className="text-sm text-gray-500">Requests: 1.2k/hr</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Recent Activities
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <FiUsers className="text-blue-600" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 dark:text-white">New donor registered</p>
                        <p className="text-xs text-gray-500">2 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <FiDroplet className="text-red-600" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 dark:text-white">Blood request fulfilled</p>
                        <p className="text-xs text-gray-500">15 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <FiTruck className="text-green-600" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 dark:text-white">Delivery completed</p>
                        <p className="text-xs text-gray-500">1 hour ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  User Management
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Blood Type
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {users?.slice(0, 10).map((user) => (
                        <tr key={user._id}>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                            {user.name}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                            {user.email}
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                              {user.role}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                            {user.bloodType || 'N/A'}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              user.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button className="text-blue-600 hover:text-blue-800 text-sm">
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Blood Bank Tab */}
            {activeTab === 'blood-bank' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Blood Bank Inventory
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {BLOOD_TYPES.map((type) => (
                    <div key={type} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg font-bold text-gray-900 dark:text-white">{type}</span>
                        <FiDroplet className="text-red-600" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stats?.bloodInventory?.[type] || 0}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Units available</p>
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              (stats?.bloodInventory?.[type] || 0) > 10 
                                ? 'bg-green-600' 
                                : (stats?.bloodInventory?.[type] || 0) > 5
                                ? 'bg-yellow-600'
                                : 'bg-red-600'
                            }`}
                            style={{ width: `${Math.min((stats?.bloodInventory?.[type] || 0) * 5, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Critical Alerts
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FiAlertCircle className="text-red-600" />
                        <div>
                          <p className="font-medium text-red-900 dark:text-red-300">O- Blood Critical</p>
                          <p className="text-sm text-red-700 dark:text-red-400">Only 3 units remaining</p>
                        </div>
                      </div>
                      <button className="btn-primary text-sm">
                        Request Donors
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
