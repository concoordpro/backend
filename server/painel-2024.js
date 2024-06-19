
//DEPENDENCIAS >>>>>>>

import adodb from 'node-adodb';
import fs from 'fs';
import { exec } from 'child_process';

//BANCO DE DADOS >>>>>>>

//CONEXAO AO ADODB (ACCESS)

//const connection2 = adodb.open('Provider=Microsoft.ACE.OLEDB.16.0;Data Source=\\\\mpeo32118155\\concoord\\server\\bd\\painel.mdb;', false);
//const connection = adodb.open('Provider=Microsoft.Jet.OLEDB.4.0;Data Source=\\\\mpeo32118155\\concoord\\server\\bd\\painel.mdb;', false);
//const connection = adodb.open('Provider=Microsoft.Jet.OLEDB.4.0;Data Source=C:\\Concoord_15 Projeto\\server\\bd\\painel.mdb;', false);

//VARIAVEIS DE COR

let cor;
let verde = '#5F9EA0';
let cinza = '#E7E7E7';
let amarelo = '#F5BD33';
let vermelho = '#CD5C5C';
let azul = '#316f97';
let connection='';

//DATA PAINEL

const rPainel = {

  mGerencial: 0,
  rGerencial: 0,
  pGerencial: 0,
  gGerencial: 0,
  aGerencial: 0,

  mCarteira: 0,
  rCarteira: 0,
  pCarteira: 0,
  gCarteira: 0,
  aCarteira: 0,

  mBalcao: 0,
  rBalcao: 0,
  pBalcao: 0,
  gBalcao: 0,
  aBalcao: 0,

  sEncomenda: 0,
  sMarketing: 0,
  sConveniencia: 0,
  sMensagem: 0,
  sInternacional: 0,
  sOutros: 0,
  sLogistica: 0,
  sMalote: 0,

  rMensal: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  mMensal: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  rDesempenho: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  rCores: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  rSegmentos: [0, 0, 0, 0, 0, 0, 0, 0],

  rTabela: 0,

  rData: 0,
}

//CALCULO PAINEL >>>>>>>

function calcularPainelGerencial(periodo, segmento, gerencia, linha, fvendas) {
  return new Promise((resolve, reject) => {

    copiarBD() //CRIA UMA CÓPIA DO BANCO DE DADOS >>>>
      .then((copyPath) => {

        connection = adodb.open(`Provider=Microsoft.Jet.OLEDB.4.0;Data Source=${copyPath};`, false);
       
        const periodoSQL = escreverPeriodoSQL(periodo);
        const segmentoSQL = segmento;
        const gerenciaSQL = gerencia;
        const filtroSQL = linha;
        const fvendasSQL = fvendas;

        //PRIMEIRA FUNCAO (CANAL + SEGMENTOS) >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
        buscaResultadosCanal(periodoSQL, segmentoSQL, gerenciaSQL, filtroSQL, fvendasSQL)
          .then((resultado) => {

            zerarValores();

            //ATUALIZA OS RESULTADOS DOS CANAIS
            for (let i = 0; i < resultado.length; i++) {
              if (resultado[i].CANAL == 'A FATURAR') {
                rPainel.rCarteira = rPainel.rCarteira + resultado[i].RECEITA;
                rPainel.mCarteira = rPainel.mCarteira + resultado[i].META;
                rPainel.aCarteira = rPainel.aCarteira + resultado[i].ANTERIOR;
              } else if (resultado[i].CANAL == 'À VISTA') {
                rPainel.rBalcao = rPainel.rBalcao + resultado[i].RECEITA;
                rPainel.mBalcao = rPainel.mBalcao + resultado[i].META;
                rPainel.aBalcao = rPainel.aBalcao + resultado[i].ANTERIOR;
              }
            }

            //ATUALIZA OS RESULTADOS DOS SEGMENTOS
            for (let i = 0; i < resultado.length; i++) {
              if (resultado[i].SEGMENTO == 'ENCOMENDA') {
                rPainel.sEncomenda = rPainel.sEncomenda + resultado[i].RECEITA;
              } else if (resultado[i].SEGMENTO == 'MARKETING') {
                rPainel.sMarketing = rPainel.sMarketing + resultado[i].RECEITA;
              } else if (resultado[i].SEGMENTO == 'MENSAGEM') {
                rPainel.sMensagem = rPainel.sMensagem + resultado[i].RECEITA;
              } else if (resultado[i].SEGMENTO == 'INTERNACIONAL') {
                rPainel.sInternacional = rPainel.sInternacional + resultado[i].RECEITA;
              } else if (resultado[i].SEGMENTO == 'CONVENIÊNCIA') {
                rPainel.sConveniencia = rPainel.sConveniencia + resultado[i].RECEITA;
              } else if (resultado[i].SEGMENTO == 'OUTROS') {
                rPainel.sOutros = rPainel.sOutros + resultado[i].RECEITA;
              } else if (resultado[i].SEGMENTO == 'MALOTE') {
                rPainel.sMalote = rPainel.sMalote + resultado[i].RECEITA;
              } else if (resultado[i].SEGMENTO == 'LOGÍSTICA') {
                rPainel.sLogistica = rPainel.sLogistica + resultado[i].RECEITA;
              }
            }

            //ATUALIZA OS PERCENTUAIS 
            rPainel.rGerencial = rPainel.rBalcao + rPainel.rCarteira;
            rPainel.mGerencial = rPainel.mBalcao + rPainel.mCarteira;
            rPainel.pBalcao = rPainel.rBalcao / rPainel.mBalcao;
            rPainel.pCarteira = rPainel.rCarteira / rPainel.mCarteira;
            rPainel.pGerencial = rPainel.rGerencial / rPainel.mGerencial;
            rPainel.aGerencial = rPainel.aBalcao + rPainel.aCarteira;
            rPainel.aCarteira = ajustaPercentualCrescimento(rPainel.aCarteira, rPainel.rCarteira);
            rPainel.aBalcao = ajustaPercentualCrescimento(rPainel.aBalcao, rPainel.rBalcao);
            rPainel.aGerencial = ajustaPercentualCrescimento(rPainel.aGerencial, rPainel.rGerencial);


            //ATUALIZA OS PARÂMETROS PARA OS GRÁFICOS
            rPainel.gGerencial = ajustaPercentual(rPainel.pGerencial);
            rPainel.gCarteira = ajustaPercentual(rPainel.pCarteira);
            rPainel.gBalcao = ajustaPercentual(rPainel.pBalcao);
            rPainel.rSegmentos = [rPainel.sEncomenda, rPainel.sMensagem, rPainel.sInternacional, rPainel.sMarketing, rPainel.sConveniencia, rPainel.sOutros, rPainel.sLogistica, rPainel.sMalote]

            //SEGUNDA FUNCAO (MENSAIS) >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
            buscaResultadosMensais(periodoSQL, segmentoSQL, gerenciaSQL, filtroSQL, fvendasSQL)
              .then((resultado) => {

                const rProps = ["Expr1000", "Expr1001", "Expr1002", "Expr1003", "Expr1004", "Expr1005", "Expr1006", "Expr1007", "Expr1008", "Expr1009", "Expr1010", "Expr1011"];
                const mProps = ["Expr1012", "Expr1013", "Expr1014", "Expr1015", "Expr1016", "Expr1017", "Expr1018", "Expr1019", "Expr1020", "Expr1021", "Expr1022", "Expr1023"];

                for (let i = 0; i <= 11; i++) {
                  rPainel.rMensal[i] = resultado[0][rProps[i]];
                  rPainel.mMensal[i] = resultado[0][mProps[i]];
                  if (rPainel.mMensal[i] !== 0) { rPainel.rDesempenho[i] = rPainel.rMensal[i] / rPainel.mMensal[i] } else rPainel.rDesempenho[i] = 0;
                  rPainel.rCores[i] = ajustaPercentualCor(rPainel.rDesempenho[i]);
                }

                //TERCEIRA FUNCAO (GRUPOS) >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
                buscaResultadosGrupos(periodoSQL, segmentoSQL, gerenciaSQL, filtroSQL, fvendasSQL)
                  .then((resultado) => {

                    rPainel.rTabela = resultado;


                    //QUARTA FUNCAO (DATA) >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
                    buscaDataPainel()
                      .then((resultado) => {

                        rPainel.rData = resultado;
                        deleteCopia(copyPath); // EXCLUI A CÓPIA DO BANCO DE DADOS
                        
                        resolve(rPainel); // Resolve a Promise com rPainel após atualização dos valores

                      })
                      .catch((error) => {
                        res.send(error);
                        console.error('Erro:', error);

                      });

                  })
                  .catch((error) => {
                    res.send(error);
                    console.error('Erro:', error);

                  });

              })
              .catch((error) => {
                res.send(error);
                console.error('Erro:', error);

              });

          })
          .catch((error) => {
            console.error('Erro:', error);
          });


      })
      .catch((error) => {
        reject(error); // Rejeita a Promise em caso de erro
      });
  });
}


function escreverPeriodoSQL(periodo) {

  return `SUM(PE_2024.REC_${periodo}) AS RECEITA, SUM(PE_2024.META_${periodo}) AS META, SUM(PE_2024.ANT_${periodo}) AS ANTERIOR, IIF(META = 0, 0, RECEITA / META) AS DESEMPENHO, RECEITA - META AS DIFERENCA`

}

function criarGrupoSQLMes(numMeses) {

  const meses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
  const colunasReceita = meses.slice(0, numMeses).map(mes => `SUM(PE_2024.REC_${mes})`).join(' + ');
  const colunasMeta = meses.slice(0, numMeses).map(mes => `SUM(PE_2024.META_${mes})`).join(' + ');
  const grupoPeriodoSQL = `(${colunasReceita}) AS RECEITA, (${colunasMeta}) AS META`

  return grupoPeriodoSQL;

}

async function buscaResultadosCanal(periodoCanal, segmentoCanal, gerenciaCanal, filtroCanal, fvendasCanal) {
  try {

    const coluna = filtroCanal.replace("'", "");
    const sql = `SELECT CANAL, SEGMENTO, ${periodoCanal} 
    FROM PE_REDE
    INNER JOIN PE_2024 ON PE_REDE.MCU = PE_2024.MCU
    WHERE SEGMENTO = ${segmentoCanal} AND CAPTACAO = ${gerenciaCanal} AND ${coluna} = ${fvendasCanal}
    AND PE_REDE.${filtroCanal} IS NOT NULL
    GROUP BY CANAL, SEGMENTO`;
    const result = connection.query(sql);

    return result;

  } catch (error) {
    console.error('Erro ao executar a consulta:', error);
    throw error;
  }
}

async function buscaResultadosMensais(periodoCanal, segmentoCanal, gerenciaCanal, filtroCanal, fvendasCanal) {
  try {

    const coluna = filtroCanal.replace("'", "");
    const sql = `SELECT Sum(REC_JAN), Sum(REC_FEV), Sum(REC_MAR), Sum(REC_ABR), Sum(REC_MAI), Sum(REC_JUN), Sum(REC_JUL), Sum(REC_AGO), Sum(REC_SET), Sum(REC_OUT), Sum(REC_NOV), Sum(REC_DEZ), Sum(META_JAN), Sum(META_FEV), Sum(META_MAR), Sum(META_ABR), Sum(META_MAI), Sum(META_JUN), Sum(META_JUL), Sum(META_AGO), Sum(META_SET), Sum(META_OUT), Sum(META_NOV), Sum(META_DEZ) 
    FROM PE_2024 
    INNER JOIN PE_REDE ON PE_2024.MCU = PE_REDE.MCU 
    WHERE SEGMENTO = ${segmentoCanal} AND CAPTACAO = ${gerenciaCanal} AND ${coluna} = ${fvendasCanal}
    AND PE_REDE.${filtroCanal} IS NOT NULL`;

    const result = connection.query(sql);
    return result;

  } catch (error) {
    console.error('Erro ao executar a consulta:', error);
    throw error;
  }
}

async function buscaResultadosGrupos(periodoGrupo, segmentoGrupo, filtroGerencia, filtroGrupo, filtroFvendas) {
  try {

    const coluna = filtroGrupo.replace("'", "");
    let sql = '';

    if (coluna === filtroFvendas) {
      sql = `SELECT PE_REDE.${filtroGrupo}, ${periodoGrupo} 
      FROM PE_REDE
      INNER JOIN PE_2024 ON PE_REDE.MCU = PE_2024.MCU
      WHERE SEGMENTO = ${segmentoGrupo} AND CAPTACAO = ${filtroGerencia} AND ${coluna} = ${filtroFvendas}
      AND PE_REDE.${filtroGrupo} IS NOT NULL
      GROUP BY PE_REDE.${filtroGrupo}`;
    } else {
      sql = `SELECT PE_REDE.F_VENDAS, ${periodoGrupo} 
      FROM PE_REDE
      INNER JOIN PE_2024 ON PE_REDE.MCU = PE_2024.MCU
      WHERE SEGMENTO = ${segmentoGrupo} AND CAPTACAO = ${filtroGerencia} AND ${coluna} = ${filtroFvendas}
      AND PE_REDE.F_VENDAS IS NOT NULL
      GROUP BY PE_REDE.F_VENDAS`;
    }

    const result = connection.query(sql);
    return result;

  } catch (error) {
    console.error('Erro ao executar a consulta:', error);
    throw error;
  }
}

async function buscaResultadosFiltro(periodoGrupo, segmentoGrupo, filtroGrupo) {
  try {

    const sql = `SELECT PE_REDE.${filtroGrupo}, ${periodoGrupo} 
    FROM PE_REDE
    INNER JOIN PE_2024 ON PE_REDE.MCU = PE_2024.MCU
    WHERE SEGMENTO = ${segmentoGrupo}
    GROUP BY PE_REDE.${filtroGrupo}`;

    const result = connection.query(sql);
    return result;

  } catch (error) {
    console.error('Erro ao executar a consulta:', error);
    throw error;
  }
}

async function buscaDataPainel() {
  try {

    const sql = `SELECT Datapainel.DATAPAINEL FROM Datapainel`;

    const result = connection.query(sql);
    return result;

  } catch (error) {
    console.error('Erro ao executar a consulta:', error);
    throw error;
  }
}

function zerarValores() {

  rPainel.mGerencial = 0;
  rPainel.rGerencial = 0;
  rPainel.pGerencial = 0;
  rPainel.gGerencial = 0;
  rPainel.aGerencial = 0;

  rPainel.mCarteira = 0;
  rPainel.rCarteira = 0;
  rPainel.pCarteira = 0;
  rPainel.gCarteira = 0;
  rPainel.aCarteira = 0;


  rPainel.mBalcao = 0;
  rPainel.rBalcao = 0;
  rPainel.pBalcao = 0;
  rPainel.gBalcao = 0;
  rPainel.aBalcao = 0;

  rPainel.sEncomenda = 0;
  rPainel.sMarketing = 0;
  rPainel.sConveniencia = 0;
  rPainel.sMensagem = 0;
  rPainel.sInternacional = 0;
  rPainel.sOutros = 0;
  rPainel.sLogistica = 0;
  rPainel.sMalote = 0;

  rPainel.rMensal = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  rPainel.mMensal = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  rPainel.rDesempenho = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  rPainel.rCores = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  rPainel.rSegmentos = [0, 0, 0, 0, 0, 0, 0, 0];

  rPainel.rData = 0;

}

//VERIFICA SE O VALOR ULTRAPASSA 100% E COLORE
function ajustaPercentual(pgrafico) {
  if (pgrafico >= 1) {
    return { percentual: [1, 0], cor: verde };
  } else if (pgrafico < 0.9) {
    return { percentual: [pgrafico, (1 - pgrafico)], cor: vermelho };
  } else {
    return { percentual: [pgrafico, (1 - pgrafico)], cor: amarelo };
  }
}

//VERIFICA SE O VALOR DE CRECIMENTO ULTRAPASSA 100% E COLORE
function ajustaPercentualCrescimento(anterior, atual) {
  if (anterior > 0) {
    if ((atual - anterior) / anterior > 0) {
      return { crescimento: ((atual - anterior) / anterior), cor: verde };
    } else {
      return { crescimento: ((atual - anterior) / anterior), cor: vermelho };
    };
  } else {
    return { crescimento: 0, cor: vermelho };
  };
}

//VERIFICA QUANDO JÁ HÁ O PERCENTUAL E COLORE
function ajustaPercentualCor(pgrafico) {
  if (pgrafico >= 1) {
    return "#5F9EA0";
  } else if (pgrafico < 0.9) {
    return "#CD5C5C";
  } else {
    return "#F5BD33";
  }
}

async function copiarBD() {

  const numero = Math.floor(Math.random() * 10000) + 1;
  const originalPath = '\\\\mpeo32118155\\concoord\\server\\bd\\painel.mdb';
  const copyPath = `\\\\mpeo32118155\\concoord\\server\\bd\\${numero}painel.mdb`;

  return new Promise((resolve, reject) => {
    // Copia o arquivo do banco de dados
    fs.copyFile(originalPath, copyPath, (err) => {
      if (err) {
        reject('Erro ao criar cópia do banco de dados');
      } else {
        resolve(copyPath);
      }
    });
  });
}

async function deleteCopia(path) {
  return new Promise((resolve, reject) => {
    // Exclui o arquivo do banco de dados
    fs.unlink(path, (err) => {
      if (err) {
        reject('Erro ao excluir cópia do banco de dados');
      } else {
        resolve();
      }
    });
  });
}

export default calcularPainelGerencial;

