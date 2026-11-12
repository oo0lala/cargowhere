import type { Request, Response } from 'express';

const LTA_DATAMALL_CARPARK_ENDPOINT =
  'https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2';

export interface LTACarparkItem {
  CarParkID: string;
  Area: string;
  Development: string;
  Location: string; // e.g. "1.29375 103.85718"
  AvailableLots: number;
  LotType: 'C' | 'H' | 'Y'; // C: Car, H: Heavy Vehicle, Y: Motorcycle
  Agency: 'HDB' | 'LTA' | 'URA';
}

export interface LTACarparkResponse {
  'odata.metadata'?: string;
  value: LTACarparkItem[];
}

export interface ApiResponsePayload {
  success: boolean;
  source: 'lta-datamall' | 'unconfigured';
  timestamp: string;
  totalRecords: number;
  data: LTACarparkItem[];
  error?: string;
  message?: string;
  skip?: number;
}

/**
 * Serverless connection to Land Transport Authority (LTA) DataMall CarParkAvailabilityv2
 * Endpoint: https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2
 * Header: AccountKey: <LTA_ACCOUNT_KEY>
 */
export default async function handler(req: Request | any, res?: Response | any) {
  // Read AccountKey strictly from server-side environment variable (never hardcoded)
  const ltaAccountKey =
    process.env.LTA_ACCOUNT_KEY ||
    process.env.ACCOUNT_KEY ||
    process.env.LTA_DATAMALL_KEY;

  // Extract query parameters
  let skip = 0;
  let fetchAll = false;

  if (req?.query) {
    if (req.query.$skip) skip = parseInt(String(req.query.$skip), 10) || 0;
    else if (req.query.skip) skip = parseInt(String(req.query.skip), 10) || 0;
    if (req.query.all === 'true' || req.query.all === '1') fetchAll = true;
  } else if (req?.url) {
    try {
      const parsedUrl = new URL(req.url, 'http://localhost');
      const skipParam = parsedUrl.searchParams.get('$skip') || parsedUrl.searchParams.get('skip');
      if (skipParam) skip = parseInt(skipParam, 10) || 0;
      if (parsedUrl.searchParams.get('all') === 'true') fetchAll = true;
    } catch {
      // ignore url parsing error
    }
  }

  // If LTA AccountKey has not yet been set by the user, return a clear structured message
  if (!ltaAccountKey || ltaAccountKey === 'YOUR_LTA_ACCOUNT_KEY' || ltaAccountKey.trim() === '') {
    const missingKeyResponse: ApiResponsePayload = {
      success: false,
      source: 'unconfigured',
      timestamp: new Date().toISOString(),
      totalRecords: 0,
      data: [],
      error: 'MISSING_LTA_ACCOUNT_KEY',
      message:
        'LTA_ACCOUNT_KEY environment variable is not configured. Please set LTA_ACCOUNT_KEY in your .env file or server environment.',
    };

    if (res && typeof res.status === 'function') {
      return res.status(200).json(missingKeyResponse);
    }
    return new globalThis.Response(JSON.stringify(missingKeyResponse), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const headers = {
      AccountKey: ltaAccountKey.trim(),
      accept: 'application/json',
      'User-Agent': 'ParkSG-Serverless-DataMall/1.0',
    };

    // Helper to fetch a single batch of 500 records
    const fetchBatch = async (batchSkip: number): Promise<LTACarparkItem[]> => {
      const url = `${LTA_DATAMALL_CARPARK_ENDPOINT}?$skip=${batchSkip}`;
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(
          `LTA DataMall responded with HTTP ${response.status}: ${response.statusText}`
        );
      }

      const json: LTACarparkResponse = await response.json();
      return json.value || [];
    };

    let allItems: LTACarparkItem[] = [];

    if (fetchAll) {
      // LTA limits each request to 500 items; paginate up to 5 batches (~2500 carparks)
      let currentSkip = 0;
      let hasMore = true;
      let iterations = 0;

      while (hasMore && iterations < 6) {
        const batch = await fetchBatch(currentSkip);
        allItems = allItems.concat(batch);
        if (batch.length < 500) {
          hasMore = false;
        } else {
          currentSkip += 500;
        }
        iterations += 1;
      }
    } else {
      allItems = await fetchBatch(skip);
    }

    const payload: ApiResponsePayload = {
      success: true,
      source: 'lta-datamall',
      timestamp: new Date().toISOString(),
      totalRecords: allItems.length,
      skip,
      data: allItems,
    };

    if (res && typeof res.status === 'function') {
      res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=30');
      return res.status(200).json(payload);
    }

    return new globalThis.Response(JSON.stringify(payload), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=30',
      },
    });
  } catch (err: any) {
    const errorPayload: ApiResponsePayload = {
      success: false,
      source: 'lta-datamall',
      timestamp: new Date().toISOString(),
      totalRecords: 0,
      data: [],
      error: 'LTA_DATAMALL_FETCH_ERROR',
      message: err?.message || 'Failed to communicate with LTA DataMall service',
    };

    if (res && typeof res.status === 'function') {
      return res.status(502).json(errorPayload);
    }

    return new globalThis.Response(JSON.stringify(errorPayload), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
