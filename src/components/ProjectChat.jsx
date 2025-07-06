import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import supabase from '../lib/supabase';
import { useProject } from '../context/ProjectContext';
import * as FiIcons from 'react-icons/fi';

const { FiMessageCircle, FiSend, FiX, FiUsers, FiClock, FiPin, FiTrash2, FiEdit3, FiMoreHorizontal, FiCheck, FiAlertCircle, FiInfo } = FiIcons;

const ProjectChat = ({ projectId, isOpen, onClose }) => {
  const { user } = useProject();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [collaborators, setCollaborators] = useState([]);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && projectId) {
      loadMessages();
      loadCollaborators();
      subscribeToMessages();
    }
  }, [isOpen, projectId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('project_comments_fc2024')
        .select('*')
        .eq('project_id', projectId)
        .is('shot_id', null) // Only get general project comments, not shot-specific ones
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const subscribeToMessages = () => {
    const subscription = supabase
      .channel(`project_chat_${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_comments_fc2024',
          filter: `project_id=eq.${projectId}`
        },
        () => {
          loadMessages();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const messageData = {
        project_id: projectId,
        user_id: user.id,
        content: newMessage.trim(),
        message_type: 'general', // general, announcement, question
        metadata: {
          author_email: user.email,
          timestamp: new Date().toISOString()
        }
      };

      const { error } = await supabase
        .from('project_comments_fc2024')
        .insert([messageData]);

      if (error) throw error;

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const deleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;

    try {
      const { error } = await supabase
        .from('project_comments_fc2024')
        .delete()
        .eq('id', messageId)
        .eq('user_id', user.id); // Only allow users to delete their own messages

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const editMessage = async (messageId, newContent) => {
    try {
      const { error } = await supabase
        .from('project_comments_fc2024')
        .update({ 
          content: newContent,
          metadata: {
            ...messages.find(m => m.id === messageId)?.metadata,
            edited: true,
            edited_at: new Date().toISOString()
          }
        })
        .eq('id', messageId)
        .eq('user_id', user.id);

      if (error) throw error;

      setEditingMessage(null);
      setEditText('');
    } catch (error) {
      console.error('Error editing message:', error);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    }
  };

  const getMessageTypeIcon = (type) => {
    switch (type) {
      case 'announcement': return FiInfo;
      case 'question': return FiAlertCircle;
      default: return FiMessageCircle;
    }
  };

  const getMessageTypeColor = (type) => {
    switch (type) {
      case 'announcement': return 'text-blue-400 bg-blue-500/10';
      case 'question': return 'text-yellow-400 bg-yellow-500/10';
      default: return 'text-gray-400 bg-white/5';
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-y-0 right-0 w-96 bg-gray-900/95 backdrop-blur-lg border-l border-white/10 z-50 flex flex-col"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <SafeIcon icon={FiMessageCircle} className="text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Project Chat</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <SafeIcon icon={FiX} className="text-gray-400" />
          </button>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <SafeIcon icon={FiUsers} className="text-xs" />
          <span>{collaborators.length + 1} team members</span>
          <span>•</span>
          <span>{messages.length} messages</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
            <p className="text-gray-400 mt-2">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <SafeIcon icon={FiMessageCircle} className="text-4xl mx-auto mb-4 opacity-50" />
            <p className="text-lg">No messages yet</p>
            <p className="text-sm">Start the conversation with your team!</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                className={`p-3 rounded-lg ${getMessageTypeColor(message.message_type || 'general')} relative group`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {/* Message Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <SafeIcon 
                      icon={getMessageTypeIcon(message.message_type)} 
                      className="text-xs" 
                    />
                    <span className="text-sm font-medium text-white">
                      {message.user_id === user.id ? 'You' : (message.metadata?.author_email || 'Team Member')}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTime(message.created_at)}
                    </span>
                    {message.metadata?.edited && (
                      <span className="text-xs text-gray-500 italic">(edited)</span>
                    )}
                  </div>
                  {message.user_id === user.id && (
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingMessage(message.id);
                          setEditText(message.content);
                        }}
                        className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors"
                      >
                        <SafeIcon icon={FiEdit3} className="text-xs" />
                      </button>
                      <button
                        onClick={() => deleteMessage(message.id)}
                        className="p-1 hover:bg-red-500/20 rounded text-red-400 hover:text-red-300 transition-colors"
                      >
                        <SafeIcon icon={FiTrash2} className="text-xs" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Message Content */}
                {editingMessage === message.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full px-2 py-1 bg-white/5 border border-white/10 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none"
                      rows={2}
                      autoFocus
                    />
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => editMessage(message.id, editText)}
                        className="px-2 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded text-xs transition-all"
                      >
                        <SafeIcon icon={FiCheck} className="inline mr-1" />
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingMessage(null);
                          setEditText('');
                        }}
                        className="px-2 py-1 bg-gray-500/20 hover:bg-gray-500/30 text-gray-400 rounded text-xs transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-white text-sm whitespace-pre-wrap">{message.content}</p>
                )}
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-white/10 flex-shrink-0">
        <form onSubmit={sendMessage} className="space-y-2">
          <div className="flex items-center space-x-2">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(e);
                }
              }}
              className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              placeholder="Type a message... (Shift+Enter for new line)"
              rows={2}
            />
            <motion.button
              type="submit"
              className="p-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={!newMessage.trim()}
            >
              <SafeIcon icon={FiSend} />
            </motion.button>
          </div>
          <div className="text-xs text-gray-500">
            <span>💡 Tip: Use this chat to coordinate with your team across all project phases</span>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default ProjectChat;