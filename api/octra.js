import express from "express";
import cors from "cors";
import axios from "axios";
import serverless from "serverless-http";

const app = express();
app.use(cors());
app.use(express.json());

const OCTRA_BASE = "https://octra.network";

// get balance
app.get("/api/balance/:address", async (req, res) => {
  try {
    const { address } = req.params;
    const response = await axios.get(`${OCTRA_BASE}/balance/${address}`, { timeout: 10000 });
    res.json(response.data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// get transaction history
app.get("/api/txhistory/:address", async (req, res) => {
  try {
    const { address } = req.params;
    const limit = req.query.limit || 20;
    const response = await axios.get(`${OCTRA_BASE}/address/${address}?limit=${limit}`, { timeout: 10000 });
    res.json(response.data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// send transaction
app.post("/api/send-tx", async (req, res) => {
  try {
    const txData = req.body;
    const response = await axios.post(`${OCTRA_BASE}/send-tx`, txData, { timeout: 10000 });
    res.json(response.data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// fallback passthrough proxy (opsional)
app.use("/api/*", async (req, res) => {
  try {
    const targetPath = req.originalUrl.replace(/^\/api/, "");
    const method = req.method;
    const url = `${OCTRA_BASE}${targetPath}`;
    const response = await axios({
      method,
      url,
      data: req.body,
      timeout: 10000,
      headers: req.headers,
    });
    res.status(response.status).send(response.data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// serverless handler
export default serverless(app);
