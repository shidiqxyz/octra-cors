import { createProxyMiddleware } from "http-proxy-middleware";

export default function handler(req, res) {
  const proxy = createProxyMiddleware({
    target: "https://octra.network",
    changeOrigin: true,
    pathRewrite: {
      "^/api": "", // hapus prefix /api saat diteruskan
    },
    onProxyReq(proxyReq, req, res) {
      // opsional logging
      console.log(`Proxying ${req.url} -> https://octra.network${req.url.replace(/^\/api/, '')}`);
    }
  });
  return proxy(req, res, (result) => {
    if (result instanceof Error) {
      throw result;
    }
    return result;
  });
}
