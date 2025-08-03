# Whisper TTS Assistant

A Next.js-based voice assistant that uses OpenAI's Whisper for speech recognition and text-to-speech (TTS) technologies. This project allows you to transcribe, respond, and interact with voice using local or web-based models.

---

## 🧠 Features

- 🎙️ **Speech-to-Text** using Whisper
- 🔊 **Text-to-Speech** model integration
- 🌐 Web-based UI with Next.js
- ⚙️ Local and embedded models (`whisper.cpp`, `tts-model`)
- 📦 Service worker for offline support
- ☁️ MongoDB integration for storing conversations

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or newer)
- npm or yarn
- [MongoDB](https://www.mongodb.com/)
- Optional: Git LFS (for handling large models)

### Clone the Repository

```bash
git clone https://github.com/your-username/whisper-tts-assistant.git
cd whisper-tts-assistant
```

### Install Dependencies

```bash
npm install
# or
yarn install
```

### Set Up Environment Variables

Create a `.env.local` file:

```env
MONGODB_URI=mongodb://localhost:27017/your-db
WHISPER_MODEL_PATH=public/whisper.cpp
TTS_MODEL_PATH=public/tts-model
```

### Run the Development Server

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗃️ Project Structure

```
public/
├─ whisper.cpp/        # Whisper inference engine
├─ tts-model/          # TTS model files
├─ emsdk/              # WebAssembly support (if used)
├─ ggml-model.bin      # Optional: large model binary
src/
├─ app/api/chat/       # API route for chat
lib/
├─ mongo.ts            # MongoDB connection
```

---

## ⚠️ Notes

- Large model files (`.bin`) are not tracked by Git. Use Git LFS or download manually.
- Customize the service worker (`public/sw.js`) if needed.
- Static assets and icons are placed in `public/`.

---

## 📦 Deployment

This app can be deployed on **Vercel**, **Render**, or any Node.js-compatible host.

If deploying to Vercel:
- Add your `.env.local` to the dashboard
- Ensure large binaries/models are excluded from Git or uploaded to a CDN


