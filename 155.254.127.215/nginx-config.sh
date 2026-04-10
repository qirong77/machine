# 是否配置 letsencryp，如果没有则配置
# 更新 nginx 配置
echo "
# 3. 主站点配置
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name qirong77.com;

    # 静态文件根目录
    root /var/www/qirong77.com;
    index index.html;

    # SSL 配置
    ssl_certificate /etc/letsencrypt/live/qirong77.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/qirong77.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # --- 仅转发 API 请求到 Node.js ---
    location /api/ {
        # 将请求转发到本地 Node.js 端口
        proxy_pass http://127.0.0.1:3000; 
        
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # 传递客户端真实 IP
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 可选：如果 Node.js 内部代码没有处理 /api 前缀，可以开启下面的 rewrite
        # rewrite ^/api/(.*)$ /$1 break;
    }

    # 默认处理：交给静态文件目录
    location / {
        try_files $uri $uri/ =404;
    }
}
" > /etc/nginx/conf.d/qirong77.com.conf