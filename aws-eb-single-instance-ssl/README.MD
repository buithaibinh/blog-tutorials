## Prere

Install the EB CLI if you don't have it already.
https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3-install.html#eb-cli3-install.scripts

## Setup

### Create a new application

```
eb init
```

### Create a new environment with single instance

```
# set DOMAIN_LINK and EMAIL_LINK environment variables
eb setenv DOMAIN_LINK=test-ssl.sk-global.io EMAIL_LINK=bvbinh+ssl1@sk-global.biz
eb create --single
```