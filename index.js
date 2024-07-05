
const server = http.createServer((req, res) => {
  res.statusCode = 200;
  const msg = 'Repositorio do Concoord, Backend\n'
  const msg = 'Repositorio do Concoord, Backend 2\n'

  res.end(msg);
});
