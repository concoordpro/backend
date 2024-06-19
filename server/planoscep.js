import fs from 'fs';
import { parse } from 'csv-parse';

const filesiglas = './csv/siglasobj.csv';
const fileplanos = './csv/planos.csv';

const dados = {
  cep: 'objeto',
  planoExpedicao1: 'planoExpedicao1',
  planoExpedicao2: 'planoExpedicao2',
  planoExpedicao3: 'planoExpedicao3',
  corFundo1: 'corFundo1',
  corFundo2: 'corFundo2',
  corFundo3: 'corFundo3',
  corTexto1: 'corTexto1',
  corTexto2: 'corTexto2',
  corTexto3: 'corTexto3'
}

async function verificarPlanosCep(cep) {

    dados.cep = cep;
    await indicarPlanos(dados.cep);

    return dados;

}

// BUSCA O PLANO DE EXPEDIÇÃO
async function indicarPlanos(cep) {
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(fileplanos)
      .pipe(parse({ delimiter: ';' }))
      .on('data', (row) => {
        const faixaInicial = parseInt(row[2], 10);
        const faixaFinal = parseInt(row[3], 10);

        if (cep >= faixaInicial && cep <= faixaFinal && row[0] === 'SEDEX' && row[1] === 'PACOTE') {
          dados.planoExpedicao1 = row[4];
          dados.corFundo1 = row[7];
          dados.corTexto1 = row[8];
        }
        if (cep >= faixaInicial && cep <= faixaFinal && row[0] === 'PAC' && row[1] === 'PACOTE') {
          dados.planoExpedicao2 = row[4];
          dados.corFundo2 = row[7];
          dados.corTexto2 = row[8];
        }
        if (cep >= faixaInicial && cep <= faixaFinal && row[0] === 'SEDEX' && row[1] === 'ENVELOPE') {
          dados.planoExpedicao3 = row[4];
          dados.corFundo3 = row[7];
          dados.corTexto3 = row[8];
        }


      })
      .on('end', () => {
        resolve();
      })
      .on('error', (error) => {
        reject(error);
      });
  });

  
}


export default verificarPlanosCep;
