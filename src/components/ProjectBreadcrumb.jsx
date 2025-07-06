import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiLightbulb, FiLayers, FiVideo, FiCheck, FiChevronRight, FiHome } = FiIcons;

const ProjectBreadcrumb = ({ project, currentPhase, className = '' }) => {
  const navigate = useNavigate();

  const phases = [
    {
      id: 'ideation',
      title: 'Ideation',
      icon: FiLightbulb,
      path: `/ideation/${project.id}`,
      color: 'text-blue-400'
    },
    {
      id: 'planning',
      title: 'Planning',
      icon: FiLayers,
      path: `/planning/${project.id}`,
      color: 'text-purple-400'
    },
    {
      id: 'shooting',
      title: 'Shooting',
      icon: FiVideo,
      path: `/shooting/${project.id}`,
      color: 'text-red-400'
    },
    {
      id: 'completed',
      title: 'Completed',
      icon: FiCheck,
      path: `/project/${project.id}`,
      color: 'text-green-400'
    }
  ];

  const getPhaseStatus = (phaseId) => {
    const currentPhaseIndex = phases.findIndex(p => p.id === project.phase);
    const phaseIndex = phases.findIndex(p => p.id === phaseId);
    
    if (phaseIndex < currentPhaseIndex) return 'completed';
    if (phaseIndex === currentPhaseIndex) return 'current';
    return 'upcoming';
  };

  const isAccessible = (phaseId) => {
    // Users can always go back to previous phases or current phase
    const currentPhaseIndex = phases.findIndex(p => p.id === project.phase);
    const phaseIndex = phases.findIndex(p => p.id === phaseId);
    return phaseIndex <= currentPhaseIndex;
  };

  const handlePhaseClick = (phase) => {
    if (!isAccessible(phase.id)) return;
    
    // Special handling for completed projects
    if (phase.id === 'completed' || project.phase === 'completed') {
      navigate(`/project/${project.id}`);
    } else {
      navigate(phase.path);
    }
  };

  return (
    <div className={`bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 ${className}`}>
      <div className="flex items-center space-x-2 text-sm">
        {/* Home Link */}
        <motion.button
          className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors"
          whileHover={{ scale: 1.05 }}
          onClick={() => navigate('/')}
        >
          <SafeIcon icon={FiHome} className="text-sm" />
          <span>Dashboard</span>
        </motion.button>

        <SafeIcon icon={FiChevronRight} className="text-gray-600 text-xs" />

        {/* Project Name */}
        <motion.button
          className="text-gray-300 hover:text-white transition-colors font-medium truncate max-w-32"
          whileHover={{ scale: 1.05 }}
          onClick={() => navigate(`/project/${project.id}`)}
          title={project.title}
        >
          {project.title}
        </motion.button>

        <SafeIcon icon={FiChevronRight} className="text-gray-600 text-xs" />

        {/* Phase Navigation */}
        <div className="flex items-center space-x-1">
          {phases.map((phase, index) => {
            const status = getPhaseStatus(phase.id);
            const accessible = isAccessible(phase.id);
            const isCurrent = phase.id === currentPhase;

            return (
              <div key={phase.id} className="flex items-center">
                <motion.button
                  className={`flex items-center space-x-1 px-2 py-1 rounded-lg transition-all ${
                    isCurrent
                      ? 'bg-white/10 text-white font-medium'
                      : accessible
                        ? `${phase.color} hover:bg-white/5`
                        : 'text-gray-600 cursor-not-allowed'
                  } ${
                    status === 'completed' ? 'opacity-80' : ''
                  }`}
                  whileHover={accessible ? { scale: 1.05 } : {}}
                  whileTap={accessible ? { scale: 0.95 } : {}}
                  onClick={() => handlePhaseClick(phase)}
                  disabled={!accessible}
                  title={`${phase.title} ${status === 'completed' ? '(Completed)' : status === 'current' ? '(Current)' : '(Upcoming)'}`}
                >
                  <SafeIcon
                    icon={status === 'completed' ? FiCheck : phase.icon}
                    className="text-sm"
                  />
                  <span className="hidden sm:inline">{phase.title}</span>
                </motion.button>

                {index < phases.length - 1 && (
                  <SafeIcon icon={FiChevronRight} className="text-gray-600 text-xs mx-1" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Phase Progress Indicator */}
      <div className="mt-3 flex items-center space-x-1">
        {phases.map((phase, index) => {
          const status = getPhaseStatus(phase.id);
          const accessible = isAccessible(phase.id);

          return (
            <div
              key={phase.id}
              className={`h-1 flex-1 rounded-full transition-all ${
                status === 'completed'
                  ? 'bg-green-500'
                  : status === 'current'
                    ? 'bg-blue-500'
                    : 'bg-gray-700'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ProjectBreadcrumb;