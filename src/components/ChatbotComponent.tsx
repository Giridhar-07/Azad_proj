import React, { useEffect, useRef } from 'react';
import { Chatbot } from './Chatbot';
import '../styles/chatbot.css';

const ChatbotComponent: React.FC = () => {
  const chatbotRef = useRef<Chatbot | null>(null);

  useEffect(() => {
    if (!chatbotRef.current) {
      chatbotRef.current = new Chatbot();
    }

    return () => {
      if (chatbotRef.current) {
        // Cleanup if needed
        chatbotRef.current = null;
      }
    };
  }, []);

  return (
    <>
      {/* Chatbot toggle button */}
      <div id="chatbot-toggle" className="chatbot-toggle">
        <div className="cube-container">
          <div className="cube">
            <div className="face front">💬</div>
            <div className="face back">🤖</div>
            <div className="face right">💭</div>
            <div className="face left">🗨️</div>
            <div className="face top">💡</div>
            <div className="face bottom">❓</div>
          </div>
        </div>
      </div>

      {/* Chatbot container */}
      <div id="chatbot-container" className="chatbot-container">
        <div className="chatbot-header">
          <h3>AZAYD Assistant</h3>
          <button id="chatbot-close" className="chatbot-close">×</button>
        </div>
        <div id="chatbot-messages" className="chatbot-messages"></div>
        <div className="chatbot-input-container">
          <input 
            type="text" 
            id="chatbot-input" 
            className="chatbot-input" 
            placeholder="Ask me anything about AZAYD..."
          />
          <button id="chatbot-send" className="chatbot-send">Send</button>
        </div>
      </div>
    </>
  );
};

export default ChatbotComponent;