const config = {
  aws_project_region: 'ap-southeast-1',
  aws_cognito_identity_pool_id:
    'ap-southeast-1:f95dd665-422b-4916-94bb-84b3875bba6d',
  aws_cognito_region: 'ap-southeast-1',
  aws_user_pools_id: 'ap-southeast-1_jkM0CgrEF',
  aws_user_pools_web_client_id: '1di711cfajvfpqljvdbcek66kh',
  oauth: {
    domain: 'uvcrawler-dev.auth.ap-southeast-1.amazoncognito.com',
    scope: ['openid', 'profile'],
  },
  federationTarget: 'COGNITO_USER_POOLS',

  aws_appsync_graphqlEndpoint:
    'https://lxaxzxsu4jdgdgooyvenpa5npq.appsync-api.ap-southeast-1.amazonaws.com/graphql',
  aws_appsync_region: 'ap-southeast-1',
  aws_appsync_authenticationType: 'AMAZON_COGNITO_USER_POOLS',
  aws_appsync_apiKey: 'null',

  aws_user_files_s3_bucket:
    'devstage-basestack-databuckete3889a50-1g1xv7rv7flx1',
  aws_user_files_s3_bucket_region: 'ap-southeast-1',
};

export default config;