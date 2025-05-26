const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const axios = require('axios');
const { Parser } = require('json2csv');
const OpenAI = require('openai');

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
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB Connection Error:', err));

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Define Profile Schema directly in server.js
const ProfileSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  husbandName: {
    type: String,
    required: true
  },
  personality: {
    type: String,
    required: true,
    enum: ['Romantic', 'Supportive', 'Funny'],
    default: 'Supportive'
  },
  age: {
    type: Number
  },
  gender: {
    type: String
  },
  conversations: [{
    message: String,
    response: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Profile = mongoose.model('Profile', ProfileSchema);

// API routes
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// API route to create a profile
app.post('/api/profile', async (req, res) => {
  try {
    const { userId, husbandName, personality, age, gender } = req.body;
    
    // Check if profile already exists
    let profile = await Profile.findOne({ userId });
    
    if (profile) {
      // Update existing profile
      profile.husbandName = husbandName;
      profile.personality = personality;
      if (age) profile.age = age;
      if (gender) profile.gender = gender;
      
      await profile.save();
    } else {
      // Create new profile
      profile = new Profile({
        userId,
        husbandName,
        personality,
        age,
        gender
      });
      
      await profile.save();
    }
    
    res.json(profile);
  } catch (err) {
    console.error('Error creating profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// API route to get a profile
app.get('/api/profile/:userId', async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.params.userId });
    
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    res.json(profile);
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// API route for chat with OpenAI integration
app.post('/api/chat/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { message } = req.body;
    
    // Find the user's profile
    const profile = await Profile.findOne({ userId });
    
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    // Get conversation history (last 10 messages)
    const conversationHistory = profile.conversations || [];
    const recentConversations = conversationHistory.slice(-10);
    
    // Create a prompt with personality and conversation history
    let systemPrompt = `You are ${profile.husbandName}, a ${profile.age || 'adult'} year old ${profile.gender || 'person'} with a ${profile.personality.toLowerCase()} personality. `;
    
    switch (profile.personality) {
      case 'Romantic':
        systemPrompt += "You are very affectionate, caring, and express your love frequently. You use terms of endearment and are emotionally expressive.";
        break;
      case 'Funny':
        systemPrompt += "You have a great sense of humor, love making jokes, and always try to make your spouse laugh. You're playful and witty.";
        break;
      case 'Supportive':
      default:
        systemPrompt += "You are understanding, empathetic, and always there to support your spouse. You're a good listener and give thoughtful advice.";
    }
    
    // Format conversation history for context
    const conversationContext = recentConversations.map(conv => 
      `User: ${conv.message}\nYou: ${conv.response}`
    ).join('\n');
    
    // Generate response using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "system", content: `Previous conversation:\n${conversationContext}` },
        { role: "user", content: message }
      ],
      max_tokens: 150,
      temperature: 0.7,
    });
    
    // Get the AI response
    const response = completion.choices[0].message.content;
    
    // Save the conversation
    profile.conversations.push({
      message,
      response,
      timestamp: Date.now()
    });
    
    await profile.save();
    
    res.json({ message: response });
  } catch (err) {
    console.error('Error in chat:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('build'));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'build', 'index.html'));
  });
} else {
  // Simple route for testing that the API is running
  app.get('/', (req, res) => {
    res.json({ message: 'AI Spouse API is running' });
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
