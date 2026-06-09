# RecarregaAi!

Versao atual: **V.1.2.0**.

Extensao para Google Chrome que limpa o cache do site aberto, tenta limpar o cache
dos recursos carregados pela pagina e recarrega a aba atual. Tambem permite ativar
um timer para repetir esse processo automaticamente.

## Estrutura

```text
RecarregaAI-/
|-- manifest.json
|-- options.html
|-- popup.html
|-- welcome.html
|-- CSS/
|   |-- options.css
|   |-- popup.css
|   `-- welcome.css
|-- JS/
|   |-- background.js
|   |-- content.js
|   |-- options.js
|   |-- popup.js
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

## Funcionamento

Ao clicar no botao da extensao, o RecarregaAi!:

1. Identifica a aba aberta.
2. Coleta as origens dos recursos carregados pela pagina, como scripts, estilos,
   imagens, fetches e iframes acessiveis.
3. Limpa o cache dessas origens, incluindo cache do navegador, CacheStorage e service workers.
4. Recarrega a pagina ignorando o cache.

## Timer

O timer permite repetir a limpeza e o recarregamento automaticamente na aba selecionada.
Somente uma guia fica ativa por vez.

Se voce tiver varias guias abertas, o RecarregaAi! funciona apenas na guia em que
voce clicou em `Ativar timer`. Ao ativar o timer em outra guia, a guia anterior
deixa de mostrar o contador e a nova guia passa a ser controlada.

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

Para encerrar o agendamento, clique em `Parar timer`.

Tambem e possivel pausar, retomar e abrir diretamente a guia controlada pelo
timer usando os botoes do popup.

Enquanto o timer estiver ativo, o icone da extensao mostra a contagem regressiva
no badge, como `3:00`, `2:59`, `2:58` e assim por diante. Ao parar o timer, o
badge e removido.

O badge aparece somente na guia controlada pelo timer. Nas outras guias, o icone
fica sem contador.

## Configuracoes

A pagina `options.html` permite:

- Definir o intervalo padrao do timer.
- Cadastrar sites para auto-inicio.
- Remover sites cadastrados.
- Ver uma explicacao clara das permissoes usadas pela extensao.

O auto-inicio so entra em acao quando nao existe outro timer ativo.

## Tema

O popup abre em tema escuro por padrao. Use o botao `Claro` ou `Escuro` no topo
para alternar entre os temas. A escolha fica salva no navegador.

## Observacoes

- O projeto usa Manifest V3.
- Os arquivos de estilo ficam em `CSS/`.
- Os arquivos JavaScript ficam em `JS/`.
- A tela inicial da extensao fica em `popup.html`.
- A pagina de configuracoes fica em `options.html`.
