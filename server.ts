import express from 'express';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize Gemini AI client server-side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// API endpoint for Video Analysis using gemini-4-argon
app.post('/api/analyze-video', async (req, res) => {
  try {
    const { videoData, mimeType, prompt } = req.body;

    if (!videoData) {
      return res.status(400).json({ error: 'Video data is required' });
    }

    const defaultPrompt = prompt || 'Analyze this video for key financial information, customer identity verification, risk/fraud signals, compliance data, and transaction details. Provide a structured and professional banking assessment.';

    const response = await ai.models.generateContent({
      model: 'gemini-4-argon',
      contents: [
        {
          inlineData: {
            mimeType: mimeType || 'video/mp4',
            data: videoData,
          },
        },
        {
          text: defaultPrompt,
        },
      ],
      config: {
        systemInstruction: 'You are an elite senior banking compliance officer and video intelligence auditor for Meridian Federal Trust. Analyze uploaded videos with extreme precision, evaluating identity verification, collateral inspection, transaction authorization, and risk signals. Return professional financial audit reports.',
        temperature: 0.2,
      },
    });

    res.json({ analysis: response.text });
  } catch (error: any) {
    console.error('Error analyzing video with Gemini 4 Argon:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze video' });
  }
});

// Setup Vite middleware in development or serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
} else {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Meridian Federal Trust server running on port ${PORT}`);
});
