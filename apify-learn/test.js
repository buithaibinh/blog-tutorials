const axios = require("axios");

const options = {
  method: 'GET',
  url: 'https://ip-to-location1.p.rapidapi.com/myip',
  params: {ip: '3.0.35.31'},
  headers: {
    'X-RapidAPI-Key': '667dab69e4msh7ee671827761ed4p1e9924jsn4f2fa5712f27',
    'X-RapidAPI-Host': 'ip-to-location1.p.rapidapi.com'
  }
};

axios.request(options).then(function (response) {
	console.log(response.data);
}).catch(function (error) {
	console.error(error);
});