import fs from "fs";
import { execSync } from "child_process";
import { resolve } from "path";
const DOMAIN = "qirong77.com";
const PWD = "/root/machine";
const NGINX_CONF = resolve(PWD, `${DOMAIN}.conf`);
const INDEX_HTML = resolve(PWD, "index.html");
if (process.cwd() !== PWD) {
    console.error("当前目录不是 /root/machine");
    process.exit(1);
}
const createNginxConf = () => {
    fs.writeFileSync(
        NGINX_CONF,
        `
    # 主站点配置
    server {
        listen 443 ssl;
        listen [::]:443 ssl;
        http2 on;
        server_name ${DOMAIN};
    
        # 静态文件根目录
        root /var/www/${DOMAIN};
        index index.html;
    
        # SSL 配置
        ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;
        include /etc/letsencrypt/options-ssl-nginx.conf;
        ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
        # 默认处理：交给静态文件目录
        location / {
            try_files \$uri \$uri/ =404;
        }
    }
    `,
    );
};
const nginxRestart = () => {
    execSync("nginx -t");
    execSync("systemctl restart nginx");
};

const main = () => {
    const args = process.argv.slice(2);
    const flag = args[0];
    // bun run 155.254.127.215/nginx.ts -nginx-conf
    if (flag === "-nginx-conf") {
        createNginxConf();
    }
    // bun run 155.254.127.215/nginx.ts -nginx-restart
    if (flag === "-nginx-restart") {
        nginxRestart();
    }
};
main();
