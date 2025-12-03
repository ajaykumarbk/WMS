#!/bin/bash

# Delete WMS resources
kubectl delete -f kubernetes/namespace.yaml

# Delete Gateway API
kubectl delete -f kubernetes/gateway/

# Delete MetalLB
kubectl delete -f kubernetes/metallb/

# Delete Cert-Manager
kubectl delete -f kubernetes/cert-manager/
