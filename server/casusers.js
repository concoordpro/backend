import puppeteer from 'puppeteer';
import fs from 'fs';
import { log } from 'console';

async function acessarCAS(matricula, senha) {

  const browser = await puppeteer.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const page = await browser.newPage();

  await page.goto('https://cas.correios.com.br/login');

  // ESPERA O INPUT 'OBJETOS' CARREGAR, INFORMA O OBJETO E CLICA EM PESQUISAR
  await page.waitForSelector('#password');
  await page.type('#username', matricula);
  await page.type('#password', senha);
  await page.click('.primario');

  await page.waitForSelector('.msg');

  //ESCREVE O INNER TEXT DO DETALHAMENTO
  const innerText = await page.evaluate(() => document.body.innerText);

  await browser.close();

  // OBTÉM DATA E HORA
  const now = new Date();
  const data = `${now.toLocaleDateString()}`;
  const horario = `${now.toLocaleTimeString()}`;

  const nome = escreverUsuario(innerText);
  const setor = escreverSetor(innerText);
  let logEntry = '';

  // FORMATA O LOG
  if (nome !== null) {
    logEntry = `${data}|${horario}|${matricula}|${nome.slice(0,8)}|${setor.slice(-8)}|LOGIN OK$\n`;
  } else {
    logEntry = `${data}|${horario}|${matricula}|NOME USU|SETOR US|LOGIN ERR\n`;
  };
  
    // ESCREVE O LOG
  fs.appendFileSync('log.txt', logEntry);
  console.log(logEntry.slice(0,-1));

  return innerText;

}

function escreverUsuario(usuario) {
  const linhas = usuario.split('\n');
  let nome = null;

  if (linhas[0].includes("Sucesso ao se logar")) {

    for (let i = 0; i < linhas.length; i++) {
      if (linhas[i].includes("nome")) {
        nome = deColchetes(linhas[i]);
      }
    }
  }

  return nome;
}

function escreverSetor(usuario) {
  const linhas = usuario.split('\n');
  let setor = null;

  if (linhas[0].includes("Sucesso ao se logar")) {

    for (let i = 0; i < linhas.length; i++) {
      if (linhas[i].includes("departamento")) {
        setor = deColchetes(linhas[i]);
      }
    }
  }

  return setor;

}

function deColchetes(str) {
  var regex = /\[(.*?)\]/;
  var match = regex.exec(str);

  if (match && match.length > 1) {
    return match[1];
  } else {
    return null;
  }
}


export default acessarCAS;
