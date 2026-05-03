#!/bin/sh

# Railway dynamically assigns a port via the PORT environment variable
PORT=${PORT:-80}

# Update nginx config with the correct port
sed -i "s/listen 80/listen $PORT/" /etc/nginx/conf.d/default.conf

# Start nginx
nginx -g "daemon off;"