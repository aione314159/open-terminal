import type { Table } from "./zh";

/** Community translation, not reviewed by a native speaker. */
const de: Table = {
	"app.ribbon": "Open Terminal — Terminal-Bereich öffnen",
	"app.viewTitle": "Terminal",
	"app.command.open": "Terminal-Bereich öffnen",
	"app.command.toggle": "Terminal-Bereich ein- oder ausblenden",
	"app.command.newTab": "Neuen Terminal-Tab öffnen",
	"app.subtitle": "Ein Terminal-Bereich unter dem Editor · v{version}",

	"term.cdVault": "Zum Vault-Ordner wechseln (sendet cd)",
	"term.cdNote": "Zum Ordner der aktuellen Notiz wechseln (sendet cd)",
	"term.clear": "Bildschirm leeren (laufende Befehle bleiben unberührt)",
	"term.restart": "Shell dieses Tabs beenden und neu starten",
	"term.toLight": "Zu hellem Terminal wechseln",
	"term.toDark": "Zu dunklem Terminal wechseln",
	"term.newTab": "Neuer Tab",
	"term.closeTab": "Tab schließen",
	"term.settings": "Plugin-Einstellungen öffnen",
	"term.ended": "[Sitzung beendet — mit der Neustart-Schaltfläche neu starten]",
	"term.error.title": "Das Terminal konnte nicht starten.",
	"term.error.hint":
		"Der Baustein ist möglicherweise beschädigt. Lösche node_modules/node-pty im Plugin-Ordner, öffne das Terminal erneut und lade ihn noch einmal.",
	"term.notice.noNote": "Zurzeit ist keine Notiz geöffnet",
	"term.notice.badCwd":
		"Eingestellter Arbeitsordner nicht gefunden; es wird der Vault verwendet: {path}",

	"runtime.title": "Dem Terminal fehlt noch ein Baustein",
	"runtime.body":
		"Der Community-Store installiert nur main.js, manifest.json und styles.css — node-pty ist ein natives Modul und kann daher nicht mit dem Plugin ausgeliefert werden. Die Schaltfläche unten lädt den Build für deine Plattform aus dem GitHub-Release dieses Plugins. Das ist einmalig nötig.",
	"runtime.install": "Herunterladen und installieren",
	"runtime.working": "Wird heruntergeladen…",
	"runtime.done": "{files} Dateien installiert ({size}), SHA-256 {sha}…",
	"runtime.failed": "Installation fehlgeschlagen: {error}",
	"runtime.unsupported": "Für {platform} gibt es keinen vorgebauten Baustein.",

	"settings.shell.title": "Shell",
	"settings.shell.subtitle": "Welche Shell neue Tabs starten und in welchem Ordner",
	"settings.shell.cwd.name": "Arbeitsordner",
	"settings.shell.cwd.desc":
		"Startordner neuer Tabs; ~ wird aufgelöst. Leer lassen, um den Vault-Ordner zu verwenden.",
	"settings.shell.path.name": "Shell-Pfad",
	"settings.shell.path.desc":
		"Leer lassen, um $SHELL zu verwenden. Startet als Login-Shell, damit PATH und Profil vollständig sind.",
	"settings.shell.check.name": "Einrichtung testen",
	"settings.shell.check.desc": "Prüft Shell-Pfad, Arbeitsordner und node-pty",
	"settings.shell.check.button": "Testen",
	"settings.shell.check.ok": "Alles in Ordnung. Shell: {shell}, Startordner: {cwd}",
	"settings.shell.check.noShell": "Shell nicht gefunden: {path}.",
	"settings.shell.check.noPty":
		"Der Terminal-Baustein ist noch nicht installiert; öffne das Terminal und nutze die Schaltfläche zum Herunterladen.",

	"settings.panel.title": "Bereich",
	"settings.panel.subtitle": "Wie sich das Terminal unter dem Editor öffnet",
	"settings.panel.startup.name": "Immer beim Start öffnen",
	"settings.panel.startup.desc":
		"Öffnet den Bereich bei jedem Start. Aus: Er kehrt nur zurück, wenn er beim Beenden offen war.",
	"settings.panel.ratio.name": "Höhe des Bereichs",
	"settings.panel.ratio.desc":
		"Anteil am Editorbereich. Der Trenner lässt sich danach weiterhin ziehen.",

	"settings.look.title": "Darstellung",
	"settings.look.subtitle": "Farbpalette und Schriftgröße des Terminals",
	"settings.look.theme.name": "Terminal-Farbpalette",
	"settings.look.theme.desc":
		"Folgt dem Obsidian-Theme bewusst nicht: die 16 ANSI-Farben brauchen einen festen Kontrastbezug.",
	"settings.look.theme.dark": "Dunkel",
	"settings.look.theme.light": "Hell",
	"settings.look.font.name": "Schriftgröße",
	"settings.look.font.desc": "Gilt für alle Tabs; Zeilen und Spalten werden neu berechnet.",
	"settings.restore": "Standard wiederherstellen ({value})",

	"settings.language.title": "Sprache",
	"settings.language.subtitle": "Sprache der Oberfläche dieses Plugins",
	"settings.language.name": "Oberflächensprache",
	"settings.language.desc":
		"Offene Bereiche werden bei einer Änderung neu aufgebaut, laufende Sitzungen enden dabei.",
	"settings.language.auto": "Obsidian folgen",
	"settings.language.changed": "Sprache gewechselt",
	"settings.language.community":
		"日本語, 한국어, Deutsch und Français sind Community-Übersetzungen ohne muttersprachliche Prüfung. Melde gerne, was falsch klingt.",
};

export default de;
