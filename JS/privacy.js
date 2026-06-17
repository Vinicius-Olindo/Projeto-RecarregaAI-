// RecarregaAi! 1.7.4

import { initFloatingTools } from "./modules/floating-tools.js";
import {
  defaultLanguage,
  initLanguageDialog
} from "./modules/language-dialog.js";
import {
  loadThemePreference,
  toggleThemePreference
} from "./modules/theme.js";

const policyNavLinks = [...document.querySelectorAll(".policy-nav a[href^='#']")];
const privacyHeader = document.querySelector(".privacy-header");
const privacyElements = {
  themeToggleButton: document.querySelector("#theme-toggle-button"),
  themeToggleLabel: document.querySelector("#theme-toggle-label")
};
const policyHeadings = policyNavLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);
const sectionTopGap = 34;

const privacyTranslations = {
  "pt-BR": {
    backToTop: "Voltar ao início",
    closeDialog: "Fechar",
    contactChannelsLabel: "Canais de contato",
    documentTitle: "Política de Privacidade do RecarregaAi!",
    footerFeedback: "Feedback",
    footerDeveloper: "Desenvolvido por:",
    footerHome: "Início",
    footerLegal: "© RecarregaAi! 1.7.4. Política atualizada em 16/06/2026.",
    footerPrivacy: "Privacidade",
    headerContact: "Contato",
    headerNavLabel: "Navegação da política",
    headerPermissions: "Permissões",
    headerPolicy: "Política",
    headerReturn: "Voltar ao início",
    heroEyebrow: "Política de Privacidade",
    heroIntro:
      "O RecarregaAi! é uma extensão para navegador criada para limpar cache da página atual, recarregar abas e permitir o uso de timers automáticos de atualização.",
    heroMeta: "Última atualização: 16/06/2026",
    heroTitle: "Transparência para usar sem surpresa.",
    languageDialogDescription:
      "Escolha o idioma preferido para navegar pelo RecarregaAi!.",
    languageDialogTitle: "Idioma",
    languageGridLabel: "Idiomas disponíveis",
    languageLabel: "Idioma",
    linksLabel: "Links finais",
    navContact: "Contato",
    navControl: "Controle do usuário",
    navData: "Informações processadas",
    navFeedback: "Feedback",
    navLimitedUse: "Limited Use",
    navLocalStorage: "Armazenamento local",
    navNotCollected: "O que não é coletado",
    navPermissions: "Permissões",
    navSharing: "Compartilhamento",
    navTyping: "Proteção de digitação",
    policyNavTitle: "Conteúdo",
    quickActionsLabel: "Ações rápidas",
    themeToDark: "Tema escuro",
    themeToLight: "Tema claro",
    sectionContactBody:
      "Para dúvidas sobre privacidade, solicitações sobre feedback enviado ou esclarecimentos sobre dados processados pela extensão, use o canal de contato oficial que será informado nesta política assim que definido.",
    sectionContactTitle: "10. Contato",
    sectionControlBody1:
      "O usuário pode remover a extensão a qualquer momento pelas configurações do navegador.",
    sectionControlBody2:
      "Ao remover a extensão, as configurações locais associadas a ela são removidas pelo Chrome.",
    sectionControlBody3:
      "O usuário também pode revogar permissões concedidas a sites nas configurações do navegador.",
    sectionControlBody4:
      "Caso tenha enviado feedback e deseje solicitar remoção ou esclarecimento, o usuário pode entrar em contato pelo canal oficial informado nesta política.",
    sectionControlTitle: "9. Controle do usuário",
    sectionDataBody1:
      "Para funcionar corretamente, a extensão pode processar localmente a origem da página atual e de alguns recursos carregados pela página. Esse processamento é usado para limpar cache, CacheStorage e service workers relacionados ao site atual.",
    sectionDataBody2:
      "A extensão também pode salvar localmente configurações como tema escolhido, intervalo padrão de timer, sites configurados para auto-início e estado dos timers ativos.",
    sectionDataBody3:
      "Essas informações são armazenadas localmente no navegador do usuário usando <code>chrome.storage.local</code> e não são enviadas para servidores externos pela extensão.",
    sectionDataTitle: "1. Informações processadas pela extensão",
    sectionFeedbackBody1:
      "Ao desinstalar a extensão, o usuário pode optar por enviar um feedback. Esse envio é opcional.",
    sectionFeedbackBody2:
      "Caso enviado, o formulário pode incluir motivo da desinstalação, comentário, e-mail opcional, idioma, navegador, versão da extensão e data do envio.",
    sectionFeedbackBody3:
      "O envio do feedback é realizado por meio do serviço FormSubmit. Essas informações são usadas apenas para entender problemas, corrigir falhas e melhorar a extensão.",
    sectionFeedbackTitle: "5. Feedback de desinstalação",
    sectionLimitedUseBody1:
      "O uso das informações pela extensão segue a Política de Dados do Usuário da Chrome Web Store, incluindo os requisitos de Limited Use.",
    sectionLimitedUseBody2:
      "As informações processadas pela extensão são usadas apenas para fornecer ou melhorar suas funcionalidades principais.",
    sectionLimitedUseTitle: "7. Limited Use",
    sectionLocalStorageBody1:
      "As preferências da extensão são salvas no armazenamento local do navegador para manter a experiência funcionando entre sessões.",
    sectionLocalStorageBody2:
      "Essas informações permanecem no navegador do usuário e são usadas apenas para executar ou melhorar as funcionalidades principais da extensão.",
    sectionLocalStorageList1: "Tema escolhido.",
    sectionLocalStorageList2: "Intervalo padrão do timer.",
    sectionLocalStorageList3: "Sites configurados para auto-início.",
    sectionLocalStorageList4: "Estado dos timers ativos por guia.",
    sectionLocalStorageList5: "Último resultado de execução do timer.",
    sectionLocalStorageTitle: "4. Armazenamento local",
    sectionNotCollectedBody1:
      "A extensão não coleta senhas, textos digitados, mensagens, arquivos, dados bancários, dados de formulários ou conteúdo das páginas acessadas.",
    sectionNotCollectedBody2:
      "A extensão pode detectar localmente quando o usuário está interagindo com campos editáveis para evitar recarregamentos durante a digitação. Essa detecção não lê, armazena ou envia o conteúdo digitado.",
    sectionNotCollectedTitle: "2. Informações que a extensão não coleta",
    sectionPermissionsBody:
      "A extensão pode solicitar permissões necessárias para seu funcionamento.",
    sectionPermissionsTitle: "8. Permissões utilizadas",
    sectionSharingBody1:
      "A extensão não vende dados do usuário, não compartilha dados para publicidade e não utiliza informações para rastreamento.",
    sectionSharingBody2:
      "O único envio externo previsto ocorre quando o usuário envia voluntariamente o formulário de feedback de desinstalação, processado pelo FormSubmit.",
    sectionSharingTitle: "6. Compartilhamento de dados",
    sectionTypingBody1:
      "Quando um timer está ativo, o RecarregaAi! verifica localmente se há foco em campos como <code>input</code>, <code>textarea</code> ou áreas editáveis da página. Se houver digitação, o timer daquela guia pode ser pausado temporariamente para evitar perda de informações.",
    sectionTypingBody2:
      "Essa verificação identifica apenas o estado de interação com campos editáveis. Ela não acessa o texto digitado, não cria histórico de digitação e não envia esse estado para servidores externos.",
    sectionTypingTitle: "3. Proteção de digitação",
    permissionActiveTab:
      "Usada para executar ações na aba atual quando o usuário interage com a extensão.",
    permissionAlarms: "Usada para controlar timers automáticos.",
    permissionBrowsingData:
      "Usada para limpar cache, CacheStorage e service workers relacionados à página.",
    permissionHost:
      "Usada para solicitar permissão por domínio somente quando necessário.",
    permissionScripting:
      "Usada para executar verificações locais necessárias na página atual.",
    permissionStorage: "Usada para salvar configurações locais da extensão.",
    permissionTabs:
      "Usada para identificar a aba atual e atualizar informações do timer.",
    summaryFeedbackBody:
      "O único envio externo previsto acontece se o usuário decidir enviar o formulário de feedback de desinstalação.",
    summaryFeedbackTitle: "Feedback opcional",
    summaryGridLabel: "Resumo de privacidade",
    summaryLocalBody:
      "Origens, timers, tema e preferências ficam no navegador do usuário para executar as funções principais.",
    summaryLocalTitle: "Processamento local",
    summaryNotCollectedBody:
      "Senhas, textos digitados, mensagens, arquivos e dados de formulário não são lidos, salvos ou enviados pela extensão.",
    summaryNotCollectedTitle: "Conteúdo não coletado",
    trustDataSold: "Dados vendidos",
    trustFeedback: "Feedback externo",
    trustLocal: "Local",
    trustNo: "Não",
    trustOptional: "Opcional",
    trustPanelLabel: "Resumo rápido",
    trustProcessing: "Processamento"
  },
  en: {
    backToTop: "Back to top",
    closeDialog: "Close",
    contactChannelsLabel: "Contact channels",
    documentTitle: "RecarregaAi! Privacy Policy",
    footerFeedback: "Feedback",
    footerDeveloper: "Developed by:",
    footerHome: "Home",
    footerLegal: "© RecarregaAi! 1.7.4. Policy updated on 06/16/2026.",
    footerPrivacy: "Privacy",
    headerContact: "Contact",
    headerNavLabel: "Policy navigation",
    headerPermissions: "Permissions",
    headerPolicy: "Policy",
    headerReturn: "Back to home",
    heroEyebrow: "Privacy Policy",
    heroIntro:
      "RecarregaAi! is a browser extension created to clear the current page cache, reload tabs and allow automatic refresh timers.",
    heroMeta: "Last updated: 06/16/2026",
    heroTitle: "Transparency so you can use it without surprises.",
    languageDialogDescription:
      "Choose your preferred language to browse RecarregaAi!.",
    languageDialogTitle: "Language",
    languageGridLabel: "Available languages",
    languageLabel: "Language",
    linksLabel: "Footer links",
    navContact: "Contact",
    navControl: "User control",
    navData: "Processed information",
    navFeedback: "Feedback",
    navLimitedUse: "Limited Use",
    navLocalStorage: "Local storage",
    navNotCollected: "What is not collected",
    navPermissions: "Permissions",
    navSharing: "Sharing",
    navTyping: "Typing protection",
    policyNavTitle: "Content",
    quickActionsLabel: "Quick actions",
    themeToDark: "Dark theme",
    themeToLight: "Light theme",
    sectionContactBody:
      "For privacy questions, requests about submitted feedback or clarifications about data processed by the extension, use the official contact channel that will be added to this policy once defined.",
    sectionContactTitle: "10. Contact",
    sectionControlBody1:
      "The user can remove the extension at any time through browser settings.",
    sectionControlBody2:
      "When the extension is removed, local settings associated with it are removed by Chrome.",
    sectionControlBody3:
      "The user can also revoke permissions granted to sites in browser settings.",
    sectionControlBody4:
      "If you submitted feedback and want to request removal or clarification, contact us through the official channel listed in this policy.",
    sectionControlTitle: "9. User control",
    sectionDataBody1:
      "To work properly, the extension may locally process the origin of the current page and some resources loaded by the page. This processing is used to clear cache, CacheStorage and service workers related to the current site.",
    sectionDataBody2:
      "The extension may also locally save settings such as selected theme, default timer interval, sites configured for automatic start and active timer state.",
    sectionDataBody3:
      "This information is stored locally in the user's browser using <code>chrome.storage.local</code> and is not sent to external servers by the extension.",
    sectionDataTitle: "1. Information processed by the extension",
    sectionFeedbackBody1:
      "When uninstalling the extension, the user may choose to send feedback. This submission is optional.",
    sectionFeedbackBody2:
      "If submitted, the form may include uninstall reason, comment, optional email, language, browser, extension version and submission date.",
    sectionFeedbackBody3:
      "Feedback is submitted through FormSubmit. This information is used only to understand problems, fix issues and improve the extension.",
    sectionFeedbackTitle: "5. Uninstall feedback",
    sectionLimitedUseBody1:
      "The extension's use of information follows the Chrome Web Store User Data Policy, including Limited Use requirements.",
    sectionLimitedUseBody2:
      "Information processed by the extension is used only to provide or improve its core features.",
    sectionLimitedUseTitle: "7. Limited Use",
    sectionLocalStorageBody1:
      "Extension preferences are saved in the browser's local storage to keep the experience working across sessions.",
    sectionLocalStorageBody2:
      "This information remains in the user's browser and is used only to run or improve the extension's core features.",
    sectionLocalStorageList1: "Selected theme.",
    sectionLocalStorageList2: "Default timer interval.",
    sectionLocalStorageList3: "Sites configured for automatic start.",
    sectionLocalStorageList4: "Active timer state by tab.",
    sectionLocalStorageList5: "Last timer execution result.",
    sectionLocalStorageTitle: "4. Local storage",
    sectionNotCollectedBody1:
      "The extension does not collect passwords, typed text, messages, files, banking data, form data or page content.",
    sectionNotCollectedBody2:
      "The extension may locally detect when the user is interacting with editable fields to avoid reloads while typing. This detection does not read, store or send typed content.",
    sectionNotCollectedTitle: "2. Information the extension does not collect",
    sectionPermissionsBody:
      "The extension may request permissions required for its operation.",
    sectionPermissionsTitle: "8. Permissions used",
    sectionSharingBody1:
      "The extension does not sell user data, does not share data for advertising and does not use information for tracking.",
    sectionSharingBody2:
      "The only expected external submission happens when the user voluntarily sends the uninstall feedback form, processed by FormSubmit.",
    sectionSharingTitle: "6. Data sharing",
    sectionTypingBody1:
      "When a timer is active, RecarregaAi! locally checks whether fields such as <code>input</code>, <code>textarea</code> or editable page areas have focus. If typing is detected, that tab's timer may be paused temporarily to avoid information loss.",
    sectionTypingBody2:
      "This check identifies only the interaction state with editable fields. It does not access typed text, create typing history or send this state to external servers.",
    sectionTypingTitle: "3. Typing protection",
    permissionActiveTab:
      "Used to run actions on the current tab when the user interacts with the extension.",
    permissionAlarms: "Used to control automatic timers.",
    permissionBrowsingData:
      "Used to clear cache, CacheStorage and service workers related to the page.",
    permissionHost: "Used to request domain permission only when necessary.",
    permissionScripting:
      "Used to run required local checks on the current page.",
    permissionStorage: "Used to save local extension settings.",
    permissionTabs:
      "Used to identify the current tab and update timer information.",
    summaryFeedbackBody:
      "The only expected external submission happens if the user chooses to send the uninstall feedback form.",
    summaryFeedbackTitle: "Optional feedback",
    summaryGridLabel: "Privacy summary",
    summaryLocalBody:
      "Origins, timers, theme and preferences stay in the user's browser to run the main features.",
    summaryLocalTitle: "Local processing",
    summaryNotCollectedBody:
      "Passwords, typed text, messages, files and form data are not read, saved or sent by the extension.",
    summaryNotCollectedTitle: "Content not collected",
    trustDataSold: "Data sold",
    trustFeedback: "External feedback",
    trustLocal: "Local",
    trustNo: "No",
    trustOptional: "Optional",
    trustPanelLabel: "Quick summary",
    trustProcessing: "Processing"
  },
  es: {
    backToTop: "Volver al inicio",
    closeDialog: "Cerrar",
    contactChannelsLabel: "Canales de contacto",
    documentTitle: "Política de Privacidad de RecarregaAi!",
    footerFeedback: "Feedback",
    footerDeveloper: "Desarrollado por:",
    footerHome: "Inicio",
    footerLegal: "© RecarregaAi! 1.7.4. Política actualizada el 16/06/2026.",
    footerPrivacy: "Privacidad",
    headerContact: "Contacto",
    headerNavLabel: "Navegación de la política",
    headerPermissions: "Permisos",
    headerPolicy: "Política",
    headerReturn: "Volver al inicio",
    heroEyebrow: "Política de Privacidad",
    heroIntro:
      "RecarregaAi! es una extensión para navegador creada para limpiar la caché de la página actual, recargar pestañas y permitir temporizadores automáticos de actualización.",
    heroMeta: "Última actualización: 16/06/2026",
    heroTitle: "Transparencia para usarla sin sorpresas.",
    languageDialogDescription:
      "Elige el idioma preferido para navegar por RecarregaAi!.",
    languageDialogTitle: "Idioma",
    languageGridLabel: "Idiomas disponibles",
    languageLabel: "Idioma",
    linksLabel: "Enlaces finales",
    navContact: "Contacto",
    navControl: "Control del usuario",
    navData: "Información procesada",
    navFeedback: "Feedback",
    navLimitedUse: "Limited Use",
    navLocalStorage: "Almacenamiento local",
    navNotCollected: "Lo que no se recopila",
    navPermissions: "Permisos",
    navSharing: "Compartir datos",
    navTyping: "Protección de escritura",
    policyNavTitle: "Contenido",
    quickActionsLabel: "Acciones rápidas",
    themeToDark: "Tema oscuro",
    themeToLight: "Tema claro",
    sectionContactBody:
      "Para dudas sobre privacidad, solicitudes sobre feedback enviado o aclaraciones sobre datos procesados por la extensión, usa el canal oficial de contacto que se informará en esta política cuando esté definido.",
    sectionContactTitle: "10. Contacto",
    sectionControlBody1:
      "El usuario puede eliminar la extensión en cualquier momento desde la configuración del navegador.",
    sectionControlBody2:
      "Al eliminar la extensión, Chrome elimina las configuraciones locales asociadas a ella.",
    sectionControlBody3:
      "El usuario también puede revocar permisos concedidos a sitios desde la configuración del navegador.",
    sectionControlBody4:
      "Si enviaste feedback y deseas solicitar eliminación o aclaración, puedes entrar en contacto por el canal oficial informado en esta política.",
    sectionControlTitle: "9. Control del usuario",
    sectionDataBody1:
      "Para funcionar correctamente, la extensión puede procesar localmente el origen de la página actual y algunos recursos cargados por la página. Este procesamiento se usa para limpiar caché, CacheStorage y service workers relacionados con el sitio actual.",
    sectionDataBody2:
      "La extensión también puede guardar localmente configuraciones como tema elegido, intervalo predeterminado del timer, sitios configurados para inicio automático y estado de timers activos.",
    sectionDataBody3:
      "Esta información se almacena localmente en el navegador del usuario usando <code>chrome.storage.local</code> y la extensión no la envía a servidores externos.",
    sectionDataTitle: "1. Información procesada por la extensión",
    sectionFeedbackBody1:
      "Al desinstalar la extensión, el usuario puede optar por enviar feedback. Este envío es opcional.",
    sectionFeedbackBody2:
      "Si se envía, el formulario puede incluir motivo de desinstalación, comentario, email opcional, idioma, navegador, versión de la extensión y fecha de envío.",
    sectionFeedbackBody3:
      "El feedback se envía por medio de FormSubmit. Esta información se usa solo para entender problemas, corregir fallas y mejorar la extensión.",
    sectionFeedbackTitle: "5. Feedback de desinstalación",
    sectionLimitedUseBody1:
      "El uso de la información por parte de la extensión sigue la Política de Datos del Usuario de Chrome Web Store, incluidos los requisitos de Limited Use.",
    sectionLimitedUseBody2:
      "La información procesada por la extensión se usa solo para proporcionar o mejorar sus funcionalidades principales.",
    sectionLimitedUseTitle: "7. Limited Use",
    sectionLocalStorageBody1:
      "Las preferencias de la extensión se guardan en el almacenamiento local del navegador para mantener la experiencia funcionando entre sesiones.",
    sectionLocalStorageBody2:
      "Esta información permanece en el navegador del usuario y se usa solo para ejecutar o mejorar las funcionalidades principales de la extensión.",
    sectionLocalStorageList1: "Tema elegido.",
    sectionLocalStorageList2: "Intervalo predeterminado del timer.",
    sectionLocalStorageList3: "Sitios configurados para inicio automático.",
    sectionLocalStorageList4: "Estado de timers activos por pestaña.",
    sectionLocalStorageList5: "Último resultado de ejecución del timer.",
    sectionLocalStorageTitle: "4. Almacenamiento local",
    sectionNotCollectedBody1:
      "La extensión no recopila contraseñas, textos escritos, mensajes, archivos, datos bancarios, datos de formularios ni contenido de las páginas visitadas.",
    sectionNotCollectedBody2:
      "La extensión puede detectar localmente cuando el usuario interactúa con campos editables para evitar recargas durante la escritura. Esta detección no lee, almacena ni envía el contenido escrito.",
    sectionNotCollectedTitle: "2. Información que la extensión no recopila",
    sectionPermissionsBody:
      "La extensión puede solicitar permisos necesarios para su funcionamiento.",
    sectionPermissionsTitle: "8. Permisos utilizados",
    sectionSharingBody1:
      "La extensión no vende datos del usuario, no comparte datos para publicidad y no utiliza información para rastreo.",
    sectionSharingBody2:
      "El único envío externo previsto ocurre cuando el usuario envía voluntariamente el formulario de feedback de desinstalación, procesado por FormSubmit.",
    sectionSharingTitle: "6. Compartir datos",
    sectionTypingBody1:
      "Cuando un timer está activo, RecarregaAi! verifica localmente si hay foco en campos como <code>input</code>, <code>textarea</code> o áreas editables de la página. Si hay escritura, el timer de esa pestaña puede pausarse temporalmente para evitar pérdida de información.",
    sectionTypingBody2:
      "Esta verificación identifica solo el estado de interacción con campos editables. No accede al texto escrito, no crea historial de escritura y no envía ese estado a servidores externos.",
    sectionTypingTitle: "3. Protección de escritura",
    permissionActiveTab:
      "Usada para ejecutar acciones en la pestaña actual cuando el usuario interactúa con la extensión.",
    permissionAlarms: "Usada para controlar timers automáticos.",
    permissionBrowsingData:
      "Usada para limpiar caché, CacheStorage y service workers relacionados con la página.",
    permissionHost:
      "Usada para solicitar permiso por dominio solo cuando sea necesario.",
    permissionScripting:
      "Usada para ejecutar verificaciones locales necesarias en la página actual.",
    permissionStorage: "Usada para guardar configuraciones locales de la extensión.",
    permissionTabs:
      "Usada para identificar la pestaña actual y actualizar información del timer.",
    summaryFeedbackBody:
      "El único envío externo previsto ocurre si el usuario decide enviar el formulario de feedback de desinstalación.",
    summaryFeedbackTitle: "Feedback opcional",
    summaryGridLabel: "Resumen de privacidad",
    summaryLocalBody:
      "Orígenes, timers, tema y preferencias quedan en el navegador del usuario para ejecutar las funciones principales.",
    summaryLocalTitle: "Procesamiento local",
    summaryNotCollectedBody:
      "Contraseñas, textos escritos, mensajes, archivos y datos de formularios no son leídos, guardados ni enviados por la extensión.",
    summaryNotCollectedTitle: "Contenido no recopilado",
    trustDataSold: "Datos vendidos",
    trustFeedback: "Feedback externo",
    trustLocal: "Local",
    trustNo: "No",
    trustOptional: "Opcional",
    trustPanelLabel: "Resumen rápido",
    trustProcessing: "Procesamiento"
  }
};

let activePrivacyLanguage = defaultLanguage;
const privacyHtmlKeys = new Set([
  "sectionDataBody3",
  "sectionTypingBody1"
]);

const getPrivacyCopy = (key) => (
  privacyTranslations[activePrivacyLanguage]?.[key]
  || privacyTranslations[defaultLanguage][key]
  || key
);

const setText = (selector, key) => {
  const element = document.querySelector(selector);

  if (element) {
    element.textContent = getPrivacyCopy(key);
  }
};

const setTexts = (selector, keys) => {
  document.querySelectorAll(selector).forEach((element, index) => {
    const key = keys[index];

    if (key) {
      element.textContent = getPrivacyCopy(key);
    }
  });
};

const setAttribute = (selector, attribute, key) => {
  const element = document.querySelector(selector);

  if (element) {
    element.setAttribute(attribute, getPrivacyCopy(key));
  }
};

const setSectionText = (headingId, headingKey, paragraphKeys) => {
  const heading = document.getElementById(headingId);
  const section = heading?.closest(".policy-section");

  if (!section) {
    return;
  }

  heading.textContent = getPrivacyCopy(headingKey);
  section.querySelectorAll("p").forEach((paragraph, index) => {
    const key = paragraphKeys[index];

    if (key) {
      if (privacyHtmlKeys.has(key)) {
        paragraph.innerHTML = getPrivacyCopy(key);
        return;
      }

      paragraph.textContent = getPrivacyCopy(key);
    }
  });
};

const updatePrivacyThemeButtonLabel = ({ isDarkTheme }) => {
  const nextThemeLabel = isDarkTheme
    ? getPrivacyCopy("themeToLight")
    : getPrivacyCopy("themeToDark");

  privacyElements.themeToggleButton?.setAttribute(
    "aria-pressed",
    String(isDarkTheme)
  );
  privacyElements.themeToggleButton?.setAttribute("aria-label", nextThemeLabel);
  privacyElements.themeToggleButton?.setAttribute("title", nextThemeLabel);

  if (privacyElements.themeToggleLabel) {
    privacyElements.themeToggleLabel.textContent = nextThemeLabel;
  }
};

const loadPrivacyTheme = async () => {
  await loadThemePreference({
    onChange: updatePrivacyThemeButtonLabel
  });
};

const togglePrivacyTheme = async () => {
  await toggleThemePreference({
    onChange: updatePrivacyThemeButtonLabel
  });
};

const setActivePolicyNavLink = (headingId) => {
  policyNavLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${headingId}`;

    link.classList.toggle("is-active", isActive);

    if (isActive) {
      link.setAttribute("aria-current", "true");
      return;
    }

    link.removeAttribute("aria-current");
  });
};

const getScrollTargetTop = (heading) => {
  const section = heading.closest(".policy-section") || heading;
  const headerHeight = privacyHeader?.getBoundingClientRect().height || 0;
  const sectionTop = section.getBoundingClientRect().top + window.scrollY;

  return Math.max(0, sectionTop - headerHeight - sectionTopGap);
};

const applyPrivacyLanguage = (language) => {
  activePrivacyLanguage = privacyTranslations[language]
    ? language
    : defaultLanguage;
  document.title = getPrivacyCopy("documentTitle");

  setTexts(".header-nav a", [
    "headerPolicy",
    "headerPermissions",
    "headerContact"
  ]);
  setText(".header-link", "headerReturn");
  setText(".eyebrow", "heroEyebrow");
  setText("#privacy-title", "heroTitle");
  setText(".policy-meta", "heroMeta");
  setText(".hero__content > p:last-child", "heroIntro");
  setTexts(".trust-panel span", [
    "trustDataSold",
    "trustProcessing",
    "trustFeedback"
  ]);
  setTexts(".trust-panel strong", [
    "trustNo",
    "trustLocal",
    "trustOptional"
  ]);
  setTexts(".summary-grid h2", [
    "summaryLocalTitle",
    "summaryNotCollectedTitle",
    "summaryFeedbackTitle"
  ]);
  setTexts(".summary-grid p", [
    "summaryLocalBody",
    "summaryNotCollectedBody",
    "summaryFeedbackBody"
  ]);
  setText(".policy-nav p", "policyNavTitle");
  setTexts(".policy-nav a", [
    "navData",
    "navNotCollected",
    "navTyping",
    "navLocalStorage",
    "navFeedback",
    "navSharing",
    "navLimitedUse",
    "navPermissions",
    "navControl",
    "navContact"
  ]);

  setSectionText("data-title", "sectionDataTitle", [
    "sectionDataBody1",
    "sectionDataBody2",
    "sectionDataBody3"
  ]);
  setSectionText("not-collected-title", "sectionNotCollectedTitle", [
    "sectionNotCollectedBody1",
    "sectionNotCollectedBody2"
  ]);
  setSectionText("typing-title", "sectionTypingTitle", [
    "sectionTypingBody1",
    "sectionTypingBody2"
  ]);
  setSectionText("local-storage-title", "sectionLocalStorageTitle", [
    "sectionLocalStorageBody1",
    "sectionLocalStorageBody2"
  ]);
  setTexts("#local-storage-title ~ .policy-list li", [
    "sectionLocalStorageList1",
    "sectionLocalStorageList2",
    "sectionLocalStorageList3",
    "sectionLocalStorageList4",
    "sectionLocalStorageList5"
  ]);
  setSectionText("feedback-title", "sectionFeedbackTitle", [
    "sectionFeedbackBody1",
    "sectionFeedbackBody2",
    "sectionFeedbackBody3"
  ]);
  setSectionText("sharing-title", "sectionSharingTitle", [
    "sectionSharingBody1",
    "sectionSharingBody2"
  ]);
  setSectionText("limited-use-title", "sectionLimitedUseTitle", [
    "sectionLimitedUseBody1",
    "sectionLimitedUseBody2"
  ]);
  setSectionText("permissions-title", "sectionPermissionsTitle", [
    "sectionPermissionsBody"
  ]);
  setTexts(".permission-list dd", [
    "permissionBrowsingData",
    "permissionStorage",
    "permissionTabs",
    "permissionActiveTab",
    "permissionScripting",
    "permissionAlarms",
    "permissionHost"
  ]);
  setSectionText("control-title", "sectionControlTitle", [
    "sectionControlBody1",
    "sectionControlBody2",
    "sectionControlBody3",
    "sectionControlBody4"
  ]);
  setSectionText("contact-title", "sectionContactTitle", [
    "sectionContactBody"
  ]);

  setTexts(".privacy-footer__nav a", [
    "footerHome",
    "footerPrivacy",
    "footerFeedback"
  ]);
  setText(".privacy-footer__legal", "footerLegal");
  setText(".privacy-footer__developer-label", "footerDeveloper");
  updatePrivacyThemeButtonLabel({
    isDarkTheme: document.documentElement.dataset.theme === "dark"
  });
  setText("#open-language-button .floating-action__label", "languageLabel");
  setText("#back-to-top-button .floating-action__label", "backToTop");
  setText("#language-dialog-title", "languageDialogTitle");
  setText(".language-dialog__description", "languageDialogDescription");

  setAttribute(".header-nav", "aria-label", "headerNavLabel");
  setAttribute(".trust-panel", "aria-label", "trustPanelLabel");
  setAttribute(".summary-grid", "aria-label", "summaryGridLabel");
  setAttribute(".policy-nav", "aria-label", "headerNavLabel");
  setAttribute(".privacy-footer__nav", "aria-label", "linksLabel");
  setAttribute(".privacy-footer__social", "aria-label", "contactChannelsLabel");
  setAttribute(".floating-tools", "aria-label", "quickActionsLabel");
  setAttribute("#open-language-button", "aria-label", "languageLabel");
  setAttribute("#back-to-top-button", "aria-label", "backToTop");
  setAttribute("#close-language-button", "aria-label", "closeDialog");
  setAttribute(".language-grid", "aria-label", "languageGridLabel");
};

privacyElements.themeToggleButton?.addEventListener("click", () => {
  togglePrivacyTheme().catch((error) => {
    console.error("Erro ao alternar tema da privacidade:", error);
  });
});

policyNavLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const headingId = link.getAttribute("href").slice(1);
    const heading = document.getElementById(headingId);

    if (!heading) {
      return;
    }

    event.preventDefault();
    setActivePolicyNavLink(headingId);
    window.history.pushState(null, "", `#${headingId}`);
    window.scrollTo({
      behavior: "smooth",
      top: getScrollTargetTop(heading)
    });
  });
});

if (window.location.hash) {
  const initialHeadingId = window.location.hash.slice(1);

  if (policyHeadings.some((heading) => heading.id === initialHeadingId)) {
    setActivePolicyNavLink(initialHeadingId);
  }
}

if ("IntersectionObserver" in window && policyHeadings.length > 0) {
  const activeHeadingObserver = new IntersectionObserver((entries) => {
    const visibleEntry = entries
      .filter((entry) => entry.isIntersecting)
      .sort((firstEntry, secondEntry) => (
        firstEntry.boundingClientRect.top - secondEntry.boundingClientRect.top
      ))[0];

    if (visibleEntry?.target?.id) {
      setActivePolicyNavLink(visibleEntry.target.id);
    }
  }, {
    rootMargin: "-28% 0px -60% 0px",
    threshold: 0
  });

  policyHeadings.forEach((heading) => {
    activeHeadingObserver.observe(heading);
  });
}

initFloatingTools();
initLanguageDialog({
  onChange: applyPrivacyLanguage,
  storageKey: "recarregaAiPageLanguage"
});

loadPrivacyTheme().catch((error) => {
  console.error("Erro ao carregar tema da privacidade:", error);
});
