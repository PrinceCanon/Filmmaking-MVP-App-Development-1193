import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { 
  FiPlus, FiTrash2, FiClock, FiCalendar, FiMapPin, 
  FiUsers, FiCamera, FiSun, FiMoon, FiCloud 
} = FiIcons;

const ProductionScheduler = ({ project, onDataUpdate }) => {
  const [newScheduleItem, setNewScheduleItem] = useState({
    title: '',
    type: 'shoot',
    date: new Date().toISOString().split('T')[0],
    start_time: '09:00',
    end_time: '17:00',
    location: '',
    scenes: [],
    crew: [],
    notes: '',
    weather_consideration: false
  });

  const scheduleTypes = [
    { value: 'prep', label: 'Pre-production', icon: FiUsers, color: 'bg-blue-500/20 text-blue-400' },
    { value: 'shoot', label: 'Shooting', icon: FiCamera, color: 'bg-red-500/20 text-red-400' },
    { value: 'review', label: 'Review/Editing', icon: FiClock, color: 'bg-green-500/20 text-green-400' }
  ];

  const timeSlots = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00', '21:00', '22:00'
  ];

  const handleAddScheduleItem = () => {
    if (!newScheduleItem.title.trim()) return;
    
    const schedule = project.production_schedule || [];
    const item = {
      id: Date.now(),
      ...newScheduleItem,
      created_at: new Date().toISOString()
    };
    
    onDataUpdate({ production_schedule: [...schedule, item] });
    setNewScheduleItem({
      title: '',
      type: 'shoot',
      date: new Date().toISOString().split('T')[0],
      start_time: '09:00',
      end_time: '17:00',
      location: '',
      scenes: [],
      crew: [],
      notes: '',
      weather_consideration: false
    });
  };

  const removeScheduleItem = (itemId) => {
    const schedule = project.production_schedule || [];
    onDataUpdate({ production_schedule: schedule.filter(item => item.id !== itemId) });
  };

  const updateScheduleItem = (itemId, updates) => {
    const schedule = project.production_schedule || [];
    onDataUpdate({
      production_schedule: schedule.map(item => 
        item.id === itemId ? { ...item, ...updates } : item
      )
    });
  };

  const getAvailableScenes = () => {
    return (project.story_structure || []).map((segment, index) => ({
      id: segment.id,
      number: index + 1,
      title: segment.title
    }));
  };

  const getTypeInfo = (type) => {
    return scheduleTypes.find(t => t.value === type) || scheduleTypes[1];
  };

  const groupScheduleByDate = () => {
    const schedule = project.production_schedule || [];
    const grouped = {};
    
    schedule.forEach(item => {
      if (!grouped[item.date]) {
        grouped[item.date] = [];
      }
      grouped[item.date].push(item);
    });

    // Sort items within each date by start time
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => a.start_time.localeCompare(b.start_time));
    });

    return grouped;
  };

  const calculateDuration = (startTime, endTime) => {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const diffMs = end - start;
    const diffHours = diffMs / (1000 * 60 * 60);
    
    if (diffHours < 1) {
      return `${Math.round(diffHours * 60)}min`;
    }
    return `${diffHours}h`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
        <h4 className="text-lg font-semibold text-white mb-2">Production Scheduler</h4>
        <ul className="text-purple-300 text-sm space-y-1">
          <li>• Plan your shooting days and prep work</li>
          <li>• Assign scenes to specific shooting sessions</li>
          <li>• Consider travel time between locations</li>
          <li>• Account for golden hour and weather conditions</li>
        </ul>
      </div>

      {/* Add New Schedule Item */}
      <motion.div
        className="bg-white/5 border border-white/10 rounded-lg p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h4 className="text-lg font-semibold text-white mb-4">Add to Schedule</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-300 mb-2">Title/Activity</label>
            <input
              type="text"
              value={newScheduleItem.title}
              onChange={(e) => setNewScheduleItem({ ...newScheduleItem, title: e.target.value })}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., Shoot opening scenes, Equipment prep"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-300 mb-2">Type</label>
            <select
              value={newScheduleItem.type}
              onChange={(e) => setNewScheduleItem({ ...newScheduleItem, type: e.target.value })}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {scheduleTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-300 mb-2">Date</label>
            <input
              type="date"
              value={newScheduleItem.date}
              onChange={(e) => setNewScheduleItem({ ...newScheduleItem, date: e.target.value })}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-300 mb-2">Start Time</label>
            <select
              value={newScheduleItem.start_time}
              onChange={(e) => setNewScheduleItem({ ...newScheduleItem, start_time: e.target.value })}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {timeSlots.map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-gray-300 mb-2">End Time</label>
            <select
              value={newScheduleItem.end_time}
              onChange={(e) => setNewScheduleItem({ ...newScheduleItem, end_time: e.target.value })}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {timeSlots.map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-300 mb-2">Location</label>
            <select
              value={newScheduleItem.location}
              onChange={(e) => setNewScheduleItem({ ...newScheduleItem, location: e.target.value })}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select location...</option>
              {(project.locations || []).map(location => (
                <option key={location.id} value={location.name}>{location.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="flex items-center space-x-2 text-sm text-gray-300 mb-2">
              <input
                type="checkbox"
                checked={newScheduleItem.weather_consideration}
                onChange={(e) => setNewScheduleItem({ ...newScheduleItem, weather_consideration: e.target.checked })}
                className="rounded"
              />
              <span>Weather dependent</span>
            </label>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm text-gray-300 mb-2">Notes</label>
          <textarea
            value={newScheduleItem.notes}
            onChange={(e) => setNewScheduleItem({ ...newScheduleItem, notes: e.target.value })}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            rows={2}
            placeholder="Special requirements, equipment needed, etc."
          />
        </div>

        <motion.button
          className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all"
          whileHover={{ scale: 1.02 }}
          onClick={handleAddScheduleItem}
          disabled={!newScheduleItem.title.trim()}
        >
          <SafeIcon icon={FiPlus} className="inline mr-2" />
          Add to Schedule
        </motion.button>
      </motion.div>

      {/* Schedule Timeline */}
      <div className="space-y-6">
        {Object.entries(groupScheduleByDate()).map(([date, items]) => (
          <motion.div
            key={date}
            className="bg-white/5 border border-white/10 rounded-lg p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center space-x-3 mb-4">
              <SafeIcon icon={FiCalendar} className="text-purple-400 text-xl" />
              <h4 className="text-lg font-semibold text-white">{formatDate(date)}</h4>
            </div>

            <div className="space-y-4">
              {items.map((item) => {
                const typeInfo = getTypeInfo(item.type);
                const duration = calculateDuration(item.start_time, item.end_time);

                return (
                  <motion.div
                    key={item.id}
                    className="bg-white/5 border border-white/10 rounded-lg p-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${typeInfo.color}`}>
                            <SafeIcon icon={typeInfo.icon} />
                          </div>
                          <div>
                            <h5 className="font-semibold text-white">{item.title}</h5>
                            <div className="flex items-center space-x-4 text-sm text-gray-400">
                              <span>{item.start_time} - {item.end_time}</span>
                              <span>({duration})</span>
                              {item.location && (
                                <>
                                  <SafeIcon icon={FiMapPin} className="text-xs" />
                                  <span>{item.location}</span>
                                </>
                              )}
                              {item.weather_consideration && (
                                <SafeIcon icon={FiCloud} className="text-yellow-400" title="Weather dependent" />
                              )}
                            </div>
                          </div>
                        </div>

                        {item.notes && (
                          <p className="text-gray-400 text-sm">{item.notes}</p>
                        )}
                      </div>

                      <motion.button
                        className="ml-4 p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-all"
                        whileHover={{ scale: 1.05 }}
                        onClick={() => removeScheduleItem(item.id)}
                      >
                        <SafeIcon icon={FiTrash2} className="text-red-400" />
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ))}

        {Object.keys(groupScheduleByDate()).length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <SafeIcon icon={FiCalendar} className="text-4xl mx-auto mb-4 opacity-50" />
            <p>No schedule items yet</p>
            <p className="text-sm">Add your first production activity above</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductionScheduler;