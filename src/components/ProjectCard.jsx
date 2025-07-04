import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiEdit, FiClock, FiPlay, FiCheck, FiEye } = FiIcons;

const ProjectCard = ({ project, index }) => {
  const navigate = useNavigate();

  const getPhaseIcon = (phase) => {
    switch (phase) {
      case 'ideation': return FiEdit;
      case 'planning': return FiClock;
      case 'shooting': return FiPlay;
      case 'completed': return FiCheck;
      default: return FiEdit;
    }
  };

  const getPhaseColor = (phase) => {
    switch (phase) {
      case 'ideation': return 'from-blue-500 to-purple-500';
      case 'planning': return 'from-purple-500 to-pink-500';
      case 'shooting': return 'from-pink-500 to-red-500';
      case 'completed': return 'from-green-500 to-blue-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const handleContinue = (e) => {
    e.stopPropagation();
    if (project.phase === 'ideation') {
      navigate('/ideation');
    } else if (project.phase === 'planning') {
      navigate(`/planning/${project.id}`);
    } else if (project.phase === 'shooting') {
      navigate(`/shooting/${project.id}`);
    }
  };

  return (
    <motion.div
      className="bg-white/5 backdrop-blur-sm rounded-xl p-6 cursor-pointer hover:bg-white/10 transition-all border border-white/10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      onClick={() => navigate(`/project/${project.id}`)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-2">{project.title}</h3>
          <p className="text-gray-300 text-sm line-clamp-2">{project.concept}</p>
        </div>
        
        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full bg-gradient-to-r ${getPhaseColor(project.phase)}`}>
          <SafeIcon icon={getPhaseIcon(project.phase)} className="text-white text-xs" />
          <span className="text-white text-xs font-medium capitalize">{project.phase}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 text-sm text-gray-400">
          <span>{project.type}</span>
          <span>{project.duration}</span>
        </div>

        <div className="flex items-center space-x-2">
          <motion.button
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/project/${project.id}`);
            }}
          >
            <SafeIcon icon={FiEye} className="text-white text-sm" />
          </motion.button>
          
          {project.phase !== 'completed' && (
            <motion.button
              className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg text-sm transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleContinue}
            >
              Continue
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectCard;