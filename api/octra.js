import express from "express";
import cors from "cors";
import axios from "axios";
import serverless from "serverless-http";

const app = express();
app.use(cors());
app.use(express.json());

const OCTRA_BASE = "https://octra.network";

// safe forward
const safeForward = async (req, res, targetUrl) => {
  try {
    const result = await axios({
      method: req.method,
      url: targetUrl,
      data: req.body,
      headers: req.headers,
      timeout: 10000,
      validateStatus: () => true // do not throw on 4xx/5xx
    });

    // if text response
    if (typeof result.data === "string") {
      res.status(result.status).send(result.data);
    } else {
      res.status(result.status).json(result.data);
    }
  } catch (err) {
    console.error("proxy error:", err.message);
    res.status(500).send(err.message);
  }
};

// GET balance
app.get("/api/balance/:address", (req, res) => {
  const { address } = req.params;
  safeForward(req, res, `${OCTRA_BASE}/balance/${address}`);
});

// GET staging
app.get("/api/staging", (req, res) => {
  safeForward(req, res, `${OCTRA_BASE}/staging`);
});

// GET address history
app.get("/api/address/:address", (req, res) => {
  const { address } = req.params;
  const limit = req.query.limit || 20;
  safeForward(req, res, `${OCTRA_BASE}/address/${address}?limit=${limit}`);
});

// GET tx
app.get("/api/tx/:hash", (req, res) => {
  const { hash } = req.params;
  safeForward(req, res, `${OCTRA_BASE}/tx/${hash}`);
});

// POST send-tx
app.post("/api/send-tx", (req, res) => {
  safeForward(req, res, `${OCTRA_BASE}/send-tx`);
});

// fallback
app.use("/api/*", (req, res) => {
  const target = req.originalUrl.replace(/^\/api/, "");
  safeForward(req, res, `${OCTRA_BASE}${target}`);
});

export default serverless(app);
