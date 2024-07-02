import puppeteer from 'puppeteer';

const dados = {
  status: 'status',
  tabela: 'tabela'
}

async function buscarCEP(CEP) {
  const browser = await puppeteer.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const page = await browser.newPage();

  await page.goto('https://buscacepinter.correios.com.br/app/endereco/index.php');

  // ESPERA O INPUT 'OBJETOS' CARREGAR, INFORMA O OBJETO E CLICA EM PESQUISAR
  await page.waitForSelector('#endereco');
  await page.type('#endereco', CEP);
  await page.click('#btn_pesquisar');

  try {

    dados.status = '';
    dados.status = '';

    
    await page.waitForSelector('td', { timeout: 500 });

    dados.tabela = await page.$$eval('td', tds => tds.map(td => td.innerText));
    dados.status = await page.$eval('#mensagem-resultado-alerta', element => element.innerText);
    
    
    return dados;
    

  } catch (error) {

    dados.status = 'ERRO NO SERVIDOR'
    dados.status = await page.$eval('#mensagem-resultado-alerta', element => element.innerText);
    
    if (dados.status === 'Dados não encontrado'){dados.status = 'CEP NÃO ENCONTRADO'};
    dados.tabela = '';
    
    return dados;

  } finally {

    await browser.close();
    
  }
}

export default buscarCEP;
