import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Ideation from './pages/Ideation';
import Planning from './pages/Planning';
import Shooting from './pages/Shooting';
import ProjectView from './pages/ProjectView';
import { ProjectProvider } from './context/ProjectContext';
import './App.css';

function App() {
  return (
    <ProjectProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <Header />
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/ideation" element={<Ideation />} />
              <Route path="/planning/:projectId" element={<Planning />} />
              <Route path="/shooting/:projectId" element={<Shooting />} />
              <Route path="/project/:projectId" element={<ProjectView />} />
            </Routes>
          </AnimatePresence>
        </div>
      </Router>
    </ProjectProvider>
  );
}

export default App;