import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import supabase from '../lib/supabase';
import * as FiIcons from 'react-icons/fi';

const { FiUpload, FiEdit3, FiDownload, FiTrash2, FiPlus, FiFileText, FiSave } = FiIcons;

const ScriptManager = ({ project, onScriptUpdate }) => {
  const [script, setScript] = useState(project.script || '');
  const [scriptFile, setScriptFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState(project.script ? 'edit' : 'empty'); // empty, upload, edit

  useEffect(() => {
    setScript(project.script || '');
  }, [project.script]);

  const handleFileUpload = async (file) => {
    if (!file) return;

    setUploading(true);
    try {
      const text = await file.text();
      setScript(text);
      setMode('edit');
      await saveScript(text);
    } catch (error) {
      console.error('Error reading file:', error);
      alert('Error reading file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const saveScript = async (scriptText = script) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('projects_fc2024')
        .update({ script: scriptText })
        .eq('id', project.id);

      if (error) throw error;
      
      onScriptUpdate(scriptText);
    } catch (error) {
      console.error('Error saving script:', error);
      alert('Error saving script. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const generateScenesFromScript = () => {
    if (!script.trim()) return;

    // Simple scene detection - look for scene headings or act breaks
    const lines = script.split('\n');
    const scenes = [];
    let currentScene = null;
    let sceneNumber = 1;

    lines.forEach(line => {
      const trimmedLine = line.trim().toUpperCase();
      
      // Detect scene headings (common formats)
      if (
        trimmedLine.startsWith('SCENE') ||
        trimmedLine.startsWith('INT.') ||
        trimmedLine.startsWith('EXT.') ||
        trimmedLine.includes('FADE IN') ||
        trimmedLine.includes('CUT TO')
      ) {
        if (currentScene) {
          scenes.push(currentScene);
        }
        currentScene = {
          id: Date.now() + sceneNumber,
          scene_number: sceneNumber,
          title: line.trim() || `Scene ${sceneNumber}`,
          description: '',
          content: line.trim()
        };
        sceneNumber++;
      } else if (currentScene && line.trim()) {
        currentScene.content += '\n' + line;
        if (!currentScene.description && line.trim().length > 10) {
          currentScene.description = line.trim().substring(0, 100) + '...';
        }
      }
    });

    if (currentScene) {
      scenes.push(currentScene);
    }

    return scenes;
  };

  const downloadScript = () => {
    const blob = new Blob([script], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title}_script.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (mode === 'empty') {
    return (
      <div className="space-y-6">
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-white mb-2">Script Management</h4>
          <p className="text-purple-300 text-sm">
            Add your script to automatically generate scenes or write directly in the editor.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Upload Option */}
          <motion.div
            className="bg-white/5 border border-white/10 rounded-lg p-6 text-center cursor-pointer hover:bg-white/10 transition-all"
            whileHover={{ scale: 1.02 }}
            onClick={() => document.getElementById('script-upload').click()}
          >
            <SafeIcon icon={FiUpload} className="text-3xl text-purple-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Upload Script</h3>
            <p className="text-gray-400 text-sm">
              Upload an existing script file (.txt, .pdf, .doc)
            </p>
            <input
              id="script-upload"
              type="file"
              accept=".txt,.pdf,.doc,.docx"
              onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0])}
              className="hidden"
            />
            {uploading && (
              <div className="mt-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mx-auto"></div>
              </div>
            )}
          </motion.div>

          {/* Write Option */}
          <motion.div
            className="bg-white/5 border border-white/10 rounded-lg p-6 text-center cursor-pointer hover:bg-white/10 transition-all"
            whileHover={{ scale: 1.02 }}
            onClick={() => setMode('edit')}
          >
            <SafeIcon icon={FiEdit3} className="text-3xl text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Write Script</h3>
            <p className="text-gray-400 text-sm">
              Start writing your script directly in our editor
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-white">Script Editor</h4>
        <div className="flex items-center space-x-2">
          <motion.button
            className="px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all"
            whileHover={{ scale: 1.05 }}
            onClick={downloadScript}
            disabled={!script.trim()}
          >
            <SafeIcon icon={FiDownload} className="inline mr-1" />
            Download
          </motion.button>
          <motion.button
            className="px-3 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-all"
            whileHover={{ scale: 1.05 }}
            onClick={() => saveScript()}
            disabled={saving || !script.trim()}
          >
            <SafeIcon icon={FiSave} className="inline mr-1" />
            {saving ? 'Saving...' : 'Save'}
          </motion.button>
          <motion.button
            className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all"
            whileHover={{ scale: 1.05 }}
            onClick={() => {
              setScript('');
              setMode('empty');
            }}
          >
            <SafeIcon icon={FiTrash2} />
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Script Editor */}
        <div className="lg:col-span-2">
          <textarea
            value={script}
            onChange={(e) => setScript(e.target.value)}
            className="w-full h-96 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none font-mono text-sm"
            placeholder="Write your script here...

Example format:
SCENE 1 - INT. LIVING ROOM - DAY

John sits at his desk, typing on his laptop. The room is cluttered with papers and coffee cups.

JOHN
(to himself)
This has to be perfect.

SCENE 2 - EXT. PARK - AFTERNOON

Wide shot of the park. Children playing in the background."
          />
        </div>

        {/* Script Tools */}
        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <h5 className="font-semibold text-white mb-3">Script Tools</h5>
            <div className="space-y-3">
              <motion.button
                className="w-full px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-all"
                whileHover={{ scale: 1.02 }}
                onClick={() => {
                  const scenes = generateScenesFromScript();
                  if (scenes.length > 0) {
                    // This would trigger scene generation
                    alert(`Found ${scenes.length} scenes in your script!`);
                  } else {
                    alert('No scenes detected. Try using scene headings like "SCENE 1", "INT.", or "EXT."');
                  }
                }}
              >
                <SafeIcon icon={FiPlus} className="inline mr-2" />
                Generate Scenes from Script
              </motion.button>
              
              <div className="text-xs text-gray-400">
                <p className="mb-2">Scene Detection Tips:</p>
                <ul className="space-y-1">
                  <li>• Use "SCENE 1", "SCENE 2", etc.</li>
                  <li>• Use "INT." or "EXT." for locations</li>
                  <li>• Use "FADE IN" or "CUT TO"</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <h5 className="font-semibold text-white mb-3">Script Stats</h5>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Lines:</span>
                <span className="text-white">{script.split('\n').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Words:</span>
                <span className="text-white">{script.trim() ? script.trim().split(/\s+/).length : 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Characters:</span>
                <span className="text-white">{script.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScriptManager;