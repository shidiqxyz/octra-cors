const serverless = require('serverless-http');
const express   = require('express');
const cors      = require('cors');
const axios     = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const BASE_URL = 'https://octra.network';

// Utility untuk proxy request
async function proxy(req, res, method, path, data = null) {
  try {
    const url = `${BASE_URL}${path}`;
    const config = {
      method,
      url,
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' },
      data
    };
    const response = await axios(config);
    res.status(response.status).json(response.data);
  } catch (err) {
    if (err.response) {
      res.status(err.response.status).json(err.response.data);
    } else {
      res.status(500).json({ error: err.message });
    }
  }
}

// ———— Endpoints ————

// GET /balance/:address
app.get('/balance/:address', (req, res) => {
  proxy(req, res, 'get', `/balance/${req.params.address}`);
});

// GET /staging
app.get('/staging', (req, res) => {
  proxy(req, res, 'get', '/staging');
});

// GET /address/:address?limit=20
app.get('/address/:address', (req, res) => {
  const limit = req.query.limit || 20;
  proxy(req, res, 'get', `/address/${req.params.address}?limit=${limit}`);
});

// GET /tx/:hash
app.get('/tx/:hash', (req, res) => {
  proxy(req, res, 'get', `/tx/${req.params.hash}`);
});

// POST /send-tx
app.post('/send-tx', (req, res) => {
  proxy(req, res, 'post', '/send-tx', req.body);
});

// Export sebagai Vercel Serverless Function
module.exports = app;
module.exports.handler = serverless(app);
