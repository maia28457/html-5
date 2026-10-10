# Mini Projeto: Consumo de APIs e Manipulação do DOM

Projeto com `index.html` e `app.js`, aplicando objetos, arrays, assincronismo (Promises, `async/await`), Fetch API e os quatro estados de tela (Carregando, Erro, Vazio e Sucesso).

## Como executar

Abra o `index.html` no navegador (ou use a extensão Live Server do VS Code). É necessário ter conexão com a internet para as APIs.

## O que foi implementado

### Parte 1 – Manipulação e validação de dados
- Validação dos pedidos (cliente não vazio e valor numérico maior que 0) com `filter`.
- Filtro dos pedidos com status `"pago"`.
- Total faturado com `reduce`.
- Textos no formato `"Bia — R$ 120.00"` com `toFixed(2)`.

### Parte 2 – Buscador de CEP (ViaCEP)
- Formulário com `input` e botão, usando `e.preventDefault()`.
- Validação com `.trim()` e expressão regular (8 dígitos).
- `fetch` com `async/await` e `AbortSignal.timeout(5000)`.
- Estados: **Carregando** ("Buscando..." + botão desabilitado), **Erro** (rede, timeout e `!response.ok`), **Vazio** ("CEP não encontrado" quando a API retorna `erro`) e **Sucesso** (`replaceChildren()`, `createElement` e `textContent` para Rua, Bairro, Cidade e UF).
- Bônus: histórico de CEPs pesquisados, guardado em um array de objetos e listado na tela.

### Parte 3 – Mini Pokédex (PokéAPI)
- Nome validado (não vazio) e convertido para minúsculo.
- Exibe nome, imagem (`sprites.front_default`) e tipos.
- Quatro estados, com o 404 tratado como "Pokémon não encontrado".

> Segurança: nenhum dado externo é inserido com `innerHTML`; usa-se sempre `createElement` e `textContent`, evitando XSS.

## Parte 4 – Reflexão

**Por que `Promise.all` pode ser mais rápido que vários `await` seguidos?**

Com vários `await` seguidos, cada requisição só começa depois que a anterior terminou. O tempo total é a **soma** dos tempos de cada uma (ex.: 3 requisições de 1s levam ~3s).

Com `Promise.all`, todas as requisições são disparadas **ao mesmo tempo** (em paralelo) e o código espera todas terminarem juntas. O tempo total é aproximadamente o da requisição **mais lenta** (~1s no mesmo exemplo), aproveitando melhor o tempo de rede.

```js
// Sequencial: ~3s
const a = await fetch(urlA);
const b = await fetch(urlB);
const c = await fetch(urlC);

// Paralelo: ~1s
const [a2, b2, c2] = await Promise.all([fetch(urlA), fetch(urlB), fetch(urlC)]);
```

Obs.: só vale usar `Promise.all` quando as requisições são **independentes**. Se uma depende do resultado da outra, é preciso esperar em sequência.
