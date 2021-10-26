sudo iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 3000

cd /workspace/metriq-api
npm i
screen -dm nodemon index.html

cd /workspace/metriq-app
npm i
screen -dm npm start
