import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://api.anthropic.com/v1/messages';
const STORAGE_KEY = 'anon_api_key';

let apiKey = null;

export async function setApiKey(key) {
  apiKey = key;
  try {
    await AsyncStorage.setItem(STORAGE_KEY, key);
  } catch (e) {
    console.log('[ANON] Failed to save API key:', e.message);
  }
}

export function getApiKey() {
  return apiKey;
}

export async function loadApiKey() {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      apiKey = stored;
    }
  } catch (e) {
    console.log('[ANON] Failed to load API key:', e.message);
  }
  return apiKey;
}

export async function analyzeImage(base64Image) {
  if (!apiKey) {
    throw new Error('API key not set. Please add your Anthropic API key in Settings.');
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: base64Image,
              },
            },
            {
              type: 'text',
              text: 'You are an AR heads-up display analyzing a camera feed. Describe what you see in 2-3 concise sentences, like a futuristic HUD readout. Identify objects, people, text, and environment. Be precise and informative. Do not use markdown formatting.',
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `API error: ${response.status}`);
  }

  const data = await response.json();
  return data.content[0].text;
}
