// RecarregaAi! 2.0.7

import { initFloatingTools } from "./modules/floating-tools.js";
import { extendPageTranslations } from "./modules/extended-translations.js";
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

const privacyTranslations = extendPageTranslations({
  "pt-BR": {
    backToTop: "Voltar ao início",
    closeDialog: "Fechar",
    contactChannelsLabel: "Canais de contato",
    documentTitle: "Política de Privacidade do RecarregaAi!",
    footerFeedback: "Feedback",
    footerDeveloper: "Desenvolvido por:",
    footerHome: "Início",
    footerLegal: "© RecarregaAi! 2.0.7. Política atualizada em 19/06/2026.",
    footerPrivacy: "Privacidade",
    headerContact: "Contato",
    headerNavLabel: "Navegação da política",
    headerPermissions: "Permissões",
    headerPolicy: "Política",
    headerReturn: "Voltar ao início",
    heroEyebrow: "Política de Privacidade",
    heroIntro:
      "O RecarregaAi! é uma extensão para navegador criada para limpar dados temporários do site atual, recarregar abas, executar timers automáticos e proteger atividades de digitação e mídia contra recarregamentos inesperados.",
    heroMeta: "Última atualização: 19/06/2026",
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
    navTyping: "Proteção de digitação e mídia",
    policyNavTitle: "Conteúdo",
    quickActionsLabel: "Ações rápidas",
    themeToDark: "Tema escuro",
    themeToLight: "Tema claro",
    sectionContactBody:
      "Para dúvidas sobre privacidade, solicitações sobre feedback enviado ou esclarecimentos sobre dados processados pela extensão, use o canal de contato oficial que será informado nesta política assim que definido.",
    sectionContactTitle: "10. Contato",
    sectionControlBody1:
      "O usuário pode alterar tema, idioma, timers, sites automáticos e permissões a qualquer momento nas páginas da extensão ou nas configurações do navegador.",
    sectionControlBody2:
      "A exportação e a importação de configurações só acontecem por ação do usuário. O arquivo JSON exportado pode ser examinado e excluído pelo próprio usuário, e o arquivo importado é escolhido manualmente.",
    sectionControlBody3:
      "O usuário pode revogar permissões concedidas a sites ou remover a extensão. Ao removê-la, o Chrome exclui os dados associados ao armazenamento local da extensão.",
    sectionControlBody4:
      "Arquivos exportados permanecem no local escolhido pelo usuário e devem ser excluídos manualmente. Caso tenha enviado feedback e deseje solicitar remoção ou esclarecimento, poderá usar o canal oficial informado nesta política quando ele estiver definido.",
    sectionControlTitle: "9. Controle do usuário",
    sectionDataBody1:
      "Para funcionar corretamente, a extensão processa localmente o endereço e a origem da página atual e de alguns recursos carregados por ela. Esses dados são usados para identificar o site, limpar cache, CacheStorage e service workers relacionados e recarregar a guia.",
    sectionDataBody2:
      "A extensão também pode salvar localmente o tema, o idioma, o intervalo padrão, os sites configurados para auto-início e, para as guias com timers ativos, endereço, título, estado, próxima execução e último resultado do timer.",
    sectionDataBody3:
      "Essas informações ficam no navegador por meio de <code>chrome.storage.local</code> e, para a preferência de idioma das páginas, do armazenamento local do próprio navegador. A extensão não envia essas informações para servidores externos.",
    sectionDataTitle: "1. Informações processadas pela extensão",
    sectionFeedbackBody1:
      "Após a desinstalação, a página de feedback pode ser aberta automaticamente, mas nenhuma resposta é enviada sem uma ação do usuário. O envio é opcional.",
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
      "As preferências e os estados necessários ao funcionamento da extensão são salvos no armazenamento local do navegador para manter a experiência entre sessões.",
    sectionLocalStorageBody2:
      "Ao exportar configurações, a extensão cria localmente um arquivo JSON com tema, idioma, intervalo padrão e sites de auto-início. Timers ativos não entram no arquivo. Na importação, apenas o arquivo escolhido pelo usuário é lido localmente; ele não é enviado a servidores.",
    sectionLocalStorageList1: "Tema escolhido.",
    sectionLocalStorageList2: "Idioma escolhido para as páginas da extensão.",
    sectionLocalStorageList3: "Intervalo padrão dos timers.",
    sectionLocalStorageList4: "Sites e intervalos configurados para auto-início.",
    sectionLocalStorageList5: "Estado dos timers ativos e dados da guia associada.",
    sectionLocalStorageList6: "Último resultado de execução do timer.",
    sectionLocalStorageTitle: "4. Armazenamento local",
    sectionNotCollectedBody1:
      "A extensão não coleta senhas, textos digitados, mensagens, arquivos, dados bancários, dados de formulários, gravações de áudio ou vídeo, conteúdo textual das páginas nem cria um histórico geral de navegação ou um perfil de uso do usuário.",
    sectionNotCollectedBody2:
      "A extensão pode detectar localmente quando o usuário está interagindo com campos editáveis ou usando áudio, vídeo e gravação para evitar recarregamentos em momentos sensíveis. Essa detecção não lê, armazena ou envia o conteúdo digitado, reproduzido ou gravado.",
    sectionNotCollectedTitle: "2. Informações que a extensão não coleta",
    sectionPermissionsBody:
      "A extensão solicita somente as permissões necessárias para suas funcionalidades principais.",
    sectionPermissionsTitle: "8. Permissões utilizadas",
    sectionSharingBody1:
      "A extensão não vende dados do usuário, não compartilha dados para publicidade e não utiliza analytics de terceiros nem informações para rastreamento.",
    sectionSharingBody2:
      "O único envio externo previsto ocorre quando o usuário envia voluntariamente o formulário de feedback de desinstalação, processado pelo FormSubmit.",
    sectionSharingTitle: "6. Compartilhamento de dados",
    sectionTypingBody1:
      "Quando um timer está ativo, o RecarregaAi! verifica localmente se há foco em campos como <code>input</code>, <code>textarea</code> ou áreas editáveis da página. Ele também pode identificar se há áudio, vídeo, gravação, fluxo de mídia ou contexto de áudio em uso. Se houver atividade sensível, o timer daquela guia pode ser pausado temporariamente e retomado depois que a atividade terminar.",
    sectionTypingBody2:
      "Essa verificação recebe apenas o estado de interação com campos editáveis ou mídia ativa. Ela não acessa o texto digitado, não grava áudio, não captura vídeo, não cria histórico de atividade e não envia esse estado para servidores externos.",
    sectionTypingTitle: "3. Proteção de digitação e mídia",
    permissionActiveTab:
      "Usada para executar ações na guia atual quando o usuário interage com a extensão.",
    permissionAlarms:
      "Usada para programar e controlar os timers automáticos no navegador.",
    permissionBrowsingData:
      "Usada para limpar cache, CacheStorage e service workers das origens relacionadas à página atual ou autorizada.",
    permissionHost:
      "Usada para solicitar permissão por domínio quando o usuário inicia um timer, adiciona ou importa um site automático.",
    permissionScripting:
      "Usada para executar na página as verificações locais de digitação e mídia e identificar origens necessárias à limpeza.",
    permissionStorage:
      "Usada para salvar preferências, timers e resultados localmente.",
    permissionTabs:
      "Usada para identificar a guia, associar timers, acessar o endereço e o título necessários ao controle e recarregar a guia programada.",
    summaryFeedbackBody:
      "O único envio externo previsto acontece se o usuário decidir enviar o formulário de feedback de desinstalação.",
    summaryFeedbackTitle: "Feedback opcional",
    summaryGridLabel: "Resumo de privacidade",
    summaryLocalBody:
      "Origens necessárias à limpeza, timers, tema, idioma e preferências ficam no navegador do usuário para executar as funções principais.",
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
    footerLegal: "© RecarregaAi! 2.0.7. Policy updated on 06/19/2026.",
    footerPrivacy: "Privacy",
    headerContact: "Contact",
    headerNavLabel: "Policy navigation",
    headerPermissions: "Permissions",
    headerPolicy: "Policy",
    headerReturn: "Back to home",
    heroEyebrow: "Privacy Policy",
    heroIntro:
      "RecarregaAi! is a browser extension created to clear temporary data from the current site, reload tabs, run automatic timers and protect typing and media activity from unexpected reloads.",
    heroMeta: "Last updated: 06/19/2026",
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
    navTyping: "Typing and media protection",
    policyNavTitle: "Content",
    quickActionsLabel: "Quick actions",
    themeToDark: "Dark theme",
    themeToLight: "Light theme",
    sectionContactBody:
      "For privacy questions, requests about submitted feedback or clarifications about data processed by the extension, use the official contact channel that will be added to this policy once defined.",
    sectionContactTitle: "10. Contact",
    sectionControlBody1:
      "The user can change the theme, language, timers, automatic sites and permissions at any time through extension pages or browser settings.",
    sectionControlBody2:
      "Settings are exported or imported only after a user action. The exported JSON file can be inspected and deleted by the user, and the imported file is selected manually.",
    sectionControlBody3:
      "The user can revoke permissions granted to sites or remove the extension. When it is removed, Chrome deletes data associated with the extension's local storage.",
    sectionControlBody4:
      "Exported files remain in the location selected by the user and must be deleted manually. If feedback was submitted and removal or clarification is requested, the official channel listed in this policy may be used once it is defined.",
    sectionControlTitle: "9. User control",
    sectionDataBody1:
      "To work properly, the extension locally processes the address and origin of the current page and some resources loaded by it. This data is used to identify the site, clear related cache, CacheStorage and service workers, and reload the tab.",
    sectionDataBody2:
      "The extension may also locally save the theme, language, default interval, sites configured for automatic start and, for tabs with active timers, the address, title, state, next run and last timer result.",
    sectionDataBody3:
      "This information remains in the browser through <code>chrome.storage.local</code> and, for the page language preference, the browser's own local storage. The extension does not send this information to external servers.",
    sectionDataTitle: "1. Information processed by the extension",
    sectionFeedbackBody1:
      "After uninstalling the extension, the feedback page may open automatically, but no response is sent without a user action. Submission is optional.",
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
      "Preferences and states required for the extension to operate are saved in the browser's local storage to maintain the experience across sessions.",
    sectionLocalStorageBody2:
      "When settings are exported, the extension locally creates a JSON file containing the theme, language, default interval and automatic-start sites. Active timers are not included. During import, only the file selected by the user is read locally; it is not sent to servers.",
    sectionLocalStorageList1: "Selected theme.",
    sectionLocalStorageList2: "Language selected for extension pages.",
    sectionLocalStorageList3: "Default timer interval.",
    sectionLocalStorageList4: "Sites and intervals configured for automatic start.",
    sectionLocalStorageList5: "Active timer state and associated tab data.",
    sectionLocalStorageList6: "Last timer execution result.",
    sectionLocalStorageTitle: "4. Local storage",
    sectionNotCollectedBody1:
      "The extension does not collect passwords, typed text, messages, files, banking data, form data, audio or video recordings, textual page content, and does not create a general browsing history or user profile.",
    sectionNotCollectedBody2:
      "The extension may locally detect when the user is interacting with editable fields or using audio, video and recording to avoid reloads during sensitive moments. This detection does not read, store or send typed, played or recorded content.",
    sectionNotCollectedTitle: "2. Information the extension does not collect",
    sectionPermissionsBody:
      "The extension requests only the permissions required for its core features.",
    sectionPermissionsTitle: "8. Permissions used",
    sectionSharingBody1:
      "The extension does not sell user data, does not share data for advertising, and does not use third-party analytics or information for tracking.",
    sectionSharingBody2:
      "The only expected external submission happens when the user voluntarily sends the uninstall feedback form, processed by FormSubmit.",
    sectionSharingTitle: "6. Data sharing",
    sectionTypingBody1:
      "When a timer is active, RecarregaAi! locally checks whether fields such as <code>input</code>, <code>textarea</code> or editable page areas have focus. It may also identify whether audio, video, recording, a media stream or an audio context is in use. If sensitive activity is detected, that tab's timer may be paused temporarily and resumed after the activity ends.",
    sectionTypingBody2:
      "This check receives only the interaction state of editable fields or active media. It does not access typed text, record audio, capture video, create activity history or send this state to external servers.",
    sectionTypingTitle: "3. Typing and media protection",
    permissionActiveTab:
      "Used to run actions on the current tab when the user interacts with the extension.",
    permissionAlarms:
      "Used to schedule and control automatic timers in the browser.",
    permissionBrowsingData:
      "Used to clear cache, CacheStorage and service workers for origins related to the current or authorized page.",
    permissionHost:
      "Used to request per-domain permission when the user starts a timer or adds or imports an automatic site.",
    permissionScripting:
      "Used to run local typing and media checks on the page and identify origins required for cleanup.",
    permissionStorage:
      "Used to save preferences, timers and results locally.",
    permissionTabs:
      "Used to identify the tab, associate timers, access the address and title required for control, and reload the scheduled tab.",
    summaryFeedbackBody:
      "The only expected external submission happens if the user chooses to send the uninstall feedback form.",
    summaryFeedbackTitle: "Optional feedback",
    summaryGridLabel: "Privacy summary",
    summaryLocalBody:
      "Origins required for cleanup, timers, theme, language and preferences stay in the user's browser to run the main features.",
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
    footerLegal: "© RecarregaAi! 2.0.7. Política actualizada el 19/06/2026.",
    footerPrivacy: "Privacidad",
    headerContact: "Contacto",
    headerNavLabel: "Navegación de la política",
    headerPermissions: "Permisos",
    headerPolicy: "Política",
    headerReturn: "Volver al inicio",
    heroEyebrow: "Política de Privacidad",
    heroIntro:
      "RecarregaAi! es una extensión para navegador creada para limpiar datos temporales del sitio actual, recargar pestañas, ejecutar timers automáticos y proteger la escritura y el uso de medios contra recargas inesperadas.",
    heroMeta: "Última actualización: 19/06/2026",
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
    navTyping: "Protección de escritura y medios",
    policyNavTitle: "Contenido",
    quickActionsLabel: "Acciones rápidas",
    themeToDark: "Tema oscuro",
    themeToLight: "Tema claro",
    sectionContactBody:
      "Para dudas sobre privacidad, solicitudes sobre feedback enviado o aclaraciones sobre datos procesados por la extensión, usa el canal oficial de contacto que se informará en esta política cuando esté definido.",
    sectionContactTitle: "10. Contacto",
    sectionControlBody1:
      "El usuario puede cambiar el tema, el idioma, los timers, los sitios automáticos y los permisos en cualquier momento desde las páginas de la extensión o la configuración del navegador.",
    sectionControlBody2:
      "La exportación y la importación de configuraciones solo ocurren por acción del usuario. El archivo JSON exportado puede ser examinado y eliminado por el usuario, y el archivo importado se selecciona manualmente.",
    sectionControlBody3:
      "El usuario puede revocar permisos concedidos a sitios o eliminar la extensión. Al eliminarla, Chrome borra los datos asociados al almacenamiento local de la extensión.",
    sectionControlBody4:
      "Los archivos exportados permanecen en la ubicación elegida por el usuario y deben eliminarse manualmente. Si se envió feedback y se desea solicitar su eliminación o una aclaración, podrá usarse el canal oficial indicado en esta política cuando esté definido.",
    sectionControlTitle: "9. Control del usuario",
    sectionDataBody1:
      "Para funcionar correctamente, la extensión procesa localmente la dirección y el origen de la página actual y de algunos recursos cargados por ella. Estos datos se usan para identificar el sitio, limpiar caché, CacheStorage y service workers relacionados y recargar la pestaña.",
    sectionDataBody2:
      "La extensión también puede guardar localmente el tema, el idioma, el intervalo predeterminado, los sitios configurados para inicio automático y, para las pestañas con timers activos, la dirección, el título, el estado, la próxima ejecución y el último resultado del timer.",
    sectionDataBody3:
      "Esta información permanece en el navegador mediante <code>chrome.storage.local</code> y, para la preferencia de idioma de las páginas, el almacenamiento local del propio navegador. La extensión no envía esta información a servidores externos.",
    sectionDataTitle: "1. Información procesada por la extensión",
    sectionFeedbackBody1:
      "Después de desinstalar la extensión, la página de feedback puede abrirse automáticamente, pero no se envía ninguna respuesta sin una acción del usuario. El envío es opcional.",
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
      "Las preferencias y los estados necesarios para el funcionamiento de la extensión se guardan en el almacenamiento local del navegador para mantener la experiencia entre sesiones.",
    sectionLocalStorageBody2:
      "Al exportar configuraciones, la extensión crea localmente un archivo JSON con el tema, el idioma, el intervalo predeterminado y los sitios de inicio automático. Los timers activos no se incluyen. Durante la importación, solo se lee localmente el archivo elegido por el usuario; no se envía a servidores.",
    sectionLocalStorageList1: "Tema elegido.",
    sectionLocalStorageList2: "Idioma elegido para las páginas de la extensión.",
    sectionLocalStorageList3: "Intervalo predeterminado de los timers.",
    sectionLocalStorageList4: "Sitios e intervalos configurados para inicio automático.",
    sectionLocalStorageList5: "Estado de los timers activos y datos de la pestaña asociada.",
    sectionLocalStorageList6: "Último resultado de ejecución del timer.",
    sectionLocalStorageTitle: "4. Almacenamiento local",
    sectionNotCollectedBody1:
      "La extensión no recopila contraseñas, textos escritos, mensajes, archivos, datos bancarios, datos de formularios, grabaciones de audio o video ni contenido textual de las páginas, y no crea un historial general de navegación ni un perfil del usuario.",
    sectionNotCollectedBody2:
      "La extensión puede detectar localmente cuando el usuario interactúa con campos editables o usa audio, video y grabación para evitar recargas en momentos sensibles. Esta detección no lee, almacena ni envía el contenido escrito, reproducido o grabado.",
    sectionNotCollectedTitle: "2. Información que la extensión no recopila",
    sectionPermissionsBody:
      "La extensión solicita solo los permisos necesarios para sus funcionalidades principales.",
    sectionPermissionsTitle: "8. Permisos utilizados",
    sectionSharingBody1:
      "La extensión no vende datos del usuario, no comparte datos para publicidad y no utiliza analytics de terceros ni información para rastreo.",
    sectionSharingBody2:
      "El único envío externo previsto ocurre cuando el usuario envía voluntariamente el formulario de feedback de desinstalación, procesado por FormSubmit.",
    sectionSharingTitle: "6. Compartir datos",
    sectionTypingBody1:
      "Cuando un timer está activo, RecarregaAi! verifica localmente si hay foco en campos como <code>input</code>, <code>textarea</code> o áreas editables de la página. También puede identificar si hay audio, video, grabación, un flujo de medios o un contexto de audio en uso. Si hay actividad sensible, el timer de esa pestaña puede pausarse temporalmente y reanudarse cuando la actividad termine.",
    sectionTypingBody2:
      "Esta verificación recibe solo el estado de interacción con campos editables o medios activos. No accede al texto escrito, no graba audio, no captura video, no crea historial de actividad ni envía ese estado a servidores externos.",
    sectionTypingTitle: "3. Protección de escritura y medios",
    permissionActiveTab:
      "Usada para ejecutar acciones en la pestaña actual cuando el usuario interactúa con la extensión.",
    permissionAlarms:
      "Usada para programar y controlar los timers automáticos en el navegador.",
    permissionBrowsingData:
      "Usada para limpiar caché, CacheStorage y service workers de los orígenes relacionados con la página actual o autorizada.",
    permissionHost:
      "Usada para solicitar permiso por dominio cuando el usuario inicia un timer o agrega o importa un sitio automático.",
    permissionScripting:
      "Usada para ejecutar en la página las verificaciones locales de escritura y medios e identificar los orígenes necesarios para la limpieza.",
    permissionStorage:
      "Usada para guardar preferencias, timers y resultados localmente.",
    permissionTabs:
      "Usada para identificar la pestaña, asociar timers, acceder a la dirección y al título necesarios para el control y recargar la pestaña programada.",
    summaryFeedbackBody:
      "El único envío externo previsto ocurre si el usuario decide enviar el formulario de feedback de desinstalación.",
    summaryFeedbackTitle: "Feedback opcional",
    summaryGridLabel: "Resumen de privacidad",
    summaryLocalBody:
      "Los orígenes necesarios para la limpieza, los timers, el tema, el idioma y las preferencias permanecen en el navegador del usuario para ejecutar las funciones principales.",
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
}, "privacy");

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

const getPolicyHeadingTop = (heading) => {
  const section = heading.closest(".policy-section") || heading;

  return section.getBoundingClientRect().top + window.scrollY;
};

const getActivePolicyHeadingId = () => {
  const headerHeight = privacyHeader?.getBoundingClientRect().height || 0;
  const activeLine = window.scrollY + headerHeight + sectionTopGap + 8;
  const pageBottom = window.scrollY + window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;
  let activeHeading = policyHeadings[0];

  if (pageBottom >= documentHeight - 4) {
    return policyHeadings[policyHeadings.length - 1]?.id;
  }

  policyHeadings.forEach((heading) => {
    if (getPolicyHeadingTop(heading) <= activeLine) {
      activeHeading = heading;
    }
  });

  return activeHeading?.id;
};

let isPolicyNavSyncQueued = false;

const syncActivePolicyNavLink = () => {
  if (isPolicyNavSyncQueued) {
    return;
  }

  isPolicyNavSyncQueued = true;

  window.requestAnimationFrame(() => {
    isPolicyNavSyncQueued = false;
    const activeHeadingId = getActivePolicyHeadingId();

    if (activeHeadingId) {
      setActivePolicyNavLink(activeHeadingId);
    }
  });
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
    "sectionLocalStorageList5",
    "sectionLocalStorageList6"
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

  syncActivePolicyNavLink();
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

if (policyHeadings.length > 0) {
  syncActivePolicyNavLink();
  window.addEventListener("scroll", syncActivePolicyNavLink, { passive: true });
  window.addEventListener("resize", syncActivePolicyNavLink);
}

initFloatingTools();
initLanguageDialog({
  onChange: applyPrivacyLanguage,
  storageKey: "recarregaAiPageLanguage"
});

loadPrivacyTheme().catch((error) => {
  console.error("Erro ao carregar tema da privacidade:", error);
});
