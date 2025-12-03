#!/bin/bash

# Create namespace
kubectl apply -f kubernetes/namespace.yaml

# Deploy backend
kubectl apply -f kubernetes/backend-secret.yaml
kubectl apply -f kubernetes/backend-deployment.yaml
kubectl apply -f kubernetes/backend-service.yaml

# Deploy frontend
kubectl apply -f kubernetes/frontend-deployment.yaml
kubectl apply -f kubernetes/frontend-service.yaml

# Deploy Gateway API
kubectl apply -f kubernetes/gateway/gatewayclass.yaml
kubectl apply -f kubernetes/gateway/gateway.yaml
kubectl apply -f kubernetes/gateway/httproute-frontend.yaml
kubectl apply -f kubernetes/gateway/httproute-backend.yaml

# Deploy MetalLB
kubectl apply -f kubernetes/metallb/ippool.yaml
kubectl apply -f kubernetes/metallb/l2advertisement.yaml

# Deploy Cert-Manager
kubectl apply -f kubernetes/cert-manager/issuer.yaml
kubectl apply -f kubernetes/cert-manager/certificate-frontend.yaml
kubectl apply -f kubernetes/cert-manager/certificate-backend.yaml

# Verify
kubectl get pods -n wms
kubectl get svc -n wms
kubectl get gateway -n wms
kubectl get httproute -n wms
kubectl get certificates -n wms
