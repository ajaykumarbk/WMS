# Edit these values for your environment
DOCKERHUB_USER="ajaykumara"
FRONTEND_IMAGE="$DOCKERHUB_USER/frontend-app:latest"
BACKEND_IMAGE="$DOCKERHUB_USER/backend-app:latest"

DOMAIN="datanetwork.online"
APP_HOST="app.${DOMAIN}"
API_HOST="api.${DOMAIN}"

# MetalLB IP range (must be free in your VPC)
METALLB_POOL="10.0.1.200-10.0.1.250"

# Cloudflare
CF_API_TOKEN="ZkUQyiqKjOaDsD5yLObULWddvbSvdydta4IQ-C-p"
CF_ZONE_ID="3e70d69870ecf0a8a5400bf8180ad3f4"
CF_EMAIL="you@example.com"

# Database / secrets - fill these
DB_HOST="140.245.237.157"
DB_USER="wms_app"
DB_PASS="Ajaykumar@12."
DB_NAME="waste_management"
JWT_SECRET="supersecret_jwt_key_2025_wms"
