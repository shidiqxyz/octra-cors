const serverless = require('serverless-http');
const express   = require('express');
const cors      = require('cors');
const axios     = require('axios');

const app = express();

// 1) ENABLE CORS secara global
app.use(cors());
app.use(express.json());

// 2) TANGANI PRELIGHT (OPTIONS) sebelum proxy
app.options('*', cors());

// 3) fungsi proxy (tanpa perubahan double‑slash)
async function proxy(req, res, method, path, data = null) {
  try {
    const url = `https://octra.network${path}`;
    const cfg = { method, url, timeout: 10000, headers: req.headers };
    if (data) cfg.data = data;
    const response = await axios(cfg);
    res.status(response.status).send(response.data);
  } catch (err) {
    if (err.response) {
      res.status(err.response.status).send(err.response.data);
    } else {
      res.status(500).json({ error: err.message });
    }
  }
}

// 4) ROUTES — semua path tanpa double‑slash
app.get('/balance/:address',       (req, res) => proxy(req, res, 'get',    `/balance/${req.params.address}`));
app.get('/staging',                (req, res) => proxy(req, res, 'get',    `/staging`));
app.get('/address/:address',       (req, res) => proxy(req, res, 'get',    `/address/${req.params.address}?limit=${req.query.limit||20}`));
app.get('/tx/:hash',               (req, res) => proxy(req, res, 'get',    `/tx/${req.params.hash}`));
app.post('/send-tx',               (req, res) => proxy(req, res, 'post',   `/send-tx`, req.body));

// 5) Export untuk Vercel
module.exports = app;
module.exports.handler = serverless(app);
