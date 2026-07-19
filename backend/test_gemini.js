const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const { GoogleGenAI } = require('@google/genai');

const geminiKey = process.env.GEMINI_API_KEY || '';
console.log('Using Gemini API Key:', geminiKey ? 'Found' : 'Missing');

async function test() {
  try {
    const ai = new GoogleGenAI({ apiKey: geminiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Say hello in 3 words',
    });

    console.log('Response Text:', response.text);
  } catch (err) {
    console.error('Gemini Error:', err);
  }
}

test();
