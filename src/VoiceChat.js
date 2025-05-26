import React, { useState, useEffect, useRef } from 'react';
import './VoiceChat.css';

const VoiceChat = ({ userId, onSendMessage }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSending, setIsSending] = useState(false);
  const recognitionRef = useRef(null);
  
  // Initialize speech recognition
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        
        setTranscript(transcript);
      };
      
      recognitionRef.current.onend = () => {
        if (isListening) {
          recognitionRef.current.start();
        }
      };
    }
  }, [isListening]);
  
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      
      // If there's a transcript, ask if user wants to send it
      if (transcript.trim()) {
        setIsSending(true);
      }
    } else {
      setTranscript('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };
  
  const handleSend = () => {
    if (transcript.trim() && onSendMessage) {
      onSendMessage(transcript);
      setTranscript('');
      setIsSending(false);
    }
  };
  
  const handleCancel = () => {
    setTranscript('');
    setIsSending(false);
  };
  
  return (
    <div className="voice-chat-container">
      {transcript && (
        <div className="transcript-container">
          <p className="transcript">{transcript}</p>
        </div>
      )}
      
      {isSending ? (
        <div className="send-controls">
          <button className="voice-button" onClick={handleSend}>
            Send Message
          </button>
          <button className="voice-button cancel" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      ) : (
        <button 
          className={`voice-button ${isListening ? 'listening' : ''}`}
          onClick={toggleListening}
        >
          {isListening ? 'Stop Voice' : 'Start Voice Chat'}
        </button>
      )}
    </div>
  );
};

export default VoiceChat;
