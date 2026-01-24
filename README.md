# WMS
Waste Management System - A portal for municipality and civilians to report the waste with location, image, type of waste and description.


Commands to deploy this application to google cloud run

# frontend deployment

docker build -t frontend . 

docker tag frontend gcr.io/qwiklabs-gcp-04-8110705f4325/frontend-app

docker push gcr.io/qwiklabs-gcp-04-8110705f4325/frontend-app

gcloud run deploy frontend-app \
  --image gcr.io/qwiklabs-gcp-04-8110705f4325/frontend-app \
  --platform managed \
  --allow-unauthenticated \
  --region us-east1

# backend deployment

docker build -t backend .

docker tag backend gcr.io/qwiklabs-gcp-04-8110705f4325/backend-app

docker push gcr.io/qwiklabs-gcp-04-8110705f4325/backend-app

gcloud run deploy backend-app \
  --image gcr.io/qwiklabs-gcp-04-8110705f4325/backend-app \
  --region us-east1 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars DB_HOST=Host \
  --set-env-vars DB_USER=user \
  --set-env-vars DB_PASS=user \
  --set-env-vars DB_NAME=db \
  --set-env-vars JWT_SECRET=supersecret_jwt_key_2025_wms

#Waste Management System (WMS)

A production-grade, cloud-native Waste Management System built with a modern full-stack architecture and deployed on a self-managed Kubernetes cluster, exposed securely using Envoy Gateway + Cloudflare Tunnel.

This project demonstrates real-world DevOps practices, including containerization, CI/CD, Kubernetes networking, persistent storage, secure ingress, and live troubleshooting.

#Application

User authentication (JWT based)

Report waste issues with image upload

Track complaint status (Pending → In Progress → Resolved)

Admin dashboard for complaint management

Real-time updates using Socket.IO

Analytics dashboard

Pagination and role-based access control

Platform & DevOps

Dockerized frontend and backend

Self-managed Kubernetes cluster (EC2 + kubeadm)

Envoy Gateway (Gateway API) for traffic routing

Cloudflare Tunnel for secure internet exposure (no public load balancer)

Persistent storage for uploaded images using PVC

# CI/CD pipeline with GitHub Actions

SonarQube integration for code quality

Health checks, readiness & liveness probes

# Architecture Overview
User Browser
   ↓ HTTPS
Cloudflare Tunnel
   ↓
Envoy Gateway (Gateway API)
   ↓
--------------------------------
|            Kubernetes        |
|                              |
|  Frontend Service (React)    |
|  Backend Service (Node.js)   |
|        |                     |
|        └── PVC (/uploads)    |
--------------------------------
   ↓
MySQL Database

# Tech Stack
Frontend

React (Vite)

Axios

Socket.IO Client

Backend

Node.js + Express

Multer (image uploads)

Socket.IO

MySQL

DevOps / Platform

Docker

Kubernetes (kubeadm)

Envoy Gateway (Gateway API)

Cloudflare Tunnel

GitHub Actions (CI/CD)

SonarQube

Persistent Volumes & Claims



# Networking & Routing
Envoy Gateway (Gateway API)

Handles HTTP routing inside the cluster

Clean separation of frontend and backend traffic

HTTPRoute Rules
/api      → backend service
/uploads  → backend service
/         → frontend service

Cloudflare Tunnel

Secure ingress without public LoadBalancer

Automatic HTTPS

No exposed node ports

# CI/CD Pipeline

Implemented using GitHub Actions:

Triggered on branch push

SonarQube scan & quality gate

Docker image build (frontend + backend)

Push images to Docker Hub (:latest)

Kubernetes rollout via deployment restart

# Health & Reliability

/health endpoint for backend

Readiness & liveness probes

Socket.IO resilience

Persistent storage for uploads

Graceful shutdown handling

