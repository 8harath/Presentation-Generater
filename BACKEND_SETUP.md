# Adding AI Backend Integration

This document walks through adding Gemini API integration to make the presentation generator functional.

## Step 1: Install Dependencies

```bash
pnpm add @google/generative-ai jszip
```

## Step 2: Get Gemini API Key

1. Visit [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Click "Get API Key"
3. Create new project (or select existing)
4. Copy your API key

## Step 3: Add Environment Variable

In the v0 sidebar:
- Click "Vars"
- Add new variable:
  - Key: `GOOGLE_GENERATIVE_AI_KEY`
  - Value: Your API key from Step 2

## Step 4: Create API Route

Create `/app/api/generate/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import JSZip from 'jszip';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { topic, context, slides, template } = await request.json();

    // Generate content with Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `Create a ${slides}-slide PowerPoint presentation about "${topic}".
      ${context ? `Additional context: ${context}` : ''}
      
      For each slide, provide:
      - Slide title
      - 3-4 bullet points
      - A brief description for visuals
      
      Format as JSON array of slides.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const slidesData = JSON.parse(responseText);

    // TODO: Generate PPTX with slidesData using jszip or pptxjs
    // TODO: Upload to storage (Vercel Blob, S3, etc)
    // TODO: Return download URL

    return NextResponse.json({
      jobId: Math.random().toString(36).slice(2),
      status: 'complete',
      downloadUrl: '/path/to/presentation.pptx'
    });

  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate presentation' },
      { status: 500 }
    );
  }
}
```

## Step 5: Update Form Handler

In `app/page.tsx`, update the `handleGenerate` function:

```typescript
const handleGenerate = async () => {
  if (!topic.trim()) {
    alert('Please enter a topic');
    return;
  }

  setLoading(true);
  setStatus('Generating your presentation...');

  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic,
        context,
        slides,
        template,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setStatus(`Error: ${data.error}`);
      setLoading(false);
      return;
    }

    // Download the file
    const link = document.createElement('a');
    link.href = data.downloadUrl;
    link.download = `presentation-${Date.now()}.pptx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setStatus('✓ Download started!');
    setLoading(false);
  } catch (error) {
    setStatus(`Error: ${error}`);
    setLoading(false);
  }
};
```

## Step 6: Generate PPTX (Advanced)

For PPTX generation, you can use:

### Option A: pptxjs (Simpler)
```bash
pnpm add pptxjs
```

```typescript
import pptx from 'pptxjs';

// Create presentation
const pres = new pptx.Presentation();

slides.forEach((slide) => {
  const slide_layout = pres.defineLayout({ name: 'title' });
  slide_layout.addShape(pres.ShapeType.rect, {
    x: 0.5, y: 0.5, w: 9, h: 0.75,
    fill: { type: 'solid', color: '0066CC' }
  });
  
  const slideObj = pres.addSlide(slide_layout);
  slideObj.addText(slide.title, { x: 0.5, y: 0.5, w: 9, h: 0.75 });
  
  slide.bullets.forEach((bullet, i) => {
    slideObj.addText(`• ${bullet}`, { 
      x: 0.5, y: 1.5 + (i * 0.5), w: 9, h: 0.5 
    });
  });
});

// Save to buffer
const buf = pres.write();
```

### Option B: Custom PPTX (XML-based)
Use JSZip to create PPTX structure manually (more control, more complex).

## Step 7: Store Generated Files

Choose a storage solution:

**Option A: Vercel Blob** (Recommended)
```bash
pnpm add @vercel/blob
```

```typescript
import { put } from '@vercel/blob';

const response = await put(`presentations/${filename}`, pptxBuffer, {
  access: 'public',
});

return NextResponse.json({ downloadUrl: response.url });
```

**Option B: AWS S3**
```bash
pnpm add @aws-sdk/client-s3
```

**Option C: Temporary - Serve from endpoint**
```typescript
// In /app/api/download/[filename]/route.ts
export async function GET(request, { params }) {
  // Return the file from cache or regenerate
  return new Response(pptxBuffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'Content-Disposition': 'attachment; filename="presentation.pptx"',
    },
  });
}
```

## Troubleshooting

### API Key Error
```
Error: GOOGLE_GENERATIVE_AI_KEY is not set
```
Solution: Add the key in v0 Vars section, or check `.env.local` locally.

### Rate Limiting
Gemini API has rate limits. Implement:
- Caching of generated content
- Queue system for multiple requests
- User-level rate limiting

### PPTX Generation Issues
- Ensure JSZip is installed
- Test XML structure with offline tool
- Check file permissions for writing

### Large Presentations Timeout
- Reduce slide count
- Generate slides incrementally
- Increase Vercel timeout settings

## Testing

Test your API endpoint:

```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Machine Learning",
    "context": "For beginners",
    "slides": 5,
    "template": "professional"
  }'
```

## Production Checklist

- [ ] API key properly secured (use environment variables)
- [ ] Error handling for all failures
- [ ] File storage solution implemented
- [ ] CORS headers configured
- [ ] Rate limiting enabled
- [ ] File cleanup (delete old files)
- [ ] Monitoring and logging setup
- [ ] Tests written for API endpoints
