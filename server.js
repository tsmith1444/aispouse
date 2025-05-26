const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const axios = require('axios');
const { Parser } = require('json2csv');

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

// API routes
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
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
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Profile = mongoose.model('Profile', ProfileSchema);

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

// API route for chat
app.post('/api/chat/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { message } = req.body;
    
    // Find the user's profile
    const profile = await Profile.findOne({ userId });
    
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    // Generate a response based on personality
    let response;
    switch (profile.personality) {
      case 'Romantic':
        response = `My dear, ${message}? That's so wonderful to hear from you. I've been thinking about you all day.`;
        break;
      case 'Funny':
        response = `Haha! ${message}? That's hilarious! You always know how to make me laugh.`;
        break;
      case 'Supportive':
      default:
        response = `I understand completely. When you say "${message}", I'm here to support you no matter what.`;
    }
    
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
