import fs from 'fs';
import xml2js from 'xml2js';
import { promises as fsPromises } from 'fs';
import { parseString, Builder } from 'xml2js';

// DADOS
const dados = {
  numero_etiqueta: 'numero_etiqueta',
  peso: 'peso',
  nome_destinatario: 'nome_destinatario',
  logradouro_destinatario: 'logradouro_destinatario',
  complemento_destinatario: 'complemento_destinatario',
  numero_end_destinatario: 'numero_end_destinatario',
  bairro_destinatario: 'bairro_destinatario',
  cidade_destinatario: 'cidade_destinatario',
  uf_destinatario: 'uf_destinatario',
  cep_destinatario: 'cep_destinatario',
  tipo_objeto: 'tipo_objeto',
  dimensao_altura: 'dimensao_altura',
  dimensao_largura: 'dimensao_largura',
  dimensao_comprimento: 'dimensao_comprimento',
  dimensao_diametro: 'dimensao_diametro',
}

const validados = {
  total: 'total',
  validados: 'validados',
  peloUsuario: 'peloUsuario',
  cliente: 'cliente',
}

//CONTAGEM DOS ITENS
export default async function contarItens(xmlString, usuario) {
  return new Promise((resolve, reject) => {
    parseString(xmlString, (err, result) => {
      if (err) {
        reject(err);
      } else {
        const objetosPostais = result.correioslog.objeto_postal;
        const cliente = result.correioslog.remetente;
        // 1. TOTAL DE ITENS
        validados.total = objetosPostais.length;
        // 2. VALIDADOS
        validados.validados = objetosPostais.filter(
          (objeto) => objeto.nacional[0].codigo_usuario_postal && objeto.nacional[0].codigo_usuario_postal[0] !== ''
        ).length;
        // 3. VALIDADOS PELO USUÁRIO
        validados.peloUsuario = objetosPostais.filter(
          (objeto) => objeto.nacional[0].codigo_usuario_postal && objeto.nacional[0].codigo_usuario_postal[0] === usuario
        ).length;
        // 4. CLIENTE  
        validados.cliente = cliente[0].nome_remetente;

        resolve({
          validados
        });
      }
    });
  });
}

//LOCALIZAR OBJETO NA MÍDIA
export async function localizarObjeto(xmlString, numeroEtiqueta) {
  return new Promise((resolve, reject) => {
    parseString(xmlString, (err, result) => {
      if (err) {
        reject(err);
      } else {
        const objetosPostais = result.correioslog.objeto_postal;

        const objetoEncontrado = objetosPostais.find(objeto => objeto.numero_etiqueta && objeto.numero_etiqueta[0] === numeroEtiqueta);

        if (objetoEncontrado) {

          const nome_destinatario = objetoEncontrado.destinatario[0].nome_destinatario[0];
          const logradouro_destinatario = objetoEncontrado.destinatario[0].logradouro_destinatario[0];
          const numero_end_destinatario = objetoEncontrado.destinatario[0].numero_end_destinatario[0];
          const complemento_destinatario = objetoEncontrado.destinatario[0].complemento_destinatario[0];
          const bairro_destinatario = objetoEncontrado.nacional[0].bairro_destinatario[0];
          const cidade_destinatario = objetoEncontrado.nacional[0].cidade_destinatario[0];
          const uf_destinatario = objetoEncontrado.nacional[0].uf_destinatario[0];
          const cep_destinatario = objetoEncontrado.nacional[0].cep_destinatario[0];

          const altura = objetoEncontrado.dimensao_objeto[0].dimensao_altura[0];
          const largura = objetoEncontrado.dimensao_objeto[0].dimensao_largura[0];
          const comprimento = objetoEncontrado.dimensao_objeto[0].dimensao_comprimento[0];
          const diametro = objetoEncontrado.dimensao_objeto[0].dimensao_diametro[0];

          const servico = objetoEncontrado.codigo_servico_postagem[0];
          const peso = objetoEncontrado.peso[0];

          resolve({
            nome_destinatario,
            logradouro_destinatario,
            numero_end_destinatario,
            complemento_destinatario,
            bairro_destinatario,
            cidade_destinatario,
            uf_destinatario,
            cep_destinatario,
            altura,
            largura,
            comprimento,
            diametro,
            servico,
            peso
          });


        } else {
          resolve('objeto não pertence à midia');
        }
      }
    });
  });
}

//ALTERAR REGISTRO
export async function alterarXML(xmlString, numeroEtiqueta, dados, usuario) {

  // LEITURA DO ARQUIVO
  const xmlData = fs.readFileSync(xmlString, 'utf-8');

  // XML para JSON
  xml2js.parseString(xmlData, (err, result) => {
    if (err) {
      console.error(err);
      return;
    }

    // LOCALIZAR OBJETO
    const objetoPostalAlvo = result.correioslog.objeto_postal.find(objeto => objeto.numero_etiqueta[0] === numeroEtiqueta);

    if (objetoPostalAlvo) {

      objetoPostalAlvo.peso[0] = dados.peso;
      objetoPostalAlvo.nacional[0].codigo_usuario_postal[0] = usuario;
      objetoPostalAlvo.nacional[0].cidade_destinatario[0] = dados.cidade_destinatario;
      objetoPostalAlvo.nacional[0].uf_destinatario[0] = dados.uf_destinatario;
      objetoPostalAlvo.nacional[0].cep_destinatario[0] = dados.cep_destinatario;

      objetoPostalAlvo.dimensao_objeto[0].tipo_objeto[0] = dados.tipo_objeto;
      objetoPostalAlvo.dimensao_objeto[0].dimensao_altura[0] = dados.dimensao_altura;
      objetoPostalAlvo.dimensao_objeto[0].dimensao_largura[0] = dados.dimensao_largura;
      objetoPostalAlvo.dimensao_objeto[0].dimensao_comprimento[0] = dados.dimensao_comprimento;
      objetoPostalAlvo.dimensao_objeto[0].dimensao_diametro[0] = dados.dimensao_diametro;

      // JSON de volta para XML
      const builder = new xml2js.Builder();
      const updatedXml = builder.buildObject(result);

      // ESCREVER o XML ATUALIZADO DE VOLTA NO ARQUIVO
      fs.writeFileSync(xmlString, updatedXml, 'utf-8');

      //console.log(`XML ATUALIZADO`);
    } else {
      //console.log(`OBJETO NÃO ENCONTRADO.`);
    }
  });

}

// FINALIZAR MÍDIA COM OBJETOS VALIDADOS
export async function finalizarMidia(xmlString, res) {
  try {
    // LEITURA DO ARQUIVO ORIGINAL
    const originalXmlData = fs.readFileSync(xmlString, 'utf-8');

    // Criar um nome de arquivo para a cópia de backup (por exemplo, adicionando um timestamp)
    //const backupFileName = `${xmlString}_backup_${Date.now()}.xml`;
    const backupFileName = `${xmlString.slice(0, -4)}.bck`;

    // CRIAR A CÓPIA DE BACKUP
    await fs.copyFileSync(xmlString, backupFileName);

    // XML para JSON
    xml2js.parseString(originalXmlData, (err, result) => {
      if (err) {
        console.error(err);
        return;
      }

      // Excluir elementos objeto_postal com codigo_usuario_postal vazio
      if (result.correioslog.objeto_postal) {
        result.correioslog.objeto_postal = result.correioslog.objeto_postal.filter(objeto => {
          return objeto.nacional[0].codigo_usuario_postal[0] !== '';
        });
      }

      // JSON de volta para XML
      const builder = new xml2js.Builder();
      const updatedXml = builder.buildObject(result);

      // ESCREVER o XML ATUALIZADO DE VOLTA NO ARQUIVO
      fs.writeFileSync(xmlString, updatedXml, 'utf-8');

      // Enviar o arquivo XML como resposta
      res.setHeader('Content-disposition', 'attachment; filename=arquivo_atualizado.xml');
      res.setHeader('Content-type', 'application/xml');
      res.send(updatedXml);
    });
  } catch (error) {
    console.error('Erro ao processar o arquivo:', error);
    res.status(500).send('Erro interno do servidor');
  }
}

// GERAR RELATÓRIO
export async function gerarRelatorio(xmlString) {
  return new Promise((resolve, reject) => {
    parseString(xmlString, (err, result) => {
      if (err) {
        reject(err);
      } else {
        const objetosPostais = result.correioslog.objeto_postal;

        const relatorio = {
          'SEM VALIDAÇÃO': [] // Inicia um grupo para objetos sem usuário postal
        };

        objetosPostais.forEach((objeto) => {
          const codigoUsuarioPostal = objeto.nacional[0].codigo_usuario_postal[0];

          // Verifica se o código do usuário postal existe e não é vazio
          if (codigoUsuarioPostal && codigoUsuarioPostal !== '') {
            if (!relatorio[codigoUsuarioPostal]) {
              relatorio[codigoUsuarioPostal] = [];
            }

            const itemRelatorio = {
              numero_etiqueta: objeto.numero_etiqueta[0],
              nome_destinatario: objeto.destinatario[0].nome_destinatario[0],
            };

            relatorio[codigoUsuarioPostal].push(itemRelatorio);
          } else {
            // Se não existir código de usuário postal, adiciona ao grupo 'sem_usuario'
            const itemRelatorioSemUsuario = {
              numero_etiqueta: objeto.numero_etiqueta[0],
              nome_destinatario: objeto.destinatario[0].nome_destinatario[0],
            };

            relatorio['SEM VALIDAÇÃO'].push(itemRelatorioSemUsuario);
          }
        });

        resolve(relatorio);
      }
    });
  });
}
