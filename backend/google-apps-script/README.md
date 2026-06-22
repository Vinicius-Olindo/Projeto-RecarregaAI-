# Backend de feedback - RecarregaAi! 2.3.6

Este endpoint envia o feedback diretamente para
`olinbytedigital@gmail.com` usando o Google Apps Script. O navegador publica o
formulario em um iframe invisivel e recebe a confirmacao somente depois que o
`MailApp.sendEmail` termina sem erro.

## Publicacao

1. Acesse `https://script.google.com/` com a conta da Olinbyte Digital.
2. Crie um novo projeto chamado `RecarregaAi Feedback`.
3. Substitua o conteudo de `Code.gs` pelo arquivo desta pasta.
4. Clique em `Implantar > Nova implantacao`.
5. Escolha o tipo `Aplicativo da Web`.
6. Em `Executar como`, selecione `Eu`.
7. Em `Quem pode acessar`, selecione `Qualquer pessoa`.
8. Autorize o envio de e-mails e conclua a implantacao.
9. Copie a URL terminada em `/exec`.
10. Preencha `feedbackBackendUrl` em `JS/modules/config.js` com essa URL.

Sempre que `Code.gs` for alterado, crie uma nova versao da implantacao sem
trocar a URL publica configurada no projeto.

## Protecoes

- validacao e limite de tamanho dos campos;
- campo honeypot;
- limite global por minuto;
- bloqueio de envios duplicados;
- escape do HTML do e-mail;
- resposta assinada com o identificador unico da submissao;
- confirmacao enviada apenas para a origem oficial do GitHub Pages ou para
  uma origem valida da extensao (`chrome-extension://`).
