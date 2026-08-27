import type { Table } from "./zh";

/** Community translation, not reviewed by a native speaker. */
const ja: Table = {
	"app.ribbon": "Open Terminal — ターミナルパネルを開く",
	"app.viewTitle": "ターミナル",
	"app.command.open": "ターミナルパネルを開く",
	"app.command.toggle": "ターミナルパネルの表示を切り替え",
	"app.command.newTab": "ターミナルタブを追加",
	"app.subtitle": "エディタ下部のターミナルパネル · v{version}",

	"term.cdVault": "vault フォルダへ移動（cd を送信）",
	"term.cdNote": "現在のノートのフォルダへ移動（cd を送信）",
	"term.clear": "画面を消去（実行中のコマンドには影響しません）",
	"term.restart": "このタブのシェルを終了して再起動",
	"term.toLight": "ライトテーマに切り替え",
	"term.toDark": "ダークテーマに切り替え",
	"term.newTab": "新しいタブ",
	"term.closeTab": "タブを閉じる",
	"term.settings": "プラグイン設定を開く",
	"term.ended": "[セッションが終了しました — 再起動ボタンで新しく開始できます]",
	"term.error.title": "ターミナルを起動できませんでした。",
	"term.error.hint":
		"部品が壊れている可能性があります。プラグインフォルダの node_modules/node-pty を削除し、パネルを開き直して再取得してください。",
	"term.notice.noNote": "現在開いているノートがありません",
	"term.notice.badCwd": "設定された作業フォルダが見つからないため vault を使用します：{path}",

	"runtime.title": "ターミナルにはもう一つ部品が必要です",
	"runtime.body":
		"コミュニティストアは main.js、manifest.json、styles.css しか導入しないため、ネイティブモジュールである node-pty はプラグインと一緒には届きません。下のボタンで、このプラグイン自身の GitHub リリースからお使いのプラットフォーム向けのビルドを取得します。作業は一度だけです。",
	"runtime.install": "ダウンロードして導入",
	"runtime.working": "ダウンロード中…",
	"runtime.done": "{files} 個のファイル（{size}）を導入しました。SHA-256 {sha}…",
	"runtime.failed": "導入に失敗しました：{error}",
	"runtime.unsupported": "{platform} 向けのビルドはありません。",

	"settings.shell.title": "シェル",
	"settings.shell.subtitle": "新しいタブで使うシェルと開始フォルダ",
	"settings.shell.cwd.name": "作業フォルダ",
	"settings.shell.cwd.desc":
		"新しいタブの開始フォルダ。~ を展開します。空欄なら vault フォルダを使用します。",
	"settings.shell.path.name": "シェルのパス",
	"settings.shell.path.desc":
		"空欄なら $SHELL を使用します。ログインシェルとして起動するため PATH とプロファイルが揃います。",
	"settings.shell.check.name": "設定をテスト",
	"settings.shell.check.desc": "シェルのパス、作業フォルダ、node-pty を確認します",
	"settings.shell.check.button": "テスト",
	"settings.shell.check.ok": "問題ありません。シェル：{shell}、開始フォルダ：{cwd}",
	"settings.shell.check.noShell": "シェルが見つかりません：{path}。",
	"settings.shell.check.noPty":
		"ターミナル部品が未導入です。ターミナルパネルを開き、ダウンロードボタンを押してください。",

	"settings.panel.title": "パネル",
	"settings.panel.subtitle": "エディタ下部での開き方",
	"settings.panel.startup.name": "起動時に開く",
	"settings.panel.startup.desc":
		"Obsidian の読み込みが完了したら、エディタ下部にターミナルパネルを開きます。",
	"settings.panel.ratio.name": "パネルの高さ",
	"settings.panel.ratio.desc": "エディタ領域に対する割合。後から仕切りをドラッグして調整できます。",

	"settings.look.title": "外観",
	"settings.look.subtitle": "ターミナル自身の配色と文字サイズ",
	"settings.look.theme.name": "ターミナルの配色",
	"settings.look.theme.desc":
		"Obsidian のテーマにあえて追従しません。ANSI 16 色には固定のコントラスト基準が必要です。",
	"settings.look.theme.dark": "ダーク",
	"settings.look.theme.light": "ライト",
	"settings.look.font.name": "文字サイズ",
	"settings.look.font.desc": "すべてのタブに適用され、行数と桁数が再計算されます。",
	"settings.restore": "既定値に戻す（{value}）",

	"settings.language.title": "言語",
	"settings.language.subtitle": "このプラグインの表示に使う言語",
	"settings.language.name": "表示言語",
	"settings.language.desc": "変更すると開いているパネルは再構築され、実行中のセッションは終了します。",
	"settings.language.auto": "Obsidian に従う",
	"settings.language.changed": "言語を切り替えました",
	"settings.language.community":
		"日本語、한국어、Deutsch、Français はコミュニティ翻訳で、母語話者の校正を経ていません。誤訳を見つけたらご報告ください。",
};

export default ja;
