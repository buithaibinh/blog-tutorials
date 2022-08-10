#!/usr/bin/env bash
sudo certbot -n -d test-ssl.sk-global.io --nginx --agree-tos --email bvbinh+ssl1@sk-global.biz
# sudo chown ec2-user -R /etc/letsencrypt