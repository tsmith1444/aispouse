const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { OpenAI } = require('openai');
const generateSpouseVoice = require('./elevenlabs'); // ✅ <-- this is new

// Load environment variables
dotenv.config();

// Debug startup
console.log('🚀 Server is running and using the latest code');

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// MongoDB setup
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// OpenAI setup
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Schema
const ProfileSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  husbandName: { type: String, required: true },
  personality: { type: String, required: true },
  age: { type: Number },
  gender: { type: String },
  conversations: [{
    message: String,
    response: String,
    timestamp: Date
  }]
});
const Profile = mongoose.model('Profile', ProfileSchema);

// Routes

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
        userId, husbandName, personality, age, gender, conversations: []
      });
    }

    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error('Error creating profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/chat/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { message } = req.body;
    const profile = await Profile.findOne({ userId });

    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    const conversationHistory = profile.conversations || [];
    const recentConversations = conversationHistory.slice(-10);

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

    const conversationContext = recentConversations.map(conv =>
      `User: ${conv.message}\nYou: ${conv.response}`
    ).join('\n');

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

    const response = completion.choices[0].message.content;

    // ✅ Generate voice
    const audioUrl = await generateSpouseVoice(response);
    console.log('Voice URL:', audioUrl);

    profile.conversations.push({
      message, response, timestamp: Date.now()
    });

    await profile.save();

    const typingDelay = Math.min(Math.max(response.length * 33, 1000), 5000);
    setTimeout(() => {
      res.json({ message: response, audioUrl });
    }, typingDelay);
  } catch (err) {
    console.error('Error in chat:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Serve frontend
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('build'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
