# Add the NGINX Gateway Fabric Helm repository
helm repo add nginx-gateway-fabric https://nginxinc.github.io/nginx-gateway-fabric
helm repo update

# Install NGINX Gateway Fabric
helm install ngf nginx-gateway-fabric/nginx-gateway-fabric -n nginx-gateway --create-namespace

kubectl get pods -n nginx-gateway
kubectl get svc -n nginx-gateway
kubectl get gatewayclass