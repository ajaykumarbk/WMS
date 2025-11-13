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



# backend  deployment

1. Rebuild the backend image
docker build -t backend .

2. Tag for Google Cloud
docker tag backend gcr.io/playground-s-11-a0c422bb/backend-app

3. Push to registery
docker push gcr.io/playground-s-11-a0c422bb/backend-app

4. Deploy to Cloud Run
gcloud run deploy backend-app \
  --image gcr.io/playground-s-11-a0c422bb/backend-app \
  --region europe-west1 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars PORT=5000 \
  --set-env-vars DB_HOST=140.245.237.157 \
  --set-env-vars DB_USER=wms_app \
  --set-env-vars DB_PASS=Ajaykumar@12. \
  --set-env-vars DB_NAME=waste_management \
  --set-env-vars JWT_SECRET=supersecret_jwt_key_2025_wms \
  --set-env-vars EMAIL_USER=yourgmail@gmail.com \
  --set-env-vars EMAIL_PASS=your_app_password_16_chars