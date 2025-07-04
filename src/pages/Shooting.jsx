import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProject } from '../context/ProjectContext';
import ShootingPrompts from '../components/ShootingPrompts';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiCamera, FiCheck, FiPlay, FiPause, FiRotateCcw, FiEdit2, FiFilter } = FiIcons;

const Shooting = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { getProject, updateProject } = useProject();
  const [project, setProject] = useState(null);
  const [currentShot, setCurrentShot] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [completedShots, setCompletedShots] = useState(new Set());
  const [filterBy, setFilterBy] = useState('all'); // all, pending, completed
  const [sortBy, setSortBy] = useState('order'); // order, priority, location

  useEffect(() => {
    const projectData = getProject(projectId);
    if (projectData) {
      setProject(projectData);
      if (projectData.completed_shots) {
        setCompletedShots(new Set(projectData.completed_shots));
      }
    } else {
      navigate('/');
    }
  }, [projectId, getProject, navigate]);

  const handleShotComplete = (shotIndex) => {
    const newCompletedShots = new Set(completedShots);
    newCompletedShots.add(shotIndex);
    setCompletedShots(newCompletedShots);
    
    updateProject(projectId, {
      completed_shots: Array.from(newCompletedShots)
    });
  };

  const handleRetakeShot = (shotIndex) => {
    const newCompletedShots = new Set(completedShots);
    newCompletedShots.delete(shotIndex);
    setCompletedShots(newCompletedShots);
    
    updateProject(projectId, {
      completed_shots: Array.from(newCompletedShots)
    });
  };

  const handleShotEdit = (shotId, updates) => {
    const shotList = project.shot_list || [];
    const updatedShotList = shotList.map(shot =>
      shot.id === shotId ? { ...shot, ...updates } : shot
    );
    
    updateProject(projectId, { shot_list: updatedShotList });
    setProject({ ...project, shot_list: updatedShotList });
  };

  const handleComplete = () => {
    updateProject(projectId, { 
      phase: 'completed',
      completed_at: new Date().toISOString()
    });
    navigate(`/project/${projectId}`);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const getFilteredAndSortedShots = () => {
    let shots = project.shot_list || [];
    
    // Filter
    if (filterBy === 'pending') {
      shots = shots.filter((_, index) => !completedShots.has(index));
    } else if (filterBy === 'completed') {
      shots = shots.filter((_, index) => completedShots.has(index));
    }
    
    // Sort
    if (sortBy === 'priority') {
      const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
      shots.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
    } else if (sortBy === 'location') {
      shots.sort((a, b) => (a.location || '').localeCompare(b.location || ''));
    }
    // Default is 'order' which maintains original order
    
    return shots;
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

  const shotList = getFilteredAndSortedShots();
  const totalShots = project.shot_list?.length || 0;
  const completedCount = completedShots.size;
  const progress = totalShots > 0 ? (completedCount / totalShots) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Project Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">{project.title}</h1>
        <p className="text-gray-300">Shooting Phase</p>
        
        {/* Progress */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Progress</span>
            <span className="text-sm text-gray-400">{completedCount}/{totalShots} shots</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Recording Controls */}
      <motion.div 
        className="bg-white/5 backdrop-blur-sm rounded-xl p-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <motion.button
              className={`flex items-center justify-center w-16 h-16 rounded-full transition-all ${
                isRecording 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleRecording}
            >
              <SafeIcon 
                icon={isRecording ? FiPause : FiPlay} 
                className="text-white text-2xl" 
              />
            </motion.button>
            
            <div>
              <h3 className="text-lg font-semibold text-white">
                {isRecording ? 'Recording...' : 'Ready to Record'}
              </h3>
              <p className="text-gray-400">
                {isRecording ? 'Tap to pause recording' : 'Tap to start recording'}
              </p>
            </div>
          </div>

          {isRecording && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-400 font-medium">REC</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Filters and Sort */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <SafeIcon icon={FiFilter} className="text-gray-400" />
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Shots</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="order">Sort by Order</option>
            <option value="priority">Sort by Priority</option>
            <option value="location">Sort by Location</option>
          </select>
        </div>
        
        <div className="text-sm text-gray-400">
          Showing {shotList.length} of {totalShots} shots
        </div>
      </div>

      {/* Shot List */}
      <div className="space-y-4">
        {shotList.map((shot, index) => {
          const originalIndex = project.shot_list.findIndex(s => s.id === shot.id);
          const isCompleted = completedShots.has(originalIndex);
          
          return (
            <motion.div
              key={shot.id}
              className={`bg-white/5 backdrop-blur-sm rounded-xl p-6 border-2 transition-all ${
                isCompleted 
                  ? 'border-green-500/50 bg-green-500/10' 
                  : currentShot === originalIndex 
                  ? 'border-purple-500/50 bg-purple-500/10' 
                  : 'border-transparent'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-600'
                    }`}>
                      {isCompleted ? (
                        <SafeIcon icon={FiCheck} className="text-white text-sm" />
                      ) : (
                        <span className="text-white text-sm font-medium">{shot.order}</span>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <input
                        type="text"
                        value={shot.title || `Shot ${shot.order}`}
                        onChange={(e) => handleShotEdit(shot.id, { title: e.target.value })}
                        className="text-lg font-semibold bg-transparent text-white border-none focus:outline-none focus:ring-0 p-0 w-full"
                        placeholder="Shot title..."
                      />
                      
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs border ${
                          shot.priority === 'High' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                          shot.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                          'bg-green-500/20 text-green-400 border-green-500/30'
                        }`}>
                          {shot.priority}
                        </span>
                        <span className="text-gray-400 text-sm">{shot.type}</span>
                        <span className="text-gray-400 text-sm">•</span>
                        <span className="text-gray-400 text-sm">{shot.duration}</span>
                        {shot.location && (
                          <>
                            <span className="text-gray-400 text-sm">•</span>
                            <span className="text-gray-400 text-sm">{shot.location}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    <textarea
                      value={shot.description}
                      onChange={(e) => handleShotEdit(shot.id, { description: e.target.value })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      rows={2}
                      placeholder="Shot description..."
                    />
                    
                    {shot.notes && (
                      <textarea
                        value={shot.notes}
                        onChange={(e) => handleShotEdit(shot.id, { notes: e.target.value })}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        rows={2}
                        placeholder="Additional notes..."
                      />
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  {isCompleted ? (
                    <motion.button
                      className="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleRetakeShot(originalIndex)}
                    >
                      <SafeIcon icon={FiRotateCcw} className="text-sm" />
                      <span>Retake</span>
                    </motion.button>
                  ) : (
                    <motion.button
                      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleShotComplete(originalIndex)}
                    >
                      <SafeIcon icon={FiCheck} className="text-sm" />
                      <span>Complete</span>
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}

        {shotList.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <SafeIcon icon={FiCamera} className="text-4xl mx-auto mb-4 opacity-50" />
            <p>No shots match your current filter.</p>
          </div>
        )}
      </div>

      {/* Shooting Prompts */}
      <ShootingPrompts 
        project={project}
        currentShot={currentShot}
        isRecording={isRecording}
      />

      {/* Complete Button */}
      {completedCount === totalShots && totalShots > 0 && (
        <motion.div 
          className="mt-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.button
            className="px-8 py-4 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-lg font-semibold text-lg transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleComplete}
          >
            Complete Project
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};

export default Shooting;