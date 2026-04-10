import fs from "fs";
import { execSync } from "child_process";
import { resolve } from "path";

const DOMAIN = "qirong77.com";
const PWD = "/root/machine";
const NGINX_CONF_FILE = resolve(PWD, "conf", `${DOMAIN}.conf`);
const INDEX_FILE = resolve(PWD, "index.html");
const USAGE = `用法:
  bun run 155.254.127.215/nginx.ts --nginx-conf     写入 ${DOMAIN}.conf
  bun run 155.254.127.215/nginx.ts --nginx-restart  nginx -t 并重启 nginx
  bun run 155.254.127.215/nginx.ts --help          显示帮助
`;

function requirePwd(): void {
    if (process.cwd() !== PWD) {
        console.error(`错误: 工作目录必须是 ${PWD}（当前为 ${process.cwd()}）`);
        process.exit(1);
    }
}

function buildNginxConf(): string {
    return [
        "# 主站点配置",
        "server {",
        "    listen 443 ssl;",
        "    listen [::]:443 ssl;",
        "    http2 on;",
        `    server_name ${DOMAIN};`,
        "",
        "    # 静态文件根目录",
        `    root /var/www/${DOMAIN};`,
        `    index ${INDEX_FILE};`,
        "",
        "    # SSL 配置",
        `    ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;`,
        `    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;`,
        "    include /etc/letsencrypt/options-ssl-nginx.conf;",
        "    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;",
        "    # 默认处理：交给静态文件目录",
        "    location / {",
        "        try_files $uri $uri/ =404;",
        "    }",
        "}",
    ].join("\n");
}

function createNginxConf(): void {
    fs.writeFileSync(NGINX_CONF_FILE, buildNginxConf(), "utf8");
    console.log(`已写入 ${NGINX_CONF_FILE}`);
}

function nginxRestart(): void {
    const stdio = "inherit" as const;
    execSync("nginx -t", { stdio });
    execSync("systemctl restart nginx", { stdio });
}

function main(): void {
    const flag = process.argv[2];

    if (flag === "--help") {
        console.log(USAGE);
        return;
    }

    requirePwd();

    if (flag === "--nginx-conf") {
        createNginxConf();
        return;
    }
    if (flag === "--nginx-restart") {
        nginxRestart();
        return;
    }

    if (flag === undefined) {
        console.error("缺少参数。\n");
        console.error(USAGE);
        process.exit(1);
    }

    console.error(`未知参数: ${flag}\n`);
    console.error(USAGE);
    process.exit(1);
}

main();
