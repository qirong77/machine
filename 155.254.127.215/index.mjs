import http from "http";

/** 与 nginx-config.sh 中 INTERNAL_PORT 一致；由 nginx 对外提供 443 / IP:3000 的 HTTPS */
const port = Number(process.env.PORT || process.env.INTERNAL_PORT || 3001);

const server = http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Port test success! Server is running.");
});

server.listen(port, "0.0.0.0", () => {
    console.log(`HTTP listening at http://127.0.0.1:${port} (use nginx for HTTPS)`);
});
