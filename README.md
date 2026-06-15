# RecarregaAi!

Versao atual: **V.1.2.5**.

Extensao para Google Chrome que limpa o cache do site aberto, tenta limpar o cache
dos recursos carregados pela pagina e recarrega a aba atual. Tambem permite ativar
um timer para repetir esse processo automaticamente.

## Estrutura

```text
RecarregaAI-/
|-- manifest.json
|-- options.html
|-- popup.html
|-- uninstall.html
|-- welcome.html
|-- CSS/
|   |-- options.css
|   |-- popup.css
|   |-- uninstall.css
|   `-- welcome.css
|-- JS/
|   |-- background.js
|   |-- content.js
|   |-- options.js
|   |-- popup.js
|   |-- uninstall.js
|   `-- welcome.js
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

O badge aparece somente nas guias que possuem timer ativo. Nas outras guias, o
icone fica sem contador.

## Configuracoes

A pagina `options.html` permite:

- Definir o intervalo padrao do timer.
- Cadastrar sites para auto-inicio.
- Remover sites cadastrados.
- Ver uma explicacao clara das permissoes usadas pela extensao.

O auto-inicio cria um timer separado para cada guia carregada com um site
favorito, desde que aquela guia ainda nao tenha timer ativo.

## Feedback de desinstalacao

A pagina `uninstall.html` coleta o motivo da desinstalacao, nota de experiencia,
comentario opcional e email opcional. O envio vai direto para o email do projeto
por FormSubmit, sem abrir GitHub para o usuario confirmar.

O background configura a URL de desinstalacao com:

```text
https://raw.githack.com/Vinicius-Olindo/RecarregaAI-/main/uninstall.html
```

Essa URL renderiza o HTML diretamente a partir do arquivo `uninstall.html` no
branch `main`, sem depender do GitHub Pages. Depois de alterar essa pagina, faca
commit e push para o GitHub para a versao online acompanhar o projeto.

Se futuramente voce hospedar em dominio proprio, atualize
`uninstallFeedbackPageUrl` em `JS/background.js`.

O formulario envia para:

```text
https://formsubmit.co/ajax/vinim0106@icloud.com
```

No primeiro envio, o FormSubmit pode pedir confirmacao no email de destino.

## Tema

O popup abre em tema escuro por padrao. Use o botao `Claro` ou `Escuro` no topo
para alternar entre os temas. A escolha fica salva no navegador.

## Observacoes

- O projeto usa Manifest V3.
- Os arquivos de estilo ficam em `CSS/`.
- Os arquivos JavaScript ficam em `JS/`.
- A tela inicial da extensao fica em `popup.html`.
- A pagina de configuracoes fica em `options.html`.
- A cada alteracao da extensao, incremente a versao no padrao `V.1.2.x`.
