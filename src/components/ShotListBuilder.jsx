import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import ImageUpload from './ImageUpload';
import ShotVisualization from './ShotVisualization';
import { InfoTooltip } from './Tooltip';
import supabase from '../lib/supabase';
import { useProject } from '../context/ProjectContext';
import * as FiIcons from 'react-icons/fi';

const { FiPlus, FiTrash2, FiCamera, FiEdit2, FiMove, FiCopy, FiEye, FiGrid } = FiIcons;

const ShotListBuilder = ({ project, onDataUpdate }) => {
  const { user } = useProject();
  const [shots, setShots] = useState([]);
  const [showVisualization, setShowVisualization] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newShot, setNewShot] = useState({
    title: '',
    shot_type: 'Wide Shot',
    description: '',
    duration: '30 seconds',
    location: '',
    notes: '',
    priority: 'Medium',
    scene_number: 1
  });

  const shotTypes = [
    'Wide Shot',
    'Medium Shot', 
    'Close-up',
    'Extreme Close-up',
    'Over-the-shoulder',
    'POV Shot',
    'Establishing Shot',
    'Cutaway',
    'B-Roll',
    'Talking Head'
  ];

  const priorities = ['High', 'Medium', 'Low'];

  useEffect(() => {
    if (project?.id) {
      loadShots();
    }
  }, [project?.id]);

  const loadShots = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('shot_lists_fc2024')
        .select('*')
        .eq('project_id', project.id)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setShots(data || []);
    } catch (error) {
      console.error('Error loading shots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddShot = async () => {
    if (!newShot.title.trim() || !user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('shot_lists_fc2024')
        .insert([{
          ...newShot,
          project_id: project.id,
          order_index: shots.length + 1,
          status: 'pending'
        }])
        .select()
        .single();

      if (error) throw error;

      setShots(prev => [...prev, data]);
      setNewShot({
        title: '',
        shot_type: 'Wide Shot',
        description: '',
        duration: '30 seconds',
        location: '',
        notes: '',
        priority: 'Medium',
        scene_number: 1
      });
    } catch (error) {
      console.error('Error adding shot:', error);
      alert('Failed to add shot. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateShot = async (shotId, updates) => {
    try {
      const { data, error } = await supabase
        .from('shot_lists_fc2024')
        .update(updates)
        .eq('id', shotId)
        .select()
        .single();

      if (error) throw error;

      setShots(prev => prev.map(shot => 
        shot.id === shotId ? data : shot
      ));
    } catch (error) {
      console.error('Error updating shot:', error);
    }
  };

  const removeShot = async (shotId) => {
    try {
      const { error } = await supabase
        .from('shot_lists_fc2024')
        .delete()
        .eq('id', shotId);

      if (error) throw error;

      setShots(prev => prev.filter(shot => shot.id !== shotId));
    } catch (error) {
      console.error('Error removing shot:', error);
    }
  };

  const duplicateShot = async (shotToDuplicate) => {
    try {
      const { data, error } = await supabase
        .from('shot_lists_fc2024')
        .insert([{
          ...shotToDuplicate,
          id: undefined,
          title: `${shotToDuplicate.title} (Copy)`,
          order_index: shots.length + 1,
          status: 'pending',
          image_url: null // Don't duplicate the image
        }])
        .select()
        .single();

      if (error) throw error;

      setShots(prev => [...prev, data]);
    } catch (error) {
      console.error('Error duplicating shot:', error);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'Medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const locations = project?.locations || [];

  if (loading && shots.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
        <p className="text-gray-400 mt-2">Loading shots...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
        <h4 className="text-lg font-semibold text-white mb-2">Shot List Planning Tips</h4>
        <ul className="text-purple-300 text-sm space-y-1">
          <li>• Plan your shots based on your story structure</li>
          <li>• Include variety: wide shots, medium shots, and close-ups</li>
          <li>• Upload reference images to visualize your shots</li>
          <li>• Use the visualization tools to organize by scene or location</li>
        </ul>
      </div>

      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-white">Shot List ({shots.length} shots)</h4>
        <div className="flex items-center space-x-2">
          <motion.button
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
              showVisualization 
                ? 'bg-purple-500 text-white' 
                : 'bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white'
            }`}
            whileHover={{ scale: 1.05 }}
            onClick={() => setShowVisualization(!showVisualization)}
          >
            <SafeIcon icon={FiGrid} />
            <span className="text-sm">Visualize</span>
          </motion.button>
        </div>
      </div>

      {/* Visualization View */}
      {showVisualization ? (
        <ShotVisualization 
          shots={shots} 
          onShotUpdate={updateShot}
          scenes={project?.story_structure || []}
        />
      ) : (
        <>
          {/* Add New Shot Form */}
          <motion.div
            className="bg-white/5 border border-white/10 rounded-lg p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
              <SafeIcon icon={FiCamera} className="mr-2" />
              Add New Shot
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="flex items-center space-x-2 text-sm text-gray-300 mb-2">
                  <span>Shot Title</span>
                  <InfoTooltip content="Give your shot a descriptive name" />
                </label>
                <input
                  type="text"
                  value={newShot.title}
                  onChange={(e) => setNewShot({ ...newShot, title: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Opening wide shot of city"
                />
              </div>

              <div>
                <label className="flex items-center space-x-2 text-sm text-gray-300 mb-2">
                  <span>Shot Type</span>
                  <InfoTooltip content="Select the camera angle and framing for this shot" />
                </label>
                <select
                  value={newShot.shot_type}
                  onChange={(e) => setNewShot({ ...newShot, shot_type: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {shotTypes.map(type => (
                    <option key={type} value={type} className="bg-gray-800">{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center space-x-2 text-sm text-gray-300 mb-2">
                  <span>Duration</span>
                  <InfoTooltip content="Estimated time for this shot in your final video" />
                </label>
                <select
                  value={newShot.duration}
                  onChange={(e) => setNewShot({ ...newShot, duration: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="15 seconds">15 seconds</option>
                  <option value="30 seconds">30 seconds</option>
                  <option value="1 minute">1 minute</option>
                  <option value="2 minutes">2 minutes</option>
                  <option value="3 minutes">3 minutes</option>
                  <option value="5 minutes">5 minutes</option>
                </select>
              </div>

              <div>
                <label className="flex items-center space-x-2 text-sm text-gray-300 mb-2">
                  <span>Priority</span>
                  <InfoTooltip content="How important is this shot? High priority shots are must-haves" />
                </label>
                <select
                  value={newShot.priority}
                  onChange={(e) => setNewShot({ ...newShot, priority: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {priorities.map(priority => (
                    <option key={priority} value={priority} className="bg-gray-800">{priority}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center space-x-2 text-sm text-gray-300 mb-2">
                  <span>Scene Number</span>
                  <InfoTooltip content="Which scene does this shot belong to?" />
                </label>
                <input
                  type="number"
                  min="1"
                  value={newShot.scene_number}
                  onChange={(e) => setNewShot({ ...newShot, scene_number: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="1"
                />
              </div>

              <div>
                <label className="flex items-center space-x-2 text-sm text-gray-300 mb-2">
                  <span>Location</span>
                  <InfoTooltip content="Where will you film this shot?" />
                </label>
                <select
                  value={newShot.location}
                  onChange={(e) => setNewShot({ ...newShot, location: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select location...</option>
                  {locations.map(location => (
                    <option key={location.id} value={location.name} className="bg-gray-800">
                      {location.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="flex items-center space-x-2 text-sm text-gray-300 mb-2">
                  <span>Shot Description</span>
                  <InfoTooltip content="Describe what happens in this shot, camera movement, etc." />
                </label>
                <textarea
                  value={newShot.description}
                  onChange={(e) => setNewShot({ ...newShot, description: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  rows={3}
                  placeholder="Describe the shot: camera angle, movement, what's happening..."
                />
              </div>

              <div>
                <label className="flex items-center space-x-2 text-sm text-gray-300 mb-2">
                  <span>Additional Notes</span>
                  <InfoTooltip content="Any special requirements, equipment needed, or reminders" />
                </label>
                <textarea
                  value={newShot.notes}
                  onChange={(e) => setNewShot({ ...newShot, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  rows={2}
                  placeholder="Special equipment, lighting notes, reminders..."
                />
              </div>
            </div>

            <motion.button
              className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              onClick={handleAddShot}
              disabled={loading || !newShot.title.trim()}
            >
              <SafeIcon icon={FiPlus} className="inline mr-2" />
              {loading ? 'Adding Shot...' : 'Add Shot'}
            </motion.button>
          </motion.div>

          {/* Shot List */}
          <div className="space-y-4">
            {shots.map((shot, index) => (
              <motion.div
                key={shot.id}
                className="bg-white/5 border border-white/10 rounded-lg p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Shot Image */}
                  <div className="space-y-3">
                    <label className="text-sm text-gray-300">Reference Image</label>
                    <ImageUpload
                      onImageUploaded={(url) => updateShot(shot.id, { image_url: url })}
                      currentImage={shot.image_url}
                      shotId={shot.id}
                    />
                  </div>

                  {/* Shot Details */}
                  <div className="lg:col-span-3 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                          {shot.order_index}
                        </div>
                        <div className="flex-1">
                          <input
                            type="text"
                            value={shot.title || `Shot ${shot.order_index}`}
                            onChange={(e) => updateShot(shot.id, { title: e.target.value })}
                            className="text-lg font-semibold bg-transparent text-white border-none focus:outline-none focus:ring-0 p-0 w-full"
                            placeholder="Shot title..."
                          />
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`px-2 py-1 rounded-full text-xs border ${getPriorityColor(shot.priority)}`}>
                              {shot.priority}
                            </span>
                            <span className="text-gray-400 text-sm">{shot.shot_type}</span>
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
                      <div className="flex items-center space-x-2">
                        <motion.button
                          className="p-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg transition-all"
                          whileHover={{ scale: 1.05 }}
                          onClick={() => duplicateShot(shot)}
                        >
                          <SafeIcon icon={FiCopy} className="text-green-400" />
                        </motion.button>
                        <motion.button
                          className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-all"
                          whileHover={{ scale: 1.05 }}
                          onClick={() => removeShot(shot.id)}
                        >
                          <SafeIcon icon={FiTrash2} className="text-red-400" />
                        </motion.button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <select
                        value={shot.shot_type}
                        onChange={(e) => updateShot(shot.id, { shot_type: e.target.value })}
                        className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        {shotTypes.map(type => (
                          <option key={type} value={type} className="bg-gray-800">{type}</option>
                        ))}
                      </select>

                      <select
                        value={shot.duration}
                        onChange={(e) => updateShot(shot.id, { duration: e.target.value })}
                        className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="15 seconds">15 seconds</option>
                        <option value="30 seconds">30 seconds</option>
                        <option value="1 minute">1 minute</option>
                        <option value="2 minutes">2 minutes</option>
                        <option value="3 minutes">3 minutes</option>
                        <option value="5 minutes">5 minutes</option>
                      </select>

                      <select
                        value={shot.priority}
                        onChange={(e) => updateShot(shot.id, { priority: e.target.value })}
                        className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        {priorities.map(priority => (
                          <option key={priority} value={priority} className="bg-gray-800">{priority}</option>
                        ))}
                      </select>
                    </div>

                    <textarea
                      value={shot.description}
                      onChange={(e) => updateShot(shot.id, { description: e.target.value })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      rows={2}
                      placeholder="Shot description..."
                    />

                    <textarea
                      value={shot.notes}
                      onChange={(e) => updateShot(shot.id, { notes: e.target.value })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      rows={2}
                      placeholder="Additional notes..."
                    />
                  </div>
                </div>
              </motion.div>
            ))}

            {shots.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <SafeIcon icon={FiCamera} className="text-4xl mx-auto mb-4 opacity-50" />
                <p>No shots added yet. Create your first shot above!</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ShotListBuilder;