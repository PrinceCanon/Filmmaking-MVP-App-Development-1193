import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProject } from '../context/ProjectContext';
import CollaborationPanel from './CollaborationPanel';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiVideo, FiHome, FiArrowLeft, FiUsers, FiUser, FiLogOut } = FiIcons;

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useProject();
  const [showCollaboration, setShowCollaboration] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isHome = location.pathname === '/';
  const projectId = location.pathname.includes('/project/') || location.pathname.includes('/planning/') || location.pathname.includes('/shooting/') 
    ? location.pathname.split('/').pop() 
    : null;

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
  };

  if (!user) return null;

  return (
    <>
      <motion.header 
        className="bg-black/20 backdrop-blur-lg border-b border-white/10 sticky top-0 z-40"
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
              {/* Collaboration Button - only show on project pages */}
              {projectId && (
                <motion.button
                  className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCollaboration(true)}
                >
                  <SafeIcon icon={FiUsers} className="text-white" />
                  <span className="text-white">Team</span>
                </motion.button>
              )}

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

              {/* User Menu */}
              <div className="relative">
                <motion.button
                  className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <SafeIcon icon={FiUser} className="text-white" />
                  <span className="text-white">{user.email}</span>
                </motion.button>

                {showUserMenu && (
                  <motion.div
                    className="absolute right-0 top-full mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-white/10 overflow-hidden"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center space-x-2 px-4 py-3 text-white hover:bg-white/10 transition-colors"
                    >
                      <SafeIcon icon={FiLogOut} />
                      <span>Sign Out</span>
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Collaboration Panel */}
      <CollaborationPanel
        projectId={projectId}
        isOpen={showCollaboration}
        onClose={() => setShowCollaboration(false)}
      />

      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </>
  );
};

export default Header;