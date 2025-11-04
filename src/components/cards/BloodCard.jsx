import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiDownload, FiShare2, FiDroplet, FiAward } from 'react-icons/fi';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';

const BloodCard = ({ user }) => {
  const cardRef = useRef(null);
  const [qrCode, setQrCode] = useState('');

  // Generate QR Code
  useState(() => {
    const generateQR = async () => {
      try {
        const url = `${window.location.origin}/card/${user._id}`;
        const qr = await QRCode.toDataURL(url, {
          width: 150,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        setQrCode(qr);
      } catch (err) {
        console.error('Error generating QR code:', err);
      }
    };
    generateQR();
  }, [user._id]);

  const getBadgeColor = (level) => {
    switch(level) {
      case 'platinum': return 'bg-gradient-to-r from-purple-600 to-purple-800';
      case 'gold': return 'bg-gradient-to-r from-yellow-500 to-yellow-700';
      case 'silver': return 'bg-gradient-to-r from-gray-400 to-gray-600';
      default: return 'bg-gradient-to-r from-amber-600 to-amber-800';
    }
  };

  const downloadAsImage = async () => {
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: null
      });
      
      const link = document.createElement('a');
      link.download = `blood-card-${user.name.replace(/\s+/g, '-')}.png`;
      link.href = canvas.toDataURL();
      link.click();
      
      toast.success('Blood card downloaded as image!');
    } catch (error) {
      toast.error('Failed to download image');
    }
  };

  const downloadAsPDF = async () => {
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: null
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`blood-card-${user.name.replace(/\s+/g, '-')}.pdf`);
      
      toast.success('Blood card downloaded as PDF!');
    } catch (error) {
      toast.error('Failed to download PDF');
    }
  };

  const shareCard = () => {
    const url = `${window.location.origin}/card/${user._id}`;
    
    if (navigator.share) {
      navigator.share({
        title: `${user.name}'s Blood Card`,
        text: `View my blood donation card - Blood Type: ${user.bloodType}`,
        url: url
      }).catch(err => console.log('Error sharing:', err));
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Card link copied to clipboard!');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-4xl mx-auto"
    >
      {/* Card Container */}
      <div 
        ref={cardRef}
        className="bg-gradient-to-br from-red-600 via-red-700 to-red-800 rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Blood Donation Card
              </h2>
              <p className="text-red-100">
                Digital Identity for Life Savers
              </p>
            </div>
            <div className="flex items-center gap-2">
              <FiDroplet className="text-white text-3xl" />
              <span className="text-white font-bold text-2xl">BloodStream</span>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Personal Info */}
            <div className="md:col-span-2 bg-white/10 backdrop-blur-md rounded-xl p-6">
              <div className="flex items-start gap-4">
                {/* Profile Picture */}
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-4xl font-bold text-red-600">
                  {user.name?.charAt(0).toUpperCase()}
                </div>

                {/* Details */}
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-1">
                    {user.name}
                  </h3>
                  <p className="text-red-100 mb-3">
                    ID: #{user._id?.slice(-8).toUpperCase()}
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-red-200 text-sm">Blood Type</p>
                      <p className="text-3xl font-bold text-white">{user.bloodType}</p>
                    </div>
                    <div>
                      <p className="text-red-200 text-sm">Donations</p>
                      <p className="text-2xl font-bold text-white">{user.donationCount || 0}</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-red-200 text-sm mb-2">Badge Level</p>
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${getBadgeColor(user.badgeLevel)}`}>
                      <FiAward className="text-white" />
                      <span className="text-white font-semibold capitalize">
                        {user.badgeLevel} Donor
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/20">
                <div>
                  <p className="text-red-200 text-sm">Lives Saved</p>
                  <p className="text-xl font-bold text-white">
                    {(user.donationCount || 0) * 3}
                  </p>
                </div>
                <div>
                  <p className="text-red-200 text-sm">Member Since</p>
                  <p className="text-lg font-bold text-white">
                    {new Date(user.createdAt || Date.now()).getFullYear()}
                  </p>
                </div>
                <div>
                  <p className="text-red-200 text-sm">Status</p>
                  <p className="text-lg font-bold text-green-400">
                    Active
                  </p>
                </div>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="bg-white rounded-xl p-6 flex flex-col items-center justify-center">
              {qrCode && (
                <img src={qrCode} alt="QR Code" className="w-40 h-40 mb-4" />
              )}
              <p className="text-gray-600 text-sm text-center">
                Scan to verify and view full profile
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-white/20 flex justify-between items-center">
            <p className="text-red-100 text-sm">
              Valid until: {new Date(Date.now() + 365*24*60*60*1000).toLocaleDateString()}
            </p>
            <p className="text-red-100 text-sm">
              www.bloodstream.com
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-6 justify-center">
        <button
          onClick={downloadAsImage}
          className="btn-primary flex items-center gap-2"
        >
          <FiDownload /> Download as Image
        </button>
        <button
          onClick={downloadAsPDF}
          className="btn-secondary flex items-center gap-2"
        >
          <FiDownload /> Download as PDF
        </button>
        <button
          onClick={shareCard}
          className="btn-secondary flex items-center gap-2"
        >
          <FiShare2 /> Share Card
        </button>
      </div>
    </motion.div>
  );
};

export default BloodCard;
