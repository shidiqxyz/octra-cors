import express from "express";
import cors from "cors";
import axios from "axios";
import serverless from "serverless-http";

const app = express();
app.use(cors());
app.use(express.json());

const OCTRA_BASE = "https://octra.network";

// mirror exactly what OctraAPI expects
app.get("/api/balance/:address", async (req, res) => {
  try {
    const { address } = req.params;
    const response = await axios.get(`${OCTRA_BASE}/balance/${address}`, {
      timeout: 10000,
    });
    res.send(response.data);
  } catch (err) {
    console.error("balance error", err.message);
    res.status(500).send(err.message);
  }
});

app.get("/api/staging", async (req, res) => {
  try {
    const response = await axios.get(`${OCTRA_BASE}/staging`, {
      timeout: 10000,
    });
    res.send(response.data);
  } catch (err) {
    console.error("staging error", err.message);
    res.status(500).send(err.message);
  }
});

app.get("/api/address/:address", async (req, res) => {
  try {
    const { address } = req.params;
    const { limit } = req.query;
    const response = await axios.get(
      `${OCTRA_BASE}/address/${address}?limit=${limit || 20}`,
      { timeout: 10000 }
    );
    res.send(response.data);
  } catch (err) {
    console.error("address error", err.message);
    res.status(500).send(err.message);
  }
});

app.get("/api/tx/:hash", async (req, res) => {
  try {
    const { hash } = req.params;
    const response = await axios.get(`${OCTRA_BASE}/tx/${hash}`, {
      timeout: 10000,
    });
    res.send(response.data);
  } catch (err) {
    console.error("tx error", err.message);
    res.status(500).send(err.message);
  }
});

app.post("/api/send-tx", async (req, res) => {
  try {
    const txData = req.body;
    const response = await axios.post(`${OCTRA_BASE}/send-tx`, txData, {
      timeout: 10000,
    });
    res.send(response.data);
  } catch (err) {
    console.error("send-tx error", err.message);
    res.status(500).send(err.message);
  }
});

// fallback passthrough
app.use("/api/*", async (req, res) => {
  try {
    const target = req.originalUrl.replace(/^\/api/, "");
    const result = await axios({
      method: req.method,
      url: `${OCTRA_BASE}${target}`,
      data: req.body,
      headers: req.headers,
      timeout: 10000,
    });
    res.status(result.status).send(result.data);
  } catch (err) {
    console.error("generic passthrough error", err.message);
    res.status(500).send(err.message);
  }
});

export default serverless(app);
