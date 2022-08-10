import { createServer } from 'http';
const port = process.env.PORT || 8080;

const server = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello World\nThis site serving by NodeJS');
});

// Listen on port 8080, IP defaults to 127.0.0.1
server.listen(port);

console.log('Server running at http://127.0.0.1:' + port + '/');
