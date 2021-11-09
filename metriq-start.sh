sudo iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 3000
cd metriq-api
screen -S metriq-api -d -m nodemon index.html
cd ../metriq-app
screen -S metriq-app -d -m npm start
