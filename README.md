# RecarregaAi!

Versao atual: **2.1.6**.

Extensao para Google Chrome que limpa o cache do site aberto, tenta limpar o cache
dos recursos carregados pela pagina e recarrega a aba atual. Tambem permite ativar
um timer para repetir esse processo automaticamente.

## Estrutura

```text
RecarregaAI-/
|-- manifest.json
|-- options.html
|-- privacy.html
|-- popup.html
|-- uninstall.html
|-- welcome.html
|-- CSS/
|   |-- options.css
|   |-- privacy.css
|   |-- popup.css
|   |-- shared-floating-tools.css
|   |-- shared-footer.css
|   |-- shared-language-dialog.css
|   |-- uninstall.css
|   `-- welcome.css
|-- JS/
|   |-- background.js
|   |-- content.js
|   |-- page-media-guard.js
|   |-- options.js
|   |-- popup.js
|   |-- privacy.js
|   |-- uninstall.js
|   |-- welcome.js
|   `-- modules/
|       |-- cache.js
|       |-- config.js
|       |-- history.js
|       |-- shared.js
|       |-- storage.js
|       |-- tabs.js
|       `-- theme.js
`-- assets/
    |-- icons/
    |   |-- icon16.png
    |   |-- icon32.png
    |   |-- icon48.png
    |   |-- icon128.png
    |   `-- recarregaai.svg
    `-- images/
```

## Como testar no Chrome

1. Abra `chrome://extensions/`.
2. Ative o modo de desenvolvedor.
3. Clique em `Carregar sem compactacao`.
4. Selecione a pasta raiz deste projeto.

Ao instalar a extensao pela primeira vez, o Chrome abre automaticamente
`welcome.html` com as instrucoes iniciais.

A pagina de boas-vindas tem estrutura de tela inicial do produto: hero com CTA,
faixa de beneficios, cards de recursos, casos de uso em acordeao, FAQ e chamada
final para comecar.

Ao desinstalar, o Chrome abre a pagina de feedback configurada no background.
Como a extensao ja foi removida nesse momento, a URL precisa ser `http` ou
`https`.

## Funcionamento

Ao clicar no botao da extensao, o RecarregaAi!:

1. Identifica a aba aberta.
2. Coleta as origens dos recursos carregados pela pagina, como scripts, estilos,
   imagens, fetches e iframes acessiveis.
3. Limpa o cache dessas origens, incluindo cache do navegador, CacheStorage e service workers.
4. Recarrega a pagina ignorando o cache.

## Timer

O timer permite repetir a limpeza e o recarregamento automaticamente na aba
selecionada. Cada guia pode ter seu proprio timer.

Se voce tiver varias guias abertas, clique em `Ativar timer` nas guias que deseja
monitorar. O Drive pode ficar com um timer, outro sistema pode ficar com outro,
e cada contador aparece somente na guia correspondente.

Opcoes disponiveis:

- 3 minutos.
- 5 minutos.
- 10 minutos.
- Personalizado, em minutos.

Para usar:

1. Abra a pagina que deseja manter recarregando.
2. Abra o RecarregaAi!.
3. Escolha o tempo.
4. Clique em `Ativar timer`.

Para encerrar o agendamento da guia atual, clique em `Parar timer`.

Tambem e possivel pausar e retomar o timer da guia atual. Quando existem timers
em outras guias, o popup mostra uma lista compacta para abrir cada uma.

Quando existe um campo de texto ativo em uma guia monitorada, como input,
textarea ou editor da propria pagina, apenas o timer daquela guia pausa
automaticamente. Ao sair do campo, a contagem continua do ponto em que parou.

Enquanto o timer estiver ativo, o icone da extensao mostra a contagem regressiva
no badge, como `3:00`, `2:59`, `2:58` e assim por diante. Ao parar o timer, o
badge e removido.

O badge do icone deve ser tratado como indicador aproximado quando o popup esta
fechado. No Manifest V3, o service worker pode dormir e o `chrome.alarms` nao e
um cronometro exato de segundo. Com o popup aberto, a interface atualiza a
contagem com mais frequencia.

O badge aparece somente nas guias que possuem timer ativo. Nas outras guias, o
icone fica sem contador.

## Configuracoes

A pagina `options.html` permite:

- Definir o intervalo padrao do timer.
- Cadastrar sites para auto-inicio.
- Remover sites cadastrados.
- Consultar e limpar o historico local de acoes.
- Ver uma explicacao clara das permissoes usadas pela extensao.

O auto-inicio cria um timer separado para cada guia carregada com um site
favorito, desde que aquela guia ainda nao tenha timer ativo.

O historico mantem localmente apenas as 100 acoes mais recentes. Ele registra
limpezas manuais, atualizacoes automaticas e mudancas dos timers, guardando
somente tipo, horario, dominio, intervalo e resultado. URLs completas, conteudo
das paginas e texto digitado nao sao armazenados. O historico pode ser filtrado
ou apagado na pagina de configuracoes e nao entra no arquivo de backup.

Ao ativar um timer manual ou cadastrar um site de auto-inicio, a permissao do
dominio e solicitada durante a acao do usuario. Isso deixa o timer mais
confiavel apos reiniciar o Chrome.

## Privacidade

A pagina `privacy.html` resume como a extensao lida com dados:

- Nao vende dados.
- Nao coleta conteudo das paginas.
- Salva configuracoes localmente no Chrome.
- Mantem localmente um historico limitado das acoes da extensao.
- Usa permissoes opcionais apenas para dominios escolhidos pelo usuario.
- Feedback de desinstalacao e opcional e enviado via FormSubmit.
- Email de contato no feedback tambem e opcional.

## Feedback de desinstalacao

A pagina `uninstall.html` foi pensada para ser simples e objetiva: o usuario le
um texto curto, escolhe um motivo em uma lista de opcoes e envia o feedback na
propria pagina. Comentario e email continuam opcionais, mas ficam em uma area
recolhida para nao alongar o fluxo.

Tambem possui acoes flutuantes compactas para idioma e voltar ao inicio. Os
nomes aparecem no hover ou foco, e o idioma abre uma janela com os idiomas
disponiveis: Portugues (BR), English, Espanol, Francais, Deutsch, Italiano,
Bahasa Indonesia e Turkce.

O topo da pagina possui um botao `Adicionar ao Chrome`, pensado para apontar
para a pagina publica da extensao quando ela estiver publicada.

O envio automatico vai direto para o email do projeto por FormSubmit, sem abrir
GitHub, tela intermediaria ou outro formulario. O envio usa AJAX e so informa
sucesso depois da confirmacao do servico. A protecao antispam do FormSubmit fica
ativa, e a pagina limita o tamanho dos campos e o intervalo entre envios.

O background configura a URL de desinstalacao com:

```text
https://vinicius-olindo.github.io/RecarregaAI-/uninstall.html
```

Esse link deve permanecer fixo, sem parametros no final e sem troca por CDN,
GitHub issue, RawGitHack ou outro servico intermediario.

Essa URL precisa estar publicada pelo GitHub Pages. Sem essa publicacao, o
Chrome abre `404` depois da desinstalacao.

No repositorio, ative:

```text
Settings > Pages > Deploy from a branch > main > /root
```

Servicos com etapa intermediaria foram evitados porque exibem uma confirmacao
antes de abrir HTML. CDN cru tambem nao serve porque pode mostrar o codigo da
pagina em vez da interface.

O formulario envia para:

```text
https://formsubmit.co/ajax/onlibytedigital@gmail.com
```

No primeiro envio, o FormSubmit pode pedir confirmacao no email de destino.

## Engenharia e qualidade

- As permissoes de site ficam em `optional_host_permissions`.
- O auto-inicio pede permissao apenas para o dominio cadastrado pelo usuario.
- O service worker usa modulos ES em `JS/modules/`.
- O `setInterval` atualiza a UI/badge; o reload fica com `chrome.alarms`.
- O timer fica preso ao dominio original e pausa se a aba sair dele.
- Campos de senha nao entram na protecao de digitacao.
- URLs e endpoints fixos ficam em `JS/modules/config.js`.
- Tema claro/escuro fica centralizado em `JS/modules/theme.js`.
- Timers ficam em chaves individuais no storage, como `recarregaAiTimer:123`.
- O historico local usa uma fila de gravacao e mantem no maximo 100 acoes.
- Use `npm run check` para validar scripts, manifest e lint quando instalado.
- Use `npm run lint` para rodar ESLint apos `npm install`.
- Use `npm run zip` para gerar o pacote em `dist/recarregaai.zip`.
- O `npm run zip` usa Node e funciona melhor fora do Windows.
- O `npm run zip:ps` mantem o empacotamento antigo em PowerShell.

## Tema

O tema claro e escuro fica centralizado na pagina de configuracoes e nas paginas
com ferramentas flutuantes. O popup apenas acompanha a preferencia salva no
navegador.

## Observacoes

- O projeto usa Manifest V3.
- Os arquivos de estilo ficam em `CSS/`.
- Os arquivos JavaScript ficam em `JS/`.
- A tela inicial da extensao fica em `popup.html`.
- A pagina de configuracoes fica em `options.html`.
- A cada alteracao da extensao, incremente a versao.
- Quando a ultima casa chegar em `9`, suba a casa anterior.
- Exemplo: depois de `2.1.9`, use `2.2.0`.
