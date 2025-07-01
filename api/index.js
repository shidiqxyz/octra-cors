import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();
app.use(cors()); // agar frontend Anda bebas akses ke sini
app.use(express.json());

const OCTRA_BASE = "https://octra.network";

// contoh endpoint untuk getBalance
app.get("/api/balance/:address", async (req, res) => {
  try {
    const address = req.params.address;
    const response = await axios.get(`${OCTRA_BASE}/balance/${address}`, {
      timeout: 10000
    });
    res.json(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// contoh endpoint untuk getTransactionHistory
app.get("/api/txhistory/:address", async (req, res) => {
  try {
    const address = req.params.address;
    const limit = req.query.limit || 20;
    const response = await axios.get(`${OCTRA_BASE}/address/${address}?limit=${limit}`, {
      timeout: 10000
    });
    res.json(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// contoh endpoint untuk sendTransaction
app.post("/api/send-tx", async (req, res) => {
  try {
    const txData = req.body;
    const response = await axios.post(`${OCTRA_BASE}/send-tx`, txData, {
      timeout: 10000
    });
    res.json(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// generic passthrough (opsional)
app.use("/api/*", async (req, res) => {
  try {
    const targetPath = req.originalUrl.replace(/^\/api/, "");
    const method = req.method;
    const url = `${OCTRA_BASE}${targetPath}`;
    const headers = req.headers;

    const result = await axios({
      method,
      url,
      data: req.body,
      timeout: 10000,
      headers
    });

    res.status(result.status).send(result.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Octra proxy server listening on port ${PORT}`);
});
