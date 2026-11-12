import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import healthHandler from './api/health.ts';
import carparkAvailabilityHandler from './api/carparkavailability.ts';

// Load environment variables from .env file
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // API Routes (Serverless handlers in /api)
  app.get('/api/health', (req, res) => {
    return healthHandler(req, res);
  });

  app.get('/api/carparkavailability', (req, res) => {
    return carparkAvailabilityHandler(req, res);
  });

  // Support both snake_case and kebab-case aliases
  app.get('/api/carpark-availability', (req, res) => {
    return carparkAvailabilityHandler(req, res);
  });

  // In development, hook into Vite development server middleware
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve built static assets from dist
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ParkSG server listening on http://0.0.0.0:${PORT}`);
    console.log(`LTA DataMall API route ready at /api/carparkavailability`);
    console.log(`Health check ready at /api/health`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
