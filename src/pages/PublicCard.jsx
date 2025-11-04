import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FiDroplet, FiAward, FiCheckCircle, FiUser } from 'react-icons/fi';
import LoadingSpinner from '../components/common/LoadingSpinner';

const PublicCard = () => {
  const { userId } = useParams();

  const { data: cardData, isLoading, error } = useQuery({
    queryKey: ['publicCard', userId],
    queryFn: async () => {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/blood/card/${userId}`);
      return response.data.data;
    }
  });

  if (isLoading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-xl">Card not found or invalid</p>
        </div>
      </div>
    );
  }

  const getBadgeColor = (level) => {
    switch(level) {
      case 'platinum': return 'from-purple-600 to-purple-800';
      case 'gold': return 'from-yellow-500 to-yellow-700';
      case 'silver': return 'from-gray-400 to-gray-600';
      default: return 'from-amber-600 to-amber-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FiDroplet className="text-3xl" />
                <div>
                  <h1 className="text-2xl font-bold">BloodStream</h1>
                  <p className="text-red-100 text-sm">Digital Blood Card</p>
                </div>
              </div>
              <FiCheckCircle className="text-3xl text-green-400" />
            </div>
          </div>

          {/* Card Content */}
          <div className="p-8">
            {/* Profile Section */}
            <div className="flex items-start gap-6 mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {cardData?.name?.charAt(0).toUpperCase()}
              </div>
              
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {cardData?.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  Card ID: #{cardData?.id?.slice(-8).toUpperCase()}
                </p>
                
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${getBadgeColor(cardData?.badgeLevel)}`}>
                  <FiAward className="text-white" />
                  <span className="text-white font-semibold capitalize">
                    {cardData?.badgeLevel} Donor
                  </span>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Blood Type</p>
                <p className="text-3xl font-bold text-red-600">{cardData?.bloodType}</p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Total Donations</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {cardData?.donationCount}
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Lives Saved</p>
                <p className="text-3xl font-bold text-green-600">
                  {(cardData?.donationCount || 0) * 3}
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Member Since</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {new Date(cardData?.joinDate).getFullYear()}
                </p>
              </div>
            </div>

            {/* Verification Status */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <FiCheckCircle className="text-green-600 text-2xl" />
                <div>
                  <p className="font-semibold text-green-900 dark:text-green-300">
                    Verified Blood Donor
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-400">
                    This card has been verified by BloodStream
                  </p>
                </div>
              </div>
            </div>

            {/* QR Code */}
            {cardData?.qrCode && (
              <div className="mt-8 text-center">
                <img src={cardData.qrCode} alt="QR Code" className="mx-auto w-32 h-32" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Scan to verify authenticity
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 dark:bg-gray-700 px-8 py-4">
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              © 2024 BloodStream - Saving Lives Together
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PublicCard;
