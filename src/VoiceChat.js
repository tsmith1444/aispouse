import React, { useState, useEffect, useRef } from 'react';
import './VoiceChat.css';

const VoiceChat = ({ userId, onSendMessage, lastResponse }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);
  const speechSynthesisRef = useRef(window.speechSynthesis);
  
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
  
  // Text-to-speech for AI responses
  useEffect(() => {
    if (lastResponse && !isSpeaking && !isListening) {
      speakText(lastResponse);
    }
  }, [lastResponse, isSpeaking, isListening]);
  
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      speechSynthesisRef.current.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set voice (optional - can be customized)
      const voices = speechSynthesisRef.current.getVoices();
      if (voices.length > 0) {
        // Try to find a female voice for variety
        const femaleVoice = voices.find(voice => voice.name.includes('female'));
        utterance.voice = femaleVoice || voices[0];
      }
      
      utterance.rate = 1.0; // Speed
      utterance.pitch = 1.0; // Pitch
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      speechSynthesisRef.current.speak(utterance);
    }
  };
  
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      
      // If there's a transcript, ask if user wants to send it
      if (transcript.trim()) {
        setIsSending(true);
      }
    } else {
      // Cancel any ongoing speech when starting to listen
      if (isSpeaking) {
        speechSynthesisRef.current.cancel();
        setIsSpeaking(false);
      }
      
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
          className={`voice-button ${isListening ? 'listening' : ''} ${isSpeaking ? 'speaking' : ''}`}
          onClick={toggleListening}
          disabled={isSpeaking}
        >
          {isListening ? 'Stop Voice' : isSpeaking ? 'Speaking...' : 'Start Voice Chat'}
        </button>
      )}
      
      {isSpeaking && (
        <p className="speaking-indicator">Your AI spouse is speaking...</p>
      )}
    </div>
  );
};

export default VoiceChat;
