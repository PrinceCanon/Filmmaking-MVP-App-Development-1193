import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiVideo, FiHome, FiArrowLeft } = FiIcons;

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <motion.header 
      className="bg-black/20 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <motion.div 
            className="flex items-center space-x-3 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate('/')}
          >
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-xl">
              <SafeIcon icon={FiVideo} className="text-white text-xl" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              FilmCraft
            </span>
          </motion.div>

          <div className="flex items-center space-x-4">
            {!isHome && (
              <motion.button
                className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(-1)}
              >
                <SafeIcon icon={FiArrowLeft} className="text-white" />
                <span className="text-white">Back</span>
              </motion.button>
            )}
            
            <motion.button
              className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/')}
            >
              <SafeIcon icon={FiHome} className="text-white" />
              <span className="text-white">Home</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;