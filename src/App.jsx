import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import ProjectChatProvider from './components/ProjectChatProvider';
import Dashboard from './pages/Dashboard';
import Ideation from './pages/Ideation';
import Planning from './pages/Planning';
import Shooting from './pages/Shooting';
import ProjectView from './pages/ProjectView';
import Auth from './components/Auth';
import { ProjectProvider, useProject } from './context/ProjectContext';
import './App.css';

function AppContent() {
  const { user, loading } = useProject();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-white mt-4">Loading FilmCraft...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Header />
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/ideation" element={<Ideation />} />
            <Route path="/ideation/:projectId" element={<Ideation />} />
            <Route path="/planning/:projectId" element={<Planning />} />
            <Route path="/shooting/:projectId" element={<Shooting />} />
            <Route path="/project/:projectId" element={<ProjectView />} />
          </Routes>
        </AnimatePresence>
        
        {/* Global Floating Chat */}
        <ProjectChatProvider />
      </div>
    </Router>
  );
}

function App() {
  return (
    <ProjectProvider>
      <AppContent />
    </ProjectProvider>
  );
}

export default App;