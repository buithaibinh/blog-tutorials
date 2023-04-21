import axios from 'axios';

const main = async () => {
  const res = await axios.get('https://aws.amazon.com', {
    timeout: 10000,
    proxy: {
      protocol: 'http',
      host: 'OutboundProxyLoadBalancer-9020fba0812414a1.elb.ap-southeast-1.amazonaws.com',
      port: 3128
    }
  });

  console.log(res.data);
};

main();
