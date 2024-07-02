import fs from 'fs';
import { parse } from 'csv-parse';

const csvFilePath = './csv/usuarios.csv';;

function buscarUsuario(matricula) {
  return new Promise((resolve, reject) => {
    const results = [];

    fs.createReadStream(csvFilePath)
      .pipe(parse({ delimiter: ';' }))
      .on('data', (data) => {
        results.push(data);
      })
      .on('end', () => {
        const encontrado = results.find((item) => item[0] === matricula);

        if (encontrado && encontrado[3] === '1') {
          const menus = gerarHTML1();
          resolve(menus);
        } else if (encontrado && encontrado[3] === '2') {
          const menus = gerarHTML2();
          resolve(menus);
        } else if (encontrado && encontrado[3] === '3') {
          const menus = gerarHTML3();
          resolve(menus);
        } else if (encontrado && encontrado[3] === '4') {
          const menus = gerarHTML4();
          resolve(menus);
        } else {
          const menus = gerarHTMLN();
          resolve(menus);
        }
      });
  });
}

//PROGRAMADOR
function gerarHTML1() {
  const html = `
  
      <ul class="sidebar-nav">

      <li class="sidebar-header">
        Resultados Comerciais
      </li>

      <li id="painelGerencial" class="sidebar-item">
        <a class="sidebar-link" href="painel.html">
          <img src="img/icons/menu/painel.png" alt="">
          <i class="align-middle"></i> <span class="align-middle menu">Resultado Gerencial - 2024</span>
        </a>
      </li>

      <li class="sidebar-header">
        Postagens e Expedição
      </li>

      <li id="planos" class="sidebar-item">
        <a class="sidebar-link" href="planosexpedicao.html">
          <img src="img/icons/menu/planosexpedicao.png" alt="">
          <i class="align-middle"></i> <span class="align-middle menu">Encomendas Postadas</span>
        </a>
      </li>

      <li id="planoscep" class="sidebar-item">
        <a class="sidebar-link" href="planoscep.html">
          <img src="img/icons/menu/planoscep.png" alt="">
          <i class="align-middle"></i> <span class="align-middle menu">Planos por CEP</span>
        </a>
      </li>

      <li class="sidebar-header">
        Mídia de Postagens - SARA
      </li>

      <li id="novamidiacsra" class="sidebar-item">
        <a class="sidebar-link" href="novamidiacsra.html">
          <img src="img/icons/menu/novamidia.png" alt="">
          <i class="align-middle"></i> <span class="align-middle menu">Criar Mídia CSRA</span>
        </a>
      </li>

      <li id="conferenciamidia" class="sidebar-item">
        <a class="sidebar-link" href="conferenciamidia.html">
          <img src="img/icons/menu/conferenciamidia.png" alt="">
          <i class="align-middle"></i> <span class="align-middle menu">Conferência e Validação</span>
        </a>
      </li>

  `;

  return html;
}

//OPERADORES CEM RECIFE
function gerarHTML2() {
  const html = `
  
      <ul class="sidebar-nav">

      <li class="sidebar-header">
        Postagens e Expedição
      </li>

      <li id="planos" class="sidebar-item">
        <a class="sidebar-link" href="planosexpedicao.html">
          <img src="img/icons/menu/planosexpedicao.png" alt="">
          <i class="align-middle"></i> <span class="align-middle menu">Encomendas Postadas</span>
        </a>
      </li>

      <li id="planoscep" class="sidebar-item">
        <a class="sidebar-link" href="planoscep.html">
          <img src="img/icons/menu/planoscep.png" alt="">
          <i class="align-middle"></i> <span class="align-middle menu">Planos por CEP</span>
        </a>
      </li>

      <li class="sidebar-header">
        Mídia de Postagens - SARA
      </li>

      <li id="novamidiacsra" class="sidebar-item">
        <a class="sidebar-link" href="novamidiacsra.html">
          <img src="img/icons/menu/novamidia.png" alt="">
          <i class="align-middle"></i> <span class="align-middle menu">Criar Mídia CSRA</span>
        </a>
      </li>

      <li id="conferenciamidia" class="sidebar-item">
        <a class="sidebar-link" href="conferenciamidia.html">
          <img src="img/icons/menu/conferenciamidia.png" alt="">
          <i class="align-middle"></i> <span class="align-middle menu">Conferência e Validação</span>
        </a>
      </li>

  `;

  return html;
}

//OPERADORES OUTRAS CEM
function gerarHTML3() {
  const html = `
  
      <ul class="sidebar-nav">

      <li class="sidebar-header">
        Postagens e Expedição
      </li>

      <li id="planos" class="sidebar-item">
        <a class="sidebar-link" href="planosexpedicao.html">
          <img src="img/icons/menu/planosexpedicao.png" alt="">
          <i class="align-middle"></i> <span class="align-middle menu">Encomendas Postadas</span>
        </a>
      </li>

      <li id="planoscep" class="sidebar-item">
        <a class="sidebar-link" href="planoscep.html">
          <img src="img/icons/menu/planoscep.png" alt="">
          <i class="align-middle"></i> <span class="align-middle menu">Planos por CEP</span>
        </a>
      </li>

  `;

  return html;
}

//APENAS RESULTADOS COMERCIAIS
function gerarHTML4() {
  const html = `
  
  <ul class="sidebar-nav">

  <li class="sidebar-header">
    Resultados Comerciais
  </li>

  <li id="painelGerencial" class="sidebar-item">
    <a class="sidebar-link" href="painel.html">
      <img src="img/icons/menu/painel.png" alt="">
      <i class="align-middle"></i> <span class="align-middle menu">Resultado Gerencial - 2024</span>
    </a>
  </li>

  
`;

return html;
}

//NÃO VINCULADOS
function gerarHTMLN() {
  const html = `
  
      <ul class="sidebar-nav">

      <li class="sidebar-header">
        Você não possui um perfil de usuário para exibir os menus.
        <p></p>
        Entre em contato com o suporte, através do e-mail alexluis@correios.com.br
      </li>

      
  `;

  return html;
}

// Chamada da função principal
export default buscarUsuario;