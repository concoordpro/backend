import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  // Seu objeto de configuração do Firebase
};

const app = initializeApp(firebaseConfig);

const http = require('http');
const port = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  const msg = './concoord/index.html' //'Repositorio do Concoord!\n'
  
  res.end(msg);
});

server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}/`);
});
