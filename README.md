# RecarregaAi!

**Versão atual: 2.2.3**

Extensão para Google Chrome que limpa dados antigos do site aberto, recarrega a
página sem depender do cache anterior e permite automatizar esse processo com
um timer independente para cada guia.

O projeto usa Manifest V3, solicita acesso aos sites somente quando necessário
e mantém configurações, timers e histórico de ações no próprio navegador.

## Funcionalidades

- Limpeza manual de cache com recarregamento imediato da página atual.
- Timers prontos de 3, 5 e 10 minutos.
- Intervalo personalizado em minutos.
- Vários timers funcionando ao mesmo tempo, um para cada guia.
- Contagem regressiva no ícone da extensão.
- Pausa e retomada manual diretamente pelo popup.
- Pausa automática durante digitação, reprodução de áudio ou vídeo e gravações.
- Proteção contra recarregamento após a guia sair do domínio original.
- Sites automáticos que iniciam um timer quando são abertos.
- Histórico local das 100 ações mais recentes, com filtros e limpeza manual.
- Importação e exportação das preferências em arquivo JSON.
- Tema claro e escuro.
- Interface em português, inglês, espanhol, francês, alemão, italiano,
  indonésio e turco.
- Página de boas-vindas, política de privacidade e formulário de feedback de
  desinstalação.

## Como funciona

### Limpeza manual

Ao selecionar `Limpar e recarregar`, a extensão:

1. Identifica a guia atual e as origens HTTP ou HTTPS carregadas por ela.
2. Remove cache do navegador, CacheStorage e service workers dessas origens.
3. Recarrega a guia ignorando o cache anterior.
4. Registra localmente o resultado da ação.

Cookies, sessões, senhas salvas e histórico de navegação não são removidos.

Páginas internas do Chrome, a Chrome Web Store e outros endereços protegidos
pelo navegador não permitem esse tipo de operação.

### Timer por guia

Cada guia pode manter seu próprio intervalo. Drive, sistemas internos, painéis
e outras páginas podem ser atualizados ao mesmo tempo, sem que um timer
substitua o outro.

Para iniciar:

1. Abra a página desejada.
2. Abra o popup do RecarregaAi!.
3. Escolha um intervalo pronto ou informe um tempo personalizado.
4. Selecione `Ativar atualização`.

O popup permite pausar, retomar, remover e abrir cada guia controlada. O badge
do ícone exibe uma contagem como `3:00`, `2:59` e `2:58`.

No Manifest V3, o service worker pode ser suspenso pelo Chrome. Por isso, a
contagem no ícone deve ser entendida como um indicador aproximado quando o
popup está fechado. O vencimento do timer é controlado por `chrome.alarms` e o
popup aberto atualiza a interface com maior frequência.

### Pausas de segurança

O timer da guia é pausado automaticamente quando a extensão detecta:

- digitação em campos de texto, áreas de texto ou editores da página;
- reprodução de áudio ou vídeo;
- gravação ativa com `MediaRecorder`;
- navegação para fora do domínio em que o timer foi iniciado.

A contagem continua quando a atividade termina. Campos de senha não são
monitorados pela proteção de digitação.

### Sites automáticos

Na página de configurações, o usuário pode cadastrar sites que devem iniciar
um timer quando forem abertos. Cada endereço pode usar o intervalo padrão ou um
tempo próprio.

A extensão solicita permissão apenas para o domínio cadastrado. Endereços
duplicados são recusados e podem ser removidos a qualquer momento.

## Configurações

A página `options.html` reúne:

- intervalo padrão;
- cadastro e remoção de sites automáticos;
- importação e exportação de configurações;
- histórico local com filtros por tipo de ação;
- explicação das permissões utilizadas;
- seleção de idioma e tema.

O arquivo exportado inclui intervalo padrão, sites automáticos, tema e idioma.
Timers ativos e histórico não entram no backup porque pertencem à instalação
atual do navegador.

## Instalação para desenvolvimento

### Carregar a pasta no Chrome

1. Clone ou baixe este repositório.
2. Abra `chrome://extensions/`.
3. Ative o `Modo do desenvolvedor`.
4. Selecione `Carregar sem compactação`.
5. Escolha a pasta raiz do projeto.

Ao instalar pela primeira vez, o Chrome abre `welcome.html` automaticamente.

### Preparar o ambiente de qualidade

O Node.js é necessário apenas para validação e empacotamento. Use uma versão
compatível com o ESLint 9.

```powershell
npm ci --ignore-scripts
npm run check
```

Depois de alterar a extensão, abra `chrome://extensions/` e selecione
`Recarregar` no card do RecarregaAi!.

## Permissões

O manifesto não possui `host_permissions` obrigatórias. Os acessos a sites
ficam em `optional_host_permissions` e são solicitados por domínio durante uma
ação iniciada pelo usuário.

| Permissão | Finalidade |
| --- | --- |
| `activeTab` | Autorizar a ação na guia escolhida após a interação do usuário. |
| `alarms` | Agendar os próximos recarregamentos mesmo quando o service worker é suspenso. |
| `browsingData` | Remover cache, CacheStorage e service workers das origens identificadas. |
| `scripting` | Coletar origens e ativar as proteções de digitação e mídia na página controlada. |
| `storage` | Salvar preferências, timers e histórico local no navegador. |
| `http://*/*` e `https://*/*` | Permissões opcionais solicitadas somente para os sites autorizados pelo usuário. |

## Privacidade

- O RecarregaAi! não vende dados.
- O conteúdo das páginas e os textos digitados não são armazenados.
- Configurações, timers e histórico permanecem no armazenamento local do
  Chrome.
- O histórico guarda somente tipo de ação, horário, domínio, intervalo,
  resultado e um detalhe técnico limitado.
- O histórico mantém no máximo 100 entradas e pode ser apagado pelo usuário.
- O feedback de desinstalação é opcional e utiliza o FormSubmit.
- Comentário e e-mail no formulário também são opcionais.

A política completa está em `privacy.html` e pode ser publicada pelo GitHub
Pages junto com as demais páginas públicas.

## Feedback de desinstalação

O Chrome abre o endereço abaixo depois que a extensão é removida:

```text
https://vinicius-olindo.github.io/RecarregaAI-/uninstall.html
```

Esse endereço deve permanecer fixo e publicado em:

```text
Settings > Pages > Deploy from a branch > main > /root
```

O formulário envia os dados diretamente para o endpoint configurado em
`JS/modules/config.js`. A proteção antispam do FormSubmit permanece ativa, e o
cliente limita o tamanho dos campos e o intervalo entre envios.

Ao configurar um novo e-mail de destino, o primeiro envio faz o FormSubmit
encaminhar uma mensagem de ativação para esse endereço. O responsável deve
abrir o link recebido e enviar o formulário novamente; sem essa confirmação, o
serviço aceita a requisição HTTP, mas não entrega o feedback.

## Estrutura do projeto

```text
RecarregaAI-/
|-- .github/
|   `-- workflows/
|       `-- validate.yml
|-- index.html
|-- manifest.json
|-- popup.html
|-- options.html
|-- welcome.html
|-- privacy.html
|-- uninstall.html
|-- CSS/
|   |-- popup.css
|   |-- options.css
|   |-- welcome.css
|   |-- privacy.css
|   |-- uninstall.css
|   `-- shared-*.css
|-- JS/
|   |-- background.js
|   |-- content.js
|   |-- page-media-guard.js
|   |-- popup.js
|   |-- options.js
|   |-- welcome.js
|   |-- privacy.js
|   |-- uninstall.js
|   `-- modules/
|       |-- cache.js
|       |-- config.js
|       |-- extended-translations.js
|       |-- floating-tools.js
|       |-- history.js
|       |-- language-dialog.js
|       |-- public-page-security.js
|       |-- shared.js
|       |-- storage.js
|       |-- tabs.js
|       `-- theme.js
|-- assets/
|   |-- icons/
|   `-- images/
|-- scripts/
|   |-- check-js.mjs
|   |-- check-manifest.mjs
|   |-- package-extension.mjs
|   `-- package-extension.ps1
|-- eslint.config.mjs
|-- package.json
`-- package-lock.json
```

Os arquivos HTML permanecem na raiz. Estilos ficam em `CSS/`, scripts em `JS/`
e comportamentos compartilhados em `JS/modules/`.

No GitHub Pages, `index.html` direciona a raiz do projeto para `welcome.html`.
O arquivo `.nojekyll` mantém a publicação como um site estático, sem transformar
o README em página inicial.

## Qualidade

Instale as dependências antes de usar os comandos deste projeto:

```powershell
npm ci --ignore-scripts
```

| Comando | Resultado |
| --- | --- |
| `npm run check` | Valida a sintaxe JavaScript, o manifesto e o ESLint. |
| `npm run check:js` | Verifica os arquivos JavaScript do pacote. |
| `npm run check:manifest` | Valida estrutura, arquivos e permissões do manifesto. |
| `npm run lint` | Executa o ESLint sem aceitar avisos. |
| `npm audit` | Verifica vulnerabilidades conhecidas nas dependências. |

## Integração contínua

O workflow `.github/workflows/validate.yml` é executado em pushes e pull
requests para `main`, além de permitir execução manual pelo GitHub Actions.

A rotina instala as dependências com `npm ci`, valida o projeto, bloqueia
vulnerabilidades de severidade alta ou crítica, gera `dist/recarregaai.zip` e
disponibiliza o pacote como artefato por 14 dias. O workflow possui apenas
permissão de leitura e não publica, não cria commits e não altera o repositório.

## Empacotamento

O pacote oficial é gerado com Node.js:

```powershell
npm run zip
```

O comando executa todas as validações e cria:

```text
dist/recarregaai.zip
```

No Windows, o empacotador legado também está disponível:

```powershell
npm run zip:ps
```

Os dois processos incluem somente os arquivos necessários para a extensão e
ignoram marcadores como `.gitkeep`. A pasta `dist/`, documentação, dependências
de desenvolvimento e scripts de build não entram no ZIP.

O arquivo `dist/recarregaai.zip` é o artefato destinado ao envio para a Chrome
Web Store.

Depois que o painel da Chrome Web Store gerar a URL específica da extensão,
preencha `chromeWebStoreUrl` em `JS/modules/config.js`. Enquanto esse campo
estiver vazio, os botões `Adicionar ao Chrome` permanecem ocultos para não
direcionar o usuário a uma página genérica.

## Versionamento

- A versão usa apenas números, sem o prefixo `V`.
- Cada card ou alteração concluída gera uma nova versão.
- A versão deve permanecer sincronizada em todos os arquivos do projeto.
- Quando a última casa chegar a `9`, a casa anterior é incrementada.
- Exemplo: depois de `2.2.3`, use `2.2.3`.

## Contato

- Empresa: Olinbyte Digital
- E-mail: [olinbytedigital@gmail.com](mailto:olinbytedigital@gmail.com)
- Instagram: [@olinbytedigital](https://www.instagram.com/olinbytedigital/)
