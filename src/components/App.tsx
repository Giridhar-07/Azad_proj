import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '../contexts/ThemeContext';
import Header from './Header';
import PageTransition from './PageTransition';
import Home from '../pages/Home';
import About from '../pages/About';
import Services from '../pages/Services';
import Careers from '../pages/Careers';
import Contact from '../pages/Contact';
import ChatbotComponent from './ChatbotComponent';

import '../styles/main.css';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <div className="app page">
        <Header />
        <main className="main">
          <PageTransition>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/services" element={<Services />} />
              <Route path="/services/*" element={<Services />} />
              <Route path="/about" element={<About />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/contact" element={<Contact />} />
            </Routes>
          </PageTransition>
        </main>
      </div>
      <ChatbotComponent />
    </ThemeProvider>
  );
};

export default App;