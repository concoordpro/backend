import puppeteer from 'puppeteer';

const dados = {
  peso: 'peso',
  x: 'x',
  y: 'y',
  z: 'z',
  info: 'info'
}

async function buscaCubo(objeto, cep) {
  const browser = await puppeteer.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const page = await browser.newPage();

  await page.goto('http://10.128.39.25/');

  try {

    await page.evaluate(() => {

      const elemento = document.querySelector('#myModal');

      if (elemento) {
        elemento.classList.add('in');
        elemento.style.display = 'block';
      }
    });

    await page.click('#input');
    await page.type('#input', objeto);
    await page.click('.btn:nth-child(3)');

    await page.click('#input');
    await page.type('#input', cep);
    await page.click('.btn:nth-child(3)');

    await page.waitForFunction(() => {
      const weightElement = document.querySelector('#weight');
      return weightElement && weightElement.textContent.trim() !== '';
    });

    await page.waitForFunction(() => {
      const boxzElement = document.querySelector('#box-z');
      return boxzElement && boxzElement.textContent.trim() !== '- - -';
    });

    dados.peso = await page.$eval('#weight', element => element.innerText);
    dados.x = await page.$eval('#box-x', element => element.innerText);
    dados.y = await page.$eval('#box-y', element => element.innerText);
    dados.z = await page.$eval('#box-z', element => element.innerText);


  } catch (error) {
    //console.error(`A espera da função excedeu o tempo máximo de ${tempoMaximoEspera}ms.`);  << DESATIVAR NO AMBIENTE PRODUÇÃO
  } finally {
    await browser.close();
  }

  return dados;
}


export default buscaCubo;
