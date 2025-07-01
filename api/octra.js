import express from "express";
import cors from "cors";
import axios from "axios";
import serverless from "serverless-http";

const app = express();
app.use(cors());
app.use(express.json());

const OCTRA_BASE = "https://octra.network";

// universal proxy handler
const safeForward = async (req, res, targetUrl) => {
  try {
    const response = await axios({
      method: req.method,
      url: targetUrl,
      data: req.body,
      headers: req.headers,
      timeout: 10000,
      validateStatus: () => true, // do not throw on 4xx/5xx
    });

    const contentType = response.headers["content-type"] || "";

    if (contentType.includes("application/json")) {
      res.status(response.status).json(response.data);
    } else {
      res.status(response.status).send(response.data);
    }
  } catch (err) {
    console.error("proxy error:", err.message);
    res.status(500).send("Internal proxy error: " + err.message);
  }
};

// match your OctraAPI endpoints:
app.get("/api/balance/:address", (req, res) => {
  safeForward(req, res, `${OCTRA_BASE}/balance/${req.params.address}`);
});

app.get("/api/staging", (req, res) => {
  safeForward(req, res, `${OCTRA_BASE}/staging`);
});

app.get("/api/address/:address", (req, res) => {
  const limit = req.query.limit || 20;
  safeForward(req, res, `${OCTRA_BASE}/address/${req.params.address}?limit=${limit}`);
});

app.get("/api/tx/:hash", (req, res) => {
  safeForward(req, res, `${OCTRA_BASE}/tx/${req.params.hash}`);
});

app.post("/api/send-tx", (req, res) => {
  safeForward(req, res, `${OCTRA_BASE}/send-tx`);
});

// fallback passthrough
app.all("/api/*", (req, res) => {
  const forwardPath = req.originalUrl.replace(/^\/api/, "");
  safeForward(req, res, `${OCTRA_BASE}${forwardPath}`);
});

// serverless export
export default serverless(app);
