import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import supabase from '../lib/supabase';
import { useProject } from '../context/ProjectContext';
import * as FiIcons from 'react-icons/fi';

const { FiUsers, FiMail, FiUserPlus, FiTrash2, FiMessageCircle, FiSend, FiMoreHorizontal, FiVideo, FiEdit3, FiCamera } = FiIcons;

const CollaborationPanel = ({ projectId, isOpen, onClose }) => {
  const { user } = useProject();
  const [collaborators, setCollaborators] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('viewer');
  const [filmRole, setFilmRole] = useState('crew');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('team'); // team, chat

  const filmRoles = [
    { value: 'director', label: 'Director', icon: FiVideo, color: 'bg-red-500/20 text-red-400' },
    { value: 'cinematographer', label: 'Cinematographer', icon: FiCamera, color: 'bg-blue-500/20 text-blue-400' },
    { value: 'editor', label: 'Editor', icon: FiEdit3, color: 'bg-purple-500/20 text-purple-400' },
    { value: 'producer', label: 'Producer', icon: FiUsers, color: 'bg-green-500/20 text-green-400' },
    { value: 'writer', label: 'Writer', icon: FiEdit3, color: 'bg-yellow-500/20 text-yellow-400' },
    { value: 'sound', label: 'Sound Engineer', icon: FiVideo, color: 'bg-pink-500/20 text-pink-400' },
    { value: 'gaffer', label: 'Gaffer', icon: FiVideo, color: 'bg-orange-500/20 text-orange-400' },
    { value: 'assistant', label: 'Assistant', icon: FiUsers, color: 'bg-gray-500/20 text-gray-400' },
    { value: 'crew', label: 'General Crew', icon: FiUsers, color: 'bg-indigo-500/20 text-indigo-400' }
  ];

  useEffect(() => {
    if (isOpen && projectId) {
      loadCollaborators();
      loadComments();
      subscribeToComments();
    }
  }, [isOpen, projectId]);

  const loadCollaborators = async () => {
    try {
      const { data, error } = await supabase
        .from('project_collaborators_fc2024')
        .select('*')
        .eq('project_id', projectId);

      if (error) throw error;
      setCollaborators(data || []);
    } catch (error) {
      console.error('Error loading collaborators:', error);
    }
  };

  const loadComments = async () => {
    try {
      const { data, error } = await supabase
        .from('project_comments_fc2024')
        .select('*')
        .eq('project_id', projectId)
        .is('shot_id', null)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const subscribeToComments = () => {
    const subscription = supabase
      .channel(`project_comments_${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_comments_fc2024',
          filter: `project_id=eq.${projectId}`
        },
        () => {
          loadComments();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const inviteCollaborator = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setLoading(true);
    try {
      const permissions = {
        view: true,
        edit: inviteRole === 'editor' || inviteRole === 'admin',
        admin: inviteRole === 'admin'
      };

      const { error } = await supabase
        .from('project_collaborators_fc2024')
        .insert([{
          project_id: projectId,
          email: inviteEmail,
          role: inviteRole,
          film_role: filmRole,
          permissions,
          invited_by: user.id,
          user_id: user.id // This should be updated when the user accepts
        }]);

      if (error) throw error;

      setInviteEmail('');
      setFilmRole('crew');
      loadCollaborators();
      
      // In a real app, you'd send an email invitation here
      alert(`Invitation sent to ${inviteEmail} as ${filmRoles.find(r => r.value === filmRole)?.label}`);
    } catch (error) {
      console.error('Error inviting collaborator:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const removeCollaborator = async (collaboratorId) => {
    try {
      const { error } = await supabase
        .from('project_collaborators_fc2024')
        .delete()
        .eq('id', collaboratorId);

      if (error) throw error;
      loadCollaborators();
    } catch (error) {
      console.error('Error removing collaborator:', error);
    }
  };

  const sendComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const { error } = await supabase
        .from('project_comments_fc2024')
        .insert([{
          project_id: projectId,
          user_id: user.id,
          content: newComment
        }]);

      if (error) throw error;
      setNewComment('');
    } catch (error) {
      console.error('Error sending comment:', error);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-500/20 text-red-400';
      case 'editor': return 'bg-blue-500/20 text-blue-400';
      case 'viewer': return 'bg-green-500/20 text-green-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getFilmRoleInfo = (filmRole) => {
    return filmRoles.find(r => r.value === filmRole) || filmRoles[filmRoles.length - 1];
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-y-0 right-0 w-96 bg-gray-900/95 backdrop-blur-lg border-l border-white/10 z-50"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Collaboration</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <SafeIcon icon={FiMoreHorizontal} className="text-gray-400" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-white/5 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('team')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg transition-all ${
                activeTab === 'team' 
                  ? 'bg-purple-500 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <SafeIcon icon={FiUsers} className="text-sm" />
              <span className="text-sm">Team</span>
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg transition-all ${
                activeTab === 'chat' 
                  ? 'bg-purple-500 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <SafeIcon icon={FiMessageCircle} className="text-sm" />
              <span className="text-sm">Chat</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'team' && (
            <div className="p-4 space-y-6 h-full overflow-y-auto">
              {/* Invite Form */}
              <div>
                <h4 className="text-sm font-medium text-white mb-3">Invite Team Member</h4>
                <form onSubmit={inviteCollaborator} className="space-y-3">
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  
                  <div className="grid grid-cols-1 gap-3">
                    <select
                      value={filmRole}
                      onChange={(e) => setFilmRole(e.target.value)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {filmRoles.map(role => (
                        <option key={role.value} value={role.value} className="bg-gray-800">
                          {role.label}
                        </option>
                      ))}
                    </select>
                    
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="viewer">Viewer - Can view only</option>
                      <option value="editor">Editor - Can edit content</option>
                      <option value="admin">Admin - Full access</option>
                    </select>
                  </div>
                  
                  <motion.button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-500 text-white rounded-lg transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <SafeIcon icon={FiUserPlus} className="inline mr-2" />
                    {loading ? 'Inviting...' : 'Send Invite'}
                  </motion.button>
                </form>
              </div>

              {/* Collaborators List */}
              <div>
                <h4 className="text-sm font-medium text-white mb-3">Team Members</h4>
                <div className="space-y-3">
                  {collaborators.map(collaborator => {
                    const filmRoleInfo = getFilmRoleInfo(collaborator.film_role);
                    return (
                      <div key={collaborator.id} className="p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-white text-sm">{collaborator.email}</span>
                              <span className={`px-2 py-1 rounded-full text-xs ${getRoleColor(collaborator.role)}`}>
                                {collaborator.role}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className={`px-2 py-1 rounded-full text-xs flex items-center space-x-1 ${filmRoleInfo.color}`}>
                                <SafeIcon icon={filmRoleInfo.icon} className="text-xs" />
                                <span>{filmRoleInfo.label}</span>
                              </div>
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {collaborator.status === 'pending' ? 'Invitation pending' : 'Active'}
                            </div>
                          </div>
                          <button
                            onClick={() => removeCollaborator(collaborator.id)}
                            className="p-1 hover:bg-red-500/20 rounded text-red-400 hover:text-red-300 transition-colors"
                          >
                            <SafeIcon icon={FiTrash2} className="text-xs" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="flex flex-col h-full">
              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {comments.map(comment => (
                  <div key={comment.id} className="space-y-2">
                    <div className="flex items-center space-x-2 text-xs text-gray-400">
                      <span>{comment.user_id === user.id ? 'You' : 'Team Member'}</span>
                      <span>•</span>
                      <span>{new Date(comment.created_at).toLocaleTimeString()}</span>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-white text-sm">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-white/10">
                <form onSubmit={sendComment} className="flex space-x-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <motion.button
                    type="submit"
                    className="p-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <SafeIcon icon={FiSend} />
                  </motion.button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CollaborationPanel;