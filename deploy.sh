#!/usr/bin/env bash
set -e

# ---------- LAB CONFIG ----------
PROJECT_ID=$(gcloud config get-value project)
REGION=us-central1
ZONE=us-central1-a
CLUSTER=wms-lab-cluster
# --------------------------------

echo "Deploying WMS to SINGLE-NODE lab cluster..."

# 1. Enable APIs
gcloud services enable container.googleapis.com artifactregistry.googleapis.com --quiet

# 2. Create tiny 1-node cluster
if ! gcloud container clusters list --filter="name:$CLUSTER" --format="value(name)" | grep -q .; then
  echo "Creating 1-node cluster in $ZONE..."
  gcloud container clusters create $CLUSTER \
    --zone=$ZONE \
    --machine-type=e2-medium \
    --num-nodes=1 \
    --quiet
fi
gcloud container clusters get-credentials $CLUSTER --zone=$ZONE

# 3. Create Artifact Registry IN REGION
REPO=wms-repo
if ! gcloud artifacts repositories describe $REPO --location=$REGION >/dev/null 2>&1; then
  gcloud artifacts repositories create $REPO \
    --repository-format=docker \
    --location=$REGION \
    --description="WMS Lab"
fi

# 4. BUILD FROM CORRECT FOLDERS
BACKEND_IMG=$REGION-docker.pkg.dev/$PROJECT_ID/$REPO/wms-backend
FRONTEND_IMG=$REGION-docker.pkg.dev/$PROJECT_ID/$REPO/wms-frontend

echo "Building backend image..."
docker build -t $BACKEND_IMG:latest ./backend

echo "Building frontend image..."
docker build -t $FRONTEND_IMG:latest ./frontend

gcloud auth configure-docker $REGION-docker.pkg.dev --quiet
docker push $BACKEND_IMG:latest
docker push $FRONTEND_IMG:latest

# 5. Update k8s files
sed -i.bak "s|gcr.io/PROJECT_ID/wms-backend:latest|$BACKEND_IMG:latest|g" k8s/backend-deployment.yaml
sed -i.bak "s|gcr.io/PROJECT_ID/wms-frontend:latest|$FRONTEND_IMG:latest|g" k8s/frontend-deployment.yaml

# 6. Force 1 replica
if ! command -v yq &>/dev/null; then
  echo "Installing yq..."
  wget https://github.com/mikefarah/yq/releases/download/v4.40.5/yq_linux_amd64 -O /usr/local/bin/yq
  chmod +x /usr/local/bin/yq
fi
yq eval '.spec.replicas = 1' -i k8s/*-deployment.yaml

# 7. Deploy
kubectl apply -f k8s/

# 8. Show URL
echo "Waiting for your public IP..."
while true; do
  IP=$(kubectl get svc frontend -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "")
  if [ -n "$IP" ]; then
    echo ""
    echo "WMS IS LIVE!"
    echo "http://$IP"
    echo "API test: http://$IP/api/health"
    break
  fi
  echo -n "."
  sleep 5
done