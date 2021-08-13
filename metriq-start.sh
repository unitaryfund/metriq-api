cd /workspace/metriq-db
mongoimport --db metriq --collection methods methods.json
mongoimport --db metriq --collection results results.json
mongoimport --db metriq --collection submissions submissions.json
mongoimport --db metriq --collection tags tags.json
mongoimport --db metriq --collection tasks tasks.json
mongoimport --db metriq --collection users users.json

cd /workspace/metriq-api
npm i
screen -dm nodemon index.html

cd /workspace/metriq-app
npm i
screen -dm npm start
