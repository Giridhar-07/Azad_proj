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
      {/* Chatbot container */}
      <div id="chatbot-container" className="chatbot-container">
        <div id="chatbot-messages" className="chatbot-messages"></div>
      </div>
    </>
  );
};

export default ChatbotComponent;