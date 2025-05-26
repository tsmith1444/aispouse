// Modify the chat API route in server.js
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
    
    // Add a delay before sending the response (simulate typing)
    // Calculate delay based on response length (approx. 30 characters per second)
    const typingDelay = Math.min(Math.max(response.length * 33, 1000), 5000); // Between 1-5 seconds
    
    setTimeout(() => {
      res.json({ message: response });
    }, typingDelay);
    
  } catch (err) {
    console.error('Error in chat:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
