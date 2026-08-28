/**
 * Traditional Chinese. This table is the source of truth for the key set:
 * `StringKey` is derived from it, so every other locale must supply exactly
 * these keys or the build fails.
 */
const zh = {
	// ── plugin shell ────────────────────────────────────────
	"app.ribbon": "Open Terminal — 開啟終端機面板",
	"app.viewTitle": "終端機",
	"app.command.open": "開啟終端機面板",
	"app.command.toggle": "開關終端機面板",
	"app.command.newTab": "新增終端機分頁",
	"app.subtitle": "編輯區下方的終端機面板 · v{version}",

	// ── terminal header ─────────────────────────────────────
	"term.cdVault": "切換到 vault 資料夾（送出 cd）",
	"term.cdNote": "切換到目前筆記所在資料夾（送出 cd）",
	"term.clear": "清空畫面（不影響執行中的指令）",
	"term.restart": "結束並重開這個分頁的 shell",
	"term.toLight": "改用淺色終端機",
	"term.toDark": "改用深色終端機",
	"term.newTab": "新增分頁",
	"term.closeTab": "關閉分頁",
	"term.settings": "開啟插件設定",
	"term.ended": "[工作階段已結束，按重開鈕重啟]",
	"term.error.title": "終端機無法啟動。",
	"term.error.hint":
		"元件可能損毀。刪掉插件目錄下的 node_modules/node-pty，重開面板再下載一次。",
	"term.notice.noNote": "目前沒有開啟任何筆記",
	"term.notice.badCwd": "找不到設定的工作目錄，改用 vault 資料夾：{path}",

	// ── native runtime ──────────────────────────────────────
	"runtime.title": "終端機還缺一個元件",
	"runtime.body":
		"Obsidian 社群商店只會安裝 main.js、manifest.json 與 styles.css，node-pty 這個原生模組送不到你手上。按下面的按鈕，從本插件自己的 GitHub Release 下載對應你平台的版本，只需要做一次。",
	"runtime.install": "下載並安裝",
	"runtime.working": "下載中……",
	"runtime.done": "已安裝 {files} 個檔案（{size}），SHA-256 {sha}…",
	"runtime.failed": "安裝失敗：{error}",
	"runtime.unsupported": "{platform} 沒有預先建置的元件。",

	// ── settings: shell ─────────────────────────────────────
	"settings.shell.title": "Shell",
	"settings.shell.subtitle": "新分頁用哪個 shell、從哪個目錄開始",
	"settings.shell.cwd.name": "預設工作目錄",
	"settings.shell.cwd.desc": "新分頁的起始目錄，支援 ~ 開頭。留空就用 vault 資料夾。",
	"settings.shell.path.name": "Shell 路徑",
	"settings.shell.path.desc": "留空就用系統的 $SHELL。以登入 shell 啟動，確保 PATH 與 profile 完整。",
	"settings.shell.check.name": "測試設定",
	"settings.shell.check.desc": "檢查 shell 路徑、工作目錄與 node-pty 是否都到位",
	"settings.shell.check.button": "測試",
	"settings.shell.check.ok": "沒問題。shell：{shell}，起始目錄：{cwd}",
	"settings.shell.check.noShell": "找不到 shell：{path}。",
	"settings.shell.check.noPty": "終端機元件尚未安裝；開啟終端機面板，按面板中的下載按鈕即可。",

	// ── settings: panel ─────────────────────────────────────
	"settings.panel.title": "面板",
	"settings.panel.subtitle": "終端機在編輯區下方的開啟方式",
	"settings.panel.startup.name": "每次啟動都開啟",
	"settings.panel.startup.desc":
		"每次啟動都開啟面板。關閉時，只有上次離開 Obsidian 前面板是開著的才會回來。",
	"settings.panel.ratio.name": "面板高度",
	"settings.panel.ratio.desc": "佔編輯區的百分比；之後仍可直接拖曳中間的分隔線調整。",

	// ── settings: appearance ────────────────────────────────
	"settings.look.title": "外觀",
	"settings.look.subtitle": "終端機自己的配色與字級",
	"settings.look.theme.name": "終端機配色",
	"settings.look.theme.desc": "刻意不跟隨 Obsidian 主題：終端機輸出的 16 色需要固定的對比基準。",
	"settings.look.theme.dark": "深色",
	"settings.look.theme.light": "淺色",
	"settings.look.font.name": "字級",
	"settings.look.font.desc": "以 px 為單位，套用到所有分頁，行列數會重新計算。",
	"settings.restore": "還原預設 {value}",

	// ── settings: language ──────────────────────────────────
	"settings.language.title": "語言",
	"settings.language.subtitle": "插件介面文字使用的語言",
	"settings.language.name": "介面語言",
	"settings.language.desc": "切換後已開啟的面板會重建，執行中的工作階段會結束。",
	"settings.language.auto": "跟隨 Obsidian",
	"settings.language.changed": "語言已切換",
	"settings.language.community":
		"日本語、한국어、Deutsch、Français 為社群翻譯，未經母語者校對。發現錯譯請回報。",
};

export default zh;

/** Every key the interface can ask for; derived from the table above */
export type StringKey = keyof typeof zh;

/** What a locale file has to export */
export type Table = Record<StringKey, string>;
