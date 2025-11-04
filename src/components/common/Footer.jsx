import { FiDroplet, FiHeart, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <FiDroplet className="text-red-500 text-2xl" />
              <span className="text-xl font-bold">BloodStream</span>
            </div>
            <p className="text-gray-400">
              Connecting donors with those in need, saving lives one donation at a time.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link to="/" className="hover:text-red-500 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/leaderboard" className="hover:text-red-500 transition-colors">
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-red-500 transition-colors">
                  Become a Donor
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-center space-x-2">
                <FiMail className="text-red-500" />
                <span>support@bloodstream.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <FiPhone className="text-red-500" />
                <span>+91 80 1234 5678</span>
              </li>
              <li className="flex items-center space-x-2">
                <FiMapPin className="text-red-500" />
                <span>Bengaluru, Karnataka</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Emergency</h3>
            <p className="text-gray-400 mb-4">
              24/7 Emergency Blood Request Hotline
            </p>
            <p className="text-2xl font-bold text-red-500">
              104
            </p>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p className="flex items-center justify-center">
            Made with <FiHeart className="text-red-500 mx-1" /> for College Project
          </p>
          <p className="mt-2">© 2024 BloodStream. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
