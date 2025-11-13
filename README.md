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
  --set-env-vars DB_HOST=140.245.237.157 \
  --set-env-vars DB_USER=wms_app \
  --set-env-vars DB_PASS=Ajaykumar@12. \
  --set-env-vars DB_NAME=waste_management \
  --set-env-vars JWT_SECRET=supersecret_jwt_key_2025_wms \
  --set-env-vars EMAIL_USER=yourgmail@gmail.com \
  --set-env-vars EMAIL_PASS=your_app_password_16_chars