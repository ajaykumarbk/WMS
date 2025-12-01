Use these commands to verify components:
- kubectl get pods -n nginx-gateway
- kubectl get svc -n nginx-gateway
- kubectl get svc -n metallb-system
- kubectl get ippools -n metallb-system
- kubectl describe certificate -n wms
- kubectl get orders -n wms
- kubectl describe gateway wms-gateway -n wms
- kubectl get httproute -n wms
- curl -k https://app.datanetwork.online/  (after DNS points to LB IP)
