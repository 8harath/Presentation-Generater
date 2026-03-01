# Setup Guide: AI Presentation Generator

## Quick Start (2 minutes)

### Step 1: Get Your Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Get API Key"** in the left sidebar
4. Click **"Create API Key in new project"**
5. Copy the generated API key

### Step 2: Add the API Key to Your Project

1. In v0, click the **"Vars"** button in the sidebar (looks like sliders)
2. Click **"Add Environment Variable"**
3. Fill in:
   - **Key**: `GOOGLE_GENERATIVE_AI_KEY`
   - **Value**: Paste your API key from Step 1
4. Click **"Save"**

### Step 3: Test It Out

1. Click **"Preview"** to start the dev server
2. Navigate to http://localhost:3000
3. Click **"Start Creating"**
4. Enter a topic (e.g., "The Future of Artificial Intelligence")
5. Select a template and slide count
6. Click **"Generate"** and watch it work!

## What You Need

- **Gemini API Key** - Free tier available (generous rate limits)
- **No credit card required** - Free API access available
- **Browser** - Chrome, Firefox, Safari, or Edge

## Gemini API Pricing

The free tier is very generous:

- **60 requests per minute** - More than enough for this MVP
- **No cost** - Free API tier with no credit card needed
- **Generate text** - Unlimited for free tier
- **Generate images** - Included in free tier

See [Google AI for Developers Pricing](https://ai.google.dev/pricing) for details.

## Installation & Running Locally

If you want to run this locally:

```bash
# Clone or download the project
cd ai-presentation-generator

# Install dependencies
pnpm install

# Create .env.local file
cat > .env.local << EOF
GOOGLE_GENERATIVE_AI_KEY=your-api-key-here
EOF

# Run development server
pnpm dev

# Open browser
open http://localhost:3000
```

## Deploying to Vercel

The easiest way to deploy is to Vercel:

1. Click **"Publish"** in v0
2. Connect your Vercel account
3. Follow the prompts
4. Add the `GOOGLE_GENERATIVE_AI_KEY` environment variable in Vercel project settings
5. Done! Your app is live

## Architecture Overview

### Frontend
- **Next.js 16** App Router
- **React 19** with hooks
- **Tailwind CSS** for styling
- **shadcn/ui** for components

### Backend
- **Next.js API Routes** at `/app/api/*`
- **Gemini API** for content and image generation
- **In-memory job store** for MVP (could scale to Redis/database)
- **JSZip** for PPTX generation

### Data Flow

```
User Input
    ↓
POST /api/generate
    ↓
Create Job (jobId)
    ↓
Background Generation:
  1. Generate slide content via Gemini
  2. Generate images for each slide
  3. Compose PPTX file
  4. Store in memory
    ↓
GET /api/status/[jobId]
    ↓ (Polling)
GET /api/download/[jobId] (when complete)
    ↓
User downloads .pptx file
```

## File Structure

```
app/
├── layout.tsx              # Root layout
├── page.tsx                # Home page
├── generate/
│   └── page.tsx            # Generation page
└── api/
    ├── templates/
    │   └── route.ts        # List available templates
    ├── generate/
    │   └── route.ts        # Start generation
    ├── status/
    │   └── [jobId]/route.ts # Check job status
    └── download/
        └── [jobId]/route.ts # Download PPTX

components/
├── PresentationForm.tsx    # Main input form
├── TemplateSelector.tsx    # Template picker
└── GenerationProgress.tsx  # Progress UI

lib/
├── ai/
│   ├── gemini-client.ts    # Gemini API wrapper
│   ├── content-generator.ts # Slide content logic
│   └── prompt-templates.ts # AI prompts
├── pptx/
│   ├── pptx-generator.ts   # PPTX file creation
│   ├── slide-composer.ts   # Slide layout logic
│   └── templates.ts        # Design templates
├── storage/
│   └── job-store.ts        # In-memory job storage
├── types/
│   └── presentation.ts     # TypeScript types
└── utils/
    ├── validation.ts       # Input validation
    ├── error-handler.ts    # Error handling
    └── validate-setup.ts   # Setup validation
```

## Customization

### Change Colors/Fonts

Edit `/lib/pptx/templates.ts` to customize:
- Background colors
- Font families and sizes
- Slide layouts
- Default styling

### Adjust AI Prompts

Edit `/lib/ai/prompt-templates.ts` to:
- Change content generation style
- Adjust image prompts
- Modify slide structure

### Add New Templates

1. Create a new template object in `/lib/pptx/templates.ts`
2. Update the `templateId` type in `/lib/types/presentation.ts`
3. Add it to the frontend template selector

## Troubleshooting

### "API Key is not set" Error

**Problem**: Generation fails with this error
**Solution**: 
1. Check that you added `GOOGLE_GENERATIVE_AI_KEY` in Vars
2. Make sure the value is your actual API key (not a placeholder)
3. Refresh the page and try again

### Generation Takes Too Long

**Problem**: Presentation generation times out
**Solution**:
1. Try reducing the number of slides (3-8 instead of 15)
2. Use a simpler template
3. Check your Gemini API quota

### PPTX File Won't Open

**Problem**: Downloaded file is corrupted
**Solution**:
1. Make sure you have Microsoft Office 2016+ or LibreOffice
2. Try opening in Google Slides
3. Check browser console for JavaScript errors

### Images Not Showing

**Problem**: Slides have colored blocks instead of images
**Solution**:
1. This is expected if image generation fails
2. The system uses fallback gradient backgrounds
3. Check Gemini API quota limits
4. Try again in a few minutes

## Performance Tips

- **3-5 slides**: Fast (~30 seconds)
- **5-10 slides**: Medium (~60 seconds)
- **10-15 slides**: Slow (~90+ seconds)

## Next Steps

### For Users
- Generate presentations
- Customize the content before downloading
- Edit in PowerPoint/Google Slides

### For Developers
- Add authentication to save presentations
- Implement custom templates
- Add speaker notes generation
- Support collaborative editing
- Export to PDF/Google Slides

## Support

### Resources
- [Google AI Documentation](https://ai.google.dev/docs)
- [Gemini API Quickstart](https://ai.google.dev/tutorials/python_quickstart)
- [v0 Documentation](https://v0.dev/docs)

### Getting Help
- Check [Troubleshooting](#troubleshooting) above
- Review error messages in browser console
- Open an issue on GitHub
- Contact Vercel support at vercel.com/help

## Rate Limits

Gemini API free tier:
- **Text Generation**: 60 requests/minute
- **Image Generation**: 20 requests/minute (varies by model)
- **Per day**: 1,500 requests

For production use, consider upgrading to a paid plan.

## Security Notes

- API key is stored as an environment variable (never in code)
- Jobs are stored in memory (clears on server restart)
- No user data is logged or stored permanently
- For production: implement authentication and persistent storage

## License

MIT - Feel free to use and modify!
