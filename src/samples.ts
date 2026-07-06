import type { Lang } from './i18n'

export type Sample = { url: string; label: string }

// Localized "摸鱼" (slack-off) sample sites — entertainment / sports / gossip that
// office workers actually sneak-read, not study material. The first entry is a
// World Cup link everywhere (the 2026 tournament is live). Each URL was
// reader-tested (Jina) to confirm it returns readable, link-rich content.
const SAMPLES: Record<Lang, Sample[]> = {
  en: [
    { url: 'https://www.bbc.com/sport/football/world-cup', label: '⚽ World Cup · BBC' },
    { url: 'https://www.skysports.com/football', label: '🏟️ Sky Sports Football' },
    { url: 'https://www.espn.com/soccer/', label: '🏅 ESPN Soccer' },
    { url: 'https://www.dailymail.co.uk/tvshowbiz/index.html', label: '📺 Daily Mail Showbiz' },
    { url: 'https://people.com/', label: '🌟 People' },
    { url: 'https://www.theonion.com/', label: '😂 The Onion' },
  ],
  zh: [
    { url: 'https://www.dongqiudi.com/', label: '⚽ 懂球帝 · 世界杯' },
    { url: 'https://bbs.hupu.com/', label: '🏀 虎扑 · 步行街' },
    { url: 'https://www.zhibo8.com/', label: '📺 直播吧' },
    { url: 'https://sports.sina.com.cn/', label: '🏆 新浪体育' },
    { url: 'https://ent.sina.com.cn/', label: '🎬 新浪娱乐' },
    { url: 'https://www.jiemian.com/', label: '📰 界面新闻' },
  ],
  es: [
    { url: 'https://www.marca.com/futbol/mundial.html', label: '⚽ Mundial 2026 · Marca' },
    { url: 'https://www.sport.es', label: '🔵 SPORT' },
    { url: 'https://www.20minutos.es', label: '📰 20minutos' },
    { url: 'https://www.ole.com.ar', label: '🇦🇷 Olé' },
    { url: 'https://www.milenio.com', label: '🇲🇽 Milenio' },
    { url: 'https://www.tycsports.com', label: '⚡ TyC Sports' },
  ],
  hi: [
    { url: 'https://sports.ndtv.com/fifa-world-cup-2026', label: '⚽ World Cup · NDTV' },
    { url: 'https://www.espncricinfo.com/', label: '🏏 Cricket · ESPNcricinfo' },
    { url: 'https://www.bollywoodhungama.com/', label: '🎬 Bollywood Hungama' },
    { url: 'https://www.pinkvilla.com/', label: '💖 Pinkvilla' },
    { url: 'https://timesofindia.indiatimes.com/sports', label: '📰 TOI Sports' },
    { url: 'https://www.hindustantimes.com/entertainment', label: '🌟 HT Entertainment' },
  ],
  ar: [
    { url: 'https://www.kooora.com/', label: '⚽ كووورة · كأس العالم' },
    { url: 'https://www.yallakora.com/', label: '⚽ يلاكورة' },
    { url: 'https://www.youm7.com/', label: '📰 اليوم السابع' },
    { url: 'https://www.alarabiya.net/', label: '🌍 العربية' },
    { url: 'https://www.beinsports.com/ar/', label: '📺 beIN SPORTS' },
    { url: 'https://www.skynewsarabia.com/', label: '🗞️ سكاي نيوز' },
  ],
  pt: [
    { url: 'https://ge.globo.com/futebol/copa-do-mundo/', label: '⚽ Copa do Mundo · ge' },
    { url: 'https://www.abola.pt/', label: '🇵🇹 A Bola' },
    { url: 'https://www.record.pt/', label: '📰 Record' },
    { url: 'https://www.lance.com.br/', label: '🏟️ LANCE!' },
    { url: 'https://www.omelete.com.br/', label: '🎬 Omelete' },
    { url: 'https://g1.globo.com/', label: '🗞️ G1' },
  ],
  ru: [
    { url: 'https://www.championat.com/football/', label: '⚽ ЧМ-2026 · Championat' },
    { url: 'https://www.sports.ru/football/', label: '🏟️ Sports.ru' },
    { url: 'https://pikabu.ru/', label: '😂 Пикабу' },
    { url: 'https://lenta.ru/', label: '📰 Лента.ру' },
    { url: 'https://lifehacker.ru/', label: '🎬 Лайфхакер' },
    { url: 'https://fishki.net/', label: '🃏 Fishki.net' },
  ],
  ja: [
    { url: 'https://www.goal.com/jp', label: '⚽ W杯2026 · Goal' },
    { url: 'https://www.nikkansports.com/soccer/', label: '🥅 日刊スポーツ' },
    { url: 'https://www.oricon.co.jp/', label: '🎬 オリコン' },
    { url: 'https://girlschannel.net/', label: '💬 ガールズちゃんねる' },
    { url: 'https://www.famitsu.com/', label: '🎮 ファミ通' },
    { url: 'https://news.livedoor.com/', label: '📰 ライブドア' },
  ],
  fr: [
    { url: 'https://www.lequipe.fr/Football/Coupe-du-monde/', label: '⚽ Coupe du Monde · L’Équipe' },
    { url: 'https://rmcsport.bfmtv.com/football/coupe-du-monde/', label: '⚽ RMC Sport' },
    { url: 'https://www.footmercato.net/', label: '🔁 Foot Mercato' },
    { url: 'https://www.20minutes.fr/sport/', label: '🏅 20 Minutes' },
    { url: 'https://www.voici.fr/', label: '💃 Voici' },
    { url: 'https://www.public.fr/', label: '⭐ Public' },
  ],
  de: [
    { url: 'https://www.sport1.de/fussball/wm', label: '⚽ Fußball-WM · SPORT1' },
    { url: 'https://www.bild.de/sport', label: '🥅 BILD Sport' },
    { url: 'https://www.gala.de/', label: '✨ GALA' },
    { url: 'https://www.bunte.de/', label: '👑 BUNTE' },
    { url: 'https://www.tz.de/', label: '🏙️ tz München' },
    { url: 'https://www.chip.de/', label: '🖥️ CHIP' },
  ],
}

export function samplesFor(lang: Lang): Sample[] {
  return SAMPLES[lang] ?? SAMPLES.en
}
