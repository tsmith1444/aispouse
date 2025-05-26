import React, { useState, useEffect } from 'react';
import './App.css';
import { getProfile, createProfile, sendMessage } from './api';
// Add these imports for VoiceChat
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
  const [step, setStep] = useState('profile'); // 'profile' or 'chat'

  // Load profile if userId exists
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
      // If profile not found, stay on profile creation page
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!husbandName) {
      setError('Please enter a name for your AI husband');
      return;
    }

    try {
      setLoading(true);
      // Generate a random userId if not set
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
      setConversation(prev => [...prev, { sender: 'ai', text: response.message }]);
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

  const renderProfileForm = () => (
    <div className="profile-form">
      <h2>Create Your AI Husband</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleProfileSubmit}>
        <div className="form-group">
          <label>Name:</label>
          <input
            type="text"
            value={husbandName}
            onChange={(e) => setHusbandName(e.target.value)}
            placeholder="Enter a name"
          />
        </div>
        
        <div className="form-group">
          <label>Personality:</label>
          <select 
            value={personality} 
            onChange={(e) => setPersonality(e.target.value)}
          >
            <option value="Romantic">Romantic</option>
            <option value="Supportive">Supportive</option>
            <option value="Funny">Funny</option>
          </select>
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
          {loading ? 'Creating...' : 'Create AI Husband'}
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
            Say hello to your {profile.personality.toLowerCase()} AI husband!
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
      
      {/* Add Voice Chat Component here */}
      <VoiceChat />
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
