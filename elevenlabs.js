// elevenlabs.js
const axios = require('axios');
const fs    = require('fs');
const path  = require('path');

const ELEVEN_API_KEY = 'sk_6b19972b58c5b07685efe3f9da3f8f06107f3114ed573f9a';  // ← your fake key
const VOICE_ID       = 'PjkBJlyjC1SUbaEXg0K7';                             // ← your voice ID

async function generateSpouseVoice(text) {
  try {
    console.log('📤 Sending to ElevenLabs:', { VOICE_ID, text });

    const response = await axios({
      method:       'post',
      url:          `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      data:         { text, voice_settings: { stability: 0.5, similarity_boost: 0.75 } },
      headers:      {
        'xi-api-key':    ELEVEN_API_KEY,
        'Content-Type':  'application/json'
      },
      responseType: 'arraybuffer'
    });

    const filename = `spouse_response_${Date.now()}.mp3`;
    const filePath = path.join(__dirname, 'public', filename);

    // write binary MP3
    fs.writeFileSync(filePath, Buffer.from(response.data), 'binary');
    console.log('✅ Voice file saved as:', filename);

    // debug file size
    const stats = fs.statSync(filePath);
    console.log(`📦 File size: ${stats.size} bytes`);

    return `/${filename}`;
  } catch (err) {
    console.error('❌ Voice generation failed:', err.message);
    return null;
  }
}

module.exports = generateSpouseVoice;
