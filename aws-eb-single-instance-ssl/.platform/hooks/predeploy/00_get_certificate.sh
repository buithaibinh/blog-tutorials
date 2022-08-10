#!/usr/bin/env bash
# Change DOMAIN to your domain and EMAIL to your email address
sudo certbot -n -d demo-ssl.sk-global.io --nginx --agree-tos --email bvbinh+ssl1@sk-global.biz
ln -sf /etc/letsencrypt/live/demo-ssl.sk-global.io /etc/letsencrypt/live/ebcert