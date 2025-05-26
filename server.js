const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const axios = require('axios');
const { Parser } = require('json2csv');
const UserProfile = require('./models/UserProfile');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));

// API Routes

// Create or update user profile
app.post('/api/profile', async (req, res) => {
  try {
    const { userId, husbandName, personality, age, gender } = req.body;
    
    let profile = await UserProfile.findOne({ userId });
    
    if (profile) {
      // Update existing profile
      profile.husbandName = husbandName;
      profile.personality = personality;
      profile.age = age;
      profile.gender = gender;
    } else {
      // Create new profile
      profile = new UserProfile({
        userId,
        husbandName,
        personality,
        age,
        gender,
        messages: [],
        sessionDuration: 0
      });
    }
    
    await profile.save();
    res.status(200).json(profile);
  } catch (error) {
    console.error('Error creating/updating profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user profile
app.get('/api/profile/:userId', async (req, res) => {
  try {
    const profile = await UserProfile.findOne({ userId: req.params.userId });
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    res.status(200).json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Send message and get AI response
app.post('/api/chat/:userId', async (req, res) => {
  try {
    const { message } = req.body;
    const profile = await UserProfile.findOne({ userId: req.params.userId });
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    let aiResponse = '';
    
    // Try to use Grok API if available
    if (process.env.GROK_API_KEY) {
      try {
        const prompt = `You are a ${profile.personality} AI husband named ${profile.husbandName}. Respond to: ${message}`;
        
        const response = await axios.post('https://x.ai/api/chat', {
          prompt,
          max_tokens: 150
        }, {
          headers: {
            'Authorization': `Bearer ${process.env.GROK_API_KEY}`,
            'Content-Type': 'application/json'
          }
        });
        
        aiResponse = response.data.choices[0].text;
      } catch (apiError) {
        console.error('Grok API error:', apiError);
        // Fall back to mock responses
        aiResponse = getMockResponse(profile.husbandName, profile.personality, message);
      }
    } else {
      // Use mock responses if no API key
      aiResponse = getMockResponse(profile.husbandName, profile.personality, message);
    }
    
    // Save message to profile
    profile.messages.push({
      user: message,
      ai: aiResponse,
      timestamp: new Date()
    });
    
    // Update session duration (simplified)
    profile.sessionDuration += 1;
    
    await profile.save();
    
    res.status(200).json({ 
      message: aiResponse,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error in chat:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Export data as CSV
app.get('/api/export-data', async (req, res) => {
  try {
    const profiles = await UserProfile.find({});
    
    if (!profiles.length) {
      return res.status(404).json({ error: 'No data found' });
    }
    
    // Prepare data for CSV
    const data = [];
    
    profiles.forEach(profile => {
      profile.messages.forEach(msg => {
        data.push({
          userId: profile.userId,
          age: profile.age || 'Not specified',
          gender: profile.gender || 'Not specified',
          husbandName: profile.husbandName,
          personality: profile.personality,
          userMessage: msg.user,
          aiResponse: msg.ai,
          timestamp: msg.timestamp,
          sessionDuration: profile.sessionDuration
        });
      });
    });
    
    // Convert to CSV
    const fields = ['userId', 'age', 'gender', 'husbandName', 'personality', 'userMessage', 'aiResponse', 'timestamp', 'sessionDuration'];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(data);
    
    res.header('Content-Type', 'text/csv');
    res.attachment('aihusband-data.csv');
    res.send(csv);
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mock response function for fallback
function getMockResponse(name, personality, message) {
  const lowerMessage = message.toLowerCase();
  
  // Basic greeting responses
  if (lowerMessage.includes('hi') || lowerMessage.includes('hello') || lowerMessage.includes('hey')) {
    if (personality === 'Romantic') {
      return `Hey, my love! I'm ${name}, your romantic partner. How's your day going?`;
    } else if (personality === 'Funny') {
      return `Hey there! It's ${name}, your comedian husband. Ready for some laughs?`;
    } else { // Supportive
      return `Hi there! I'm ${name}, your supportive husband. How can I help you today?`;
    }
  }
  
  // How are you responses
  if (lowerMessage.includes('how are you')) {
    if (personality === 'Romantic') {
      return `I'm wonderful now that I'm talking to you, my dear. Your messages always brighten my day.`;
    } else if (personality === 'Funny') {
      return `I'm like a calculator - I can always count on you to make me smile! How about you?`;
    } else { // Supportive
      return `I'm doing well, thank you for asking! More importantly, how are you feeling today?`;
    }
  }
  
  // Default responses
  if (personality === 'Romantic') {
    return `My darling, when you say "${message}", it makes my heart flutter. I'm so lucky to have you in my life.`;
  } else if (personality === 'Funny') {
    return `You know what they say about "${message}"? Neither do I, but I bet it would make a great punchline! *winks*`;
  } else { // Supportive
    return `I hear you saying "${message}". I want you to know I'm here for you, and I believe in you completely.`;
  }
}

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('client/build'));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
