import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProject } from '../context/ProjectContext';
import ProjectBreadcrumb from '../components/ProjectBreadcrumb';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiEdit, FiTrash2, FiDownload, FiShare2, FiPlay, FiCheck, FiClock, FiLightbulb, FiLayers, FiVideo } = FiIcons;

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
      navigate(`/ideation/${projectId}`);
    } else if (project.phase === 'planning') {
      navigate(`/planning/${projectId}`);
    } else if (project.phase === 'shooting') {
      navigate(`/shooting/${projectId}`);
    }
  };

  const handleEditIdeation = () => {
    navigate(`/ideation/${projectId}`);
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
      case 'ideation': return FiLightbulb;
      case 'planning': return FiLayers;
      case 'shooting': return FiVideo;
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
      {/* Breadcrumb Navigation */}
      <ProjectBreadcrumb 
        project={project} 
        currentPhase="overview"
        className="mb-6"
      />

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
            <motion.button
              className="px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleEditIdeation}
            >
              <SafeIcon icon={FiEdit} className="inline mr-2" />
              Edit Concept
            </motion.button>
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
              <p className="text-white">{project.target_audience || 'Not specified'}</p>
            </div>
            <div>
              <span className="text-gray-400">Tone:</span>
              <p className="text-white">{project.tone || 'Not specified'}</p>
            </div>
            <div>
              <span className="text-gray-400">Key Message:</span>
              <p className="text-white">{project.key_message || 'Not specified'}</p>
            </div>
            {project.unique_angle && (
              <div>
                <span className="text-gray-400">Unique Angle:</span>
                <p className="text-white">{project.unique_angle}</p>
              </div>
            )}
            {project.inspiration && (
              <div>
                <span className="text-gray-400">Inspiration:</span>
                <p className="text-white">{project.inspiration}</p>
              </div>
            )}
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
              <p className="text-white">{new Date(project.created_at).toLocaleDateString()}</p>
            </div>
            <div>
              <span className="text-gray-400">Last Updated:</span>
              <p className="text-white">{new Date(project.updated_at || project.created_at).toLocaleDateString()}</p>
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
      {project.story_structure && project.story_structure.length > 0 && (
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
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                  <span>{segment.duration}</span>
                  {segment.location && (
                    <>
                      <span>•</span>
                      <span>{segment.location}</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Resources */}
      {project.resources && Object.keys(project.resources).length > 0 && (
        <motion.div
          className="bg-white/5 backdrop-blur-sm rounded-xl p-6 mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-xl font-semibold text-white mb-4">Project Resources</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(project.resources).map(([category, items]) => (
              <div key={category} className="space-y-2">
                <h4 className="font-medium text-purple-400 capitalize">{category}</h4>
                <div className="space-y-1">
                  {items.filter(item => item.trim()).map((item, index) => (
                    <div key={index} className="text-sm text-gray-300 bg-white/5 rounded px-2 py-1">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div
        className="bg-white/5 backdrop-blur-sm rounded-xl p-6 mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.button
            className="flex flex-col items-center space-y-2 p-4 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-all"
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate(`/ideation/${projectId}`)}
          >
            <SafeIcon icon={FiLightbulb} className="text-blue-400 text-xl" />
            <span className="text-blue-400 text-sm font-medium">Edit Concept</span>
          </motion.button>
          
          <motion.button
            className="flex flex-col items-center space-y-2 p-4 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg transition-all"
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate(`/planning/${projectId}`)}
          >
            <SafeIcon icon={FiLayers} className="text-purple-400 text-xl" />
            <span className="text-purple-400 text-sm font-medium">Planning</span>
          </motion.button>
          
          <motion.button
            className="flex flex-col items-center space-y-2 p-4 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-all"
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate(`/shooting/${projectId}`)}
          >
            <SafeIcon icon={FiVideo} className="text-red-400 text-xl" />
            <span className="text-red-400 text-sm font-medium">Shooting</span>
          </motion.button>
          
          <motion.button
            className="flex flex-col items-center space-y-2 p-4 bg-gray-500/20 hover:bg-gray-500/30 rounded-lg transition-all"
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate('/')}
          >
            <SafeIcon icon={FiPlay} className="text-gray-400 text-xl" />
            <span className="text-gray-400 text-sm font-medium">Dashboard</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default ProjectView;