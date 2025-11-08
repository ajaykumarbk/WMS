#!/usr/bin/env bash
set -e

# ---------- CONFIG ----------
PROJECT_ID=$(gcloud config get-value project)
ZONE=us-central1-a          # single zone
CLUSTER=wms-lab-cluster
# ---------------------------

echo "Starting minimal WMS deployment in $ZONE..."

# 1. Enable required APIs
gcloud services enable container.googleapis.com artifactregistry.googleapis.com --quiet

# 2. Create SMALL standard cluster (1 node, e2-medium)
if ! gcloud container clusters list --filter="name:$CLUSTER" --format="value(name)" | grep -q .; then
  echo "Creating small standard cluster in $ZONE..."
  gcloud container clusters create $CLUSTER \
    --zone=$ZONE \
    --machine-type=e2-medium \
    --num-nodes=1 \
    --enable-ip-alias \
    --quiet
else
  echo "Cluster $CLUSTER already exists."
fi

# 3. Get kubectl credentials
gcloud container clusters get-credentials $CLUSTER --zone=$ZONE

# 4. Create Artifact Registry repo
REPO=wms-repo
if ! gcloud artifacts repositories describe $REPO --location=$ZONE >/dev/null 2>&1; then
  gcloud artifacts repositories create $REPO \
    --repository-format=docker \
    --location=$ZONE \
    --description="WMS Lab Images"
fi

# 5. Build & Push Images
BACKEND_IMG=$ZONE-docker.pkg.dev/$PROJECT_ID/$REPO/wms-backend
FRONTEND_IMG=$ZONE-docker.pkg.dev/$PROJECT_ID/$REPO/wms-frontend

echo "Building and pushing Docker images..."
docker build -t $BACKEND_IMG:latest ./backend
docker build -t $FRONTEND_IMG:latest ./frontend

gcloud auth configure-docker $ZONE-docker.pkg.dev --quiet
docker push $BACKEND_IMG:latest
docker push $FRONTEND_IMG:latest

# 6. Update Kubernetes manifests with real image URLs
sed -i.bak "s|gcr.io/PROJECT_ID/wms-backend:latest|$BACKEND_IMG:latest|g" k8s/backend-deployment.yaml
sed -i.bak "s|gcr.io/PROJECT_ID/wms-frontend:latest|$FRONTEND_IMG:latest|g" k8s/frontend-deployment.yaml

# 7. Set only 1 replica
yq eval '.spec.replicas = 1' -i k8s/backend-deployment.yaml
yq eval '.spec.replicas = 1' -i k8s/frontend-deployment.yaml

# 8. Deploy everything
echo "Deploying to Kubernetes..."
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml

# 9. Wait for external IP
echo "Waiting for LoadBalancer IP (frontend)..."
while true; do
  IP=$(kubectl get svc frontend -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "")
  if [ -n "$IP" ]; then
    echo ""
    echo "WMS IS LIVE!"
    echo "Frontend: http://$IP"
    echo "Backend:  http://$IP/api  (test with /health or your API)"
    break
  fi
  echo -n "."
  sleep 5
done