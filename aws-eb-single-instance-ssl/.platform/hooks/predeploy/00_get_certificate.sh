#!/usr/bin/env bash
# Change CERTBOT_DOMAINS to your domain and CERTBOT_EMAIL to your email address
sudo certbot -n -d ${CERTBOT_DOMAINS} --nginx --agree-tos --email ${CERTBOT_EMAIL}
ln -sf /etc/letsencrypt/live/${CERTBOT_DOMAINS} /etc/letsencrypt/live/ebcert