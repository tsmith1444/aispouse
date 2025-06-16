const axios = require('axios');
const fs = require('fs');
const path = require('path');

const ELEVEN_API_KEY = 'sk_bdfe1680c82fc70761926fa58d1e96be2d4295e8bc2b1205'; // fake key
const VOICE_ID = 'ZT9u07TYPVl83ejeLakq'; // Rachelle's voice

async function generateSpouseVoice(text) {
  try {
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

    const audioPath = path.join(__dirname, 'public', 'spouse_response.mp3');
    fs.writeFileSync(audioPath, response.data);
    return '/spouse_response.mp3';
  } catch (error) {
    console.error('Error generating voice:', error.message);
    return null;
  }
}

module.exports = generateSpouseVoice;
