import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import supabase from '../lib/supabase';
import { useProject } from '../context/ProjectContext';
import * as FiIcons from 'react-icons/fi';

const { FiMessageCircle, FiSend, FiX, FiUsers, FiClock, FiPin, FiTrash2, FiEdit3, FiMoreHorizontal, FiCheck, FiAlertCircle, FiInfo, FiSearch, FiFilter, FiChevronDown, FiChevronUp, FiMinimize2, FiMaximize2 } = FiIcons;

const FloatingProjectChat = ({ projectId }) => {
  const { user } = useProject();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [collaborators, setCollaborators] = useState([]);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastReadMessageId, setLastReadMessageId] = useState(null);
  
  // Search functionality
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  // Message type filter
  const [messageTypeFilter, setMessageTypeFilter] = useState('all'); // all, general, announcement, question
  
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (projectId && user) {
      loadMessages();
      loadCollaborators();
      subscribeToMessages();
      loadLastReadMessage();
    }
  }, [projectId, user]);

  useEffect(() => {
    if (!isMinimized) {
      scrollToBottom();
    }
  }, [messages, isMinimized]);

  useEffect(() => {
    // Filter messages based on search and type
    let filtered = messages;
    
    if (messageTypeFilter !== 'all') {
      filtered = filtered.filter(msg => (msg.message_type || 'general') === messageTypeFilter);
    }
    
    if (searchQuery.trim()) {
      filtered = filtered.filter(msg => 
        msg.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (msg.metadata?.author_email || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredMessages(filtered);
  }, [messages, searchQuery, messageTypeFilter]);

  useEffect(() => {
    // Calculate unread count
    if (lastReadMessageId && messages.length > 0) {
      const lastReadIndex = messages.findIndex(msg => msg.id === lastReadMessageId);
      const unreadMessages = lastReadIndex >= 0 ? messages.slice(lastReadIndex + 1) : messages;
      setUnreadCount(unreadMessages.filter(msg => msg.user_id !== user?.id).length);
    } else {
      setUnreadCount(messages.filter(msg => msg.user_id !== user?.id).length);
    }
  }, [messages, lastReadMessageId, user]);

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
        .is('shot_id', null)
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

  const loadLastReadMessage = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_read_status_fc2024')
        .select('last_read_message_id')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setLastReadMessageId(data?.last_read_message_id || null);
    } catch (error) {
      console.error('Error loading last read message:', error);
    }
  };

  const updateLastReadMessage = async () => {
    if (messages.length === 0) return;
    
    const lastMessage = messages[messages.length - 1];
    
    try {
      const { error } = await supabase
        .from('chat_read_status_fc2024')
        .upsert({
          project_id: projectId,
          user_id: user.id,
          last_read_message_id: lastMessage.id,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      setLastReadMessageId(lastMessage.id);
    } catch (error) {
      console.error('Error updating last read message:', error);
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
        message_type: 'general',
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
        .eq('user_id', user.id);

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

  const performSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('project_comments_fc2024')
        .select('*')
        .eq('project_id', projectId)
        .is('shot_id', null)
        .ilike('content', `%${searchQuery}%`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setSearchResults(data || []);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Error searching messages:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleChatOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
    setTimeout(() => {
      updateLastReadMessage();
    }, 1000);
  };

  const handleChatClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
    updateLastReadMessage();
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

  const highlightSearchTerm = (text, searchTerm) => {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="bg-yellow-500/30 text-yellow-200 px-1 rounded">
          {part}
        </span>
      ) : part
    );
  };

  if (!projectId || !user) return null;

  return (
    <>
      {/* Floating Chat Button */}
      <motion.button
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full p-4 shadow-lg transition-all"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleChatOpen}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <SafeIcon icon={FiMessageCircle} className="text-xl" />
        {unreadCount > 0 && (
          <motion.div
            className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500 }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.div>
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={`fixed z-50 bg-gray-900/95 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden shadow-2xl ${
              isMinimized 
                ? 'bottom-6 right-20 w-80 h-16' 
                : 'bottom-6 right-6 w-96 h-[600px]'
            }`}
            initial={{ opacity: 0, scale: 0.8, x: 100, y: 100 }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 100, y: 100 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            {/* Chat Header */}
            <div className="p-4 border-b border-white/10 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <SafeIcon icon={FiMessageCircle} className="text-purple-400" />
                  <h3 className="text-lg font-semibold text-white">Project Chat</h3>
                  {unreadCount > 0 && !isMinimized && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                  >
                    <SafeIcon icon={isMinimized ? FiMaximize2 : FiMinimize2} className="text-gray-400 text-sm" />
                  </button>
                  <button
                    onClick={handleChatClose}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                  >
                    <SafeIcon icon={FiX} className="text-gray-400" />
                  </button>
                </div>
              </div>

              {!isMinimized && (
                <div className="mt-2 flex items-center space-x-2 text-sm text-gray-400">
                  <SafeIcon icon={FiUsers} className="text-xs" />
                  <span>{collaborators.length + 1} team members</span>
                  <span>•</span>
                  <span>{messages.length} messages</span>
                </div>
              )}
            </div>

            {!isMinimized && (
              <>
                {/* Search and Filter Bar */}
                <div className="p-3 border-b border-white/10 bg-white/5">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="flex-1 relative">
                      <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && performSearch()}
                        className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        placeholder="Search messages..."
                      />
                    </div>
                    <motion.button
                      className="px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-all"
                      whileHover={{ scale: 1.05 }}
                      onClick={performSearch}
                      disabled={isSearching}
                    >
                      {isSearching ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-400"></div>
                      ) : (
                        <SafeIcon icon={FiSearch} className="text-sm" />
                      )}
                    </motion.button>
                  </div>

                  {/* Message Type Filter */}
                  <div className="flex items-center space-x-1">
                    <SafeIcon icon={FiFilter} className="text-gray-400 text-sm" />
                    <select
                      value={messageTypeFilter}
                      onChange={(e) => setMessageTypeFilter(e.target.value)}
                      className="text-xs bg-white/5 border border-white/10 rounded px-2 py-1 text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                    >
                      <option value="all">All Messages</option>
                      <option value="general">General</option>
                      <option value="announcement">Announcements</option>
                      <option value="question">Questions</option>
                    </select>
                    
                    {(searchQuery || messageTypeFilter !== 'all') && (
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setMessageTypeFilter('all');
                          setShowSearchResults(false);
                        }}
                        className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-white/10 transition-colors"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Messages Container */}
                <div 
                  ref={chatContainerRef}
                  className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96"
                >
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
                      <p className="text-gray-400 mt-2">Loading messages...</p>
                    </div>
                  ) : filteredMessages.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <SafeIcon icon={FiMessageCircle} className="text-4xl mx-auto mb-4 opacity-50" />
                      {searchQuery || messageTypeFilter !== 'all' ? (
                        <p className="text-lg">No messages found matching your criteria</p>
                      ) : (
                        <>
                          <p className="text-lg">No messages yet</p>
                          <p className="text-sm">Start the conversation with your team!</p>
                        </>
                      )}
                    </div>
                  ) : (
                    <>
                      {filteredMessages.map((message) => (
                        <motion.div
                          key={message.id}
                          className={`p-3 rounded-lg ${getMessageTypeColor(message.message_type || 'general')} relative group`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          {/* Message Header */}
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <SafeIcon icon={getMessageTypeIcon(message.message_type)} className="text-xs" />
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
                            <p className="text-white text-sm whitespace-pre-wrap">
                              {searchQuery ? highlightSearchTerm(message.content, searchQuery) : message.content}
                            </p>
                          )}
                        </motion.div>
                      ))}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-white/10">
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
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingProjectChat;