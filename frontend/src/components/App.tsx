import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '../contexts/ThemeContext';
import Header from './Header';
import PageTransition from './PageTransition';
import ChatbotComponent from './ChatbotComponent';

// Lazy load route components
const Home = React.lazy(() => import('../pages/Home'));
const About = React.lazy(() => import('../pages/About'));
const Services = React.lazy(() => import('../pages/Services'));
const Careers = React.lazy(() => import('../pages/Careers'));
const Contact = React.lazy(() => import('../pages/Contact'));
const JobDetail = React.lazy(() => import('./JobDetail'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="loading-spinner">
    <div className="spinner"></div>
  </div>
);

import '../styles/main.css';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <div className="app page">
        <Header />
        <main className="main">
          <PageTransition>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/services" element={<Services />} />
                <Route path="/services/*" element={<Services />} />
                <Route path="/about" element={<About />} />
                <Route path="/careers" element={<Careers />} />
                <Route path="/careers/:id" element={<JobDetail />} />
                <Route path="/contact" element={<Contact />} />
              </Routes>
            </Suspense>
          </PageTransition>
        </main>
      </div>
      <ChatbotComponent />
    </ThemeProvider>
  );
};

export default App;