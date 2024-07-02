import fs from 'fs';
import { parse } from 'csv-parse';

const dados = {
  objeto: 'objeto',
  tipoObjeto: 'tipoObjeto',
  evento: 'evento',
  unidadeOrigem: 'unidadeOrigem',
  municipioOrigem: 'municipioOrigem',
  dataPostagem: 'dataPostagem',
  sDataPostagem: 'sDataPostagem',
  postadoHoje: 'postadoHoje',
  destino: 'destino',
  cepDestino: 'cepDestino',
  tipoObjeto: 'tipoObjeto',
  planoExpedicao: 'planoExpedicao',
  corFundo: 'corFundo',
  corTexto: 'corTexto',
  expedicao: 'expedicao'
}


// VERIFICA OS DADOS RECEBIDOS DO SRO
async function verificarPlanos(mcu, dadospostagem) {

  const linhas = dadospostagem.split('\n');
  let encontrado = false; // Flag para indicar se "(PO)" foi encontrado em alguma linha

  for (let i = 0; i < linhas.length; i++) {
    if (linhas[i].includes("(PO)")) {
      encontrado = true;
      dados.objeto = linhas[i].slice(0, 13);
      dados.tipoObjeto = linhas[i].slice(0, 2);
      dados.evento = 'POSTADO';
      dados.unidadeOrigem = linhas[i + 3].replace('\t', ' ');
      dados.municipioOrigem = linhas[i + 4].replace('\t', ' ');
      dados.dataPostagem = linhas[i + 5].replace('\t', ' ');
      dados.dataPostagem = dados.dataPostagem.replace('Criado', 'Postado');
      dados.sDataPostagem = dados.dataPostagem.slice(12, 22);
      dados.destino = linhas[i + 7].replace('\t', ' ');
      dados.cepDestino = dados.destino.slice(13, 21);
      dados.expedicao = linhas[i + 14];
      dados.corFundo = 'bg-danger';
      dados.corTexto = 'text-white';
      dados.planoExpedicao = 'PLANO NÃO CADASTRADO';// INICIA A BUSCA SEM PLANO
      //FUNÇÕES
      await categorizarObjeto(dados.tipoObjeto);
      await indicarPlanos(mcu, dados.cepDestino); // CASO ENCONTRE O PLANO
      await verificarData(dados.sDataPostagem);
      break; // Sair do loop assim que encontrar a linha com "(PO)"
    }
  }

  if (!encontrado) {
    dados.objeto = linhas[7].slice(0, 13);
    dados.tipoObjeto = linhas[7].slice(0, 2);
    dados.evento = 'NÃO POSTADO';
    dados.unidadeOrigem = '';
    dados.municipioOrigem = '';
    dados.dataPostagem = '';
    dados.dataPostagem = '';
    dados.sDataPostagem = '';
    dados.destino = '';
    dados.cepDestino = '';
    dados.corFundo = 'bg-danger';
    dados.corTexto = 'text-white';
    dados.planoExpedicao = 'POSTAGEM NÃO ENCONTRADA';
    dados.postadoHoje = 'text-dark';
    dados.expedicao = '';
  }

 
  return dados;
}


// BUSCA PELO TIPO DE SERVIÇO PELA SILGA, NO CSV 
async function categorizarObjeto(sigla) {
  return new Promise((resolve, reject) => {


    const filesiglas = './csv/siglasobj.csv';

    const stream = fs.createReadStream(filesiglas)
      .pipe(parse({ delimiter: ';' }))
      .on('data', (row) => {
        if (row[0] === sigla) {
          dados.tipoObjeto = row[3];
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

// BUSCA O PLANO DE EXPEDIÇÃO
async function indicarPlanos(mcu, cep) {
  return new Promise((resolve, reject) => {

    const fileplanos = `./csv/${mcu}/planos.csv`;

    const stream = fs.createReadStream(fileplanos)
      .pipe(parse({ delimiter: ';' }))
      .on('data', (row) => {
        const faixaInicial = parseInt(row[2], 10);
        const faixaFinal = parseInt(row[3], 10);

        if (cep >= faixaInicial && cep <= faixaFinal && row[0] === dados.tipoObjeto && row[1] === 'PACOTE') {
          dados.planoExpedicao = row[4];
          dados.corFundo = row[7];
          dados.corTexto = row[8];
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

// VERIFICA SE POSTADO NA DATA
async function verificarData(dataInformada) {

  let dataAtual = new Date();

  // Formata a dataInformada para o mesmo formato que a dataAtual
  let partesDataInformada = dataInformada.split('/');
  let dataInformadaFormatada = new Date(partesDataInformada[2], partesDataInformada[1] - 1, partesDataInformada[0]);

  // Verifica se as datas são iguais
  if (dataInformadaFormatada.getDate() === dataAtual.getDate()) {
    dados.postadoHoje = 'text-dark';
  } else {
    dados.postadoHoje = 'text-danger';
  }
}


export default verificarPlanos;
