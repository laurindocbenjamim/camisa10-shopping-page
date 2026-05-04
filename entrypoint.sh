#!/bin/sh

# Railway dynamically assigns a port via the PORT environment variable
PORT=${PORT:-80}

# Update nginx config with the correct port
sed -i "s/listen 80/listen $PORT/" /etc/nginx/conf.d/default.conf

# ---------------------------------------------------------------
# Runtime config injection for Vite/React apps.
# Vite bakes import.meta.env.* at BUILD time, but Railway only
# exposes variables at RUNTIME. We generate config.js here so the
# browser always receives the correct backend URL.
# ---------------------------------------------------------------
API_URL="${VITE_API_BASE_URL:-http://localhost:8000/api/v1}"

cat > /usr/share/nginx/html/config.js << EOF
window.__API_BASE_URL__ = "${API_URL}";
EOF

echo "Runtime config written: __API_BASE_URL__ = ${API_URL}"

# Start nginx
nginx -g "daemon off;"