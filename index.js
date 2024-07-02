//DEPENDENCIAS >>>>>>>
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { fileURLToPath, URL } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import { promises as fsPromises } from 'fs';
import multer from 'multer';
import path from 'path';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3000;
const host = '0.0.0.0';
import Rastrear from './srointranet.js';
import verificarPlanos from './planos.js';
import verificarPlanosCep from './planoscep.js';
import acessarCAS from './casusers.js';
import buscarCEP from './buscacep.js';
import contarItens, { localizarObjeto, alterarXML, finalizarMidia, gerarRelatorio } from './xml.js';
import buscaCubo from './cubometro.js';
import buscarUsuario from './users.js';
import calcularPainelGerencial from './painel-2024.js';
import calcularPainel from './painelF-2024.js';
import adicionarDadosAoXML from './novamidiacsra.js';

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(dirname(__dirname, '../concoord')));

// REST API >>>>>>>

// ROTAS GET
app.get('/conferenciamidia', async (req, res) => {
    try {

        const endereco = '\\\\MPE32114656\\CEM_Recife\\Midias Abertas';

        // LENDO OS ARQUIVOS NA PASTA DE MÍDIAS
        fs.readdir(endereco, (err, files) => {
            if (err) {
                // TRATAMENTO DE ERROS
                console.error("Erro ao ler a pasta:", err);
                res.status(500).json({ mensagem: 'Erro durante o processamento.' });
            } else {
                // RESPOSTA
                const arquivosXml = files.filter(file => file.endsWith('.xml'));
                res.json({ arquivos: arquivosXml });
            }
        });

    } catch (erro) {
        // TRATAMENTO DE ERRO
        console.error("Erro durante o processamento:", erro);
        res.status(500).json({ mensagem: 'Erro durante o processamento.' });
    }
});


// ROTAS POST
app.post('/Login', async (req, res) => {
    try {
        const matricula = req.body.matricula;
        const senha = req.body.senha;

        const resultadoUsuario = await acessarCAS(matricula, senha)

        res.json(resultadoUsuario);

    } catch (erro) {

        res.status(500).json({ mensagem: 'Erro durante o processamento.' });
    }
});

app.post('/Rastro', async (req, res) => {
    try {
        const objeto = req.body.conteudo;
        const mcu = req.body.mcu;
        const nome = req.body.nome;

        let now = new Date();
        let data = `${now.toLocaleDateString()}`;
        let horario = `${now.toLocaleTimeString()}`;
        let logEntry = '';

        //Console.log(`${data}\t${horario}\t${nome}\t${conteudo}\tCONSULTA OBJETO POSTADO\n`);
        logEntry = `${data}|${horario}|${mcu}|${nome.slice(0,8)}|${objeto}|CONSULTA PLANO\n`;

        fs.appendFileSync('log_objetos.txt', logEntry);

        const dadospostagem = await Rastrear(objeto);
        const planos = await verificarPlanos(mcu, dadospostagem);


        res.json(planos);

    } catch (erro) {

        res.status(500).json({ mensagem: 'Erro durante o processamento.' });
    }
});

app.post('/Planos', async (req, res) => {
    try {
        const cep = req.body.conteudo;
        const planos = await verificarPlanosCep(cep);

        res.json(planos);

    } catch (erro) {

        res.status(500).json({ mensagem: 'Erro durante o processamento.' });
    }
});

app.post('/BuscaCEP', async (req, res) => {
    try {
        const cep = req.body.conteudo;
        const resultadoCEP = await buscarCEP(cep);

        res.json(resultadoCEP);

    } catch (erro) {

        res.status(500).json({ mensagem: 'Erro durante o processamento.' });
    }
});

app.post('/ContarXML', async (req, res) => {

    var arquivoXML = req.body.nomeArquivo;
    var usuario = req.body.matricula;
    var xml = `\\\\MPE32114656\\CEM_Recife\\Midias Abertas\\${arquivoXML}`; // ENDEREÇOS DA MÍDIA

    try {
        const xmlString = await fsPromises.readFile(xml, { encoding: 'utf-8' });
        const resultados = await contarItens(xmlString, usuario);

        res.json(resultados);

    } catch (error) {
        console.error('Erro ao processar o XML:', error);
    }
});

app.post('/LocalizarObjXML', async (req, res) => {

    var arquivoXML = req.body.nomeArquivo;
    var objeto = req.body.objeto;
    var xml = `\\\\MPE32114656\\CEM_Recife\\Midias Abertas\\${arquivoXML}`; // ENDEREÇOS DA MÍDIA

    try {
        const xmlString = await fsPromises.readFile(xml, { encoding: 'utf-8' });
        const resultados = await localizarObjeto(xmlString, objeto);

        res.json(resultados);

    } catch (error) {
        console.error('Erro ao processar o XML:', error);
    }
});

app.post('/AlterarObjXML', async (req, res) => {

    var arquivoXML = req.body.nomeArquivo;
    var objeto = req.body.objeto;
    var dados = req.body;
    var matricula = req.body.matricula;

    var xml = `\\\\MPE32114656\\CEM_Recife\\Midias Abertas\\${arquivoXML}`; // ENDEREÇOS DA MÍDIA

    try {
        const resultados = await alterarXML(xml, objeto, dados, matricula);

        res.json(resultados);

    } catch (error) {
        console.error('Erro ao processar o XML:', error);
    }


});

app.post('/FinalizarXML', async (req, res) => {

    var arquivoXML = req.body.nomeArquivo;

    var xml = `\\\\MPE32114656\\CEM_Recife\\Midias Abertas\\${arquivoXML}`; // ENDEREÇOS DA MÍDIA

    try {
        await finalizarMidia(xml, res);
        res.download(xml);

    } catch (error) {
        console.error('Erro ao processar o XML:', error);
    }


});

app.post('/RelatorioXML', async (req, res) => {

    var arquivoXML = req.body.nomeArquivo;
    var xml = `\\\\MPE32114656\\CEM_Recife\\Midias Abertas\\${arquivoXML}`; // ENDEREÇOS DA MÍDIA

    try {
        const xmlString = await fsPromises.readFile(xml, { encoding: 'utf-8' });
        const resultados = await gerarRelatorio(xmlString);

        res.json(resultados);

    } catch (error) {
        console.error('Erro ao processar o XML:', error);
    }
});

app.post('/BuscaCubo', async (req, res) => {
    try {

        const objeto = req.body.objeto;
        const cep = req.body.cep;
        const resposta = await buscaCubo(objeto, cep);
        res.send(resposta);

    } catch (erro) {
        // TRATAMENTO DE ERRO
        console.error("Erro durante o processamento:", erro);
        res.status(500).json({ mensagem: 'Erro durante o processamento.' });
    }
});

app.post('/Menus', async (req, res) => {
    try {
        const matricula = req.body.conteudo;
        const menus = await buscarUsuario(matricula);

        res.send(menus);

    } catch (erro) {

        res.status(500).json({ mensagem: 'Erro durante o processamento.' });
    }
});

app.post('/PainelGerencial', async (req, res) => {
    try {

        const periodo = req.body.periodoEscolhido;
        const segmento = req.body.segmentoEscolhido;
        const gerencia = req.body.gerenciaEscolhida;
        const linha = req.body.linhaEscolhida;
        const fvendas = req.body.forcaEscolhida;
        const resposta = await calcularPainelGerencial(periodo, segmento, gerencia, linha, fvendas);
        res.send(resposta);

    } catch (erro) {
        res.status(500).json({ mensagem: 'Erro durante o processamento.' });
    }
});

app.post('/PainelFVendas', async (req, res) => {
    try {

        const periodo = req.body.periodoEscolhido;
        const segmento = req.body.segmentoEscolhido;
        const fvendas = req.body.forcaEscolhida;
        const resposta = await calcularPainel(periodo, segmento, fvendas);
        res.send(resposta);

    } catch (erro) {
        res.status(500).json({ mensagem: 'Erro durante o processamento.' });
    }
});

// UPLOAD DE ARQUIVO DE MÍDIA DA REQUISIÇÃO POST /CriarMidia
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, 'VAS' + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

app.post('/CriarMidia', upload.single('arquivo'), async function (req, res) {

    try {
        const identificador = await adicionarDadosAoXML();
        res.send(identificador);
    } catch (erro) {
        res.status(500).json({ mensagem: 'Erro durante a criação da mídia.' });
    }
});

// LISTEN REST
app.listen(port, host, () => {
    console.log(`Servidor concoord on-line.`);
    console.log(`Ouvindo requisições na porta ${port}, host 10.128.34.32`);
});
