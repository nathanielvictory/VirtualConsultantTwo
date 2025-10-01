npm run build -- --mode qa
BUCKET=$(terraform -chdir=../../infra/terraform/envs/qa output -raw web_bucket_name)
aws s3 sync ./dist s3://$BUCKET --delete --cache-control "max-age=31536000,public" --exclude "index.html"
aws s3 cp ./dist/index.html s3://$BUCKET/index.html --cache-control "no-cache"