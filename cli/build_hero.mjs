// Renders docs/images/hero.<lang>.png from a single HTML template.
//
//   node cli/build_hero.mjs
//
// Needs Google Chrome installed; it is driven headless, one screenshot per locale.

import { writeFileSync, mkdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { tmpdir } from 'node:os'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const out = resolve(root, 'docs/images')
const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const W = 1672
const H = 941

const CJK = "'PingFang TC','Hiragino Sans','Apple SD Gothic Neo',"

const locales = {
  en: {
    title: ['Open ', 'Terminal', ' Panel'],
    tagline: 'Your shell. Below the editor.',
    tags: ['Tabs', 'Real TTY', 'cd to note', 'Light &amp; Dark'],
    note: 'Release notes',
    noteSub: 'Draft the changelog, then ship it without leaving the vault.',
    tabs: ['zsh', 'dev server', 'build'],
    font: '',
  },
  'zh-TW': {
    title: ['Open ', 'Terminal', ' Panel'],
    tagline: '你的 shell，就在編輯區下方。',
    tags: ['分頁', '真 TTY', 'cd 到筆記', '明暗配色'],
    note: '發布筆記',
    noteSub: '寫完 changelog，不離開 vault 就能發出去。',
    tabs: ['zsh', 'dev server', 'build'],
    font: CJK,
  },
  ja: {
    title: ['Open ', 'Terminal', ' Panel'],
    tagline: 'あなたのシェルを、エディタの真下に。',
    tags: ['タブ', '本物の TTY', 'ノートへ cd', 'ライト &amp; ダーク'],
    note: 'リリースノート',
    noteSub: '変更履歴を書いて、vault を離れずにそのまま公開する。',
    tabs: ['zsh', 'dev server', 'build'],
    font: CJK,
  },
  ko: {
    title: ['Open ', 'Terminal', ' Panel'],
    tagline: '당신의 셸, 편집기 바로 아래에.',
    tags: ['탭', '진짜 TTY', '노트로 cd', '라이트 &amp; 다크'],
    note: '릴리스 노트',
    noteSub: '변경 사항을 적고, 볼트를 벗어나지 않은 채 배포한다.',
    tabs: ['zsh', 'dev server', 'build'],
    font: CJK,
  },
}

const page = (l) => `<!doctype html>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${W}px; height: ${H}px; overflow: hidden; }
  body {
    position: relative;
    background: #04101f;
    font-family: ${l.font}'Helvetica Neue', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  /* ---- background ---- */
  .grid, .glow, .waves { position: absolute; inset: 0; }
  .grid {
    background-image:
      linear-gradient(rgba(255,255,255,.028) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,.028) 1px, transparent 1px);
    background-size: 42px 42px;
  }
  .glow {
    background:
      radial-gradient(58% 46% at 62% 104%, rgba(52,150,255,.60) 0%, rgba(52,150,255,0) 100%),
      radial-gradient(78% 62% at 88% 86%, rgba(24,110,210,.44) 0%, rgba(24,110,210,0) 100%),
      radial-gradient(95% 85% at 2% -6%, rgba(4,10,20,.92) 0%, rgba(4,10,20,0) 100%),
      radial-gradient(70% 60% at 100% 0%, rgba(4,10,20,.75) 0%, rgba(4,10,20,0) 100%),
      linear-gradient(158deg, #061120 0%, #071a30 46%, #09274a 100%);
    z-index: -1;
  }
  .waves { opacity: .62; }

  /* ---- copy ---- */
  h1 {
    position: absolute; left: 96px; top: 96px;
    font-size: 78px; font-weight: 700; letter-spacing: -2.6px;
    color: #fff; line-height: 1;
  }
  h1 em { font-style: normal; color: #1e88ff; }
  .tagline {
    position: absolute; left: 98px; top: 218px;
    font-size: 38px; font-weight: 400; letter-spacing: -.6px;
    color: #b7cbe2;
  }
  .tags {
    position: absolute; left: 100px; bottom: 88px;
    font-size: 20px; font-weight: 700; letter-spacing: -.2px;
    display: flex; align-items: baseline; gap: 9px;
  }
  .tags span:nth-child(1) { color: #f2635f; }
  .tags span:nth-child(3) { color: #4ec98a; }
  .tags span:nth-child(5) { color: #f0b429; }
  .tags span:nth-child(7) { color: #3b9bff; }
  .tags i { font-style: normal; color: #5d7591; font-weight: 400; }

  /* ---- window mockup ---- */
  .frame {
    position: absolute; right: 78px; top: 342px;
    width: 828px; height: 500px;
    border-radius: 20px; padding: 7px;
    background: rgba(150,200,255,.14);
    box-shadow: 0 0 0 1px rgba(150,200,255,.34), 0 34px 90px rgba(0,0,0,.55),
                0 0 90px rgba(45,140,255,.25);
  }
  .win {
    width: 100%; height: 100%; border-radius: 14px; overflow: hidden;
    background: #0d1521; display: flex; flex-direction: column;
  }
  .titlebar {
    height: 30px; flex: none; display: flex; align-items: center; gap: 7px;
    padding-left: 15px; background: #0a1220;
    border-bottom: 1px solid rgba(255,255,255,.05);
  }
  .titlebar b { width: 9px; height: 9px; border-radius: 50%; background: #263444; }
  .body { flex: 1; display: flex; min-height: 0; }
  .ribbon {
    width: 40px; flex: none; background: #0a111c; padding-top: 13px;
    display: flex; flex-direction: column; align-items: center; gap: 13px;
    border-right: 1px solid rgba(255,255,255,.04);
  }
  .ribbon i { display: block; width: 17px; height: 17px; border-radius: 4px; background: #22303f; }
  .ribbon i.on { background: #1e88ff; box-shadow: 0 0 12px rgba(30,136,255,.75); }
  .main { flex: 1; display: flex; flex-direction: column; min-width: 0; }

  /* editor half */
  .editor { flex: none; height: 178px; padding: 22px 30px; background: #10192a; }
  .editor h2 { font-size: 17px; color: #e7eefb; font-weight: 700; letter-spacing: -.2px; }
  .editor p { margin-top: 8px; font-size: 12px; color: #7f93ad; letter-spacing: -.1px; }
  .lines { margin-top: 17px; display: flex; flex-direction: column; gap: 9px; }
  .lines u { display: block; height: 6px; border-radius: 3px; background: rgba(150,180,215,.14); }

  /* terminal half */
  .term { flex: 1; display: flex; flex-direction: column; background: #060a12; min-height: 0;
          border-top: 1px solid rgba(120,180,255,.22); }
  .tabstrip {
    height: 31px; flex: none; display: flex; align-items: stretch;
    background: #0a1018; border-bottom: 1px solid rgba(255,255,255,.05);
  }
  .tab {
    display: flex; align-items: center; padding: 0 15px; font-size: 11px;
    color: #6c8098; border-right: 1px solid rgba(255,255,255,.05);
    font-family: ui-monospace, 'SF Mono', Menlo, monospace;
  }
  .tab.sel { background: #060a12; color: #d7e6fb; box-shadow: inset 0 2px 0 #1e88ff; }
  .plus { display: flex; align-items: center; padding: 0 13px; color: #4b5f77; font-size: 15px; }
  .acts { margin-left: auto; display: flex; align-items: center; gap: 9px; padding-right: 13px; }
  .acts i { width: 13px; height: 13px; border-radius: 3px; background: #1c2839; display: block; }
  .acts i.hl { background: rgba(30,136,255,.42); }
  pre {
    flex: 1; margin: 0; padding: 15px 22px; min-height: 0; overflow: hidden;
    font-family: ui-monospace, 'SF Mono', Menlo, monospace;
    font-size: 12.5px; line-height: 1.72; color: #c6d4e6;
  }
  .g { color: #4ec98a; } .b { color: #4aa8ff; } .y { color: #e8c060; }
  .m { color: #c98ae0; } .d { color: #5a6f88; } .r { color: #f2635f; }
  .cur { display: inline-block; width: 7px; height: 14px; background: #4ec98a;
         vertical-align: -2px; }
</style>

<div class="glow"></div>
<div class="grid"></div>
<svg class="waves" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" fill="none">
  <g stroke="rgba(130,190,255,.26)" stroke-width="1.1">
    <path d="M-40 596 C 240 520 420 660 700 592 S 1180 470 1760 556"/>
    <path d="M-40 646 C 250 574 430 706 706 640 S 1190 522 1760 606"/>
    <path d="M-40 700 C 260 630 440 754 712 690 S 1200 576 1760 658"/>
  </g>
</svg>

<h1>${l.title[0]}<em>${l.title[1]}</em>${l.title[2]}</h1>
<div class="tagline">${l.tagline}</div>
<div class="tags">
  <span>${l.tags[0]}</span><i>·</i>
  <span>${l.tags[1]}</span><i>·</i>
  <span>${l.tags[2]}</span><i>·</i>
  <span>${l.tags[3]}</span>
</div>

<div class="frame"><div class="win">
  <div class="titlebar"><b></b><b></b><b></b></div>
  <div class="body">
    <div class="ribbon"><i></i><i class="on"></i><i></i><i></i></div>
    <div class="main">
      <div class="editor">
        <h2>${l.note}</h2>
        <p>${l.noteSub}</p>
        <div class="lines">
          <u style="width:86%"></u><u style="width:71%"></u>
          <u style="width:79%"></u><u style="width:44%"></u>
        </div>
      </div>
      <div class="term">
        <div class="tabstrip">
          <div class="tab sel">${l.tabs[0]}</div>
          <div class="tab">${l.tabs[1]}</div>
          <div class="tab">${l.tabs[2]}</div>
          <div class="plus">+</div>
          <div class="acts"><i class="hl"></i><i class="hl"></i><i></i><i></i><i></i></div>
        </div>
<pre><span class="g">~/vault</span> <span class="b">$</span> git status --short
<span class="y"> M</span> Release notes.md
<span class="g">??</span> docs/images/hero.en.png
<span class="g">~/vault</span> <span class="b">$</span> npm run build
<span class="d">&gt;</span> tsc --noEmit &amp;&amp; esbuild bundle
<span class="m">  main.js</span>  <span class="d">390.5kb</span>   <span class="g">built in 412ms</span>
<span class="g">~/vault</span> <span class="b">$</span> node cli/build_hero.mjs
<span class="d">  hero.en.png  hero.zh-TW.png  hero.ja.png  hero.ko.png</span>
<span class="g">~/vault</span> <span class="b">$</span> <span class="cur"></span></pre>
      </div>
    </div>
  </div>
</div></div>
`

mkdirSync(out, { recursive: true })
const tmp = tmpdir()

for (const [lang, l] of Object.entries(locales)) {
  const html = resolve(tmp, `hero.${lang}.html`)
  const png = resolve(out, `hero.${lang}.png`)
  writeFileSync(html, page(l))
  execFileSync(chrome, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--force-device-scale-factor=1',
    `--window-size=${W},${H}`,
    `--screenshot=${png}`,
    '--virtual-time-budget=2500',
    `file://${html}`,
  ], { stdio: 'ignore' })
  console.log(`hero.${lang}.png`)
}
