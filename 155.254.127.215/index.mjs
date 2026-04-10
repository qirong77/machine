import http from "http";

const port = 3000;

const rootHTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>qirong77.com</title>
</head>
<body>
  <h1>qirong77.com</h1>
</body>
</html>
`;

const apiBody = JSON.stringify(
    { ok: true, service: "qirong77.com", path: "/api" },
    null,
    2
);

function pathnameOf(req) {
    try {
        return new URL(req.url || "/", "http://localhost").pathname;
    } catch {
        return "/";
    }
}

const server = http.createServer((req, res) => {
    const path = pathnameOf(req);

    if (path === "/" || path === "") {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(rootHTML);
        return;
    }

    if (path === "/api" || path === "/api/") {
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(apiBody);
        return;
    }

    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not Found");
});

server.listen(port, "0.0.0.0", () => {
    console.log(`HTTP listening at http://127.0.0.1:${port}`);
});
