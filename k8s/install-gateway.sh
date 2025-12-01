#!/bin/bash
set -e

echo "---------------------------------------------"
echo " Installing Kubernetes Gateway API CRDs"
echo "---------------------------------------------"

kubectl apply -f https://github.com/kubernetes-sigs/gateway-api/releases/download/v1.0.0/standard-install.yaml

echo "Waiting for CRDs to be installed..."
sleep 5


echo "---------------------------------------------"
echo " Installing NGINX Gateway Fabric (no Helm)"
echo "---------------------------------------------"

kubectl apply -f https://raw.githubusercontent.com/nginxinc/nginx-gateway-fabric/v1.1.0/deploy/manifests/deployment/ns-and-sa.yaml
kubectl apply -f https://raw.githubusercontent.com/nginxinc/nginx-gateway-fabric/v1.1.0/deploy/manifests/deployment/rbac.yaml
kubectl apply -f https://raw.githubusercontent.com/nginxinc/nginx-gateway-fabric/v1.1.0/deploy/manifests/deployment/nginx-gateway-default-secret.yaml
kubectl apply -f https://raw.githubusercontent.com/nginxinc/nginx-gateway-fabric/v1.1.0/deploy/manifests/deployment/nginx-gateway.yaml

echo "Waiting for Gateway Fabric deployment to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/nginx-gateway -n nginx-gateway


echo ""
echo "---------------------------------------------"
echo " Gateway Fabric installed successfully!"
echo "---------------------------------------------"
echo ""
echo "LoadBalancer details:"
kubectl get svc -n nginx-gateway
echo ""
echo "Next steps:"
echo "1. Note the EXTERNAL-IP of the nginx-gateway LoadBalancer."
echo "2. Point your domain DNS to this IP (Cloudflare / GoDaddy)."
echo "3. Apply Gateway, HTTPRoutes, frontend & backend manifests."

