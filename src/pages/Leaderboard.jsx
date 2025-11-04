import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiAward, FiDroplet, FiTrendingUp, FiUser } from 'react-icons/fi';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const Leaderboard = () => {
  const [timeFilter, setTimeFilter] = useState('all');

  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ['leaderboard', timeFilter],
    queryFn: async () => {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/blood/leaderboard`);
      return response.data.data;
    }
  });

  const getBadgeIcon = (position) => {
    if (position === 1) return '🥇';
    if (position === 2) return '🥈';
    if (position === 3) return '🥉';
    return null;
  };

  const getBadgeColor = (level) => {
    switch(level) {
      case 'platinum': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'gold': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'silver': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-amber-100 text-amber-800 border-amber-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Hero Leaderboard
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Celebrating our life-saving heroes who donate blood regularly
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Total Donors</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {leaderboard?.length || 0}
                </p>
              </div>
              <FiUser className="text-blue-600 text-3xl" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Total Donations</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {leaderboard?.reduce((sum, donor) => sum + donor.donationCount, 0) || 0}
                </p>
              </div>
              <FiDroplet className="text-red-600 text-3xl" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Lives Saved</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {(leaderboard?.reduce((sum, donor) => sum + donor.donationCount, 0) || 0) * 3}
                </p>
              </div>
              <FiTrendingUp className="text-green-600 text-3xl" />
            </div>
          </motion.div>
        </div>

        {/* Top 3 Donors */}
        {leaderboard && leaderboard.length >= 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* 2nd Place */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="md:mt-8"
            >
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg shadow-xl p-6 text-center transform hover:scale-105 transition-transform">
                <div className="text-5xl mb-4">🥈</div>
                <div className="w-20 h-20 mx-auto bg-gray-300 rounded-full flex items-center justify-center text-2xl font-bold text-white mb-4">
                  {leaderboard[1]?.name?.charAt(0)}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {leaderboard[1]?.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  Blood Type: {leaderboard[1]?.bloodType}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {leaderboard[1]?.donationCount} donations
                </p>
              </div>
            </motion.div>

            {/* 1st Place */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-800 dark:to-yellow-900 rounded-lg shadow-xl p-6 text-center transform hover:scale-105 transition-transform">
                <div className="text-6xl mb-4">🥇</div>
                <div className="w-24 h-24 mx-auto bg-yellow-400 rounded-full flex items-center justify-center text-3xl font-bold text-white mb-4">
                  {leaderboard[0]?.name?.charAt(0)}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {leaderboard[0]?.name}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  Blood Type: {leaderboard[0]?.bloodType}
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {leaderboard[0]?.donationCount} donations
                </p>
              </div>
            </motion.div>

            {/* 3rd Place */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="md:mt-8"
            >
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-800 dark:to-amber-900 rounded-lg shadow-xl p-6 text-center transform hover:scale-105 transition-transform">
                <div className="text-5xl mb-4">🥉</div>
                <div className="w-20 h-20 mx-auto bg-amber-600 rounded-full flex items-center justify-center text-2xl font-bold text-white mb-4">
                  {leaderboard[2]?.name?.charAt(0)}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {leaderboard[2]?.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  Blood Type: {leaderboard[2]?.bloodType}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {leaderboard[2]?.donationCount} donations
                </p>
              </div>
            </motion.div>
          </div>
        )}

        {/* Full Leaderboard Table */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              All Heroes
            </h2>
          </div>

          {isLoading ? (
            <div className="p-12 text-center">
              <p className="text-gray-600 dark:text-gray-400">Loading leaderboard...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Donor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Blood Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Badge
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Donations
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Lives Saved
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {leaderboard?.map((donor, index) => (
                    <tr key={donor._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-2xl mr-2">{getBadgeIcon(index + 1)}</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            #{index + 1}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                            {donor.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {donor.name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 dark:text-white font-semibold">
                          {donor.bloodType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getBadgeColor(donor.badgeLevel)}`}>
                          {donor.badgeLevel}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {donor.donationCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-green-600">
                          {donor.donationCount * 3}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Leaderboard;
