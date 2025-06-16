async function generateSpouseVoice(text) {
  try {
    console.log('📤 Sending to ElevenLabs:', { VOICE_ID, text }); // ✅ log input
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        text: text,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      },
      {
        headers: {
          'xi-api-key': ELEVEN_API_KEY,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer'
      }
    );

    const filename = `spouse_response_${Date.now()}.mp3`;
    const filePath = path.join(__dirname, 'public', filename);
    fs.writeFileSync(filePath, response.data);

    console.log('✅ Voice file saved as:', filename); // log output
    return `/${filename}`;
  } catch (error) {
    console.error('❌ Voice generation failed:', error.message);
    return null;
  }
}
