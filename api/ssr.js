// Vercel Serverless Function — wraps TanStack Start SSR fetch handler
export default async function handler(req, res) {
  try {
    const { default: server } = await import('../dist/server/server.js');

    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
    const url = `${protocol}://${host}${req.url}`;

    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (value !== undefined) {
        headers.set(key, Array.isArray(value) ? value.join(', ') : value);
      }
    }

    const init = { method: req.method, headers };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      init.body = Buffer.concat(chunks);
    }

    const request = new Request(url, init);
    const response = await server.fetch(request, process.env, {});

    res.status(response.status);
    response.headers.forEach((value, key) => res.setHeader(key, value));

    const buffer = await response.arrayBuffer();
    res.end(Buffer.from(buffer));
  } catch (err) {
    console.error('[SSR Error]', err);
    res.status(500).end('Internal Server Error');
  }
}
