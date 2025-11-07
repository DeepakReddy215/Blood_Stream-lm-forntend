import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiUsers, FiTarget, FiAward, FiShare2, FiTrendingUp, 
  FiCalendar, FiPlus, FiCheckCircle 
} from 'react-icons/fi';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useSocket } from '../../hooks/useSocket';

const VirtualBloodDrive = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { socket } = useSocket();

  // Real-time updates
  useEffect(() => {
    if (!socket) return;

    socket.on('drive-update', (data) => {
      toast.success(`New participant: ${data.participant}`);
      refetch();
    });

    socket.on('drive-progress', (data) => {
      refetch();
    });

    return () => {
      socket.off('drive-update');
      socket.off('drive-progress');
    };
  }, [socket]);

  // Fetch active drives
  const { data: drives, refetch } = useQuery({
    queryKey: ['bloodDrives'],
    queryFn: async () => {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/blood-drives/active`);
      return response.data.data;
    }
  });

  // Join drive mutation
  const joinDriveMutation = useMutation({
    mutationFn: async (driveId) => {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/blood-drives/${driveId}/join`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success('Successfully joined blood drive!');
      refetch();
    }
  });

  // Share on social
  const handleShare = async (drive, platform) => {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/blood-drives/${drive._id}/share`,
      { platform },
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
    );
    window.open(response.data.shareLink, '_blank');
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Virtual Blood Drive Events
        </h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <FiPlus /> Create Event
        </button>
      </div>

      {/* Active Drives Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {drives?.map((drive) => (
          <motion.div
            key={drive._id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
          >
            {/* Drive Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 p-4">
              <h3 className="text-lg font-bold text-white">{drive.name}</h3>
              <p className="text-red-100 text-sm">{drive.organization?.name}</p>
            </div>

            {/* Progress Bar */}
            <div className="p-4">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span>{drive.progress.units} units</span>
                <span>Goal: {drive.goal.units}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-red-600 h-3 rounded-full transition-all"
                  style={{ width: `${Math.min((drive.progress.units / drive.goal.units) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="px-4 pb-4 grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {drive.participants?.length || 0}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Participants</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {drive.statistics?.livesSaved || 0}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Lives Saved</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {Math.round((drive.progress.units / drive.goal.units) * 100)}%
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Complete</p>
              </div>
            </div>

            {/* Actions */}
            <div className="px-4 pb-4 flex gap-2">
              <button
                onClick={() => joinDriveMutation.mutate(drive._id)}
                className="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Join Drive
              </button>
              <button
                onClick={() => setSelectedDrive(drive)}
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-3 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
              >
                View Details
              </button>
            </div>

            {/* Share Buttons */}
            <div className="px-4 pb-4 flex gap-2">
              <button
                onClick={() => handleShare(drive, 'twitter')}
                className="flex-1 bg-blue-400 text-white px-2 py-1 rounded text-xs"
              >
                Twitter
              </button>
              <button
                onClick={() => handleShare(drive, 'facebook')}
                className="flex-1 bg-blue-600 text-white px-2 py-1 rounded text-xs"
              >
                Facebook
              </button>
              <button
                onClick={() => handleShare(drive, 'whatsapp')}
                className="flex-1 bg-green-600 text-white px-2 py-1 rounded text-xs"
              >
                WhatsApp
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Leaderboard Modal */}
      {selectedDrive && (
        <DriveLeaderboard 
          drive={selectedDrive} 
          onClose={() => setSelectedDrive(null)} 
        />
      )}

      {/* Create Drive Modal */}
      {showCreateModal && (
        <CreateDriveModal 
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            refetch();
          }}
        />
      )}
    </div>
  );
};

// Leaderboard Component
const DriveLeaderboard = ({ drive, onClose }) => {
  const { data: leaderboard } = useQuery({
    queryKey: ['driveLeaderboard', drive._id],
    queryFn: async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/blood-drives/${drive._id}/leaderboard`
      );
      return response.data.data;
    }
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto"
      >
        <h3 className="text-xl font-bold mb-4">
          {drive.name} - Live Leaderboard
        </h3>

        {/* Overall Progress */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-3xl font-bold text-red-600">
                {leaderboard?.overall.progress.units} / {leaderboard?.overall.goal.units}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Units Collected</p>
            </div>
            <FiTrendingUp className="text-4xl text-green-600" />
          </div>
        </div>

        {/* Individual Leaderboard */}
        <div className="mb-6">
          <h4 className="font-semibold mb-3">Top Donors</h4>
          <div className="space-y-2">
            {leaderboard?.individual.slice(0, 10).map((entry) => (
              <div key={entry.user._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-gray-600">
                    #{entry.rank}
                  </span>
                  <div>
                    <p className="font-semibold">{entry.user.name}</p>
                    <p className="text-sm text-gray-600">{entry.units} units</p>
                  </div>
                </div>
                {entry.rank <= 3 && <FiAward className="text-yellow-500 text-xl" />}
              </div>
            ))}
          </div>
        </div>

        <button onClick={onClose} className="btn-secondary w-full">
          Close
        </button>
      </motion.div>
    </div>
  );
};

// Create Drive Modal
const CreateDriveModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    organization: { name: '', type: 'corporate' },
    goal: { donors: 50, units: 50 },
    startDate: '',
    endDate: ''
  });

  const createDriveMutation = useMutation({
    mutationFn: async (data) => {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/blood-drives/create`,
        data,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success('Blood drive created successfully!');
      onSuccess();
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createDriveMutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4"
      >
        <h3 className="text-xl font-bold mb-4">Create Virtual Blood Drive</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Event Name"
            className="input-field"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
          
          <textarea
            placeholder="Description"
            className="input-field"
            rows="3"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="Donor Goal"
              className="input-field"
              value={formData.goal.donors}
              onChange={(e) => setFormData({
                ...formData, 
                goal: {...formData.goal, donors: parseInt(e.target.value)}
              })}
            />
            <input
              type="number"
              placeholder="Units Goal"
              className="input-field"
              value={formData.goal.units}
              onChange={(e) => setFormData({
                ...formData, 
                goal: {...formData.goal, units: parseInt(e.target.value)}
              })}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <input
              type="date"
              className="input-field"
              value={formData.startDate}
              onChange={(e) => setFormData({...formData, startDate: e.target.value})}
              required
            />
            <input
              type="date"
              className="input-field"
              value={formData.endDate}
              onChange={(e) => setFormData({...formData, endDate: e.target.value})}
              required
            />
          </div>
          
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1">
              Create Drive
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default VirtualBloodDrive;
