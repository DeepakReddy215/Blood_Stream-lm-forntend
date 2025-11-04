import { motion } from 'framer-motion';
import { FiDroplet } from 'react-icons/fi';

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="text-red-600"
      >
        <FiDroplet size={48} />
      </motion.div>
    </div>
  );
};

export default LoadingSpinner;
