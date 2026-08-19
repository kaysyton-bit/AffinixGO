 AffinisGo  Front-end

Protótipo funcional em HTML/CSS/JS puro (sem build step) para a plataforma
que conecta clientes a prestadores de serviço por proximidade.

 Sobre a construção deste projeto:


O front-end aqui tive um auxílio construí a base com apoio da I.A Claude
(principalmente nos modelos e dados inventados para o js)
Em cima de um protótipo anterior que eu mesmo
desenhei. Mas não foi só trabalho da IA revisei, testei e coloquei
a mão na massa de acordo com a necessidade, o alinhamento do container principal, a
posição do controle de ordenação, entre outros detalhes de interface e funcionalidade 
o intuito é focar em trabalhar na integração entre frontend, backend e banco de dados,
também na segurança e funcionalidade.

O back-end, por outro lado, é 100% feito e suado por mim, sem IA 
é onde estou colocando em prática (e apanhando um pouco) tudo que venho
aprendendo em Python e banco de dados.

 Como abrir:

Não precisa de instalação. basta abrir index.html no navegador, ou servir
a pasta com qualquer servidor estático

```bash
python -m http.server 8000
# depois acesse http://localhost:8000
```

 Estrutura :

```
affinisgo-frontend/
├── index.html          -> tela principal (Prestadores Perto)
├── pages/
│   ├── login.html       -> entrar / cadastrar-se
│   ├── historico.html   -> histórico de serviços
│   ├── mensagens.html   -> caixa de mensagens
│   └── ajuda.html       -> ajuda & suporte 
├── css/
│   └── styles.css       -> design tokens + todos os estilos
├── js/
│   └── app.js            -> dados de exemplo, renderização, filtros, ordenação
└── assets/
    └── avatars/          -> pasta pronta para as fotos reais dos prestadores
```

 Sistema de design:

Paleta: fundo escuro sólido (#0b0b0f) com gradiente de
assinatura violeta rosa usado com moderação (espero) em CTAS,
logo e destaques cartões usam um brush diagonal suave do canto
superior esquerdo para o inferior direito (grad brush), que escurece
ainda mais e ganha um brilho radial sutil no :hover.
Tipografia: fraunces (serifada, itálica) 
AffinisGo : Sora nos títulos: Inter no corpo de texto cinza;
JetBrains Mono nas etiquetas/categorias/badges de distância uma
Inspiração: a densidade de informação e a confiança visual de listas
de corridas da Uber e o cruzamento (tons escuros sólidos,
gradqções vívidos com tipografia em primeiro plano) do site pessoal do
Zeno Rocha (criador do Dracula Theme) daí a paleta violeta/ciano e o
uso de uma fonte mono.
Animações: entrada em cascata dos cartões ao carregar a página, leve
elevação, brilho no hover dos cartões, micro-bounce nos ícones da barra
lateral, chips de busca com "pop" ao serem criados. Tudo respeita
prefers-reduced-motion.

 Ligando ao backend em Python # Notas para mim

Os prestadores exibidos hoje vêm de um array PROVIDERS no topo de
js/app.js, no mesmo formato que uma API deveria devolver. Quando o
backend existir provavelmente Flask, trocarei esse array por um fetch:

```js
async function loadProviders() {
  const res = await fetch('/api/prestadores?lat=...&lng=...&raio=5');
  const data = await res.json();
  renderProviders(data);
}
```

A função renderProviders(lista) já existe #notas para mim

 Próximos passos 

 Extrair a barra lateral para um partial reutilizável quando o backend
  Flask entrar hoje ela está duplicada
  em cada página HTML por não haver templating no front puro.
 Conectar a busca por tags a filtros reais de categoria/raio no backend.
 Adicionar estado de loading/skeleton nos cartões enquanto a API responde.
