#!/usr/bin/env bash
set -euo pipefail

# Apply sequence
kubectl apply -f 00-namespace-wms.yaml

# Install cert-manager (if not installed)
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.12.4/cert-manager.yaml

# Install MetalLB (if not installed)
kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v0.13.10/manifests/namespace.yaml
kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v0.13.10/manifests/metallb.yaml

# Apply IPPool and L2 adv
kubectl apply -f 02-metallb-ippool.yaml
kubectl apply -f 03-metallb-l2advert.yaml

# Apply Cloudflare secret and issuers
kubectl apply -f 04-cloudflare-api-token-secret.yaml
kubectl apply -f 05-cert-manager-issuer-staging.yaml
kubectl apply -f 06-cert-manager-issuer-prod.yaml

# Apply certificates
kubectl apply -f 07-certificate-frontend.yaml
kubectl apply -f 08-certificate-backend.yaml

# Apply backend/frontend and services
kubectl apply -f 09-backend-secret.yaml
kubectl apply -f 10-backend-deployment.yaml
kubectl apply -f 11-backend-service.yaml
kubectl apply -f 12-frontend-deployment.yaml
kubectl apply -f 13-frontend-service.yaml

# Apply Gateway API objects
kubectl apply -f 14-gatewayclass-nginx.yaml
kubectl apply -f 15-gateway.yaml
kubectl apply -f 16-httproute-frontend.yaml
kubectl apply -f 17-httproute-backend.yaml

echo "Deployment applied. Check resources with kubectl get pods, svc, gateways, httproutes in relevant namespaces."
