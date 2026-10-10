"use strict";

/* =========================================================
   PARTE 1 – Manipulação e Validação de Dados
   ========================================================= */

const pedidos = [
  { id: 1, cliente: "Bia", valor: 120, status: "pago" },
  { id: 2, cliente: "Carlos", valor: 80.5, status: "pendente" },
  { id: 3, cliente: "", valor: 50, status: "pago" },
  { id: 4, cliente: "Dani", valor: 0, status: "pago" },
  { id: 5, cliente: "Edu", valor: "abc", status: "pago" },
  { id: 6, cliente: "Fábio", valor: 200, status: "pago" },
  { id: 7, cliente: "Gabi", valor: 45.9, status: "cancelado" },
];

// Cliente não vazio e valor numérico maior que 0
function pedidoValido(pedido) {
  return (
    typeof pedido.cliente === "string" &&
    pedido.cliente.trim() !== "" &&
    typeof pedido.valor === "number" &&
    Number.isFinite(pedido.valor) &&
    pedido.valor > 0
  );
}

const pedidosValidos = pedidos.filter(pedidoValido);
const pedidosPagos = pedidosValidos.filter((p) => p.status === "pago");
const totalFaturado = pedidosPagos.reduce((soma, p) => soma + p.valor, 0);
const textosPedidos = pedidosPagos.map((p) => `${p.cliente} — R$ ${p.valor.toFixed(2)}`);

console.log("Pedidos válidos:", pedidosValidos);
console.log("Pedidos pagos:", pedidosPagos);
console.log("Total faturado:", `R$ ${totalFaturado.toFixed(2)}`);
console.log("Textos:", textosPedidos);

function renderizarPedidos() {
  const lista = document.getElementById("lista-pedidos");
  const total = document.getElementById("total-faturado");

  lista.replaceChildren();
  textosPedidos.forEach((texto) => {
    const li = document.createElement("li");
    li.textContent = texto;
    lista.appendChild(li);
  });
  total.textContent = `Total faturado: R$ ${totalFaturado.toFixed(2)}`;
}

renderizarPedidos();

/* =========================================================
   Utilitário de status (usado nas Partes 2 e 3)
   ========================================================= */

function definirStatus(elemento, mensagem, tipo = "") {
  elemento.textContent = mensagem;
  elemento.className = tipo ? `status ${tipo}` : "status";
}

/* =========================================================
   PARTE 2 – Buscador de CEP
   ========================================================= */

const formCep = document.getElementById("form-cep");
const inputCep = document.getElementById("input-cep");
const btnCep = document.getElementById("btn-cep");
const statusCep = document.getElementById("status-cep");
const resultadoCep = document.getElementById("resultado-cep");
const historicoCep = document.getElementById("historico-cep");

// Bônus: histórico de CEPs pesquisados (array de objetos)
const historico = [];

function validarCep(valor) {
  const cep = valor.trim().replace(/\D/g, ""); // mantém só dígitos (aceita "65000-000")
  return /^\d{8}$/.test(cep) ? cep : null;
}

function adicionarDt_Dd(dl, rotulo, valor) {
  const dt = document.createElement("dt");
  dt.textContent = rotulo;
  const dd = document.createElement("dd");
  dd.textContent = valor || "—";
  dl.append(dt, dd);
}

function renderizarHistorico() {
  historicoCep.replaceChildren();
  if (historico.length === 0) return;

  historico.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = `${item.cep} — ${item.cidade}/${item.uf}`;
    historicoCep.appendChild(li);
  });
}

async function buscarCep(cep) {
  // Estado: CARREGANDO
  definirStatus(statusCep, "Buscando...", "carregando");
  btnCep.disabled = true;
  resultadoCep.replaceChildren();

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
      signal: AbortSignal.timeout(5000), // desafio extra: timeout de 5s
    });

    // fetch não rejeita em erros HTTP: precisa checar response.ok
    if (!response.ok) {
      throw new Error(`Erro HTTP ${response.status}`);
    }

    const dados = await response.json();

    // Estado: VAZIO / NÃO ENCONTRADO
    if (dados.erro) {
      definirStatus(statusCep, "CEP não encontrado", "vazio");
      return;
    }

    // Estado: SUCESSO
    resultadoCep.replaceChildren();
    adicionarDt_Dd(resultadoCep, "Rua", dados.logradouro);
    adicionarDt_Dd(resultadoCep, "Bairro", dados.bairro);
    adicionarDt_Dd(resultadoCep, "Cidade", dados.localidade);
    adicionarDt_Dd(resultadoCep, "UF", dados.uf);
    definirStatus(statusCep, "");

    historico.push({ cep, cidade: dados.localidade, uf: dados.uf });
    renderizarHistorico();
  } catch (erro) {
    // Estado: ERRO (rede, timeout ou HTTP)
    console.error(erro);
    const mensagem =
      erro.name === "TimeoutError"
        ? "A busca demorou demais. Tente novamente."
        : "Falha na conexão. Verifique sua internet e tente novamente.";
    definirStatus(statusCep, mensagem, "erro");
  } finally {
    btnCep.disabled = false;
  }
}

formCep.addEventListener("submit", (e) => {
  e.preventDefault();

  const cep = validarCep(inputCep.value);
  if (!cep) {
    resultadoCep.replaceChildren();
    definirStatus(statusCep, "CEP inválido: digite exatamente 8 números.", "erro");
    return;
  }
  buscarCep(cep);
});

/* =========================================================
   PARTE 3 – Mini Pokédex
   ========================================================= */

const formPokemon = document.getElementById("form-pokemon");
const inputPokemon = document.getElementById("input-pokemon");
const btnPokemon = document.getElementById("btn-pokemon");
const statusPokemon = document.getElementById("status-pokemon");
const resultadoPokemon = document.getElementById("resultado-pokemon");

function renderizarPokemon(pokemon) {
  resultadoPokemon.replaceChildren();

  const titulo = document.createElement("h3");
  titulo.textContent = pokemon.name;
  titulo.style.textTransform = "capitalize";

  const imagem = document.createElement("img");
  imagem.className = "sprite";
  imagem.src = pokemon.sprites.front_default || "";
  imagem.alt = `Imagem de ${pokemon.name}`;

  const tipos = document.createElement("p");
  tipos.append("Tipos: ");
  pokemon.types.forEach((t) => {
    const span = document.createElement("span");
    span.className = "tipo";
    span.textContent = t.type.name;
    tipos.appendChild(span);
  });

  resultadoPokemon.append(titulo, imagem, tipos);
}

async function buscarPokemon(nome) {
  // Estado: CARREGANDO
  definirStatus(statusPokemon, "Buscando...", "carregando");
  btnPokemon.disabled = true;
  resultadoPokemon.replaceChildren();

  try {
    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(nome)}`,
      { signal: AbortSignal.timeout(5000) }
    );

    // Estado: VAZIO (404)
    if (response.status === 404) {
      definirStatus(statusPokemon, "Pokémon não encontrado", "vazio");
      return;
    }

    if (!response.ok) {
      throw new Error(`Erro HTTP ${response.status}`);
    }

    const pokemon = await response.json();

    // Estado: SUCESSO
    renderizarPokemon(pokemon);
    definirStatus(statusPokemon, "");
  } catch (erro) {
    // Estado: ERRO
    console.error(erro);
    const mensagem =
      erro.name === "TimeoutError"
        ? "A busca demorou demais. Tente novamente."
        : "Falha na conexão. Verifique sua internet e tente novamente.";
    definirStatus(statusPokemon, mensagem, "erro");
  } finally {
    btnPokemon.disabled = false;
  }
}

formPokemon.addEventListener("submit", (e) => {
  e.preventDefault();

  const nome = inputPokemon.value.trim().toLowerCase();
  if (nome === "") {
    resultadoPokemon.replaceChildren();
    definirStatus(statusPokemon, "Digite o nome de um Pokémon.", "erro");
    return;
  }
  buscarPokemon(nome);
});
