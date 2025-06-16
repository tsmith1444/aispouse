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

    // 🔊 Play the spouse voice if audioUrl is returned
    if (response.audioUrl) {
      const audio = new Audio(response.audioUrl);
      audio.play();
    }

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
