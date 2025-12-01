#!/usr/bin/env bash
# Simple Cloudflare DDNS updater for MetalLB LoadBalancer IP
# Requires: jq, curl, kubectl

set -euo pipefail
ZONE="datanetwork.online"
RECORD_APP="app.datanetwork.online"
RECORD_API="api.datanetwork.online"
NAMESPACE="wms"
SECRET_NAME="cloudflare-api-token"

API_TOKEN=$(kubectl get secret $SECRET_NAME -n $NAMESPACE -o jsonpath={.data.CLOUDFLARE_API_TOKEN} | base64 --decode)

# Find MetalLB-assigned IP for nginx gateway service (assumes nginx-gateway service exists in nginx-gateway namespace)
LB_IP=$(kubectl get svc -n nginx-gateway -o jsonpath={.items[?(@.spec.type==LoadBalancer)].status.loadBalancer.ingress[0].ip})
if [ -z "$LB_IP" ]; then
  echo "LoadBalancer IP not found. Is nginx-gateway Service provisioned?"
  exit 1
fi

# Helper: get zone id
ZONE_ID=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones?name=$ZONE" \
  -H "Authorization: Bearer $API_TOKEN" -H "Content-Type: application/json" | jq -r .result[0].id)

function upsert_record() {
  local name=$1
  local type=A
  local content=$2

  # find record
  rec=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records?name=$name" \
    -H "Authorization: Bearer $API_TOKEN" -H "Content-Type: application/json")
  rec_id=$(echo "$rec" | jq -r .result[0].id)

  if [ "$rec_id" = "null" ] || [ -z "$rec_id" ]; then
    echo "Creating DNS record $name -> $content"
    curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
      -H "Authorization: Bearer $API_TOKEN" -H "Content-Type: application/json" \
      --data "{\"type\":\"A\",\"name\":\"$name\",\"content\":\"$content\",\"ttl\":1,\"proxied\":false}"
  else
    echo "Updating DNS record $name -> $content"
    curl -s -X PUT "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records/$rec_id" \
      -H "Authorization: Bearer $API_TOKEN" -H "Content-Type: application/json" \
      --data "{\"type\":\"A\",\"name\":\"$name\",\"content\":\"$content\",\"ttl\":1,\"proxied\":false}"
  fi
}

upsert_record $RECORD_APP $LB_IP
upsert_record $RECORD_API $LB_IP

echo "Cloudflare DNS updated to $LB_IP for $RECORD_APP and $RECORD_API"
