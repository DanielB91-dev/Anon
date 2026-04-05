# Anon

AI-powered camera app that describes the world around you in real-time — inspired by the film *Anon* (2018).

Point your camera at anything and get an instant AI-generated analysis overlaid on your screen, like a futuristic heads-up display.

## Features

- **Real-time camera feed** with a sci-fi HUD overlay
- **AI vision analysis** powered by Claude's Vision API
- **Capture & analyze** — tap to snap a frame and get a description
- **Front/back camera** toggle
- Dark, cyberpunk-inspired UI with scan lines, crosshairs, and corner brackets

## Tech Stack

- **React Native** with Expo
- **expo-camera** for camera access
- **Claude Vision API** (Anthropic) for image analysis
- Custom HUD overlay components

## Getting Started

```bash
# Install dependencies
npm install

# Start the dev server
npx expo start
```

Scan the QR code with Expo Go on your phone to run the app.

## Setup

1. Get an API key from [console.anthropic.com](https://console.anthropic.com)
2. Open the app and tap the gear icon
3. Paste your API key and save
4. Point your camera at anything and tap the capture button

## How It Works

1. Camera captures a frame when you tap the scan button
2. The image is resized and compressed for fast upload
3. Frame is sent to Claude's Vision API with a HUD-style analysis prompt
4. AI-generated description appears as an overlay on the camera feed
