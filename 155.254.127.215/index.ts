import http from "http";
// pm2 start 155.254.127.215/index.ts --name "proxy3000" --interpreter=bun
const PORT = 3000;
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
const key = "proxy_target";
// CORS 头配置
const CORS_HEADERS: Record<string, string> = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-MBX-APIKEY, Authorization",
    "Access-Control-Max-Age": "86400",
};

const server = http.createServer(async (req, res) => {
    // 处理 CORS 预检请求
    if (req.method === "OPTIONS") {
        res.writeHead(200, CORS_HEADERS);
        res.end();
        return;
    }

    try {
        if (req.url === "/") {
            res.writeHead(200, {
                "Content-Type": "text/html; charset=utf-8",
                ...CORS_HEADERS,
            });
            res.end(rootHTML);
            return;
        }
        if (req.url === "/api") {
            res.writeHead(200, {
                "Content-Type": "application/json; charset=utf-8",
                ...CORS_HEADERS,
            });
            res.end(JSON.stringify({ ok: true, service: "qirong77.com", path: "/api" }));
            return;
        }
        // 获取请求的路径和查询参数
        const url = new URL(req.url || "/", `http://${req.headers.host}`);
        const targetUrl = url.searchParams.get(key);

        // 验证 target 参数
        if (!targetUrl) {
            res.writeHead(400, {
                "Content-Type": "application/json",
                ...CORS_HEADERS,
            });
            res.end(
                JSON.stringify({
                    error: "Missing target parameter",
                    message: "Please provide a target URL using ?target=<url>",
                }),
            );
            return;
        }

        // 验证 target 是否是有效的 URL
        try {
            new URL(targetUrl);
        } catch (e) {
            res.writeHead(400, {
                "Content-Type": "application/json",
                ...CORS_HEADERS,
            });
            res.end(
                JSON.stringify({
                    error: "Invalid target URL",
                    message: "The target parameter must be a valid URL",
                }),
            );
            return;
        }

        url.searchParams.delete(key);
        const path = url.pathname;
        const search = url.search;
        // 构建目标 URL（如果 path 是 '/'，则不添加，避免在目标 URL 后多一个斜杠）
        const pathPart = path === "/" ? "" : path;
        const finalUrl = `${targetUrl}${pathPart}${search}`;
        console.log("[Proxy] Forwarding request to:", finalUrl);
        // 准备转发的请求头（移除敏感头信息）
        const headers = new Headers();
        Object.entries(req.headers).forEach(([key, value]) => {
            if (value && key !== "x-forwarded-for" && key !== "x-real-ip" && key !== "host") {
                headers.set(key, Array.isArray(value) ? value[0] : value);
            }
        });
        // 读取请求体
        let body: Buffer | undefined;
        if (req.method !== "GET" && req.method !== "HEAD") {
            const chunks: Buffer[] = [];
            for await (const chunk of req) {
                chunks.push(chunk);
            }
            body = Buffer.concat(chunks);
        }

        // 发起代理请求（带超时控制）
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1000 * 60); // 60秒超时

        const response = await fetch(finalUrl, {
            method: req.method,
            headers: headers,
            body: body as any, // Node.js fetch 支持 Buffer 作为 body
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // 获取响应数据
        const data = await response.arrayBuffer();

        // 过滤掉原始响应中的 CORS 相关头部和可能冲突的传输头部,避免重复
        const responseHeaders: Record<string, string> = {};
        response.headers.forEach((value, key) => {
            const lowerKey = key.toLowerCase();
            // 跳过 CORS 相关头部和可能导致冲突的传输编码头部
            // content-encoding 和 content-length 也需要过滤，因为 fetch 已经自动解压了数据
            if (
                !lowerKey.startsWith("access-control-") &&
                lowerKey !== "transfer-encoding" &&
                lowerKey !== "content-encoding" &&
                lowerKey !== "content-length"
            ) {
                responseHeaders[key] = value;
            }
        });

        console.log(`[Proxy] Response status: ${response.status}`);

        // 返回响应,添加 CORS 头
        res.writeHead(response.status, {
            ...responseHeaders,
            ...CORS_HEADERS,
        });
        res.end(Buffer.from(data));
    } catch (error) {
        console.error("[Proxy] Error:", error);

        const errorMessage = JSON.stringify({
            error: "Proxy request failed",
            message: error instanceof Error ? error.message : "Unknown error",
            timestamp: new Date().toISOString(),
        });

        res.writeHead(500, {
            "Content-Type": "application/json",
            ...CORS_HEADERS,
        });
        res.end(errorMessage);
    }
});

server.listen(PORT, () => {
    console.log(`[Proxy] Server started on http://localhost:${PORT}`);
});
