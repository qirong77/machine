
DOMAIN="qirong77.com"
NGINX_CONF="/etc/nginx/conf.d/${DOMAIN}.conf"
echo "
# 3. 主站点配置
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;
    server_name qirong77.com;

    # 静态文件根目录
    root /var/www/qirong77.com;
    index index.html;

    # SSL 配置
    ssl_certificate /etc/letsencrypt/live/qirong77.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/qirong77.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
    # 默认处理：交给静态文件目录
    location / {
        try_files \$uri \$uri/ =404;
    }
}
" > ${NGINX_CONF}