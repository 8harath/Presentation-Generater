# AI Presentation Generator - MVP

A working MVP with a beautiful, functional landing page and form for AI-powered PowerPoint presentation generation. The interface is complete and ready for backend integration.

## Current Status

✅ **Working Features:**
- Beautiful responsive landing page with hero section
- Interactive presentation generator form
- Template selector (Minimal, Professional, Creative)
- Slide count picker (3-15 slides)
- Topic and context input fields
- Form validation and state management
- Professional design with Tailwind CSS and shadcn/ui

🔄 **Next: Backend Integration**
- Gemini API integration for content generation
- PPTX file generation
- Progress tracking
- Download functionality

## Getting Started

### Run Locally

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Deploy

Click "Publish" to deploy to Vercel.

## Project Structure

```
├── app/
│   ├── page.tsx              # Main landing page with form
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   └── ui/                   # shadcn/ui components
├── lib/
│   └── utils.ts              # Utility functions
└── package.json
```

## Form Features

The home page includes:
- **Topic Input**: Enter presentation topic
- **Context Field**: Optional additional details
- **Template Selector**: Choose Minimal, Professional, or Creative
- **Slide Count**: Select 3-15 slides
- **Generate Button**: Submit form (demo mode shows placeholder)

## Next Steps - Backend Integration

To add full functionality, implement:

1. **Create API route** (`app/api/generate/route.ts`):
   - Accept POST requests with form data
   - Call Gemini API for content generation
   - Generate PPTX file
   - Return download link

2. **Add Gemini API key**:
   - Get key from [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
   - Add to environment: `GOOGLE_GENERATIVE_AI_KEY`

3. **Install backend dependencies**:
   ```bash
   pnpm add @google/generative-ai jszip
   ```

4. **Update form handler** in `app/page.tsx`:
   ```javascript
   const response = await fetch('/api/generate', {
     method: 'POST',
     body: JSON.stringify({ topic, context, slides, template })
   });
   ```

## Tech Stack

- **Next.js 16** - React framework
- **React 19.2** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **shadcn/ui** - UI components
- **Lucide React** - Icons
- **Sonner** - Notifications

## Customization

- Modify colors in `app/page.tsx` Tailwind classes
- Edit copy in the landing page sections
- Add more template options in the form
- Extend slide range in the selector

## License

MIT
