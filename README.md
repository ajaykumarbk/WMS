# Waste Management System (WMS)

A production-grade, cloud-native Waste Management System built with a modern full-stack architecture and deployed on a self-managed Kubernetes cluster, exposed securely using Envoy Gateway + Cloudflare Tunnel.

This project demonstrates real-world DevOps practices, including containerization, CI/CD, Kubernetes networking, persistent storage, secure ingress, and live troubleshooting.

# Application

User authentication (JWT based)

Report waste issues with image upload

Track complaint status (Pending → In Progress → Resolved)

Admin dashboard for complaint management

Real-time updates using Socket.IO

Analytics dashboard

Pagination and role-based access control

# Platform & DevOps

Dockerized frontend and backend

Self-managed Kubernetes cluster (EC2 + kubeadm)

Envoy Gateway (Gateway API) for traffic routing

Cloudflare Tunnel for secure internet exposure (no public load balancer)

Persistent storage for uploaded images using PVC

# CI/CD pipeline with GitHub Actions

SonarQube integration for code quality

Health checks, readiness & liveness probes


# Tech Stack

# Frontend

React (Vite)

Axios

Socket.IO Client

# Backend

Node.js + Express

Multer (image uploads)

Socket.IO

MySQL

# DevOps / Platform

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
