import React, { useState, useEffect } from 'react';
import './App.css';
import { getProfile, createProfile, sendMessage } from './api';
import VoiceChat from './VoiceChat';
import './VoiceChat.css';

function App() {
  const [userId, setUserId] = useState('');
  const [husbandName, setHusbandName] = useState('');
  const [personality, setPersonality] = useState('Supportive');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('profile');

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
      fetchProfile(storedUserId);
    }
  }, []);

  const fetchProfile = async (id) => {
    try {
      setLoading(true);
      const profileData = await getProfile(id);
      setProfile(profileData);
      setHusbandName(profileData.husbandName);
      setPersonality(profileData.personality);
      setAge(profileData.age || '');
      setGender(profileData.gender || '');
      setStep('chat');
      setLoading(false);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!husbandName) {
      setError('Please enter a name for your AI spouse');
      return;
    }

    try {
      setLoading(true);
      const newUserId = userId || Math.random().toString(36).substring(2, 15);

      const profileData = await createProfile({
        userId: newUserId,
        husbandName,
        personality,
        age: age || undefined,
        gender: gender || undefined
      });

      setUserId(newUserId);
      localStorage.setItem('userId', newUserId);
      setProfile(profileData);
      setStep('chat');
      setLoading(false);
    } catch (err) {
      console.error('Error creating profile:', err);
      setError('Failed to create profile. Please try again.');
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = message;
    setMessage('');
    setConversation([...conversation, { sender: 'user', text: userMessage }]);

    try {
      setLoading(true);
      const response = await sendMessage(userId, userMessage);

      setConversation(prev => [...prev, { sender: 'ai', text: response.message, audioUrl: response.audioUrl }]);

      setLoading(false);
    } catch (err) {
      console.error('Error sending message:', err);
      setConversation(prev => [...prev, {
        sender: 'ai',
        text: 'Sorry, I had trouble responding. Please try again.'
      }]);
      setLoading(false);
    }
  };

  const handleVoiceMessage = (voiceText) => {
    if (!voiceText.trim()) return;
    const fakeEvent = { preventDefault: () => {} };
    setMessage(voiceText);
    handleSendMessage(fakeEvent);
  };

  const renderProfileForm = () => (
    <div className="profile-form">
      <h2>Choose Your AI Spouse</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleProfileSubmit}>
        <div className="form-group">
          <label>Spouse Name:</label>
          <input
            type="text"
            value={husbandName}
            onChange={(e) => setHusbandName(e.target.value)}
            placeholder="What would you like to call them?"
          />
        </div>

        <div className="form-group">
          <label>Select a Personality:</label>
          <div className="preset-selector">
            {[
              { label: 'Luna', personality: 'Romantic' },
              { label: 'Sage', personality: 'Supportive' },
              { label: 'Maya', personality: 'Funny' },
              { label: 'Nova', personality: 'Driven' },
              { label: 'Bliss', personality: 'Soothing' }
            ].map((option) => (
              <button
                key={option.label}
                type="button"
                className={`preset-button ${personality === option.personality ? 'selected' : ''}`}
                onClick={() => {
                  setPersonality(option.personality);
                  setHusbandName(option.label);
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Age (optional):</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Enter age"
          />
        </div>

        <div className="form-group">
          <label>Gender (optional):</label>
          <input
            type="text"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            placeholder="Enter gender"
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create My Spouse'}
        </button>
      </form>
    </div>
  );

  const renderChat = () => (
    <div className="chat-container">
      <h2>Chat with {profile.husbandName}</h2>
      <div className="conversation">
        {conversation.length === 0 ? (
          <p className="welcome-message">
            Say hello to your {profile.personality.toLowerCase()} AI spouse!
          </p>
        ) : (
          conversation.map((msg, index) => (
            <div key={index} className={`message ${msg.sender}`}>
              <p>{msg.text}</p>
            </div>
          ))
        )}
        {loading && <div className="message ai loading">Typing...</div>}
      </div>
      <form onSubmit={handleSendMessage} className="message-form">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          disabled={loading}
        />
        <button type="submit" disabled={loading || !message.trim()}>
          Send
        </button>
      </form>
      <VoiceChat 
        userId={userId}
        onSendMessage={handleVoiceMessage}
        lastResponse={conversation.length > 0 && conversation[conversation.length - 1].sender === 'ai' ? conversation[conversation.length - 1].text : null}
        lastAudioUrl={conversation.length > 0 && conversation[conversation.length - 1].audioUrl ? conversation[conversation.length - 1].audioUrl : null}
      />
    </div>
  );

  return (
    <div className="App">
      <header className="App-header">
        <h1>AI Spouse</h1>
      </header>
      <main>
        {step === 'profile' ? renderProfileForm() : renderChat()}
      </main>
      <footer>
        <p>
          <a href="/privacy-policy.html" target="_blank" rel="noopener noreferrer">Privacy Policy</a> | 
          <a href="/terms-of-service.html" target="_blank" rel="noopener noreferrer">Terms of Service</a>
        </p>
      </footer>
    </div>
  );
}

export default App;
