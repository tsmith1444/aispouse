import React, { useState, useEffect, useRef } from 'react';
import './VoiceChat.css';

const VoiceChat = ({ userId, onSendMessage, lastResponse }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
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
    } else {
      alert('Your browser does not support speech recognition. Please try Chrome or Edge.');
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening]);
  
  // Handle speaking the AI response
  useEffect(() => {
    if (lastResponse && !isSpeaking) {
      speakText(lastResponse);
    }
  }, [lastResponse]);
  
  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      recognitionRef.current.stop();
      
      if (transcript.trim()) {
        onSendMessage(transcript.trim());
        setTranscript('');
      }
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };
  
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      setIsSpeaking(true);
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Get available voices and select a female voice if available
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(voice => 
        voice.name.includes('female') || 
        voice.name.includes('Samantha') || 
        voice.name.includes('Google UK English Female')
      );
      
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }
      
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Your browser does not support speech synthesis. Please try Chrome or Edge.');
    }
  };
  
  return (
    <div className="voice-chat-container">
      <div className="transcript-container">
        {transcript && <p className="transcript">{transcript}</p>}
      </div>
      
      <button 
        className={`voice-button ${isListening ? 'listening' : ''} ${isSpeaking ? 'speaking' : ''}`}
        onClick={toggleListening}
        disabled={isSpeaking}
      >
        {isListening ? 'Stop & Send' : 'Start Voice Chat'}
      </button>
      
      {isSpeaking && <div className="speaking-indicator">AI is speaking...</div>}
    </div>
  );
};

export default VoiceChat;
