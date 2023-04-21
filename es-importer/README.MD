# How to do

## Start your cluster with security enabled and configured

1. Modify the .env file

2. Create and start the Elasticsearch single node cluster with security disabled

```bash
docker-compose up -d
```

3. When the deployment has started, open a browser and navigate to `http://localhost:5601` to access Kibana, where you can load sample data and interact with your elasticsearch.
