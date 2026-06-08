# RecarregaAi!

Base inicial da extensao RecarregaAi! para Google Chrome.

## Estrutura

```text
RecarregaAI-/
├── manifest.json
├── popup.html
├── CSS/
│   └── popup.css
├── JS/
│   ├── background.js
│   ├── content.js
│   └── popup.js
└── assets/
    ├── icons/
    │   └── recarregaai.svg
    └── images/
```

## Como testar no Chrome

1. Abra `chrome://extensions/`.
2. Ative o modo de desenvolvedor.
3. Clique em `Carregar sem compactacao`.
4. Selecione a pasta raiz deste projeto.

## Observacoes

- O projeto usa Manifest V3.
- Os arquivos de estilo ficam em `CSS/`.
- Os arquivos JavaScript ficam em `JS/`.
- A tela inicial da extensao fica em `popup.html`.
