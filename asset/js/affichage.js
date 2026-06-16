/**
 * affichage.js — ImproCast Arena
 * Page d'affichage public (improcast.html)
 * P1 : overlay fin de match, sifflet, banque sonore Web Audio API
 */

/* ============================================================
   ÉTAT & CONSTANTES
============================================================ */
const defaultState = {
    scoreRouge: 0,
    scoreBleu: 0,
    penaliteRouge: 0,
    penaliteBleu: 0,
    nomEquipeRouge: "Les Rouges",
    nomEquipeBleue: "Les Bleus",
    categorie: "Libre",
    theme: "Aucun thème",
    nomEvenement: "Match d'improvisation",
    logoTroupe: "",
    sonsActifs: "false",
    dureeInitiale: 240,
    chronoRestant: 240,
    etatChrono: "pause",
    arenaOverlay: "none",
    arenaOverlayStamp: "0",
    derniereFauteRouge: "",
    derniereFauteBleue: "",
};

let temps = readNumber("chronoRestant", readNumber("dureeInitiale", defaultState.dureeInitiale));
let lastState = {};
let lastOverlayStamp = readValue("arenaOverlayStamp");
let timeUpShown = false;
let audioCtx = null;

/* ============================================================
   UTILITAIRES LOCALSTORAGE
============================================================ */
function readValue(key) {
    return localStorage.getItem(key) ?? defaultState[key];
}

function readNumber(key, fallback) {
    const v = localStorage.getItem(key);
    if (v === null) return fallback ?? defaultState[key] ?? 0;
    const n = Number(v);
    return Number.isFinite(n) ? n : (fallback ?? 0);
}

function getElement(id) {
    return document.getElementById(id);
}

function setText(id, value) {
    const el = getElement(id);
    if (el) el.textContent = value;
}

function formatTime(totalSeconds) {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function replayAnimation(element, className) {
    if (!element) return;
    element.classList.remove(className);
    void element.offsetWidth; // reflow pour redéclencher l'animation
    element.classList.add(className);
}

/* ============================================================
   BANQUE SONORE — Web Audio API (P1)
   Sons 100 % synthétisés, aucune dépendance externe
============================================================ */
function getAudioCtx() {
    if (!audioCtx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        audioCtx = new AC();
    }
    if (audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
}

function soundEnabled() {
    return readValue("sonsActifs") === "true";
}

/**
 * Joue un son synthétisé selon le type demandé.
 * Types : "score" | "category" | "theme" | "penalty" | "whistle" | "endmatch" | "timeup"
 */
function playSound(type) {
    if (!soundEnabled()) return;
    const ctx = getAudioCtx();
    if (!ctx) return;

    const now = ctx.currentTime;

    switch (type) {

        case "score": {
            // Deux notes montantes — pop sportif
            [660, 880].forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = "triangle";
                osc.frequency.setValueAtTime(freq, now + i * 0.1);
                gain.gain.setValueAtTime(0.0001, now + i * 0.1);
                gain.gain.exponentialRampToValueAtTime(0.18, now + i * 0.1 + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.1 + 0.18);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now + i * 0.1);
                osc.stop(now + i * 0.1 + 0.2);
            });
            break;
        }

        case "category":
        case "theme": {
            // Montée majeure cinématique
            const freqs = type === "category" ? [440, 554, 660] : [523, 659, 784];
            freqs.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = "sine";
                osc.frequency.setValueAtTime(freq, now + i * 0.14);
                gain.gain.setValueAtTime(0.0001, now + i * 0.14);
                gain.gain.exponentialRampToValueAtTime(0.15, now + i * 0.14 + 0.03);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.14 + 0.32);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now + i * 0.14);
                osc.stop(now + i * 0.14 + 0.36);
            });
            break;
        }

        case "penalty": {
            // Buzz sourd + chute — carton rouge
            const buzz = ctx.createOscillator();
            const buzzGain = ctx.createGain();
            buzz.type = "sawtooth";
            buzz.frequency.setValueAtTime(120, now);
            buzz.frequency.exponentialRampToValueAtTime(60, now + 0.35);
            buzzGain.gain.setValueAtTime(0.0001, now);
            buzzGain.gain.exponentialRampToValueAtTime(0.28, now + 0.02);
            buzzGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
            buzz.connect(buzzGain);
            buzzGain.connect(ctx.destination);
            buzz.start(now);
            buzz.stop(now + 0.42);
            break;
        }

        case "whistle": {
            // Sifflet d'arbitre — oscillation FM rapide + vibrato
            const carrier = ctx.createOscillator();
            const modulator = ctx.createOscillator();
            const modGain = ctx.createGain();
            const outGain = ctx.createGain();

            carrier.type = "sine";
            carrier.frequency.setValueAtTime(2800, now);
            carrier.frequency.exponentialRampToValueAtTime(2600, now + 0.12);
            carrier.frequency.setValueAtTime(2800, now + 0.12);
            carrier.frequency.exponentialRampToValueAtTime(2500, now + 0.28);

            modulator.type = "sine";
            modulator.frequency.setValueAtTime(18, now);
            modGain.gain.setValueAtTime(180, now);

            outGain.gain.setValueAtTime(0.0001, now);
            outGain.gain.exponentialRampToValueAtTime(0.22, now + 0.03);
            outGain.gain.setValueAtTime(0.22, now + 0.22);
            outGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

            modulator.connect(modGain);
            modGain.connect(carrier.frequency);
            carrier.connect(outGain);
            outGain.connect(ctx.destination);

            modulator.start(now);
            carrier.start(now);
            modulator.stop(now + 0.58);
            carrier.stop(now + 0.58);

            // Double sifflet
            setTimeout(() => {
                if (!soundEnabled()) return;
                const ctx2 = getAudioCtx();
                if (!ctx2) return;
                const t = ctx2.currentTime;
                const osc = ctx2.createOscillator();
                const g = ctx2.createGain();
                osc.type = "sine";
                osc.frequency.setValueAtTime(2900, t);
                osc.frequency.exponentialRampToValueAtTime(2500, t + 0.18);
                g.gain.setValueAtTime(0.0001, t);
                g.gain.exponentialRampToValueAtTime(0.18, t + 0.03);
                g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
                osc.connect(g);
                g.connect(ctx2.destination);
                osc.start(t);
                osc.stop(t + 0.32);
            }, 680);
            break;
        }

        case "timeup": {
            // Alarme grave descendante
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(200, now);
            osc.frequency.exponentialRampToValueAtTime(80, now + 0.6);
            gain.gain.setValueAtTime(0.0001, now);
            gain.gain.exponentialRampToValueAtTime(0.32, now + 0.04);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.75);
            break;
        }

        case "endmatch": {
            // Fanfare de victoire — 5 notes en arpège
            const melody = [523, 659, 784, 1047, 1319];
            melody.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = "triangle";
                osc.frequency.setValueAtTime(freq, now + i * 0.12);
                gain.gain.setValueAtTime(0.0001, now + i * 0.12);
                gain.gain.exponentialRampToValueAtTime(0.16, now + i * 0.12 + 0.04);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.12 + 0.28);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now + i * 0.12);
                osc.stop(now + i * 0.12 + 0.32);
            });
            break;
        }

        default: {
            // Son générique reveal
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "triangle";
            osc.frequency.setValueAtTime(440, now);
            gain.gain.setValueAtTime(0.0001, now);
            gain.gain.exponentialRampToValueAtTime(0.12, now + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.32);
        }
    }
}

/* ============================================================
   LOGO
============================================================ */
function updateLogo(url) {
    const logoArena = getElement("logoBadge");
    const overlayLogo = getElement("overlayLogo");
    const safeUrl = String(url || "").trim();

    [logoArena, overlayLogo].forEach((el) => {
        if (!el) return;
        if (el.tagName === "IMG") {
            // Si c'est une image <img>, on ne change pas la src principale (logo arena)
            if (el.id === "overlayLogo" && safeUrl) {
                el.src = safeUrl;
            }
        } else {
            el.textContent = safeUrl ? "" : "IC";
            el.style.backgroundImage = safeUrl ? `url("${safeUrl}")` : "";
        }
    });
}

/* ============================================================
   CHRONO
============================================================ */
function afficherChrono() {
    const timer = getElement("chronoAff");
    const formatted = formatTime(temps);
    if (timer) {
        timer.textContent = formatted;
        timer.setAttribute("datetime", `PT${Math.floor(temps / 60)}M${temps % 60}S`);
        timer.classList.toggle("is-danger", temps <= 30 && temps > 0);
    }

    if (temps === 0 && !timeUpShown) {
        timeUpShown = true;
        showOverlay("timeup");
        playSound("timeup");
    }
}

/* ============================================================
   OVERLAYS — contenu dynamique
============================================================ */
function setOverlayContent(type) {
    const eventName = readValue("nomEvenement");
    const category = readValue("categorie");
    const theme = readValue("theme");
    const teamsShowcase = getElement("teamsShowcase");
    const endmatchBlock = getElement("endmatchBlock");
    const overlayTitle = getElement("overlayTitle");
    const overlayText = getElement("overlayText");

    // Masquer tous les blocs par défaut
    if (teamsShowcase) teamsShowcase.style.display = "none";
    if (endmatchBlock) endmatchBlock.style.display = "none";
    if (overlayTitle) overlayTitle.style.display = "none";
    if (overlayText) overlayText.style.display = "none";

    // ------- PRÉSENTATION ÉQUIPES -------
    if (type === "teams") {
        setText("overlayKicker", eventName);
        if (teamsShowcase) teamsShowcase.style.display = "flex";
        getElement("overlayLogo").src = "./asset/images/improcast_arena_logo_officiel-removebg.png";
        getElement("teamLeft").style.display = "block";
        getElement("teamRight").style.display = "block";
        setText("teamLeft", readValue("nomEquipeRouge"));
        setText("teamRight", readValue("nomEquipeBleue"));
        return;
    }

    // ------- INTRO -------
    if (type === "intro") {
        setText("overlayKicker", "LIGUE D'IMPRO LILLE");
        if (teamsShowcase) teamsShowcase.style.display = "flex";
        getElement("overlayLogo").src = "./asset/images/improcast-arena-logo-intro.png";
        getElement("teamLeft").style.display = "none";
        getElement("teamRight").style.display = "none";
        return;
    }

    // ------- FIN DE MATCH (P1) -------
    if (type === "endmatch") {
        if (endmatchBlock) endmatchBlock.style.display = "flex";
        const scoreR = readNumber("scoreRouge", 0);
        const scoreB = readNumber("scoreBleu", 0);
        const nomR = readValue("nomEquipeRouge");
        const nomB = readValue("nomEquipeBleue");

        let winnerText = "";
        if (scoreR > scoreB) {
            winnerText = `🏆 ${nomR}`;
            getElement("endmatchBlock").classList.add("winner-rouge");
            getElement("endmatchBlock").classList.remove("winner-bleu", "winner-egalite");
        } else if (scoreB > scoreR) {
            winnerText = `🏆 ${nomB}`;
            getElement("endmatchBlock").classList.add("winner-bleu");
            getElement("endmatchBlock").classList.remove("winner-rouge", "winner-egalite");
        } else {
            winnerText = "ÉGALITÉ !";
            getElement("endmatchBlock").classList.add("winner-egalite");
            getElement("endmatchBlock").classList.remove("winner-rouge", "winner-bleu");
        }

        setText("overlayKicker", eventName);
        setText("endmatchWinner", winnerText);
        setText("endmatchScores", `${scoreR} – ${scoreB}`);
        return;
    }

    // ------- SIFFLET / ARRÊT DE JEU (P1) -------
    if (type === "whistle") {
        setText("overlayKicker", eventName);
        if (overlayTitle) { overlayTitle.style.display = "block"; overlayTitle.textContent = "⚡ ARRÊT DE JEU"; }
        if (overlayText) { overlayText.style.display = "block"; overlayText.textContent = ""; }
        return;
    }

    // ------- PÉNALITÉ -------
    if (type === "penalty") {
        setText("overlayKicker", localStorage.getItem("penaltyTeam") || "");
        if (overlayTitle) { overlayTitle.style.display = "block"; overlayTitle.textContent = "🟥 CARTON"; }
        if (overlayText) { overlayText.style.display = "block"; overlayText.textContent = localStorage.getItem("penaltyReason") || ""; }
        return;
    }

    // ------- CATÉGORIE / THÈME / TIME-UP -------
    const titleMap = {
        category: "CATÉGORIE",
        theme: "THÈME",
        timeup: "TIME UP !"
    };
    const textMap = {
        category: category,
        theme: theme,
        timeup: "Fin du chrono"
    };

    setText("overlayKicker", eventName);
    if (overlayTitle) { overlayTitle.style.display = "block"; overlayTitle.textContent = titleMap[type] || ""; }
    if (overlayText) { overlayText.style.display = "block"; overlayText.textContent = textMap[type] || ""; }
}

/* ============================================================
   AFFICHER / MASQUER UN OVERLAY
============================================================ */
function showOverlay(type) {
    const overlay = getElement("arenaOverlay");
    if (!overlay) return;

    if (type === "none") {
        overlay.className = "arena-overlay";
        overlay.setAttribute("aria-hidden", "true");
        return;
    }

    setOverlayContent(type);

    overlay.className = `arena-overlay is-visible overlay-${type}`;
    overlay.setAttribute("aria-hidden", "false");
    replayAnimation(overlay, "overlay-pulse");

    // Masquage automatique selon le type
    const autoDismiss = {
        category: 5200,
        theme: 5200,
        timeup: null,       // Reste affiché jusqu'à action manuelle
        penalty: 3000,
        whistle: 2800,
        intro: 6500,
        endmatch: null,     // Reste affiché — fin de match
    };

    if (type in autoDismiss && autoDismiss[type] !== null) {
        window.clearTimeout(showOverlay._timeout);
        showOverlay._timeout = window.setTimeout(() => showOverlay("none"), autoDismiss[type]);
    }

    // Sons associés
    const soundMap = {
        category: "category",
        theme: "theme",
        penalty: "penalty",
        whistle: "whistle",
        timeup: "timeup",
        endmatch: "endmatch",
        intro: "category",
    };
    if (soundMap[type]) playSound(soundMap[type]);
}

/* ============================================================
   TEXTE ANIMÉ
============================================================ */
function updateAnimatedText(id, value, animationClass) {
    const el = getElement(id);
    if (!el) return;
    if (el.textContent !== String(value)) {
        el.textContent = value;
        replayAnimation(el, animationClass);
    }
}

/* ============================================================
   BOUCLE PRINCIPALE — synchronisation localStorage → affichage
============================================================ */
function mettreAJourAffichage() {
    const dureeInitiale = readNumber("dureeInitiale", defaultState.dureeInitiale);
    const storedTime = readNumber("chronoRestant", dureeInitiale);
    const chronoState = localStorage.getItem("etatChrono");

    if (chronoState === "reset") {
        temps = dureeInitiale;
        timeUpShown = false;
        showOverlay("none");
        localStorage.setItem("chronoRestant", temps);
        localStorage.setItem("etatChrono", "pause");
    } else if (chronoState !== "start") {
        temps = storedTime;
        if (temps > 0) timeUpShown = false;
    }

    const current = {
        scoreRouge:     readNumber("scoreRouge",     defaultState.scoreRouge),
        scoreBleu:      readNumber("scoreBleu",      defaultState.scoreBleu),
        penaliteRouge:  readNumber("penaliteRouge",  defaultState.penaliteRouge),
        penaliteBleu:   readNumber("penaliteBleu",   defaultState.penaliteBleu),
        nomEquipeRouge: readValue("nomEquipeRouge"),
        nomEquipeBleue: readValue("nomEquipeBleue"),
        categorie:      readValue("categorie"),
        theme:          readValue("theme"),
        nomEvenement:   readValue("nomEvenement"),
        logoTroupe:     readValue("logoTroupe"),
    };

    updateAnimatedText("scoreRougeAff", current.scoreRouge, "score-pop");
    updateAnimatedText("scoreBleuAff",  current.scoreBleu,  "score-pop");
    setText("penaliteRougeAff", `🟥 ×${current.penaliteRouge}`);
    setText("penaliteBleuAff",  `🟦 ×${current.penaliteBleu}`);
    setText("nomRougeAff", current.nomEquipeRouge);
    setText("nomBleuAff",  current.nomEquipeBleue);
    updateAnimatedText("categorieAff", current.categorie, "info-swipe");
    updateAnimatedText("themeAff",     current.theme,     "info-swipe");
    setText("eventNameAff", current.nomEvenement);
    updateLogo(current.logoTroupe);
    afficherChrono();

    // Son sur changement de score
    if (
        lastState.scoreRouge !== undefined &&
        (lastState.scoreRouge !== current.scoreRouge || lastState.scoreBleu !== current.scoreBleu)
    ) {
        playSound("score");
    }

    // Synchronisation overlay via stamp
    const overlayStamp = readValue("arenaOverlayStamp");
    if (overlayStamp !== lastOverlayStamp) {
        lastOverlayStamp = overlayStamp;
        showOverlay(readValue("arenaOverlay"));
    }

    lastState = { ...current };
}

/* ============================================================
   CHRONO — tick chaque seconde
============================================================ */
setInterval(() => {
    if (localStorage.getItem("etatChrono") === "start" && temps > 0) {
        temps -= 1;
        localStorage.setItem("chronoRestant", temps);
        afficherChrono();
    }
}, 1000);

/* ============================================================
   BOUCLE DE SYNCHRO — 300 ms
============================================================ */
setInterval(mettreAJourAffichage, 300);

/* ============================================================
   BOUTON PLEIN ÉCRAN
============================================================ */
getElement("pleinEcran").addEventListener("click", () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
    } else {
        document.exitFullscreen();
    }
});

/* ============================================================
   INIT
============================================================ */
mettreAJourAffichage();
