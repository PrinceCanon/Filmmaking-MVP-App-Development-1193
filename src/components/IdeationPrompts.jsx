import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiHelpCircle, FiRefreshCw } = FiIcons;

const IdeationPrompts = ({ step, data, onDataUpdate }) => {
  const [activePrompt, setActivePrompt] = useState(0);

  const prompts = {
    0: {
      title: 'Project Basics',
      questions: [
        {
          id: 'title',
          label: 'Project Title',
          type: 'text',
          placeholder: 'Enter your project title...',
          prompt: 'What would you like to call your video project?'
        },
        {
          id: 'type',
          label: 'Video Type',
          type: 'select',
          options: [
            'Vlog',
            'Tutorial',
            'Review',
            'Travel',
            'Food',
            'Lifestyle',
            'Business',
            'Educational',
            'Entertainment',
            'Documentary'
          ],
          prompt: 'What type of video are you creating?'
        },
        {
          id: 'duration',
          label: 'Target Duration',
          type: 'select',
          options: [
            '30 seconds - 1 minute',
            '1-3 minutes',
            '3-5 minutes',
            '5-10 minutes',
            '10-15 minutes',
            '15+ minutes'
          ],
          prompt: 'How long should your video be?'
        }
      ]
    },
    1: {
      title: 'Concept Development',
      questions: [
        {
          id: 'concept',
          label: 'Core Concept',
          type: 'textarea',
          placeholder: 'Describe your video concept in detail...',
          prompt: 'What is the main idea or story you want to tell?'
        },
        {
          id: 'key_message',
          label: 'Key Message',
          type: 'textarea',
          placeholder: 'What do you want viewers to take away...',
          prompt: 'What is the one key message you want your audience to remember?'
        },
        {
          id: 'unique_angle',
          label: 'Unique Angle',
          type: 'textarea',
          placeholder: 'What makes your approach different...',
          prompt: 'What makes your video unique? What\'s your special perspective?'
        }
      ]
    },
    2: {
      title: 'Audience & Tone',
      questions: [
        {
          id: 'target_audience',
          label: 'Target Audience',
          type: 'textarea',
          placeholder: 'Describe your ideal viewer...',
          prompt: 'Who is your ideal viewer? What are their interests, age, and preferences?'
        },
        {
          id: 'tone',
          label: 'Tone & Style',
          type: 'select',
          options: [
            'Casual & Friendly',
            'Professional & Informative',
            'Energetic & Fun',
            'Calm & Relaxing',
            'Inspiring & Motivational',
            'Humorous & Entertaining',
            'Serious & Educational',
            'Personal & Intimate'
          ],
          prompt: 'What tone and style best fits your content and audience?'
        },
        {
          id: 'inspiration',
          label: 'Inspiration',
          type: 'textarea',
          placeholder: 'What inspired this video idea...',
          prompt: 'What inspired this video? Any creators or content you admire?'
        }
      ]
    }
  };

  const currentPrompts = prompts[step];

  const handleInputChange = (id, value) => {
    onDataUpdate({ [id]: value });
  };

  const getRandomPrompt = (question) => {
    const suggestions = {
      concept: [
        'Think about a problem you can solve for your audience',
        'Consider sharing a personal experience or journey',
        'What trend or topic is relevant to your niche right now?',
        'What question do people always ask you about?'
      ],
      key_message: [
        'What one thing would change someone\'s day for the better?',
        'What lesson took you years to learn?',
        'What misconception do you want to clear up?',
        'What action do you want viewers to take after watching?'
      ],
      target_audience: [
        'Picture your ideal viewer - what do they do in their free time?',
        'What challenges does your audience face daily?',
        'Where does your audience typically hang out online?',
        'What other creators does your audience follow?'
      ]
    };

    const prompts = suggestions[question.id] || ['Think creatively about this...'];
    return prompts[Math.floor(Math.random() * prompts.length)];
  };

  return (
    <div className="space-y-6">
      {currentPrompts.questions.map((question, index) => (
        <motion.div
          key={question.id}
          className="space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-300">
              {question.label}
            </label>
            <motion.button
              className="flex items-center space-x-1 px-2 py-1 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg transition-all"
              whileHover={{ scale: 1.05 }}
              onClick={() => setActivePrompt(activePrompt === index ? -1 : index)}
            >
              <SafeIcon icon={FiHelpCircle} className="text-purple-400 text-sm" />
              <span className="text-purple-400 text-xs">Prompt</span>
            </motion.button>
          </div>

          {activePrompt === index && (
            <motion.div
              className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="flex items-start space-x-3">
                <SafeIcon icon={FiHelpCircle} className="text-purple-400 text-lg mt-0.5" />
                <div className="flex-1">
                  <p className="text-purple-300 text-sm mb-2">{question.prompt}</p>
                  <motion.button
                    className="flex items-center space-x-1 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    onClick={() => {
                      const suggestion = getRandomPrompt(question);
                      // You could show this suggestion in a tooltip or modal
                    }}
                  >
                    <SafeIcon icon={FiRefreshCw} className="text-xs" />
                    <span>Get suggestion</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {question.type === 'text' && (
            <input
              type="text"
              value={data[question.id] || ''}
              onChange={(e) => handleInputChange(question.id, e.target.value)}
              placeholder={question.placeholder}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          )}

          {question.type === 'textarea' && (
            <textarea
              value={data[question.id] || ''}
              onChange={(e) => handleInputChange(question.id, e.target.value)}
              placeholder={question.placeholder}
              rows={4}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
            />
          )}

          {question.type === 'select' && (
            <select
              value={data[question.id] || ''}
              onChange={(e) => handleInputChange(question.id, e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            >
              <option value="">Select an option...</option>
              {question.options.map((option) => (
                <option key={option} value={option} className="bg-gray-800">
                  {option}
                </option>
              ))}
            </select>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default IdeationPrompts;