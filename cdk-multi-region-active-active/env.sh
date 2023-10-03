# AWS profile to use for the stack, defaults to "default"
export AWS_PROFILE="my"

# Hosted zone ID for the domain, e.g. Z1A2BCDEF3GH4I
export DOMAIN_NAME="mutil-demo.freedevtool.com"
export HOSTED_ZONE_ID="Z09806561I7RBF9O4RMC8"

# stage name, e.g. dev, prod. It also used as a suffix for the dynamodb table name
export STAGE_NAME="dev"

# define the regions to deploy the stack to here
REGIONS=("us-east-1" "ap-southeast-1")