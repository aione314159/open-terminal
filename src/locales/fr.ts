import type { Table } from "./zh";

/** Community translation, not reviewed by a native speaker. */
const fr: Table = {
	"app.ribbon": "Open Terminal — ouvrir le panneau terminal",
	"app.viewTitle": "Terminal",
	"app.command.open": "Ouvrir le panneau terminal",
	"app.command.toggle": "Afficher ou masquer le panneau terminal",
	"app.command.newTab": "Nouvel onglet de terminal",
	"app.subtitle": "Un panneau terminal sous l'éditeur · v{version}",

	"term.cdVault": "Aller au dossier du coffre (envoie cd)",
	"term.cdNote": "Aller au dossier de la note active (envoie cd)",
	"term.clear": "Effacer l'écran (sans toucher à la commande en cours)",
	"term.restart": "Terminer et relancer le shell de cet onglet",
	"term.toLight": "Passer au terminal clair",
	"term.toDark": "Passer au terminal sombre",
	"term.newTab": "Nouvel onglet",
	"term.closeTab": "Fermer l'onglet",
	"term.settings": "Ouvrir les réglages du plugin",
	"term.ended": "[Session terminée — appuyez sur le bouton de redémarrage]",
	"term.error.title": "Le terminal n'a pas pu démarrer.",
	"term.error.hint":
		"Le composant est peut-être endommagé. Supprimez node_modules/node-pty dans le dossier du plugin, puis rouvrez le panneau et téléchargez-le à nouveau.",
	"term.notice.noNote": "Aucune note n'est ouverte actuellement",
	"term.notice.badCwd": "Dossier de travail introuvable ; le coffre est utilisé à la place : {path}",

	"runtime.title": "Il manque un composant au terminal",
	"runtime.body":
		"La boutique communautaire n'installe que main.js, manifest.json et styles.css : node-pty, un module natif, ne peut donc pas vous parvenir avec le plugin. Le bouton ci-dessous télécharge la version correspondant à votre plateforme depuis la release GitHub de ce plugin. C'est une étape unique.",
	"runtime.install": "Télécharger et installer",
	"runtime.working": "Téléchargement…",
	"runtime.done": "{files} fichiers installés ({size}), SHA-256 {sha}…",
	"runtime.failed": "Échec de l'installation : {error}",
	"runtime.unsupported": "Aucun composant prédéfini pour {platform}.",

	"settings.shell.title": "Shell",
	"settings.shell.subtitle": "Le shell lancé par les nouveaux onglets et leur dossier de départ",
	"settings.shell.cwd.name": "Dossier de travail",
	"settings.shell.cwd.desc":
		"Dossier de départ des nouveaux onglets ; ~ est développé. Laissez vide pour utiliser le coffre.",
	"settings.shell.path.name": "Chemin du shell",
	"settings.shell.path.desc":
		"Laissez vide pour utiliser $SHELL. Lancé en shell de connexion, donc PATH et profil sont complets.",
	"settings.shell.check.name": "Tester la configuration",
	"settings.shell.check.desc": "Vérifie le chemin du shell, le dossier de travail et node-pty",
	"settings.shell.check.button": "Tester",
	"settings.shell.check.ok": "Tout est bon. Shell : {shell}, dossier de départ : {cwd}",
	"settings.shell.check.noShell": "Shell introuvable : {path}.",
	"settings.shell.check.noPty":
		"Le composant du terminal n'est pas encore installé ; ouvrez le panneau et utilisez le bouton de téléchargement.",

	"settings.panel.title": "Panneau",
	"settings.panel.subtitle": "Comment le terminal s'ouvre sous l'éditeur",
	"settings.panel.startup.name": "Toujours ouvrir au démarrage",
	"settings.panel.startup.desc":
		"Ouvre le panneau à chaque démarrage. Désactivé, il revient seulement s'il était ouvert à la fermeture.",
	"settings.panel.ratio.name": "Hauteur du panneau",
	"settings.panel.ratio.desc":
		"Part de la zone d'édition. Le séparateur reste déplaçable ensuite.",

	"settings.look.title": "Apparence",
	"settings.look.subtitle": "Palette et taille de police propres au terminal",
	"settings.look.theme.name": "Palette du terminal",
	"settings.look.theme.desc":
		"Volontairement indépendante du thème Obsidian : les 16 couleurs ANSI ont besoin d'un contraste fixe.",
	"settings.look.theme.dark": "Sombre",
	"settings.look.theme.light": "Clair",
	"settings.look.font.name": "Taille de police",
	"settings.look.font.desc": "S'applique à tous les onglets ; lignes et colonnes sont recalculées.",
	"settings.restore": "Rétablir la valeur par défaut ({value})",

	"settings.language.title": "Langue",
	"settings.language.subtitle": "Langue de l'interface de ce plugin",
	"settings.language.name": "Langue de l'interface",
	"settings.language.desc":
		"Les panneaux ouverts sont reconstruits au changement, ce qui met fin aux sessions en cours.",
	"settings.language.auto": "Suivre Obsidian",
	"settings.language.changed": "Langue changée",
	"settings.language.community":
		"日本語, 한국어, Deutsch et Français sont des traductions communautaires sans relecture par un locuteur natif. Signalez ce qui sonne faux.",
};

export default fr;
