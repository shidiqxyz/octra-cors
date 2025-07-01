import axios from 'axios';

const OCTRA_BASE = 'https://octra.network';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Preflight
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  try {
    // Hitung path + query yang akan diteruskan
    const rawPath = req.url.replace(/^\/api/, '');
    const [path, query = ''] = rawPath.split('?');
    const targetUrl = `${OCTRA_BASE}${path}${query ? '?' + query : ''}`;

    // Forward ke Octra
    const response = await axios({
      method: req.method,
      url: targetUrl,
      data: req.body,
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000,
      validateStatus: () => true
    });

    // Mirror status & body
    res.status(response.status);
    const ct = response.headers['content-type'] || '';
    if (ct.includes('application/json')) {
      res.json(response.data);
    } else {
      res.send(response.data);
    }

  } catch (err) {
    console.error('Proxy error:', err.message);
    res.status(500).send('Proxy error: ' + err.message);
  }
}
