import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiAward, FiDroplet, FiTrendingUp, FiUser, FiHeart, FiStar } from 'react-icons/fi';
import axios from 'axios';

const HallOfHeroes = () => {
  const [heroes, setHeroes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHeroes();
  }, []);

  const fetchHeroes = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/blood/heroes`);
      setHeroes(response.data.data || []);
    } catch (error) {
      console.error('Error fetching heroes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getHonorIcon = (position) => {
    if (position === 1) return '🌟';
    if (position === 2) return '⭐';
    if (position === 3) return '✨';
    return null;
  };

  const getBadgeTitle = (level) => {
    switch(level) {
      case 'platinum': return 'Legendary Hero';
      case 'gold': return 'Champion Hero';
      case 'silver': return 'Dedicated Hero';
      default: return 'Rising Hero';
    }
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
          <div className="flex justify-center items-center gap-3 mb-4">
            <FiStar className="text-yellow-500 text-4xl" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Hall of Heroes
            </h1>
            <FiStar className="text-yellow-500 text-4xl" />
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Honoring our life-saving heroes who donate blood selflessly
          </p>
          <p className="text-sm text-red-600 mt-2">
            Every drop counts, every hero matters
          </p>
        </motion.div>

        {/* Impact Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Total Heroes</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {heroes?.length || 0}
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
                  {heroes?.reduce((sum, donor) => sum + donor.donationCount, 0) || 0}
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
                  {(heroes?.reduce((sum, donor) => sum + donor.donationCount, 0) || 0) * 3}
                </p>
              </div>
              <FiHeart className="text-pink-600 text-3xl" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Impact Score</p>
                <p className="text-3xl font-bold text-green-600">
                  {heroes?.length ? '⭐⭐⭐⭐⭐' : '⭐'}
                </p>
              </div>
              <FiAward className="text-green-600 text-3xl" />
            </div>
          </motion.div>
        </div>

        {/* Featured Heroes (Top 3) */}
        {heroes && heroes.length >= 3 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
              Featured Heroes of the Month
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Second Place */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="md:mt-8"
              >
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg shadow-xl p-6 text-center transform hover:scale-105 transition-transform">
                  <div className="text-5xl mb-4">⭐</div>
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-2xl font-bold text-white mb-4 shadow-lg">
                    {heroes[1]?.name?.charAt(0)}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    {heroes[1]?.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Dedicated Hero
                  </p>
                  <div className="bg-white dark:bg-gray-600 rounded-lg p-2 mb-2">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Blood Type: <span className="font-bold text-red-600">{heroes[1]?.bloodType}</span>
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {heroes[1]?.donationCount} donations
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    {heroes[1]?.donationCount * 3} lives saved
                  </p>
                </div>
              </motion.div>

              {/* First Place */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-800 dark:to-yellow-900 rounded-lg shadow-2xl p-6 text-center transform hover:scale-105 transition-transform border-2 border-yellow-400">
                  <div className="text-6xl mb-4 animate-pulse">🌟</div>
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center text-3xl font-bold text-white mb-4 shadow-xl">
                    {heroes[0]?.name?.charAt(0)}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {heroes[0]?.name}
                  </h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 font-semibold mb-2">
                    Hero of the Month
                  </p>
                  <div className="bg-white dark:bg-yellow-700 rounded-lg p-2 mb-2">
                    <p className="text-sm text-gray-700 dark:text-gray-200">
                      Blood Type: <span className="font-bold text-red-600">{heroes[0]?.bloodType}</span>
                    </p>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {heroes[0]?.donationCount} donations
                  </p>
                  <p className="text-sm text-green-600 font-semibold mt-1">
                    {heroes[0]?.donationCount * 3} lives saved
                  </p>
                </div>
              </motion.div>

              {/* Third Place */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="md:mt-8"
              >
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-800 dark:to-amber-900 rounded-lg shadow-xl p-6 text-center transform hover:scale-105 transition-transform">
                  <div className="text-5xl mb-4">✨</div>
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-2xl font-bold text-white mb-4 shadow-lg">
                    {heroes[2]?.name?.charAt(0)}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    {heroes[2]?.name}
                  </h3>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mb-2">
                    Rising Hero
                  </p>
                  <div className="bg-white dark:bg-amber-700 rounded-lg p-2 mb-2">
                    <p className="text-sm text-gray-600 dark:text-gray-200">
                      Blood Type: <span className="font-bold text-red-600">{heroes[2]?.bloodType}</span>
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {heroes[2]?.donationCount} donations
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    {heroes[2]?.donationCount * 3} lives saved
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {/* Inspirational Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg p-6 mb-8 text-center"
        >
          <p className="text-lg font-semibold">
            "The need is constant. The gratitude is infinite."
          </p>
          <p className="text-sm mt-2">
            Join our heroes in making a difference. Your donation today could save up to three lives.
          </p>
        </motion.div>

        {/* Complete Honor Roll */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
        >
          <div className="px-6 py-4 bg-gradient-to-r from-red-600 to-red-700">
            <h2 className="text-xl font-bold text-white">
              Complete Honor Roll
            </h2>
            <p className="text-red-100 text-sm">
              Every hero deserves recognition
            </p>
          </div>

          {isLoading ? (
            <div className="p-12 text-center">
              <p className="text-gray-600 dark:text-gray-400">Loading our heroes...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Honor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Hero
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Blood Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Recognition Level
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
                  {heroes?.map((hero, index) => (
                    <tr key={hero._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-2xl mr-2">{getHonorIcon(index + 1)}</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {index + 1}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold mr-3 shadow">
                            {hero.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {hero.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              Hero since {new Date(hero.createdAt || Date.now()).getFullYear()}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 dark:text-white font-semibold">
                          {hero.bloodType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getBadgeColor(hero.badgeLevel)}`}>
                          {getBadgeTitle(hero.badgeLevel)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FiDroplet className="text-red-500 mr-1" />
                          <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {hero.donationCount}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FiHeart className="text-green-600 mr-1" />
                          <span className="text-sm font-bold text-green-600">
                            {hero.donationCount * 3}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 text-center"
        >
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
            Want to join our Hall of Heroes?
          </p>
          <a
            href="/register"
            className="inline-block bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Become a Hero Today
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default HallOfHeroes;
