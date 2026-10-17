# Meu treino

App pessoal de treino, água e progresso. Site estático (GitHub Pages), funciona offline e pode ser instalado como app.

## Arquivos

| Arquivo | O que tem |
|---|---|
| `index.html` | Estrutura da página e a ordem dos scripts |
| `js/config.js` | Endereço e chave pública do servidor de notificações |
| `css/estilo.css` | Todo o visual (cores, modo escuro, componentes) |
| `js/dados.js` | Estado, salvar/carregar, fotos (IndexedDB), backup, desfazer |
| `js/util.js` | Datas, formatação, ícones, tema, avisos no topo, modal, edição |
| `js/hoje.js` | Tela Hoje: anel, metas, semana, calendário, humor, ajuda |
| `js/treino.js` | Tela Treino: séries, sugestão de carga, histórico, modo foco, descanso, músculos |
| `js/progresso.js` | Medidas, gráficos, fotos, análise |
| `js/mais.js` | Água, suplementos, consultas e a tela Mais |
| `js/pdf.js` | Compartilhar dados em PDF |
| `js/avisos.js` | Notificações |
| `js/app.js` | Navegação, cliques e inicialização (carrega por último) |
| `sw.js` | Modo offline e notificações em segundo plano |
| `manifest.json` | Nome, ícones e cores do app instalado |

## Regras

- A ordem dos `<script>` no `index.html` importa: `app.js` sempre por último.
- Criou ou renomeou um arquivo? Atualize a lista `APP_FILES` no `sw.js` e troque a `VERSION`.
- Mudou só o conteúdo de um arquivo? Não precisa mexer no `sw.js`.

## Notificações pelo servidor

O servidor fica na pasta `push-server` (Cloudflare Worker), separada deste repositório. Depois de publicá-lo, preencha `js/config.js` com o endereço e a **chave pública**. A chave privada nunca entra aqui.
