import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { FiSun, FiMoon, FiMenu, FiX, FiDroplet, FiUser, FiLogOut } from 'react-icons/fi';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'donor': return '/donor-dashboard';
      case 'recipient': return '/recipient-dashboard';
      case 'delivery': return '/delivery-dashboard';
      case 'admin': return '/admin-dashboard';
      default: return '/';
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-[100]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <FiDroplet className="text-red-600 text-2xl" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                BloodStream
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-red-600 px-3 py-2">
              Home
            </Link>
            <Link to="/leaderboard" className="text-gray-700 dark:text-gray-300 hover:text-red-600 px-3 py-2">
              Leaderboard
            </Link>
            
            {user ? (
              <>
                <Link to={getDashboardLink()} className="text-gray-700 dark:text-gray-300 hover:text-red-600 px-3 py-2">
                  Dashboard
                </Link>
                <div className="flex items-center space-x-2 ml-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {user.name}
                  </span>
                  <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                    {user.role}
                  </span>
                  <button
                    onClick={logout}
                    className="p-2 text-gray-700 dark:text-gray-300 hover:text-red-600"
                  >
                    <FiLogOut />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login" className="btn-secondary">
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Register
                </Link>
              </div>
            )}

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {theme === 'light' ? <FiMoon /> : <FiSun />}
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-700 dark:text-gray-300"
            >
              {theme === 'light' ? <FiMoon /> : <FiSun />}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-gray-700 dark:text-gray-300"
            >
              {isMenuOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-gray-800 border-t dark:border-gray-700"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/"
                className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-red-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/leaderboard"
                className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-red-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Leaderboard
              </Link>
              
              {user ? (
                <>
                  <Link
                    to={getDashboardLink()}
                    className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-red-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-red-600"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-red-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-red-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
