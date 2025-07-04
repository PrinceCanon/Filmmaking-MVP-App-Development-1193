import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import ShotListBuilder from './ShotListBuilder';
import LocationMap from './LocationMap';
import * as FiIcons from 'react-icons/fi';

const { FiPlus, FiTrash2, FiEdit3, FiMapPin, FiClock, FiUsers, FiEdit2 } = FiIcons;

const PlanningPrompts = ({ step, project, onDataUpdate }) => {
  const [newItem, setNewItem] = useState('');
  const [editingItem, setEditingItem] = useState(null);

  const handleAddStorySegment = () => {
    if (!newItem.trim()) return;
    
    const segments = project.story_structure || [];
    const newSegment = {
      id: Date.now(),
      title: newItem,
      description: '',
      duration: '30 seconds'
    };
    
    onDataUpdate({ story_structure: [...segments, newSegment] });
    setNewItem('');
  };

  const handleAddLocation = () => {
    if (!newItem.trim()) return;
    
    const locations = project.locations || [];
    const newLocation = {
      id: Date.now(),
      name: newItem,
      type: 'Indoor',
      notes: '',
      equipment_needed: [],
      coordinates: null,
      address: ''
    };
    
    onDataUpdate({ locations: [...locations, newLocation] });
    setNewItem('');
  };

  const handleAddTimelineItem = () => {
    if (!newItem.trim()) return;
    
    const timeline = project.timeline || [];
    const newTimelineItem = {
      id: Date.now(),
      task: newItem,
      date: new Date().toISOString().split('T')[0],
      duration: '1 hour',
      status: 'pending'
    };
    
    onDataUpdate({ timeline: [...timeline, newTimelineItem] });
    setNewItem('');
  };

  const handleUpdateResources = (category, items) => {
    const resources = project.resources || {};
    onDataUpdate({ resources: { ...resources, [category]: items } });
  };

  const removeItem = (listKey, itemId) => {
    const items = project[listKey] || [];
    onDataUpdate({ [listKey]: items.filter(item => item.id !== itemId) });
  };

  const updateItem = (listKey, itemId, updates) => {
    const items = project[listKey] || [];
    onDataUpdate({ 
      [listKey]: items.map(item => 
        item.id === itemId ? { ...item, ...updates } : item
      )
    });
  };

  const renderStoryStructure = () => (
    <div className="space-y-6">
      <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
        <h4 className="text-lg font-semibold text-white mb-2">Story Structure Tips</h4>
        <ul className="text-purple-300 text-sm space-y-1">
          <li>• Start with a hook to grab attention</li>
          <li>• Build your story with clear beginning, middle, and end</li>
          <li>• Include transitions between segments</li>
          <li>• End with a call-to-action or memorable conclusion</li>
        </ul>
      </div>

      <div className="space-y-4">
        {(project.story_structure || []).map((segment, index) => (
          <motion.div
            key={segment.id}
            className="bg-white/5 border border-white/10 rounded-lg p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <input
                    type="text"
                    value={segment.title}
                    onChange={(e) => updateItem('story_structure', segment.id, { title: e.target.value })}
                    className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Segment title..."
                  />
                </div>
                <textarea
                  value={segment.description}
                  onChange={(e) => updateItem('story_structure', segment.id, { description: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  rows={3}
                  placeholder="Describe what happens in this segment..."
                />
                <select
                  value={segment.duration}
                  onChange={(e) => updateItem('story_structure', segment.id, { duration: e.target.value })}
                  className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="15 seconds">15 seconds</option>
                  <option value="30 seconds">30 seconds</option>
                  <option value="1 minute">1 minute</option>
                  <option value="2 minutes">2 minutes</option>
                  <option value="3 minutes">3 minutes</option>
                  <option value="5 minutes">5 minutes</option>
                </select>
              </div>
              <motion.button
                className="ml-4 p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-all"
                whileHover={{ scale: 1.05 }}
                onClick={() => removeItem('story_structure', segment.id)}
              >
                <SafeIcon icon={FiTrash2} className="text-red-400" />
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center space-x-3">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddStorySegment()}
          placeholder="Add a new story segment..."
          className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <motion.button
          className="px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all"
          whileHover={{ scale: 1.05 }}
          onClick={handleAddStorySegment}
        >
          <SafeIcon icon={FiPlus} />
        </motion.button>
      </div>
    </div>
  );

  const renderLocations = () => (
    <div className="space-y-6">
      <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
        <h4 className="text-lg font-semibold text-white mb-2">Location Planning Tips</h4>
        <ul className="text-purple-300 text-sm space-y-1">
          <li>• Scout locations in advance</li>
          <li>• Consider lighting conditions at different times</li>
          <li>• Check for background noise and distractions</li>
          <li>• Ensure you have permission to film</li>
        </ul>
      </div>

      <div className="space-y-4">
        {(project.locations || []).map((location) => (
          <motion.div
            key={location.id}
            className="bg-white/5 border border-white/10 rounded-lg p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-3">
                <input
                  type="text"
                  value={location.name}
                  onChange={(e) => updateItem('locations', location.id, { name: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Location name..."
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <select
                    value={location.type}
                    onChange={(e) => updateItem('locations', location.id, { type: e.target.value })}
                    className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Indoor">Indoor</option>
                    <option value="Outdoor">Outdoor</option>
                    <option value="Studio">Studio</option>
                    <option value="Public">Public Space</option>
                    <option value="Private">Private Property</option>
                  </select>
                  <input
                    type="text"
                    value={location.address || ''}
                    onChange={(e) => updateItem('locations', location.id, { address: e.target.value })}
                    className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Address or description..."
                  />
                </div>
                <textarea
                  value={location.notes}
                  onChange={(e) => updateItem('locations', location.id, { notes: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  rows={2}
                  placeholder="Notes about this location..."
                />
                
                {/* Map Component */}
                <LocationMap 
                  location={location}
                  onLocationUpdate={(updates) => updateItem('locations', location.id, updates)}
                />
              </div>
              <motion.button
                className="ml-4 p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-all"
                whileHover={{ scale: 1.05 }}
                onClick={() => removeItem('locations', location.id)}
              >
                <SafeIcon icon={FiTrash2} className="text-red-400" />
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center space-x-3">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddLocation()}
          placeholder="Add a filming location..."
          className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <motion.button
          className="px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all"
          whileHover={{ scale: 1.05 }}
          onClick={handleAddLocation}
        >
          <SafeIcon icon={FiPlus} />
        </motion.button>
      </div>
    </div>
  );

  const renderTimeline = () => (
    <div className="space-y-6">
      <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
        <h4 className="text-lg font-semibold text-white mb-2">Timeline Planning Tips</h4>
        <ul className="text-purple-300 text-sm space-y-1">
          <li>• Plan your shoot day by day</li>
          <li>• Include prep time and setup</li>
          <li>• Add buffer time for unexpected delays</li>
          <li>• Consider golden hour for outdoor shoots</li>
        </ul>
      </div>

      <div className="space-y-4">
        {(project.timeline || []).map((item) => (
          <motion.div
            key={item.id}
            className="bg-white/5 border border-white/10 rounded-lg p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-3">
                <input
                  type="text"
                  value={item.task}
                  onChange={(e) => updateItem('timeline', item.id, { task: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Task or milestone..."
                />
                <div className="flex items-center space-x-3">
                  <input
                    type="date"
                    value={item.date}
                    onChange={(e) => updateItem('timeline', item.id, { date: e.target.value })}
                    className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <select
                    value={item.duration}
                    onChange={(e) => updateItem('timeline', item.id, { duration: e.target.value })}
                    className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="30 minutes">30 minutes</option>
                    <option value="1 hour">1 hour</option>
                    <option value="2 hours">2 hours</option>
                    <option value="Half day">Half day</option>
                    <option value="Full day">Full day</option>
                  </select>
                  <select
                    value={item.status}
                    onChange={(e) => updateItem('timeline', item.id, { status: e.target.value })}
                    className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              <motion.button
                className="ml-4 p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-all"
                whileHover={{ scale: 1.05 }}
                onClick={() => removeItem('timeline', item.id)}
              >
                <SafeIcon icon={FiTrash2} className="text-red-400" />
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center space-x-3">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddTimelineItem()}
          placeholder="Add a timeline item..."
          className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <motion.button
          className="px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all"
          whileHover={{ scale: 1.05 }}
          onClick={handleAddTimelineItem}
        >
          <SafeIcon icon={FiPlus} />
        </motion.button>
      </div>
    </div>
  );

  const renderShotList = () => (
    <ShotListBuilder 
      project={project}
      onDataUpdate={onDataUpdate}
    />
  );

  const renderResources = () => {
    const resources = project.resources || {};
    const categories = ['Equipment', 'Props', 'Costumes', 'Team', 'Other'];

    return (
      <div className="space-y-6">
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-white mb-2">Resource Planning Tips</h4>
          <ul className="text-purple-300 text-sm space-y-1">
            <li>• List all equipment you'll need</li>
            <li>• Don't forget basics like batteries and memory cards</li>
            <li>• Plan for backup equipment</li>
            <li>• Consider who will help with different tasks</li>
          </ul>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((category) => (
            <div key={category} className="bg-white/5 border border-white/10 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-white mb-3">{category}</h4>
              <div className="space-y-2">
                {(resources[category] || []).map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => {
                        const newItems = [...(resources[category] || [])];
                        newItems[index] = e.target.value;
                        handleUpdateResources(category, newItems);
                      }}
                      className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder={`Add ${category.toLowerCase()} item...`}
                    />
                    <motion.button
                      className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-all"
                      whileHover={{ scale: 1.05 }}
                      onClick={() => {
                        const newItems = (resources[category] || []).filter((_, i) => i !== index);
                        handleUpdateResources(category, newItems);
                      }}
                    >
                      <SafeIcon icon={FiTrash2} className="text-red-400 text-sm" />
                    </motion.button>
                  </div>
                ))}
                <motion.button
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 border-dashed rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                  whileHover={{ scale: 1.02 }}
                  onClick={() => {
                    const newItems = [...(resources[category] || []), ''];
                    handleUpdateResources(category, newItems);
                  }}
                >
                  <SafeIcon icon={FiPlus} className="inline mr-2" />
                  Add {category} Item
                </motion.button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  switch (step) {
    case 0: return renderStoryStructure();
    case 1: return renderLocations();
    case 2: return renderTimeline();
    case 3: return renderShotList();
    case 4: return renderResources();
    default: return null;
  }
};

export default PlanningPrompts;