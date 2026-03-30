# ALLWEONE AI Presentation Generator

An AI-powered presentation generator that creates slides from any topic. Enter a topic, get an outline, generate slides, and present — all in the browser.

## How It Works

1. Enter a presentation topic
2. AI generates an outline using Groq (Llama 3.3 70B)
3. Review and customize the outline
4. Generate full presentation slides
5. Present directly from the app or export to PowerPoint

All presentations are saved locally in your browser (localStorage). No account or database required.

## Tech Stack

- **Framework**: Next.js 15 (App Router, Turbopack)
- **AI**: Groq API via Vercel AI SDK
- **Model**: Llama 3.3 70B Versatile
- **Editor**: Plate.js (rich text slide editing)
- **Styling**: Tailwind CSS, Radix UI
- **State**: Zustand
- **Storage**: Browser localStorage

## Setup

### Requirements

- Node.js 18+
- Groq API key ([get one here](https://console.groq.com))

### Install and Run

```bash
git clone https://github.com/8harath/AMB-PRJ.git
cd AMB-PRJ
npm install
```

Create a `.env` file:

```env
GROQ_API_KEY=your_groq_api_key
```

Optional environment variables:

```env
TOGETHER_AI_API_KEY=     # AI image generation (Together AI)
UNSPLASH_ACCESS_KEY=     # Stock images from Unsplash
TAVILY_API_KEY=          # Web search during outline generation
UPLOADTHING_TOKEN=       # File uploads
```

Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Deploy to Vercel

The only required environment variable is `GROQ_API_KEY`. Set it in your Vercel project settings and deploy.

## Features

- AI-generated outlines and slides from any topic
- 9 built-in presentation themes
- Multiple language support (English, Hindi, Bengali, Tamil, Telugu, and more)
- Configurable slide count and page style
- Real-time streaming generation
- Rich text editing with drag-and-drop slide reordering
- Presentation mode (present directly from the app)
- Export to PowerPoint (.pptx)
- Auto-save to browser localStorage
- Dark/light theme toggle
