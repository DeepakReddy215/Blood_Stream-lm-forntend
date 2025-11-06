import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiDroplet, FiUsers, FiHeart, FiAward, FiMapPin, FiClock } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import axios from 'axios';

const Home = () => {
  const [stats, setStats] = useState({
    totalDonors: 0,
    totalRecipients: 0,
    bloodSaved: 0,
    activeCampaigns: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // For demo purposes, using static data
      setStats({
        totalDonors: 1234,
        totalRecipients: 567,
        bloodSaved: 3456,
        activeCampaigns: 12
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const features = [
    {
      icon: <FiDroplet />,
      title: 'Digital Blood Card',
      description: 'Get your personalized digital blood card with QR code for quick access'
    },
    {
      icon: <FiMapPin />,
      title: 'Find Nearby Donors',
      description: 'Locate compatible blood donors in your area instantly'
    },
    {
      icon: <FiClock />,
      title: 'Real-time Tracking',
      description: 'Track blood delivery status in real-time with GPS'
    },
    {
      icon: <FiAward />,
      title: 'Donor Recognition',
      description: 'Earn badges and climb the leaderboard as you save lives'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-red-600 to-red-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-5xl font-bold mb-6">
                Save Lives with Every Drop
              </h1>
              <p className="text-xl mb-8 text-red-100">
                Join BloodStream - The modern platform connecting blood donors with those in need. 
                Every donation counts, every second matters.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/register" className="bg-white text-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-red-50 transition-colors">
                  Become a Donor
                </Link>
                <Link to="/register" className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-red-600 transition-colors">
                  Request Blood
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="hidden md:block"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-white/10 rounded-full blur-3xl"></div>
                <FiDroplet className="w-full h-64 text-white/20" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Active Donors', value: stats.totalDonors, icon: <FiUsers /> },
              { label: 'Recipients Helped', value: stats.totalRecipients, icon: <FiHeart /> },
              { label: 'Lives Saved', value: stats.bloodSaved, icon: <FiDroplet /> },
              { label: 'Active Campaigns', value: stats.activeCampaigns, icon: <FiAward /> }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-red-600 text-3xl mb-2 flex justify-center">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stat.value.toLocaleString()}+
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose BloodStream?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              We're revolutionizing blood donation management with cutting-edge technology and compassionate care
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="text-red-600 text-3xl mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-red-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-4">
            Every Second Counts
          </h2>
          <p className="text-xl mb-8 text-red-100">
            Join our Hall of Heroes. Your blood donation can save up to 3 lives.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-white text-red-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-red-50 transition-colors inline-block">
              Become a Hero Today
            </Link>
            <Link to="/heroes" className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-red-600 transition-colors inline-block">
              View Our Heroes
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
