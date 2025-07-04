import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProject } from '../context/ProjectContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiEdit, FiTrash2, FiDownload, FiShare2, FiPlay, FiCheck, FiClock } = FiIcons;

const ProjectView = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { getProject, deleteProject } = useProject();
  const [project, setProject] = useState(null);

  useEffect(() => {
    const projectData = getProject(projectId);
    if (projectData) {
      setProject(projectData);
    } else {
      navigate('/');
    }
  }, [projectId, getProject, navigate]);

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      deleteProject(projectId);
      navigate('/');
    }
  };

  const handleContinue = () => {
    if (project.phase === 'ideation') {
      navigate('/ideation');
    } else if (project.phase === 'planning') {
      navigate(`/planning/${projectId}`);
    } else if (project.phase === 'shooting') {
      navigate(`/shooting/${projectId}`);
    }
  };

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-white mt-4">Loading project...</p>
        </div>
      </div>
    );
  }

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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Project Header */}
      <motion.div 
        className="bg-white/5 backdrop-blur-sm rounded-xl p-8 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-2">{project.title}</h1>
            <p className="text-gray-300 mb-4">{project.concept}</p>
            
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full bg-gradient-to-r ${getPhaseColor(project.phase)}`}>
                <SafeIcon icon={getPhaseIcon(project.phase)} className="text-white text-sm" />
                <span className="text-white text-sm font-medium capitalize">{project.phase}</span>
              </div>
              
              <span className="text-gray-400 text-sm">
                {project.type} • {project.duration}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {project.phase !== 'completed' && (
              <motion.button
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleContinue}
              >
                Continue
              </motion.button>
            )}
            
            <motion.button
              className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDelete}
            >
              <SafeIcon icon={FiTrash2} />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Project Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Basic Info */}
        <motion.div 
          className="bg-white/5 backdrop-blur-sm rounded-xl p-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h3 className="text-xl font-semibold text-white mb-4">Project Info</h3>
          <div className="space-y-3">
            <div>
              <span className="text-gray-400">Target Audience:</span>
              <p className="text-white">{project.target_audience}</p>
            </div>
            <div>
              <span className="text-gray-400">Tone:</span>
              <p className="text-white">{project.tone}</p>
            </div>
            <div>
              <span className="text-gray-400">Key Message:</span>
              <p className="text-white">{project.key_message}</p>
            </div>
          </div>
        </motion.div>

        {/* Timeline */}
        <motion.div 
          className="bg-white/5 backdrop-blur-sm rounded-xl p-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h3 className="text-xl font-semibold text-white mb-4">Timeline</h3>
          <div className="space-y-3">
            <div>
              <span className="text-gray-400">Created:</span>
              <p className="text-white">{new Date(project.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <span className="text-gray-400">Last Updated:</span>
              <p className="text-white">{new Date(project.updatedAt).toLocaleDateString()}</p>
            </div>
            {project.completed_at && (
              <div>
                <span className="text-gray-400">Completed:</span>
                <p className="text-white">{new Date(project.completed_at).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Story Structure */}
      {project.story_structure && (
        <motion.div 
          className="bg-white/5 backdrop-blur-sm rounded-xl p-6 mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-xl font-semibold text-white mb-4">Story Structure</h3>
          <div className="space-y-4">
            {project.story_structure.map((segment, index) => (
              <div key={index} className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-semibold text-white">{segment.title}</h4>
                <p className="text-gray-300">{segment.description}</p>
                <span className="text-sm text-gray-400">{segment.duration}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Shot List */}
      {project.shot_list && (
        <motion.div 
          className="bg-white/5 backdrop-blur-sm rounded-xl p-6 mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-xl font-semibold text-white mb-4">Shot List</h3>
          <div className="space-y-4">
            {project.shot_list.map((shot, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 bg-white/5 rounded-lg">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  project.completed_shots && project.completed_shots.includes(index) 
                    ? 'bg-green-500' 
                    : 'bg-gray-600'
                }`}>
                  {project.completed_shots && project.completed_shots.includes(index) ? (
                    <SafeIcon icon={FiCheck} className="text-white text-sm" />
                  ) : (
                    <span className="text-white text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white">{shot.title}</h4>
                  <p className="text-gray-300">{shot.description}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                    <span>{shot.type}</span>
                    <span>{shot.duration}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ProjectView;