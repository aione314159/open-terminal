import type { Table } from "./zh";

/** Community translation, not reviewed by a native speaker. */
const ko: Table = {
	"app.ribbon": "Open Terminal — 터미널 패널 열기",
	"app.viewTitle": "터미널",
	"app.command.open": "터미널 패널 열기",
	"app.command.toggle": "터미널 패널 켜기/끄기",
	"app.command.newTab": "터미널 탭 추가",
	"app.subtitle": "편집 영역 아래의 터미널 패널 · v{version}",

	"term.cdVault": "보관함 폴더로 이동 (cd 전송)",
	"term.cdNote": "현재 노트가 있는 폴더로 이동 (cd 전송)",
	"term.clear": "화면 지우기 (실행 중인 명령에는 영향 없음)",
	"term.restart": "이 탭의 셸을 종료하고 다시 시작",
	"term.toLight": "밝은 터미널로 전환",
	"term.toDark": "어두운 터미널로 전환",
	"term.newTab": "새 탭",
	"term.closeTab": "탭 닫기",
	"term.settings": "플러그인 설정 열기",
	"term.ended": "[세션이 종료되었습니다 — 다시 시작 버튼을 누르세요]",
	"term.error.title": "터미널을 시작할 수 없습니다.",
	"term.error.hint":
		"구성 요소가 손상되었을 수 있습니다. 플러그인 폴더의 node_modules/node-pty 를 지우고 패널을 다시 열어 내려받으세요.",
	"term.notice.noNote": "현재 열려 있는 노트가 없습니다",
	"term.notice.badCwd": "설정된 작업 폴더를 찾을 수 없어 보관함을 사용합니다: {path}",

	"runtime.title": "터미널에 구성 요소가 하나 더 필요합니다",
	"runtime.body":
		"커뮤니티 스토어는 main.js, manifest.json, styles.css 만 설치하므로 네이티브 모듈인 node-pty 는 플러그인과 함께 전달될 수 없습니다. 아래 버튼을 누르면 이 플러그인의 GitHub 릴리스에서 사용 중인 플랫폼용 빌드를 내려받습니다. 한 번만 하면 됩니다.",
	"runtime.install": "내려받아 설치",
	"runtime.working": "내려받는 중…",
	"runtime.done": "파일 {files} 개({size})를 설치했습니다. SHA-256 {sha}…",
	"runtime.failed": "설치 실패: {error}",
	"runtime.unsupported": "{platform} 용으로 미리 빌드된 구성 요소가 없습니다.",

	"settings.shell.title": "셸",
	"settings.shell.subtitle": "새 탭이 사용할 셸과 시작 폴더",
	"settings.shell.cwd.name": "작업 폴더",
	"settings.shell.cwd.desc": "새 탭의 시작 폴더이며 ~ 를 확장합니다. 비우면 보관함 폴더를 사용합니다.",
	"settings.shell.path.name": "셸 경로",
	"settings.shell.path.desc":
		"비우면 $SHELL 을 사용합니다. 로그인 셸로 실행되므로 PATH 와 프로필이 온전히 적용됩니다.",
	"settings.shell.check.name": "설정 테스트",
	"settings.shell.check.desc": "셸 경로, 작업 폴더, node-pty 를 확인합니다",
	"settings.shell.check.button": "테스트",
	"settings.shell.check.ok": "이상 없습니다. 셸: {shell}, 시작 폴더: {cwd}",
	"settings.shell.check.noShell": "셸을 찾을 수 없습니다: {path}.",
	"settings.shell.check.noPty":
		"터미널 구성 요소가 아직 설치되지 않았습니다. 터미널 패널을 열고 내려받기 버튼을 누르세요.",

	"settings.panel.title": "패널",
	"settings.panel.subtitle": "편집 영역 아래에서 열리는 방식",
	"settings.panel.startup.name": "시작할 때마다 열기",
	"settings.panel.startup.desc":
		"시작할 때마다 패널을 엽니다. 끄면 Obsidian을 끝낼 때 열려 있던 경우에만 다시 열립니다.",
	"settings.panel.ratio.name": "패널 높이",
	"settings.panel.ratio.desc": "편집 영역에서 차지하는 비율이며, 이후 구분선을 끌어 조절할 수 있습니다.",

	"settings.look.title": "모양",
	"settings.look.subtitle": "터미널 자체의 색상과 글자 크기",
	"settings.look.theme.name": "터미널 색상",
	"settings.look.theme.desc":
		"Obsidian 테마를 일부러 따르지 않습니다. ANSI 16색에는 고정된 대비 기준이 필요합니다.",
	"settings.look.theme.dark": "어둡게",
	"settings.look.theme.light": "밝게",
	"settings.look.font.name": "글자 크기",
	"settings.look.font.desc": "모든 탭에 적용되며 행과 열 수가 다시 계산됩니다.",
	"settings.restore": "기본값으로 되돌리기 ({value})",

	"settings.language.title": "언어",
	"settings.language.subtitle": "이 플러그인 화면에 사용할 언어",
	"settings.language.name": "표시 언어",
	"settings.language.desc": "변경하면 열려 있는 패널이 다시 만들어지고 실행 중인 세션이 종료됩니다.",
	"settings.language.auto": "Obsidian 따르기",
	"settings.language.changed": "언어를 변경했습니다",
	"settings.language.community":
		"日本語, 한국어, Deutsch, Français 는 원어민 검수를 거치지 않은 커뮤니티 번역입니다. 잘못된 번역을 발견하면 알려주세요.",
};

export default ko;
