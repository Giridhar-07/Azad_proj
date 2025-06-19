import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './Header';
import Home from '../pages/Home';
import Services from '../pages/Services';
import About from '../pages/About';
import Careers from '../pages/Careers';
import Contact from '../pages/Contact';
import ChatbotComponent from './ChatbotComponent';
import '../styles/main.css';

const App: React.FC = () => {
  return (
    <div className="app">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/about" element={<About />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>
      <ChatbotComponent />
    </div>
  );
};

export default App;