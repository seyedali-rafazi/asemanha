/**
 * Vercel Serverless Function API Proxy for AsemanYar Backend (Render FastAPI).
 * Routes all `/api/...` browser requests to the backend server-side,
 * ensuring users in restricted networks (e.g., Iran) can access the API
 * without direct connection to the blocked Render domain.
 */

// Disable Vercel's automatic body parser to preserve raw bytes for JSON, multipart/form-data, and binary uploads
export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
};

const HOP_BY_HOP_REQUEST_HEADERS = new Set([
  'host',
  'connection',
  'keep-alive',
  'transfer-encoding',
  'content-length',
]);

const HOP_BY_HOP_RESPONSE_HEADERS = new Set([
  'connection',
  'keep-alive',
  'transfer-encoding',
  'content-encoding',
  'content-length',
]);

/**
 * Reads the raw incoming request body as a Buffer.
 */
async function getRequestBody(req) {
  if (req.method === 'GET' || req.method === 'HEAD') {
    return undefined;
  }

  // If already parsed or buffered by a custom wrapper
  if (req.body !== undefined && req.body !== null) {
    if (Buffer.isBuffer(req.body)) {
      return req.body;
    }
    if (typeof req.body === 'string') {
      return Buffer.from(req.body);
    }
    if (typeof req.body === 'object') {
      return Buffer.from(JSON.stringify(req.body));
    }
  }

  // Read raw chunks from the IncomingMessage stream
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      const buffer = Buffer.concat(chunks);
      resolve(buffer.length > 0 ? buffer : undefined);
    });
    req.on('error', (err) => reject(err));
  });
}

export default async function handler(req, res) {
  const backendBase = (
    process.env.BACKEND_URL || 'https://asemanyar-backend.onrender.com'
  ).replace(/\/+$/, '');

  // Extract path from Vercel dynamic catch-all route [req.query.path]
  const pathParam = req.query?.path;
  const subPath = Array.isArray(pathParam)
    ? pathParam.map(encodeURIComponent).join('/')
    : String(pathParam || '');

  // Map subPath to backend path
  let targetPath;
  if (!subPath) {
    targetPath = '/api/v1';
  } else if (subPath === 'health') {
    targetPath = '/health';
  } else if (subPath.startsWith('v1/')) {
    targetPath = `/api/${subPath}`;
  } else {
    // Standard relative endpoint under /api/v1
    targetPath = `/api/v1/${subPath}`;
  }

  // Construct query string without the Vercel internal 'path' param
  const searchParams = new URLSearchParams();
  if (req.query) {
    for (const [key, value] of Object.entries(req.query)) {
      if (key === 'path') continue;
      if (Array.isArray(value)) {
        value.forEach((v) => searchParams.append(key, String(v)));
      } else if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    }
  }

  const queryString = searchParams.toString();
  const targetUrl = `${backendBase}${targetPath}${queryString ? `?${queryString}` : ''}`;

  // Filter and forward client headers
  const forwardHeaders = {};
  if (req.headers) {
    for (const [key, val] of Object.entries(req.headers)) {
      const lowerKey = key.toLowerCase();
      if (!HOP_BY_HOP_REQUEST_HEADERS.has(lowerKey) && val !== undefined) {
        forwardHeaders[lowerKey] = val;
      }
    }
  }

  // Append client IP to X-Forwarded-For if available
  const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress;
  if (clientIp && !forwardHeaders['x-forwarded-for']) {
    forwardHeaders['x-forwarded-for'] = Array.isArray(clientIp) ? clientIp[0] : clientIp;
  }

  try {
    const requestBody = await getRequestBody(req);

    const backendResponse = await fetch(targetUrl, {
      method: req.method,
      headers: forwardHeaders,
      body: requestBody,
      redirect: 'follow',
    });

    // Forward response headers excluding hop-by-hop headers
    backendResponse.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      if (!HOP_BY_HOP_RESPONSE_HEADERS.has(lowerKey)) {
        res.setHeader(key, value);
      }
    });

    // Forward Set-Cookie headers if any exist
    if (typeof backendResponse.headers.getSetCookie === 'function') {
      const setCookies = backendResponse.headers.getSetCookie();
      if (setCookies && setCookies.length > 0) {
        res.setHeader('set-cookie', setCookies);
      }
    } else {
      const setCookie = backendResponse.headers.get('set-cookie');
      if (setCookie) {
        res.setHeader('set-cookie', setCookie);
      }
    }

    // Handle 204 No Content or 304 Not Modified
    if (backendResponse.status === 204 || backendResponse.status === 304) {
      return res.status(backendResponse.status).end();
    }

    // Stream back response body (JSON, text, or binary)
    const arrayBuffer = await backendResponse.arrayBuffer();
    const responseBuffer = Buffer.from(arrayBuffer);

    return res.status(backendResponse.status).send(responseBuffer);
  } catch (error) {
    // Never log sensitive tokens or bodies; only log error message
    console.error(`[API Proxy Error] Failed to proxy ${req.method} ${targetPath}:`, error?.message || error);
    return res.status(502).json({
      detail: 'Bad Gateway: Unable to reach backend service',
      error: error instanceof Error ? error.message : 'Network error',
    });
  }
}
