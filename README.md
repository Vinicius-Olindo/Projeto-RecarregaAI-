# RecarregaAi!

Extensao para Google Chrome que limpa o cache do site aberto, tenta limpar o cache
dos recursos carregados pela pagina e recarrega a aba atual. Tambem permite ativar
um timer para repetir esse processo automaticamente.

## Estrutura

```text
RecarregaAI-/
|-- manifest.json
|-- popup.html
|-- CSS/
|   `-- popup.css
|-- JS/
|   |-- background.js
|   |-- content.js
|   `-- popup.js
`-- assets/
    |-- icons/
    |   `-- recarregaai.svg
    `-- images/
```

## Como testar no Chrome

1. Abra `chrome://extensions/`.
2. Ative o modo de desenvolvedor.
3. Clique em `Carregar sem compactacao`.
4. Selecione a pasta raiz deste projeto.

## Funcionamento

Ao clicar no botao da extensao, o RecarregaAi!:

1. Identifica a aba aberta.
2. Coleta as origens dos recursos carregados pela pagina, como scripts, estilos,
   imagens, fetches e iframes acessiveis.
3. Limpa o cache dessas origens, incluindo cache do navegador, CacheStorage e service workers.
4. Recarrega a pagina ignorando o cache.

## Timer

O timer permite repetir a limpeza e o recarregamento automaticamente na aba selecionada.

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

Enquanto o timer estiver ativo, o icone da extensao mostra a contagem regressiva
no badge, como `3:00`, `2:59`, `2:58` e assim por diante. Ao parar o timer, o
badge e removido.

## Observacoes

- O projeto usa Manifest V3.
- Os arquivos de estilo ficam em `CSS/`.
- Os arquivos JavaScript ficam em `JS/`.
- A tela inicial da extensao fica em `popup.html`.
