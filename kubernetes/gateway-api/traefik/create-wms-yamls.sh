#!/usr/bin/env bash
set -e

# Directory where files will be created
DIR="wms-real"
mkdir -p "$DIR"

# Values from your message
DB_HOST="140.245.237.157"
DB_USER="wms_app"
DB_PASS="Ajaykumar@12."
DB_NAME="waste_management"
JWT_SECRET="supersecret_jwt_key_2025_wms"
PORT="5000"   # currently not used in deployment, but kept for reference

cat > "$DIR/00-namespace.yaml" <<'EOF'
apiVersion: v1
kind: Namespace
metadata:
  name: wms
EOF

cat > "$DIR/01-backend-secret.yaml" <<EOF
apiVersion: v1
kind: Secret
metadata:
  name: backend-secrets
  namespace: wms
type: Opaque
stringData:
  DB_HOST: "$DB_HOST"
  DB_PORT: "3306"           # default MySQL port - change if different
  DB_NAME: "$DB_NAME"
  DB_USER: "$DB_USER"
  DB_PASSWORD: "$DB_PASS"
  JWT_SECRET: "$JWT_SECRET"
  NODE_ENV: "production"
EOF

cat > "$DIR/02-backend-deployment.yaml" <<'EOF'
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: wms
  labels:
    app: backend
spec:
  replicas: 1
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: ajaykumara/backend-app:latest
        imagePullPolicy: Always
        ports:
        - containerPort: 5000
          name: http
        envFrom:
        - secretRef:
            name: backend-secrets
        resources:
          requests:
            cpu: "150m"
            memory: "256Mi"
          limits:
            cpu: "800m"
            memory: "1Gi"
        readinessProbe:
          httpGet:
            path: /health                # ← change if your health endpoint is different
            port: 5000
          initialDelaySeconds: 10
          periodSeconds: 10
          timeoutSeconds: 3
        livenessProbe:
          httpGet:
            path: /health
            port: 5000
          initialDelaySeconds: 30
          periodSeconds: 30
          timeoutSeconds: 3
EOF

cat > "$DIR/03-backend-service.yaml" <<'EOF'
apiVersion: v1
kind: Service
metadata:
  name: backend
  namespace: wms
spec:
  selector:
    app: backend
  ports:
  - name: http
    port: 5000
    targetPort: 5000
    protocol: TCP
EOF

cat > "$DIR/04-frontend-deployment.yaml" <<'EOF'
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: wms
  labels:
    app: frontend
spec:
  replicas: 1
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: ajaykumara/frontend-app:latest
        imagePullPolicy: Always
        ports:
        - containerPort: 80
          name: http
        resources:
          requests:
            cpu: "100m"
            memory: "192Mi"
          limits:
            cpu: "500m"
            memory: "512Mi"
        readinessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 10
        livenessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 15
          periodSeconds: 20
EOF

cat > "$DIR/05-frontend-service.yaml" <<'EOF'
apiVersion: v1
kind: Service
metadata:
  name: frontend
  namespace: wms
spec:
  selector:
    app: frontend
  ports:
  - name: http
    port: 80
    targetPort: 80
    protocol: TCP
EOF

cat > "$DIR/06-httproute-frontend.yaml" <<'EOF'
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: frontend
  namespace: wms
spec:
  parentRefs:
  - name: wms-gateway
    namespace: traefik
  hostnames:
  - "app.datanetwork.online"
  rules:
  - matches:
    - path:
        type: PathPrefix
        value: /
    backendRefs:
    - name: frontend
      port: 80
      namespace: wms
EOF

cat > "$DIR/07-httproute-backend.yaml" <<'EOF'
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: backend
  namespace: wms
spec:
  parentRefs:
  - name: wms-gateway
    namespace: traefik
  hostnames:
  - "api.datanetwork.online"
  rules:
  - matches:
    - path:
        type: PathPrefix
        value: /
    backendRefs:
    - name: backend
      port: 5000
      namespace: wms
EOF

echo "All YAML files have been created in directory: $DIR"
echo ""
echo "Next steps:"
echo "1. cd $DIR"
echo "2. Review 01-backend-secret.yaml (especially passwords!)"
echo "3. Apply everything:"
echo "   kubectl apply -f ."
echo "   # or in order: kubectl apply -f 0*.yaml 1*.yaml 2*.yaml ... 7*.yaml"
echo ""
echo "Verify:"
echo "   kubectl get all -n wms"
echo "   kubectl get httproute -n wms"
echo "   kubectl -n traefik get gateway"
