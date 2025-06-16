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

    // ✅ Stop repeated playback and play only once
    if (response.audioUrl) {
      if (window.spouseAudio) {
        window.spouseAudio.pause();
        window.spouseAudio.currentTime = 0;
      }
      window.spouseAudio = new Audio(response.audioUrl);
      window.spouseAudio.play();
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
