const http = require('http');
const port = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  const msg = 'Repositorio do Concoord, Backend\n'
  const msg = 'Repositorio do Concoord, Backend 3\n'

  res.end(msg);
});
