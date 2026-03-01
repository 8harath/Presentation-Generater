import { GoogleGenerativeAI } from '@google/generative-ai';
import { readFileSync } from 'fs';

// Read .env.local manually
const env = readFileSync('.env.local', 'utf8');
const match = env.match(/GOOGLE_GENERATIVE_AI_KEY=(.+)/);
const key = match?.[1]?.trim();

console.log('Key present:', !!key);
console.log('Key prefix:', key ? key.substring(0, 14) + '...' : 'MISSING');

if (!key) {
    console.error('No API key found!');
    process.exit(1);
}

const client = new GoogleGenerativeAI(key);
const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' });

try {
    console.log('Calling Gemini API...');
    const result = await model.generateContent('Return this exact JSON and nothing else: {"title": "Test Slide", "bullets": ["Point 1", "Point 2"], "imageConcept": "test"}');
    const text = result.response.text();
    console.log('SUCCESS! Response:', text.substring(0, 300));
} catch (error) {
    console.error('ERROR:', error.message);
    console.error('Status:', error.status);
}
