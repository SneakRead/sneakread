// Dependency-free i18n. Language is detected once from the browser and drives
// only SneakRead's own conversational layer (onboarding, command menu, welcome,
// loading). The disguise chrome stays in its native app language.

export type Lang = 'en' | 'zh' | 'es' | 'hi' | 'ar' | 'pt' | 'ru' | 'ja' | 'fr' | 'de'

const LANGS: Lang[] = ['en', 'zh', 'es', 'hi', 'ar', 'pt', 'ru', 'ja', 'fr', 'de']
const RTL_LANGS: Lang[] = ['ar']

export const langKey = 'sneakread-lang'

export function detectLang(): Lang {
  // A user's explicit choice (from the File ▸ Language menu) wins over the browser.
  let saved: string | null = null
  try {
    saved = typeof localStorage !== 'undefined' ? localStorage.getItem(langKey) : null
  } catch {
    saved = null
  }
  if (saved && LANGS.includes(saved as Lang)) return saved as Lang
  const raw =
    (typeof navigator !== 'undefined' &&
      ((navigator.languages && navigator.languages[0]) || navigator.language)) ||
    'en'
  const code = raw.toLowerCase().split('-')[0]
  return (LANGS.includes(code as Lang) ? code : 'en') as Lang
}

export const LANG_NAMES: Record<Lang, string> = {
  en: 'English',
  zh: '中文',
  es: 'Español',
  hi: 'हिन्दी',
  ar: 'العربية',
  pt: 'Português',
  ru: 'Русский',
  ja: '日本語',
  fr: 'Français',
  de: 'Deutsch',
}

export const ALL_LANGS = LANGS

type Dict = Record<string, string>

const en: Dict = {
  onboardTitle: 'Turn any web page into work',
  onboardBody:
    'Paste a link and SneakRead disguises it full-screen as VS Code, Word, Docs, Notion, Slack, Lark, a spreadsheet, or email — so you can read anything while looking busy.',
  onboardK: 'Command menu — open a link, switch apps, go fullscreen, hide',
  onboardEsc: 'Boss key — flip to a budget sheet instantly; press again to restore',
  onboardFull: 'Click any link to keep browsing, still disguised',
  onboardStart: 'Start reading',
  onboardOnce: 'Shown only once',
  palettePlaceholder: 'Paste a URL, or type a command…',
  paletteEmpty: 'No matching commands',
  openAs: 'Open as {app}',
  cmdRefresh: 'Refresh from source',
  cmdCopy: 'Copy source text',
  cmdOriginal: 'Open original page',
  cmdFullscreen: 'Toggle fullscreen',
  cmdFullscreenHint: 'Hide the browser chrome',
  bossOn: 'Boss auto-hide: on',
  bossOff: 'Boss auto-hide: off',
  bossHint: 'Switch to a safe sheet when the window loses focus',
  cmdPanic: 'Panic — open budget sheet',
  itemOpen: 'Open',
  sample: 'sample',
  wTagline: 'Editing evolved',
  wStart: 'Start',
  wNew: 'New File…',
  wOpenUrl: 'Open URL…',
  wClone: 'Clone Git Repository…',
  wRecent: 'Recent',
  wEmptyRecent: 'paste a link to open it',
  wTip: 'open a link, switch apps, or hide your screen',
  wNoFiles: 'No files opened yet',
  homeOpenAs: 'Open as',
  homeDevPick: 'Dev pick',
  loadTitle: 'Opening…',
  loadHint: 'Fetching readable text through the reader — usually a few seconds',
  loadCancel: 'Cancel',
}

const zh: Dict = {
  onboardTitle: '把任何网页，变成正经工作',
  onboardBody:
    '粘贴一个链接，摸鱼会把它整屏伪装成 VS Code、Word、文档、Notion、Slack、飞书、表格或邮件——让你边摸鱼边像在干活。',
  onboardK: '命令菜单——打开链接、切换软件、全屏、隐藏',
  onboardEsc: '老板键——一键切成预算表，再按一次恢复',
  onboardFull: '点任意链接继续浏览，依旧是伪装状态',
  onboardStart: '开始阅读',
  onboardOnce: '只出现这一次',
  palettePlaceholder: '粘贴网址，或输入命令…',
  paletteEmpty: '没有匹配的命令',
  openAs: '以 {app} 打开',
  cmdRefresh: '从源重新抓取',
  cmdCopy: '复制原文',
  cmdOriginal: '打开原始网页',
  cmdFullscreen: '切换全屏',
  cmdFullscreenHint: '连浏览器界面一起藏掉',
  bossOn: '失焦自动隐藏：开',
  bossOff: '失焦自动隐藏：关',
  bossHint: '窗口失去焦点时自动切到安全表格',
  cmdPanic: '一键遮盖——打开预算表',
  itemOpen: '打开',
  sample: '示例',
  wTagline: 'Editing evolved',
  wStart: '开始',
  wNew: '新建文件…',
  wOpenUrl: '打开网址…',
  wClone: '克隆 Git 仓库…',
  wRecent: '最近',
  wEmptyRecent: '粘贴一个链接即可打开',
  wTip: '打开链接、切换软件，或一键遮屏',
  wNoFiles: '还没有打开任何文件',
  homeOpenAs: '打开为…',
  homeDevPick: '程序员最爱',
  loadTitle: '正在打开…',
  loadHint: '正在通过阅读器抓取正文——通常几秒钟',
  loadCancel: '取消',
}

const es: Dict = {
  onboardTitle: 'Convierte cualquier web en trabajo',
  onboardBody:
    'Pega un enlace y SneakRead lo disfraza a pantalla completa como VS Code, Word, Docs, Notion, Slack, Lark, una hoja de cálculo o correo, para que leas lo que sea sin dejar de parecer ocupado.',
  onboardK: 'Menú de comandos: abrir un enlace, cambiar de app, pantalla completa, ocultar',
  onboardEsc: 'Tecla del jefe: cambia al instante a una hoja de presupuesto; púlsala de nuevo para volver',
  onboardFull: 'Haz clic en cualquier enlace para seguir navegando, aún disfrazado',
  onboardStart: 'Empezar a leer',
  onboardOnce: 'Se muestra solo una vez',
  palettePlaceholder: 'Pega una URL o escribe un comando…',
  paletteEmpty: 'No hay comandos que coincidan',
  openAs: 'Abrir como {app}',
  cmdRefresh: 'Recargar desde el origen',
  cmdCopy: 'Copiar el texto original',
  cmdOriginal: 'Abrir la página original',
  cmdFullscreen: 'Pantalla completa',
  cmdFullscreenHint: 'Ocultar la interfaz del navegador',
  bossOn: 'Ocultar al jefe: activado',
  bossOff: 'Ocultar al jefe: desactivado',
  bossHint: 'Cambiar a una hoja segura cuando la ventana pierde el foco',
  cmdPanic: 'Pánico: abrir hoja de presupuesto',
  itemOpen: 'Abrir',
  sample: 'ejemplo',
  wTagline: 'Editing evolved',
  wStart: 'Inicio',
  wNew: 'Nuevo archivo…',
  wOpenUrl: 'Abrir URL…',
  wClone: 'Clonar repositorio Git…',
  wRecent: 'Recientes',
  wEmptyRecent: 'pega un enlace para abrirlo',
  wTip: 'abrir un enlace, cambiar de app u ocultar la pantalla',
  wNoFiles: 'Aún no se ha abierto ningún archivo',
  homeOpenAs: 'Abrir como',
  homeDevPick: 'Favorito dev',
  loadTitle: 'Abriendo…',
  loadHint: 'Obteniendo el texto a través del lector; suele tardar unos segundos',
  loadCancel: 'Cancelar',
}

const hi: Dict = {
  onboardTitle: 'किसी भी वेब पेज को काम में बदलें',
  onboardBody:
    'एक लिंक पेस्ट करें और SneakRead उसे पूरे स्क्रीन पर VS Code, Word, Docs, Notion, Slack, Lark, स्प्रेडशीट या ईमेल जैसा बना देता है — ताकि आप व्यस्त दिखते हुए कुछ भी पढ़ सकें।',
  onboardK: 'कमांड मेनू — लिंक खोलें, ऐप बदलें, फुलस्क्रीन, छिपाएँ',
  onboardEsc: 'बॉस की — तुरंत बजट शीट पर जाएँ; वापस लाने के लिए फिर दबाएँ',
  onboardFull: 'ब्राउज़िंग जारी रखने के लिए किसी भी लिंक पर क्लिक करें, फिर भी छद्म रूप में',
  onboardStart: 'पढ़ना शुरू करें',
  onboardOnce: 'सिर्फ़ एक बार दिखेगा',
  palettePlaceholder: 'URL पेस्ट करें, या कमांड लिखें…',
  paletteEmpty: 'कोई मिलती-जुलती कमांड नहीं',
  openAs: '{app} के रूप में खोलें',
  cmdRefresh: 'स्रोत से फिर लोड करें',
  cmdCopy: 'मूल टेक्स्ट कॉपी करें',
  cmdOriginal: 'मूल पेज खोलें',
  cmdFullscreen: 'फुलस्क्रीन टॉगल करें',
  cmdFullscreenHint: 'ब्राउज़र इंटरफ़ेस छिपाएँ',
  bossOn: 'बॉस ऑटो-हाइड: चालू',
  bossOff: 'बॉस ऑटो-हाइड: बंद',
  bossHint: 'विंडो फोकस खोने पर सुरक्षित शीट पर स्विच करें',
  cmdPanic: 'पैनिक — बजट शीट खोलें',
  itemOpen: 'खोलें',
  sample: 'नमूना',
  wTagline: 'Editing evolved',
  wStart: 'शुरू',
  wNew: 'नई फ़ाइल…',
  wOpenUrl: 'URL खोलें…',
  wClone: 'Git रिपॉज़िटरी क्लोन करें…',
  wRecent: 'हाल के',
  wEmptyRecent: 'खोलने के लिए एक लिंक पेस्ट करें',
  wTip: 'लिंक खोलें, ऐप बदलें, या स्क्रीन छिपाएँ',
  wNoFiles: 'अभी तक कोई फ़ाइल नहीं खोली गई',
  homeOpenAs: 'इस रूप में खोलें',
  homeDevPick: 'डेव पसंद',
  loadTitle: 'खुल रहा है…',
  loadHint: 'रीडर के ज़रिए टेक्स्ट लाया जा रहा है — आमतौर पर कुछ सेकंड',
  loadCancel: 'रद्द करें',
}

const ar: Dict = {
  onboardTitle: 'حوّل أي صفحة ويب إلى عمل',
  onboardBody:
    'الصق رابطًا وسيموّهه SneakRead بملء الشاشة كأنه VS Code أو Word أو Docs أو Notion أو Slack أو Lark أو جدول بيانات أو بريد — لتقرأ أي شيء بينما تبدو مشغولًا.',
  onboardK: 'قائمة الأوامر — افتح رابطًا، بدّل التطبيقات، ملء الشاشة، إخفاء',
  onboardEsc: 'زر المدير — انتقل فورًا إلى جدول ميزانية؛ اضغط مرة أخرى للعودة',
  onboardFull: 'انقر أي رابط لمواصلة التصفّح، وأنت متخفٍّ',
  onboardStart: 'ابدأ القراءة',
  onboardOnce: 'يظهر مرة واحدة فقط',
  palettePlaceholder: 'الصق رابطًا أو اكتب أمرًا…',
  paletteEmpty: 'لا توجد أوامر مطابقة',
  openAs: 'فتح كـ {app}',
  cmdRefresh: 'إعادة التحميل من المصدر',
  cmdCopy: 'نسخ النص الأصلي',
  cmdOriginal: 'فتح الصفحة الأصلية',
  cmdFullscreen: 'تبديل ملء الشاشة',
  cmdFullscreenHint: 'إخفاء واجهة المتصفح',
  bossOn: 'الإخفاء التلقائي: مفعّل',
  bossOff: 'الإخفاء التلقائي: متوقف',
  bossHint: 'التبديل إلى جدول آمن عند فقدان النافذة للتركيز',
  cmdPanic: 'إخفاء سريع — فتح جدول الميزانية',
  itemOpen: 'فتح',
  sample: 'مثال',
  wTagline: 'Editing evolved',
  wStart: 'ابدأ',
  wNew: 'ملف جديد…',
  wOpenUrl: 'فتح رابط…',
  wClone: 'استنساخ مستودع Git…',
  wRecent: 'الأخيرة',
  wEmptyRecent: 'الصق رابطًا لفتحه',
  wTip: 'افتح رابطًا، بدّل التطبيقات، أو أخفِ الشاشة',
  wNoFiles: 'لم يتم فتح أي ملف بعد',
  homeOpenAs: 'افتح كـ',
  homeDevPick: 'اختيار المطوّر',
  loadTitle: 'جارٍ الفتح…',
  loadHint: 'يتم جلب النص عبر القارئ — عادةً بضع ثوانٍ',
  loadCancel: 'إلغاء',
}

const pt: Dict = {
  onboardTitle: 'Transforme qualquer página em trabalho',
  onboardBody:
    'Cole um link e o SneakRead o disfarça em tela cheia como VS Code, Word, Docs, Notion, Slack, Lark, uma planilha ou e-mail — para você ler qualquer coisa parecendo ocupado.',
  onboardK: 'Menu de comandos: abrir um link, trocar de app, tela cheia, ocultar',
  onboardEsc: 'Tecla do chefe: pula na hora para uma planilha de orçamento; pressione de novo para voltar',
  onboardFull: 'Clique em qualquer link para continuar navegando, ainda disfarçado',
  onboardStart: 'Começar a ler',
  onboardOnce: 'Mostrado apenas uma vez',
  palettePlaceholder: 'Cole uma URL ou digite um comando…',
  paletteEmpty: 'Nenhum comando correspondente',
  openAs: 'Abrir como {app}',
  cmdRefresh: 'Recarregar da origem',
  cmdCopy: 'Copiar o texto de origem',
  cmdOriginal: 'Abrir a página original',
  cmdFullscreen: 'Alternar tela cheia',
  cmdFullscreenHint: 'Ocultar a interface do navegador',
  bossOn: 'Ocultar do chefe: ativado',
  bossOff: 'Ocultar do chefe: desativado',
  bossHint: 'Mudar para uma planilha segura quando a janela perde o foco',
  cmdPanic: 'Pânico — abrir planilha de orçamento',
  itemOpen: 'Abrir',
  sample: 'exemplo',
  wTagline: 'Editing evolved',
  wStart: 'Início',
  wNew: 'Novo arquivo…',
  wOpenUrl: 'Abrir URL…',
  wClone: 'Clonar repositório Git…',
  wRecent: 'Recentes',
  wEmptyRecent: 'cole um link para abri-lo',
  wTip: 'abrir um link, trocar de app ou ocultar a tela',
  wNoFiles: 'Nenhum arquivo aberto ainda',
  homeOpenAs: 'Abrir como',
  homeDevPick: 'Favorito dev',
  loadTitle: 'Abrindo…',
  loadHint: 'Buscando o texto pelo leitor — geralmente alguns segundos',
  loadCancel: 'Cancelar',
}

const ru: Dict = {
  onboardTitle: 'Превратите любую веб-страницу в работу',
  onboardBody:
    'Вставьте ссылку, и SneakRead замаскирует её на весь экран под VS Code, Word, Docs, Notion, Slack, Lark, таблицу или почту — читайте что угодно, оставаясь «занятым».',
  onboardK: 'Меню команд — открыть ссылку, сменить приложение, полный экран, скрыть',
  onboardEsc: 'Кнопка «босс» — мгновенно к таблице бюджета; нажмите ещё раз, чтобы вернуться',
  onboardFull: 'Нажимайте на ссылки, чтобы продолжать просмотр, оставаясь замаскированным',
  onboardStart: 'Начать чтение',
  onboardOnce: 'Показывается только один раз',
  palettePlaceholder: 'Вставьте URL или введите команду…',
  paletteEmpty: 'Нет подходящих команд',
  openAs: 'Открыть как {app}',
  cmdRefresh: 'Обновить из источника',
  cmdCopy: 'Копировать исходный текст',
  cmdOriginal: 'Открыть исходную страницу',
  cmdFullscreen: 'Полный экран',
  cmdFullscreenHint: 'Скрыть интерфейс браузера',
  bossOn: 'Автоскрытие: вкл',
  bossOff: 'Автоскрытие: выкл',
  bossHint: 'Переключаться на безопасную таблицу, когда окно теряет фокус',
  cmdPanic: 'Паника — открыть таблицу бюджета',
  itemOpen: 'Открыть',
  sample: 'пример',
  wTagline: 'Editing evolved',
  wStart: 'Начало',
  wNew: 'Создать файл…',
  wOpenUrl: 'Открыть URL…',
  wClone: 'Клонировать репозиторий Git…',
  wRecent: 'Недавние',
  wEmptyRecent: 'вставьте ссылку, чтобы открыть',
  wTip: 'открыть ссылку, сменить приложение или скрыть экран',
  wNoFiles: 'Файлы ещё не открывались',
  homeOpenAs: 'Открыть как',
  homeDevPick: 'Выбор разработчиков',
  loadTitle: 'Открытие…',
  loadHint: 'Загружаем текст через ридер — обычно несколько секунд',
  loadCancel: 'Отмена',
}

const ja: Dict = {
  onboardTitle: 'どんなウェブページも仕事に変える',
  onboardBody:
    'リンクを貼ると、SneakRead が全画面で VS Code・Word・ドキュメント・Notion・Slack・Lark・表計算・メールに偽装します。忙しそうに見せながら何でも読めます。',
  onboardK: 'コマンドメニュー — リンクを開く、アプリ切替、全画面、隠す',
  onboardEsc: 'ボスキー — 即座に予算シートへ。もう一度押すと元に戻ります',
  onboardFull: 'リンクをクリックすれば、偽装したまま読み進められます',
  onboardStart: '読み始める',
  onboardOnce: '最初の一回だけ表示されます',
  palettePlaceholder: 'URL を貼り付けるか、コマンドを入力…',
  paletteEmpty: '一致するコマンドがありません',
  openAs: '{app} として開く',
  cmdRefresh: 'ソースから再取得',
  cmdCopy: '元のテキストをコピー',
  cmdOriginal: '元のページを開く',
  cmdFullscreen: '全画面を切り替え',
  cmdFullscreenHint: 'ブラウザの枠も隠す',
  bossOn: 'ボス自動隠し：オン',
  bossOff: 'ボス自動隠し：オフ',
  bossHint: 'ウィンドウのフォーカスが外れたら安全なシートに切替',
  cmdPanic: 'パニック — 予算シートを開く',
  itemOpen: '開く',
  sample: 'サンプル',
  wTagline: 'Editing evolved',
  wStart: '開始',
  wNew: '新しいファイル…',
  wOpenUrl: 'URL を開く…',
  wClone: 'Git リポジトリをクローン…',
  wRecent: '最近',
  wEmptyRecent: 'リンクを貼ると開けます',
  wTip: 'リンクを開く、アプリ切替、画面を隠す',
  wNoFiles: 'まだファイルを開いていません',
  homeOpenAs: '別のアプリで開く',
  homeDevPick: '開発者に人気',
  loadTitle: '開いています…',
  loadHint: 'リーダー経由で本文を取得中 — 通常は数秒です',
  loadCancel: 'キャンセル',
}

const fr: Dict = {
  onboardTitle: 'Transformez n’importe quelle page en travail',
  onboardBody:
    'Collez un lien et SneakRead le déguise en plein écran en VS Code, Word, Docs, Notion, Slack, Lark, un tableur ou un e-mail — pour lire n’importe quoi tout en ayant l’air occupé.',
  onboardK: 'Menu de commandes : ouvrir un lien, changer d’appli, plein écran, masquer',
  onboardEsc: 'Touche patron : bascule aussitôt vers un tableau de budget ; appuyez encore pour revenir',
  onboardFull: 'Cliquez sur un lien pour continuer à naviguer, toujours déguisé',
  onboardStart: 'Commencer à lire',
  onboardOnce: 'Affiché une seule fois',
  palettePlaceholder: 'Collez une URL ou tapez une commande…',
  paletteEmpty: 'Aucune commande correspondante',
  openAs: 'Ouvrir comme {app}',
  cmdRefresh: 'Recharger depuis la source',
  cmdCopy: 'Copier le texte source',
  cmdOriginal: 'Ouvrir la page d’origine',
  cmdFullscreen: 'Basculer en plein écran',
  cmdFullscreenHint: 'Masquer l’interface du navigateur',
  bossOn: 'Masquage patron : activé',
  bossOff: 'Masquage patron : désactivé',
  bossHint: 'Basculer vers un tableau sûr quand la fenêtre perd le focus',
  cmdPanic: 'Panique — ouvrir le tableau de budget',
  itemOpen: 'Ouvrir',
  sample: 'exemple',
  wTagline: 'Editing evolved',
  wStart: 'Démarrer',
  wNew: 'Nouveau fichier…',
  wOpenUrl: 'Ouvrir une URL…',
  wClone: 'Cloner un dépôt Git…',
  wRecent: 'Récents',
  wEmptyRecent: 'collez un lien pour l’ouvrir',
  wTip: 'ouvrir un lien, changer d’appli ou masquer l’écran',
  wNoFiles: 'Aucun fichier ouvert pour l’instant',
  homeOpenAs: 'Ouvrir en',
  homeDevPick: 'Choix des devs',
  loadTitle: 'Ouverture…',
  loadHint: 'Récupération du texte via le lecteur — quelques secondes en général',
  loadCancel: 'Annuler',
}

const de: Dict = {
  onboardTitle: 'Verwandle jede Webseite in Arbeit',
  onboardBody:
    'Füge einen Link ein und SneakRead tarnt ihn im Vollbild als VS Code, Word, Docs, Notion, Slack, Lark, Tabelle oder E-Mail — so liest du alles und wirkst beschäftigt.',
  onboardK: 'Befehlsmenü — Link öffnen, App wechseln, Vollbild, ausblenden',
  onboardEsc: 'Chef-Taste — sofort zur Budgettabelle; erneut drücken zum Zurückwechseln',
  onboardFull: 'Klicke auf einen Link, um getarnt weiterzulesen',
  onboardStart: 'Lesen starten',
  onboardOnce: 'Wird nur einmal angezeigt',
  palettePlaceholder: 'URL einfügen oder Befehl eingeben…',
  paletteEmpty: 'Keine passenden Befehle',
  openAs: 'Öffnen als {app}',
  cmdRefresh: 'Von Quelle neu laden',
  cmdCopy: 'Quelltext kopieren',
  cmdOriginal: 'Originalseite öffnen',
  cmdFullscreen: 'Vollbild umschalten',
  cmdFullscreenHint: 'Browser-Oberfläche ausblenden',
  bossOn: 'Chef-Ausblenden: an',
  bossOff: 'Chef-Ausblenden: aus',
  bossHint: 'Zu einer sicheren Tabelle wechseln, wenn das Fenster den Fokus verliert',
  cmdPanic: 'Panik — Budgettabelle öffnen',
  itemOpen: 'Öffnen',
  sample: 'Beispiel',
  wTagline: 'Editing evolved',
  wStart: 'Start',
  wNew: 'Neue Datei…',
  wOpenUrl: 'URL öffnen…',
  wClone: 'Git-Repository klonen…',
  wRecent: 'Zuletzt',
  wEmptyRecent: 'einen Link einfügen zum Öffnen',
  wTip: 'Link öffnen, App wechseln oder Bildschirm ausblenden',
  wNoFiles: 'Noch keine Dateien geöffnet',
  homeOpenAs: 'Öffnen als',
  homeDevPick: 'Dev-Favorit',
  loadTitle: 'Wird geöffnet…',
  loadHint: 'Text wird über den Reader geladen — meist ein paar Sekunden',
  loadCancel: 'Abbrechen',
}

const messages: Record<Lang, Dict> = { en, zh, es, hi, ar, pt, ru, ja, fr, de }

// File-menu labels
const menuExtra: Record<Lang, Dict> = {
  en: { mHome: 'Home', mLanguage: 'Language', mHelp: 'What is SneakRead?' },
  zh: { mHome: '首页', mLanguage: '语言', mHelp: '这是什么？' },
  es: { mHome: 'Inicio', mLanguage: 'Idioma', mHelp: '¿Qué es SneakRead?' },
  hi: { mHome: 'होम', mLanguage: 'भाषा', mHelp: 'SneakRead क्या है?' },
  ar: { mHome: 'الرئيسية', mLanguage: 'اللغة', mHelp: 'ما هو SneakRead؟' },
  pt: { mHome: 'Início', mLanguage: 'Idioma', mHelp: 'O que é o SneakRead?' },
  ru: { mHome: 'Главная', mLanguage: 'Язык', mHelp: 'Что такое SneakRead?' },
  ja: { mHome: 'ホーム', mLanguage: '言語', mHelp: 'SneakRead とは？' },
  fr: { mHome: 'Accueil', mLanguage: 'Langue', mHelp: 'Qu’est-ce que SneakRead ?' },
  de: { mHome: 'Startseite', mLanguage: 'Sprache', mHelp: 'Was ist SneakRead?' },
}
for (const code of LANGS) Object.assign(messages[code], menuExtra[code])

const shareKey: Record<Lang, Dict> = {
  en: { cmdShare: 'Copy share link' },
  zh: { cmdShare: '复制分享链接' },
  es: { cmdShare: 'Copiar enlace para compartir' },
  hi: { cmdShare: 'शेयर लिंक कॉपी करें' },
  ar: { cmdShare: 'نسخ رابط المشاركة' },
  pt: { cmdShare: 'Copiar link de compartilhamento' },
  ru: { cmdShare: 'Копировать ссылку' },
  ja: { cmdShare: '共有リンクをコピー' },
  fr: { cmdShare: 'Copier le lien de partage' },
  de: { cmdShare: 'Freigabelink kopieren' },
}
for (const code of LANGS) Object.assign(messages[code], shareKey[code])

// Reader-source override (advanced): lets a user force a fetch provider when
// the auto pick is blocked on their network. Provider names stay untranslated.
const readerKey: Record<Lang, Dict> = {
  en: { mReader: 'Reader source', mReaderAuto: 'Auto (recommended)' },
  zh: { mReader: '读取来源', mReaderAuto: '自动（推荐）' },
  es: { mReader: 'Fuente del lector', mReaderAuto: 'Automático (recomendado)' },
  hi: { mReader: 'रीडर स्रोत', mReaderAuto: 'स्वतः (अनुशंसित)' },
  ar: { mReader: 'مصدر القارئ', mReaderAuto: 'تلقائي (موصى به)' },
  pt: { mReader: 'Fonte do leitor', mReaderAuto: 'Automático (recomendado)' },
  ru: { mReader: 'Источник чтения', mReaderAuto: 'Авто (рекомендуется)' },
  ja: { mReader: '読み込み元', mReaderAuto: '自動（推奨）' },
  fr: { mReader: 'Source du lecteur', mReaderAuto: 'Auto (recommandé)' },
  de: { mReader: 'Reader-Quelle', mReaderAuto: 'Auto (empfohlen)' },
}
for (const code of LANGS) Object.assign(messages[code], readerKey[code])

// First-run coach-mark pointing at the File menu.
const coachKeys: Record<Lang, Dict> = {
  en: { coachTitle: 'Real menu lives here', coachBody: 'File hides language, share, and the panic key — not just decoration.', coachGot: 'Got it' },
  zh: { coachTitle: '真正的菜单在这里', coachBody: '“文件”里藏着语言、分享和一键老板键，不只是摆设。', coachGot: '知道了' },
  es: { coachTitle: 'El menú real está aquí', coachBody: 'Archivo esconde idioma, compartir y la tecla de pánico, no es decoración.', coachGot: 'Entendido' },
  hi: { coachTitle: 'असली मेन्यू यहाँ है', coachBody: 'File में भाषा, शेयर और पैनिक-की छिपे हैं — सिर्फ़ सजावट नहीं।', coachGot: 'समझ गया' },
  ar: { coachTitle: 'القائمة الحقيقية هنا', coachBody: 'يخفي "ملف" اللغة والمشاركة ومفتاح الطوارئ، وليس مجرد زينة.', coachGot: 'حسناً' },
  pt: { coachTitle: 'O menu real fica aqui', coachBody: 'Arquivo esconde idioma, compartilhar e a tecla de pânico, não é enfeite.', coachGot: 'Entendi' },
  ru: { coachTitle: 'Настоящее меню здесь', coachBody: 'В «Файле» спрятаны язык, отправка и кнопка паники — это не декор.', coachGot: 'Понятно' },
  ja: { coachTitle: '本物のメニューはここ', coachBody: 'ファイルに言語・共有・パニックキーが隠れています。飾りではありません。', coachGot: 'OK' },
  fr: { coachTitle: 'Le vrai menu est ici', coachBody: 'Fichier cache la langue, le partage et la touche panique, pas qu’un décor.', coachGot: 'Compris' },
  de: { coachTitle: 'Das echte Menü ist hier', coachBody: 'Datei verbirgt Sprache, Teilen und die Panik-Taste — keine Deko.', coachGot: 'Alles klar' },
}
for (const code of LANGS) Object.assign(messages[code], coachKeys[code])

// Home CTA (try the VS Code disguise) + footer credits.
const homeKeys: Record<Lang, Dict> = {
  en: { ctaVscode: '👨‍💻 Try the VS Code skin →', openSource: 'Open source (MIT)', builtBy: 'Built by' },
  zh: { ctaVscode: '👨‍💻 试试 VS Code 皮肤（程序员摸鱼神器）→', openSource: '开源（MIT）', builtBy: '作者' },
  es: { ctaVscode: '👨‍💻 Prueba la piel de VS Code →', openSource: 'Código abierto (MIT)', builtBy: 'Creado por' },
  hi: { ctaVscode: '👨‍💻 VS Code स्किन आज़माएँ →', openSource: 'ओपन सोर्स (MIT)', builtBy: 'निर्माता' },
  ar: { ctaVscode: '👨‍💻 جرّب مظهر VS Code →', openSource: 'مفتوح المصدر (MIT)', builtBy: 'من إعداد' },
  pt: { ctaVscode: '👨‍💻 Experimente a skin do VS Code →', openSource: 'Código aberto (MIT)', builtBy: 'Feito por' },
  ru: { ctaVscode: '👨‍💻 Попробуйте скин VS Code →', openSource: 'Открытый код (MIT)', builtBy: 'Автор' },
  ja: { ctaVscode: '👨‍💻 VS Code スキンを試す →', openSource: 'オープンソース (MIT)', builtBy: '作者' },
  fr: { ctaVscode: '👨‍💻 Essayez le skin VS Code →', openSource: 'Open source (MIT)', builtBy: 'Créé par' },
  de: { ctaVscode: '👨‍💻 VS-Code-Skin ausprobieren →', openSource: 'Open Source (MIT)', builtBy: 'Erstellt von' },
}
for (const code of LANGS) Object.assign(messages[code], homeKeys[code])

// Brand name + tagline. The brand is a proper noun kept global (SneakRead),
// except Chinese, which uses the native 摸鱼. Taglines are localized.
const brandTag: Record<Lang, Dict> = {
  en: { brand: 'SneakRead', tagline: 'Read the web. Look busy.' },
  zh: { brand: '摸鱼', tagline: '光明正大地摸鱼' },
  es: { brand: 'SneakRead', tagline: 'Lee la web. Aparenta estar ocupado.' },
  hi: { brand: 'SneakRead', tagline: 'वेब पढ़ें, व्यस्त दिखें।' },
  ar: { brand: 'SneakRead', tagline: 'اقرأ الويب، وابدُ مشغولًا.' },
  pt: { brand: 'SneakRead', tagline: 'Leia a web. Pareça ocupado.' },
  ru: { brand: 'SneakRead', tagline: 'Читай что угодно. Выгляди занятым.' },
  ja: { brand: 'SneakRead', tagline: 'こっそり読む。忙しそうに見せる。' },
  fr: { brand: 'SneakRead', tagline: 'Lisez le web. Ayez l’air occupé.' },
  de: { brand: 'SneakRead', tagline: 'Lies das Web. Wirk beschäftigt.' },
}
for (const code of LANGS) Object.assign(messages[code], brandTag[code])

export const lang: Lang = detectLang()
export const isRtl = RTL_LANGS.includes(lang)

const dict = messages[lang] || en

export function t(key: string, vars?: Record<string, string>): string {
  let value = dict[key] ?? en[key] ?? key
  if (vars) {
    for (const name of Object.keys(vars)) value = value.replace(`{${name}}`, vars[name])
  }
  return value
}

// Translator for an explicit language (used by the per-language landing pages,
// whose language comes from the URL, not the browser).
export function tr(l: Lang, key: string, vars?: Record<string, string>): string {
  const d = messages[l] || en
  let value = d[key] ?? en[key] ?? key
  if (vars) {
    for (const name of Object.keys(vars)) value = value.replace(`{${name}}`, vars[name])
  }
  return value
}

export function langFromPath(pathname: string): Lang {
  const seg = pathname.replace(/^\/+/, '').split('/')[0]
  return (LANGS.includes(seg as Lang) ? seg : 'en') as Lang
}
