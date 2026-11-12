import type { Request, Response } from 'express';

export interface HealthResponse {
  status: 'ok' | 'degraded';
  service: string;
  timestamp: string;
  ltaKeyConfigured: boolean;
  uptimeSeconds: number;
  environment: string;
  notes?: string;
}

/**
 * Health check endpoint for the serverless LTA DataMall carpark connection.
 * Can be invoked directly as an Express route handler or serverless function.
 */
export default async function handler(req: Request | any, res?: Response | any) {
  const ltaKey =
    process.env.LTA_ACCOUNT_KEY ||
    process.env.ACCOUNT_KEY ||
    process.env.LTA_DATAMALL_KEY;

  const isConfigured = Boolean(ltaKey && ltaKey.trim().length > 0 && ltaKey !== 'YOUR_LTA_ACCOUNT_KEY');

  const payload: HealthResponse = {
    status: 'ok',
    service: 'parksg-lta-datamall-serverless-api',
    timestamp: new Date().toISOString(),
    ltaKeyConfigured: isConfigured,
    uptimeSeconds: Math.round(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
    notes: isConfigured
      ? 'LTA AccountKey is detected in environment variables.'
      : 'LTA_ACCOUNT_KEY is not configured yet. Configure LTA_ACCOUNT_KEY in .env to pull live LTA DataMall lots.',
  };

  // If used with Express res object
  if (res && typeof res.status === 'function') {
    return res.status(200).json(payload);
  }

  // If used in Web Standard Request/Response serverless runtime (e.g. Next/Edge/Cloudflare)
  return new globalThis.Response(JSON.stringify(payload), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
