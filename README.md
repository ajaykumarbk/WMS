# WMS
Waste Management System - A portal for municipality and civilians to report the waste with location, image, type of waste and description.


Commands to deploy this application to google cloud run

docker build -t frontend .
docker tag frontend gcr.io/playground-s-11-a0c422bb/frontend-app
docker push gcr.io/playground-s-11-a0c422bb/frontend-app

gcloud run deploy frontend-app \
  --image gcr.io/playground-s-11-a0c422bb/frontend-app \
  --platform managed \
  --allow-unauthenticated \
  --region europe-west1
