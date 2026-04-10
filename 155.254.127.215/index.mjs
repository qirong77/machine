import http from "http";
const port = 3000;
const server = http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Port test success! Server is running.");
});

server.listen(port, "0.0.0.0", () => {
    console.log(`HTTP listening at http://127.0.0.1:${port} `);
});
