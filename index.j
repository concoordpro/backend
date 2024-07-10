const express = require('express');
const app = express();
const port = process.env.PORT || 8080;

// Define uma rota para o caminho raiz "/"
app.get('/', (req, res) => {
  res.statusCode = 200;
  const msg = 'Repositorio do Concoord, Backend 10/07/2024 08:09\n';
  res.send(msg);
});

// Inicia o servidor na porta especificada
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}/`);
});
