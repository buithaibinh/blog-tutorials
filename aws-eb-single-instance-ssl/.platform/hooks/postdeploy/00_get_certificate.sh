#!/usr/bin/env bash
# Change DOMAIN to your domain and EMAIL to your email address
sudo certbot -n -d ${CERTBOT_DOMAINS} --nginx --agree-tos --email ${CERTBOT_EMAIL}