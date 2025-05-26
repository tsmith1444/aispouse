import React, { useState } from 'react';
import './VoiceChat.css';

const VoiceChat = () => {
  const [isListening, setIsListening] = useState(false);
  
  const toggleListening = () => {
    setIsListening(!isListening);
  };
  
  return (
    <div className="voice-chat-container">
      <button 
        className={`voice-button ${isListening ? 'listening' : ''}`}
        onClick={toggleListening}
      >
        {isListening ? 'Stop Voice' : 'Start Voice Chat'}
      </button>
    </div>
  );
};

export default VoiceChat;
