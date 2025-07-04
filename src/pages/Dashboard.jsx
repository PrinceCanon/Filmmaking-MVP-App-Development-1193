import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProject } from '../context/ProjectContext';
import ProjectCard from '../components/ProjectCard';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiPlus, FiFilm, FiEdit3, FiCamera, FiFolder } = FiIcons;

const Dashboard = () => {
  const navigate = useNavigate();
  const { projects } = useProject();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  const phases = [
    {
      title: 'Ideation',
      description: 'Brainstorm and develop your video concepts',
      icon: FiEdit3,
      color: 'from-blue-500 to-purple-500',
      path: '/ideation'
    },
    {
      title: 'Planning',
      description: 'Structure your story and create shot lists',
      icon: FiFolder,
      color: 'from-purple-500 to-pink-500',
      disabled: true
    },
    {
      title: 'Shooting',
      description: 'Capture your footage with guided prompts',
      icon: FiCamera,
      color: 'from-pink-500 to-red-500',
      disabled: true
    }
  ];

  return (
    <motion.div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero Section */}
      <motion.div 
        className="text-center mb-12"
        variants={itemVariants}
      >
        <h1 className="text-5xl font-bold text-white mb-4">
          Create Amazing Videos
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Your complete filmmaking companion - from idea to final cut. 
          Get guided through every step with smart prompts and professional workflows.
        </p>
      </motion.div>

      {/* Quick Start */}
      <motion.div 
        className="mb-12"
        variants={itemVariants}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Quick Start</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {phases.map((phase, index) => (
            <motion.div
              key={phase.title}
              className={`relative p-6 rounded-xl bg-gradient-to-br ${phase.color} ${
                phase.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'
              } transition-all duration-300`}
              whileHover={!phase.disabled ? { scale: 1.05 } : {}}
              whileTap={!phase.disabled ? { scale: 0.95 } : {}}
              onClick={() => !phase.disabled && navigate(phase.path)}
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="bg-white/20 p-3 rounded-lg">
                  <SafeIcon icon={phase.icon} className="text-white text-2xl" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">{phase.title}</h3>
                  {phase.disabled && (
                    <span className="text-xs text-white/60">Start with ideation</span>
                  )}
                </div>
              </div>
              <p className="text-white/80">{phase.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Projects */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Your Projects</h2>
          <motion.button
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/ideation')}
          >
            <SafeIcon icon={FiPlus} />
            <span>New Project</span>
          </motion.button>
        </div>

        {projects.length === 0 ? (
          <motion.div 
            className="text-center py-12 bg-white/5 rounded-xl backdrop-blur-sm"
            variants={itemVariants}
          >
            <SafeIcon icon={FiFilm} className="text-6xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No projects yet</h3>
            <p className="text-gray-400 mb-6">Start your filmmaking journey by creating your first project</p>
            <motion.button
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/ideation')}
            >
              Create Your First Project
            </motion.button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;