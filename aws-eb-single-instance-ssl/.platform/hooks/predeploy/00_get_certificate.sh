#!/usr/bin/env bash
# Change DOMAIN to your domain and EMAIL to your email address
sudo certbot -n -d test-ssl.sk-global.io --nginx --agree-tos --email bvbinh+ssl1@sk-global.biz
ln -sf /etc/letsencrypt/live/test-ssl.sk-global.io /etc/letsencrypt/live/ebcert