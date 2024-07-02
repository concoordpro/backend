import fs from 'fs';
import xml2js from 'xml2js';
import XLSX from 'xlsx';



let i = 0;

// LER XLS E RETORNAR OS DADOS
function lerArquivoXLS(nomeArquivo) {
    const workbook = XLSX.readFile(nomeArquivo);
    const sheetName = workbook.SheetNames[0]; // CONSIDERA APENAS A PRIMEIRA PLANILHA
    const worksheet = workbook.Sheets[sheetName];
    const dados = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    return dados.slice(1); // IGNORA O CABEÇALHO (PRIMEIRA LINHA)

}

const alteracoes = [];

function adicionarAlteracao(i, numeroEtiqueta, destinatario, logradouro, bairro, usuario) {
    alteracoes.push({ i, numeroEtiqueta, destinatario, logradouro, bairro, usuario });
}

export async function alterarXML(numeroEtiqueta, destinatario, logradouro, bairro, usuario) {
    adicionarAlteracao(i, numeroEtiqueta, destinatario, logradouro, bairro, usuario);
}

async function atualizarXML(xmlPath, novoXmlPath) {
    try {
        await aplicarAlteracoesEAtualizarXML(xmlPath, novoXmlPath);
    } catch (error) {
        console.error('Erro ao atualizar XML:', error);
    }
}

async function aplicarAlteracoesEAtualizarXML(xmlString, novoXmlPath) {
    try {
        const xmlData = fs.readFileSync(xmlString, 'utf-8');
        xml2js.parseString(xmlData, (err, result) => {
            if (err) {
                console.error(err);
                return;
            }

            // APLICAR ALTERAÇÕES AO XML
            for (const alteracao of alteracoes) {
                const { i, numeroEtiqueta, destinatario, logradouro, bairro, usuario } = alteracao;
                if (result.correioslog.objeto_postal[i]) {
                    result.correioslog.objeto_postal[i].numero_etiqueta[0] = numeroEtiqueta;
                    result.correioslog.objeto_postal[i].nacional[0].codigo_usuario_postal[0] = usuario;
                    result.correioslog.objeto_postal[i].destinatario[0].nome_destinatario[0] = destinatario;
                    result.correioslog.objeto_postal[i].destinatario[0].logradouro_destinatario[0] = logradouro;
                    result.correioslog.objeto_postal[i].nacional[0].bairro_destinatario[0] = bairro;
                }
            }

            // JSON PARA XML
            const builder = new xml2js.Builder();
            const updatedXml = builder.buildObject(result);

            // ESCREVER NOVO XML
            fs.writeFileSync(novoXmlPath, updatedXml, 'utf-8');

        });
    } catch (error) {
        console.error('Erro ao processar o arquivo:', error);
    }
}


async function adicionarDadosAoXML() {
    try {

        i = 0;
        alteracoes.length = 0;

        const xmlPath = './uploads/MIDIA.xml';
        const xlsPath = './uploads/VAS.xls';
        const identificador = Date.now();
        const novoXML = `\\\\MPE32114656\\CEM_Recife\\Midias Abertas\\CSRA_MIDIA_${identificador}.xml`;
        const dadosXLS = lerArquivoXLS(xlsPath);
        for (const linha of dadosXLS) {
            const numeroEtiqueta = linha[0];
            const destinatario = linha[1] + ' ' + linha[2];
            const logradouro = linha[3].substring(0, 25);
            const bairro = linha[4];
            await alterarXML(numeroEtiqueta, destinatario, logradouro, bairro, '');
            i = i + 1;
        }
        await atualizarXML(xmlPath, novoXML);
        await finalizarMidia(novoXML);
        return `Mídia de postagem gerada com sucesso! <br><br> [ ${i} objetos ]  CSRA_MIDIA_${identificador}.xml <br> `;;
        
    } catch (error) {
        console.error('Erro ao adicionar dados ao XML:', error);
    }
}

// FINALIZAR MÍDIA COM OBJETOS VALIDADOS
async function finalizarMidia(xmlString, res) {
    try {
        // LEITURA DO ARQUIVO ORIGINAL
        const originalXmlData = fs.readFileSync(xmlString, 'utf-8');

        // XML PARA JSON
        xml2js.parseString(originalXmlData, (err, result) => {
            if (err) {
                console.error(err);
                return;
            }

            // EXCLUIR ELEMENTOS NÃO ALTERADOS
            if (result.correioslog.objeto_postal) {
                result.correioslog.objeto_postal = result.correioslog.objeto_postal.filter(objeto => {
                    return objeto.nacional[0].codigo_usuario_postal[0] !== 'CSRA';
                });
            }

            // JSON de volta para XML
            const builder = new xml2js.Builder();
            const updatedXml = builder.buildObject(result);

            // ESCREVER o XML ATUALIZADO DE VOLTA NO ARQUIVO
            fs.writeFileSync(xmlString, updatedXml, 'utf-8');

        });
    } catch (error) {
        console.error('Erro ao processar o arquivo:', error);
        res.status(500).send('Erro interno do servidor');
    }
}

export default adicionarDadosAoXML;

