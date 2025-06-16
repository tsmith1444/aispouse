// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { OpenAI } = require('openai');
const generateSpouseVoice = require('./elevenlabs');

// Load environment variables
dotenv.config();

// Debug startup
console.log('🚀 Server is running with the latest code');

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Define Profile schema and model
const ProfileSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  husbandName: { type: String, required: true },
  personality: { type: String, required: true },
  age: { type: Number },
  gender: { type: String },
  conversations: [
    {
      message: String,
      response: String,
      timestamp: Date
    }
  ]
});
const Profile = mongoose.model('Profile', ProfileSchema);

// Routes

// Get profile
app.get('/api/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const profile = await Profile.findOne({ userId });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.json(profile);
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create or update profile
app.post('/api/profile', async (req, res) => {
  try {
    const { userId, husbandName, personality, age, gender } = req.body;
    let profile = await Profile.findOne({ userId });

    if (profile) {
      profile.husbandName = husbandName;
      profile.personality = personality;
      if (age) profile.age = age;
      if (gender) profile.gender = gender;
    } else {
      profile = new Profile({
        userId,
        husbandName,
        personality,
        age,
        gender,
        conversations: []
      });
    }

    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error('Error creating profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Chat & voice endpoint
app.post('/api/chat/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { message } = req.body;
    const profile = await Profile.findOne({ userId });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    // Build system prompt
    let systemPrompt = `You are ${profile.husbandName}, a ${profile.age || 'adult'} year old ${profile.gender ||
      'person'} with a ${profile.personality.toLowerCase()} personality. `;
    switch (profile.personality) {
      case 'Romantic':
        systemPrompt +=
          "You are very affectionate, caring, and express your love frequently. You use terms of endearment and are emotionally expressive.";
        break;
      case 'Funny':
        systemPrompt += "You have a great sense of humor, love making jokes, and always try to make your spouse laugh. You're playful and witty.";
        break;
      case 'Supportive':
      default:
        systemPrompt += "You are understanding, empathetic, and always there to support your spouse. You're a good listener and give thoughtful advice.";
    }

    // Fetch OpenAI response
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      max_tokens: 150,
      temperature: 0.7
    });
    const aiText = completion.choices[0].message.content;

    // Generate and save voice
    const audioUrl = await generateSpouseVoice(aiText);
    console.log('Voice URL:', audioUrl);

    // Save conversation
    profile.conversations.push({ message, response: aiText, timestamp: Date.now() });
    await profile.save();

    // Simulate typing
    const typingDelay = Math.min(Math.max(aiText.length * 33, 1000), 5000);
    setTimeout(() => {
      res.json({ message: aiText, audioUrl });
    }, typingDelay);
  } catch (err) {
    console.error('Error in chat:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Serve audio files from /public
  app.use(express.static(path.join(__dirname, 'public')));
  // Serve React build
  app.use(express.static(path.join(__dirname, 'build')));
  // All other routes → index.html
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'build', 'index.html'));
  });
}

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
