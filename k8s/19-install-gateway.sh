#!/usr/bin/env bash
set -euo pipefail

echo "Installing Gateway API CRDs and NGINX Gateway Fabric..."

kubectl kustomize "https://github.com/nginx/nginx-gateway-fabric/config/crd/gateway-api/standard?ref=v2.2.1" | kubectl apply -f -
kubectl apply --server-side -f https://raw.githubusercontent.com/nginx/nginx-gateway-fabric/v2.2.1/deploy/crds.yaml
kubectl apply -f https://raw.githubusercontent.com/nginx/nginx-gateway-fabric/v2.2.1/deploy/default/deploy.yaml

echo "NGINX Gateway Fabric install applied. Wait for pods to be ready: kubectl -n nginx-gateway get pods"
