const axios = require('axios');
const fs = require('fs');
const path = require('path');

const ELEVEN_API_KEY = 'your-real-api-key';
const VOICE_ID = 'PjkBJlyjC1SUbaEXg0K7'; // your female voice

async function generateSpouseVoice(text) {
  try {
    console.log('📤 Sending to ElevenLabs:', { VOICE_ID, text });

    const response = await axios({
      method: 'post',
      url: `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      data: {
        text: text,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      },
      headers: {
        'xi-api-key': ELEVEN_API_KEY,
        'Content-Type': 'application/json'
      },
      responseType: 'arraybuffer'
    });

    const filename = `spouse_response_${Date.now()}.mp3`;
    const filePath = path.join(__dirname, 'public', filename);

    fs.writeFileSync(filePath, Buffer.from(response.data), 'binary');

    console.log('✅ Voice file saved as:', filename);
    return `/${filename}`;
  } catch (error) {
    console.error('❌ Voice generation failed:', error.message);
    return null;
  }
}

module.exports = generateSpouseVoice;
