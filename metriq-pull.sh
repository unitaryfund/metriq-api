cd /home/ubuntu/GitHub/metriq-api
git stash
git pull
git stash apply
npm i 2>/dev/null

cd ..
cd metriq-app
git stash
git pull
git stash apply
npm i 2>/dev/null