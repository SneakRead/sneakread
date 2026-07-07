import type { Lang } from './i18n'

// Marketing copy for the landing pages. Real, semantic text (crawlable).
// Brand + tagline come from i18n; this adds the SEO title/description and the
// Features + FAQ bodies, localized for each language.

export type Feature = { t: string; d: string }
export type Faq = { q: string; a: string }
export type LandingContent = {
  metaTitle: string
  metaDesc: string
  heroSub: string
  cta: string
  featuresTitle: string
  faqTitle: string
  features: Feature[]
  faqs: Faq[]
}

const content: Record<Lang, LandingContent> = {
  en: {
    metaTitle: 'Look Busy at Work: Fake VS Code & Word Screens | SneakRead',
    metaDesc:
      'Pretend to work while reading anything. SneakRead disguises any page as VS Code, Word, Google Docs, Notion or Slack — free, in-browser, with an Esc boss key.',
    heroSub: 'Paste any link. SneakRead makes it look like real work — so you can read anything at your desk.',
    cta: 'Open SneakRead',
    featuresTitle: 'Features',
    faqTitle: 'FAQ',
    features: [
      { t: '14 disguises', d: 'VS Code, Claude Code, Word, WPS, Notion, Slack, Lark, DingTalk, Teams, Gmail and more — full screen.' },
      { t: 'One-key boss screen', d: 'Press Esc to flip to a budget spreadsheet instantly.' },
      { t: 'Read any URL', d: 'Paste a link and get clean, readable text.' },
      { t: 'Browse disguised', d: 'Click links to keep reading, without leaving the disguise.' },
    ],
    faqs: [
      { q: 'Is SneakRead free?', a: 'Yes — it runs entirely in your browser.' },
      { q: 'Can my boss see the real page?', a: 'No. Only the disguise shows, and Esc hides it instantly.' },
      { q: 'Do you store what I read?', a: 'No. Recent files stay in your browser only.' },
      { q: 'Which apps can it mimic?', a: 'VS Code, Claude Code, Word, WPS, Google Docs, Notion, Slack, Lark, DingTalk, Teams, Gmail, Excel, and Outlook.' },
    ],
  },
  zh: {
    metaTitle: '摸鱼网站 SneakRead — 上班摸鱼神器，一键老板键，把网页伪装成 VS Code/Word/飞书',
    metaDesc:
      '免费摸鱼网站：小说、论坛、任意网页整屏伪装成 VS Code、Word、飞书、Notion，看起来在认真工作；按 Esc 老板键秒切预算表，无需安装。',
    heroSub: '粘贴任意链接，摸鱼把它变成一份正经工作的样子——上班也能读任何东西。',
    cta: '开始摸鱼',
    featuresTitle: '功能',
    faqTitle: '常见问题',
    features: [
      { t: '14 种伪装', d: 'VS Code、Claude Code、Word、WPS、Notion、飞书、钉钉、Slack、Teams、Gmail 等 14 种，整屏还原。' },
      { t: '一键老板键', d: '按 Esc 瞬间切成预算表。' },
      { t: '读任意网址', d: '粘贴链接，得到干净可读的正文。' },
      { t: '伪装着浏览', d: '点链接接着读，全程不脱伪装。' },
    ],
    faqs: [
      { q: '摸鱼收费吗？', a: '免费，全部在你的浏览器里运行。' },
      { q: '老板会看到真实网页吗？', a: '不会。只显示伪装，按 Esc 立刻隐藏。' },
      { q: '会保存我读了什么吗？', a: '不会。最近文件只存在你本地浏览器。' },
      { q: '能伪装成哪些软件？', a: 'VS Code、Claude Code、Word、WPS 文字、Google 文档、Notion、Slack、飞书、飞书文档、钉钉、Teams、Gmail、Excel、Outlook。' },
    ],
  },
  es: {
    metaTitle: 'Finge que Trabajas: VS Code y Word Falsos | SneakRead',
    metaDesc:
      'Lee lo que quieras pareciendo ocupado: SneakRead disfraza cualquier página como VS Code, Word, Docs o Notion. Gratis, sin instalar, con botón del jefe (Esc).',
    heroSub: 'Pega un enlace. SneakRead lo hace parecer trabajo de verdad, para que leas lo que sea en tu escritorio.',
    cta: 'Abrir SneakRead',
    featuresTitle: 'Funciones',
    faqTitle: 'Preguntas frecuentes',
    features: [
      { t: '14 disfraces', d: 'VS Code, Claude Code, Word, WPS, Notion, Slack, Teams, Gmail y más, a pantalla completa.' },
      { t: 'Tecla del jefe', d: 'Pulsa Esc para cambiar al instante a una hoja de presupuesto.' },
      { t: 'Lee cualquier URL', d: 'Pega un enlace y obtén un texto limpio y legible.' },
      { t: 'Navega disfrazado', d: 'Haz clic en los enlaces para seguir leyendo, sin salir del disfraz.' },
    ],
    faqs: [
      { q: '¿SneakRead es gratis?', a: 'Sí, funciona por completo en tu navegador.' },
      { q: '¿Mi jefe puede ver la página real?', a: 'No. Solo se ve el disfraz, y Esc lo oculta al instante.' },
      { q: '¿Guardan lo que leo?', a: 'No. Los archivos recientes quedan solo en tu navegador.' },
      { q: '¿Qué apps puede imitar?', a: 'VS Code, Claude Code, Word, WPS, Google Docs, Notion, Slack, Lark, DingTalk, Teams, Gmail, Excel y Outlook.' },
    ],
  },
  hi: {
    metaTitle: 'ऑफिस में Busy दिखें: नकली VS Code और Word स्क्रीन | SneakRead',
    metaDesc:
      'काम पर कुछ भी पढ़ें और व्यस्त दिखें: SneakRead किसी भी पेज को VS Code, Word, Google Docs या Notion जैसा दिखा देता है — मुफ़्त, बिना इंस्टॉल, Esc बॉस-की के साथ।',
    heroSub: 'कोई भी लिंक पेस्ट करें। SneakRead उसे असली काम जैसा बना देता है — ताकि आप डेस्क पर कुछ भी पढ़ सकें।',
    cta: 'SneakRead खोलें',
    featuresTitle: 'विशेषताएँ',
    faqTitle: 'अक्सर पूछे जाने वाले प्रश्न',
    features: [
      { t: '14 भेस', d: 'VS Code, Claude Code, Word, WPS, Notion, Slack, Teams, Gmail और अधिक — पूरी स्क्रीन।' },
      { t: 'बॉस की', d: 'बजट शीट पर तुरंत जाने के लिए Esc दबाएँ।' },
      { t: 'कोई भी URL पढ़ें', d: 'लिंक पेस्ट करें और साफ़, पठनीय टेक्स्ट पाएँ।' },
      { t: 'भेस में ब्राउज़ करें', d: 'भेस छोड़े बिना पढ़ते रहने के लिए लिंक पर क्लिक करें।' },
    ],
    faqs: [
      { q: 'क्या SneakRead मुफ़्त है?', a: 'हाँ, यह पूरी तरह आपके ब्राउज़र में चलता है।' },
      { q: 'क्या मेरा बॉस असली पेज देख सकता है?', a: 'नहीं। सिर्फ़ भेस दिखता है, और Esc उसे तुरंत छिपा देता है।' },
      { q: 'क्या आप सहेजते हैं कि मैं क्या पढ़ता हूँ?', a: 'नहीं। हाल की फ़ाइलें सिर्फ़ आपके ब्राउज़र में रहती हैं।' },
      { q: 'यह कौन-से ऐप की नकल कर सकता है?', a: 'VS Code, Claude Code, Word, WPS, Google Docs, Notion, Slack, Lark, DingTalk, Teams, Gmail, Excel और Outlook।' },
    ],
  },
  ar: {
    metaTitle: 'تظاهر بالانشغال في العمل: شاشات VS Code وWord مزيّفة | SneakRead',
    metaDesc:
      'اقرأ ما تشاء في العمل وأنت تبدو مشغولًا: يموّه SneakRead أي صفحة كأنها VS Code أو Word أو Docs أو Notion — مجانًا في المتصفح، دون تثبيت، مع زر المدير Esc.',
    heroSub: 'الصق أي رابط. يجعله SneakRead يبدو كعمل حقيقي — لتقرأ أي شيء على مكتبك.',
    cta: 'افتح SneakRead',
    featuresTitle: 'المزايا',
    faqTitle: 'الأسئلة الشائعة',
    features: [
      { t: '14 قناعًا', d: 'VS Code وClaude Code وWord وWPS وNotion وSlack وTeams وGmail والمزيد — بملء الشاشة.' },
      { t: 'زر المدير', d: 'اضغط Esc للانتقال فورًا إلى جدول ميزانية.' },
      { t: 'اقرأ أي رابط', d: 'الصق رابطًا واحصل على نص نظيف قابل للقراءة.' },
      { t: 'تصفّح متخفّيًا', d: 'انقر الروابط لمواصلة القراءة دون مغادرة القناع.' },
    ],
    faqs: [
      { q: 'هل SneakRead مجاني؟', a: 'نعم، يعمل بالكامل داخل متصفّحك.' },
      { q: 'هل يرى مديري الصفحة الحقيقية؟', a: 'لا. يظهر القناع فقط، ويخفيه Esc فورًا.' },
      { q: 'هل تحفظون ما أقرأه؟', a: 'لا. تبقى الملفات الأخيرة في متصفّحك فقط.' },
      { q: 'أي تطبيقات يمكنه محاكاتها؟', a: 'VS Code وClaude Code وWord وWPS وGoogle Docs وNotion وSlack وLark وDingTalk وTeams وGmail وExcel وOutlook.' },
    ],
  },
  pt: {
    metaTitle: 'Finja que Está Trabalhando: VS Code e Word Falsos | SneakRead',
    metaDesc:
      'Leia qualquer coisa parecendo ocupado: o SneakRead disfarça qualquer página como VS Code, Word, Docs ou Notion. Grátis, sem instalar, com botão do chefe (Esc).',
    heroSub: 'Cole um link. O SneakRead faz parecer trabalho de verdade — para você ler qualquer coisa na sua mesa.',
    cta: 'Abrir SneakRead',
    featuresTitle: 'Recursos',
    faqTitle: 'Perguntas frequentes',
    features: [
      { t: '14 disfarces', d: 'VS Code, Claude Code, Word, WPS, Notion, Slack, Teams, Gmail e mais — em tela cheia.' },
      { t: 'Tecla do chefe', d: 'Pressione Esc para pular na hora para uma planilha de orçamento.' },
      { t: 'Leia qualquer URL', d: 'Cole um link e receba um texto limpo e legível.' },
      { t: 'Navegue disfarçado', d: 'Clique nos links para continuar lendo, sem sair do disfarce.' },
    ],
    faqs: [
      { q: 'O SneakRead é grátis?', a: 'Sim, roda inteiramente no seu navegador.' },
      { q: 'Meu chefe vê a página real?', a: 'Não. Só o disfarce aparece, e Esc o esconde na hora.' },
      { q: 'Vocês guardam o que eu leio?', a: 'Não. Os arquivos recentes ficam só no seu navegador.' },
      { q: 'Quais apps ele imita?', a: 'VS Code, Claude Code, Word, WPS, Google Docs, Notion, Slack, Lark, DingTalk, Teams, Gmail, Excel e Outlook.' },
    ],
  },
  ru: {
    metaTitle: 'Делай вид, что работаешь: фейковые VS Code и Word | SneakRead',
    metaDesc:
      'Читайте что угодно на работе, выглядя занятым: SneakRead маскирует любую страницу под VS Code, Word, Docs или Notion. Бесплатно, в браузере, босс-клавиша Esc.',
    heroSub: 'Вставьте ссылку. SneakRead сделает её похожей на настоящую работу — читайте что угодно за рабочим столом.',
    cta: 'Открыть SneakRead',
    featuresTitle: 'Возможности',
    faqTitle: 'Вопросы и ответы',
    features: [
      { t: '14 маскировок', d: 'VS Code, Claude Code, Word, WPS, Notion, Slack, Teams, Gmail и другие — на весь экран.' },
      { t: 'Кнопка «босс»', d: 'Нажмите Esc, чтобы мгновенно переключиться на таблицу бюджета.' },
      { t: 'Читайте любой URL', d: 'Вставьте ссылку и получите чистый читаемый текст.' },
      { t: 'Просмотр под прикрытием', d: 'Кликайте по ссылкам и читайте дальше, не снимая маскировку.' },
    ],
    faqs: [
      { q: 'SneakRead бесплатный?', a: 'Да, он работает полностью в вашем браузере.' },
      { q: 'Увидит ли начальник настоящую страницу?', a: 'Нет. Видна только маскировка, а Esc скрывает её мгновенно.' },
      { q: 'Вы храните, что я читаю?', a: 'Нет. Недавние файлы остаются только в вашем браузере.' },
      { q: 'Какие приложения он имитирует?', a: 'VS Code, Claude Code, Word, WPS, Google Docs, Notion, Slack, Lark, DingTalk, Teams, Gmail, Excel и Outlook.' },
    ],
  },
  ja: {
    metaTitle: '仕事してるフリで何でも読める：偽 VS Code・Word 画面 | SneakRead',
    metaDesc:
      '働いているフリをしながら小説もブログも読める無料ツール。SneakRead はどんなページも VS Code・Word・Google ドキュメント・Notion に偽装。Esc の「ボスが来た」キーで瞬時に予算表へ。インストール不要。',
    heroSub: 'リンクを貼るだけ。SneakRead が本物の仕事のように見せるので、デスクで何でも読めます。',
    cta: 'SneakRead を開く',
    featuresTitle: '機能',
    faqTitle: 'よくある質問',
    features: [
      { t: '14 種類の偽装', d: 'VS Code・Claude Code・Word・WPS・Notion・Slack・Teams・Gmail など全画面で。' },
      { t: 'ボスキー', d: 'Esc で即座に予算シートへ切り替え。' },
      { t: 'どんな URL も読む', d: 'リンクを貼れば、読みやすい本文に。' },
      { t: '偽装したまま閲覧', d: 'リンクをクリックして、偽装を保ったまま読み進め。' },
    ],
    faqs: [
      { q: 'SneakRead は無料ですか？', a: 'はい、すべてブラウザ内で動作します。' },
      { q: '上司に本物のページは見えますか？', a: 'いいえ。偽装だけが表示され、Esc で即座に隠せます。' },
      { q: '読んだ内容を保存しますか？', a: 'いいえ。最近のファイルはブラウザ内にのみ残ります。' },
      { q: 'どのアプリに偽装できますか？', a: 'VS Code・Claude Code・Word・WPS・Google ドキュメント・Notion・Slack・Lark・DingTalk・Teams・Gmail・Excel・Outlook。' },
    ],
  },
  fr: {
    metaTitle: 'Faire semblant de travailler : faux VS Code et Word | SneakRead',
    metaDesc:
      'Lisez tout en ayant l’air occupé : SneakRead déguise n’importe quelle page en VS Code, Word, Docs ou Notion. Gratuit, sans installation, touche patron (Échap).',
    heroSub: 'Collez un lien. SneakRead lui donne l’air d’un vrai travail — pour lire tout ce que vous voulez à votre bureau.',
    cta: 'Ouvrir SneakRead',
    featuresTitle: 'Fonctionnalités',
    faqTitle: 'FAQ',
    features: [
      { t: '14 déguisements', d: 'VS Code, Claude Code, Word, WPS, Notion, Slack, Teams, Gmail et plus — en plein écran.' },
      { t: 'Touche patron', d: 'Appuyez sur Échap pour basculer aussitôt vers un tableau de budget.' },
      { t: 'Lisez n’importe quelle URL', d: 'Collez un lien et obtenez un texte propre et lisible.' },
      { t: 'Naviguez déguisé', d: 'Cliquez sur les liens pour continuer à lire, sans quitter le déguisement.' },
    ],
    faqs: [
      { q: 'SneakRead est-il gratuit ?', a: 'Oui, il fonctionne entièrement dans votre navigateur.' },
      { q: 'Mon patron voit-il la vraie page ?', a: 'Non. Seul le déguisement s’affiche, et Échap le masque aussitôt.' },
      { q: 'Conservez-vous ce que je lis ?', a: 'Non. Les fichiers récents restent seulement dans votre navigateur.' },
      { q: 'Quelles applis peut-il imiter ?', a: 'VS Code, Claude Code, Word, WPS, Google Docs, Notion, Slack, Lark, DingTalk, Teams, Gmail, Excel et Outlook.' },
    ],
  },
  de: {
    metaTitle: 'Beschäftigt wirken im Büro: Fake VS Code & Word | SneakRead',
    metaDesc:
      'Lies alles bei der Arbeit und wirke beschäftigt: SneakRead tarnt jede Seite als VS Code, Word, Docs oder Notion. Kostenlos im Browser, mit Esc-Chef-Taste.',
    heroSub: 'Füge einen Link ein. SneakRead lässt ihn wie echte Arbeit aussehen — damit du am Schreibtisch alles lesen kannst.',
    cta: 'SneakRead öffnen',
    featuresTitle: 'Funktionen',
    faqTitle: 'FAQ',
    features: [
      { t: '14 Tarnungen', d: 'VS Code, Claude Code, Word, WPS, Notion, Slack, Teams, Gmail und mehr — im Vollbild.' },
      { t: 'Chef-Taste', d: 'Drücke Esc, um sofort zu einer Budgettabelle zu wechseln.' },
      { t: 'Jede URL lesen', d: 'Link einfügen und sauberen, lesbaren Text erhalten.' },
      { t: 'Getarnt surfen', d: 'Klicke auf Links und lies weiter, ohne die Tarnung zu verlassen.' },
    ],
    faqs: [
      { q: 'Ist SneakRead kostenlos?', a: 'Ja, es läuft vollständig in deinem Browser.' },
      { q: 'Sieht mein Chef die echte Seite?', a: 'Nein. Nur die Tarnung ist sichtbar, und Esc blendet sie sofort aus.' },
      { q: 'Speichert ihr, was ich lese?', a: 'Nein. Zuletzt geöffnete Dateien bleiben nur in deinem Browser.' },
      { q: 'Welche Apps kann es imitieren?', a: 'VS Code, Claude Code, Word, WPS, Google Docs, Notion, Slack, Lark, DingTalk, Teams, Gmail, Excel und Outlook.' },
    ],
  },
}

export function landingContent(lang: Lang): LandingContent {
  return content[lang] || content.en
}
