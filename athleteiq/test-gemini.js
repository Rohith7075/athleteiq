// Quick test to check Gemini API key
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

// Read the API key from .env.local
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const match = envContent.match(/GEMINI_API_KEY=(\S+)/);
const apiKey = match ? match[1] : '';

if (!apiKey || apiKey === 'your_gemini_api_key_here') {
  console.log('❌ GEMINI_API_KEY is empty or still the placeholder!');
  console.log('   Open .env.local and replace with your real key from:');
  console.log('   https://aistudio.google.com/apikey');
  process.exit(1);
}

console.log('API Key found:', apiKey.substring(0, 10) + '...');

const genAI = new GoogleGenerativeAI(apiKey);

async function testModels() {
  // Try different model names
  const modelsToTry = [
    'gemini-2.0-flash',
    'gemini-2.5-flash',
    'gemini-2.0-flash-lite',
  ];

  for (const modelName of modelsToTry) {
    try {
      console.log(`\nTrying model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent('Say "Hello" in one word.');
      const text = result.response.text();
      console.log(`✅ SUCCESS with ${modelName}:`, text);
      break;
    } catch (err) {
      console.log(`❌ FAILED with ${modelName}:`, err.message?.substring(0, 120));
    }
  }
}

testModels().catch(console.error);