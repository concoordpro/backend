import puppeteer from 'puppeteer';

async function Rastrear(objeto) {

  const browser = await puppeteer.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const page = await browser.newPage();

  await page.goto('https://srointranet.correios.com.br/rastreamento');

  // ESPERA O INPUT 'OBJETOS' CARREGAR, INFORMA O OBJETO E CLICA EM PESQUISAR
  await page.waitForSelector('#objetos');
  await page.type('#objetos', objeto);
  await page.click('#btnPesquisar');

  await page.waitForSelector('[name="Inicio"]');

  const eventos = await page.evaluate(() => document.body.innerText);
  const expedicao = await verificarString(eventos);
  
  // INFORMA OS LINKS
  const links = await page.$$eval('a', (anchors) => anchors.map((anchor) => anchor.href));

  // PERCORRE OS LINKS E, SE ENCONTRAR A SUBSTRING 'PO', EXECUTA O SCRIPT DE DETALHAMENTO
  for (const link of links) {
    if (link.includes('PO')) {
      //console.log(`Postagem de ${objeto} encontrada`);
      // Executa o JavaScript
      await page.evaluate((link) => {
        eval(link);
      }, link);
      break; // ENCERRA O LOOP FOR CASO ENCONTRE A POSTAGEM
    }
  }

  await page.waitForSelector('[name="Inicio"]');

  //ESCREVE O INNER TEXT DO DETALHAMENTO
  const innerText = await page.evaluate(() => document.body.innerText);

  await browser.close();

  return innerText + '\n' + expedicao;

}

async function verificarString(texto) {
 
  //var linhas = texto.split('\n'); CÓDIGO ANTERIOR

  var linhas = texto.split('\t');
 
  for (var i = 0; i < linhas.length; i++) {

    if (linhas[i].includes('Postado') && linhas[i-1] === linhas[i-6] && linhas[i-5].includes('Objeto expedido') ) {
          return 'EXPEDIDO';
      }
  }

  //CÓDIGO ANTERIOR (SOMENTE CEM RECIFE)
  /*for (var i = 0; i < linhas.length; i++) {

    if (linhas[i].includes('CEM RECIFE - JABOATAO DOS GUARARAPES / PE') && linhas[i].includes('Objeto expedido')) {
          return 'EXPEDIDO';
      }
  }*/
  return 'NAO EXPEDIDO';
}

export default Rastrear;
