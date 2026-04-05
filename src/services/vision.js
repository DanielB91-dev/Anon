const API_URL = 'https://api.anthropic.com/v1/messages';

// Store the API key in memory (set via Settings screen)
let apiKey = null;

export function setApiKey(key) {
  apiKey = key;
}

export function getApiKey() {
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
