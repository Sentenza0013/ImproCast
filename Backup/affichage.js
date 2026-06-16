const defaultState = {
    scoreRouge: 0,
    scoreBleu: 0,
    penaliteRouge: 0,
    penaliteBleu: 0,
    nomEquipeRouge: "Les Rouges",
    nomEquipeBleue: "Les Bleus",
    categorie: "Libre",
    theme: "Aucun th\u00e8me",
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
let audioContext;

function readValue(key) {
    return localStorage.getItem(key) || defaultState[key];
}

function readNumber(key, fallback) {
    const storedValue = localStorage.getItem(key);

    if (storedValue === null) {
        return fallback;
    }

    const value = Number(storedValue);
    return Number.isFinite(value) ? value : fallback;
}

function getElement(id) {
    return document.getElementById(id);
}

function setText(id, value) {
    const element = getElement(id);

    if (element) {
        element.textContent = value;
    }
}

function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function replayAnimation(element, className) {
    if (!element) {
        return;
    }

    element.classList.remove(className);
    void element.offsetWidth;
    element.classList.add(className);
}

function soundEnabled() {
    return readValue("sonsActifs") === "true";
}

function playArenaTone(type) {
    if (!soundEnabled()) {
        return;
    }

    const AudioContext = window.AudioContext || window.webkitAudioContext;

    if (!AudioContext) {
        return;
    }

    audioContext = audioContext || new AudioContext();

    if (audioContext.state === "suspended") {
        audioContext.resume();
    }

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const now = audioContext.currentTime;
    const tone = {
        score: [660, 0.16, 0.08],
        reveal: [440, 0.28, 0.06],
        timeup: [130, 0.7, 0.14]
    }[type] || [330, 0.2, 0.06];

    oscillator.type = type === "timeup" ? "sawtooth" : "triangle";
    oscillator.frequency.setValueAtTime(tone[0], now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(tone[2], now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + tone[1]);

    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + tone[1] + 0.02);
}

function updateLogo(url) {
    const logoBadge = getElement("logoBadge");
    const overlayLogo = getElement("overlayLogo");
    const safeUrl = String(url || "").trim();

    [logoBadge, overlayLogo].forEach((element) => {
        if (!element) {
            return;
        }

        element.textContent = safeUrl ? "" : "IC";
        element.style.backgroundImage = safeUrl ? `url("${safeUrl}")` : "";
    });
}

function afficherChrono() {
    const timer = getElement("chronoAff");
    setText("chronoAff", formatTime(temps));

    if (timer) {
        timer.classList.toggle("is-danger", temps <= 30 && temps > 0);
    }

    if (temps === 0 && !timeUpShown) {
        timeUpShown = true;
        showOverlay("timeup");
        playArenaTone("timeup");
    }
}

function setOverlayContent(type) {

    const eventName = readValue("nomEvenement");
    const category = readValue("categorie");
    const theme = readValue("theme");

    const teamsShowcase = document.querySelector(".teams-showcase");

    if (type === "teams") {

    setText("overlayKicker", eventName);

    teamsShowcase.style.display = "flex";

    getElement("overlayLogo").src =
    "./asset/images/improcast_arena_logo_officiel-removebg.png";

    getElement("teamLeft").style.display = "block";
    getElement("teamRight").style.display = "block";

    getElement("overlayTitle").style.display = "none";
    getElement("overlayText").style.display = "none";

    getElement("teamLeft").textContent =
        readValue("nomEquipeRouge");

    getElement("teamRight").textContent =
        readValue("nomEquipeBleue");

    return;
}

    if (type === "intro") {

    teamsShowcase.style.display = "flex";

    getElement("overlayLogo").src =
    "./asset/images/improcast-arena-logo-intro.png";

    getElement("teamLeft").style.display = "none";
    getElement("teamRight").style.display = "none";

    setText("overlayKicker", "LIGUE D'IMPRO LILLE");

    getElement("overlayTitle").style.display = "none";
    getElement("overlayText").style.display = "none";

    return;
}

    teamsShowcase.style.display = "none";

    getElement("overlayTitle").style.display = "block";
    getElement("overlayText").style.display = "block";

    getElement("teamLeft").style.display = "block";
    getElement("teamRight").style.display = "block";
if (type === "penalty") {

    teamsShowcase.style.display = "none";

    getElement("overlayTitle").style.display = "block";
    getElement("overlayText").style.display = "block";

    setText(
        "overlayKicker",
        localStorage.getItem("penaltyTeam") || ""
    );

    setText(
        "overlayTitle",
        "🟥 CARTON"
    );

    setText(
        "overlayText",
        localStorage.getItem("penaltyReason") || ""
    );

    return;
}
    const titleMap = {
        category: "CATÉGORIE",
        theme: "THÈME",
        timeup: "TIME UP !",
        penalty: "🟥 CARTON"
    };

    const textMap = {
        category: category,
        theme: theme,
        timeup: "Fin du chrono",
        penalty: localStorage.getItem("penaltyReason") || ""
    };

    setText("overlayKicker", eventName);

    setText("overlayTitle", titleMap[type] || "");
    setText("overlayText", textMap[type] || "");
}

function showOverlay(type) {

    const overlay = getElement("arenaOverlay");

    if (!overlay) {
        return;
    }

    if (type === "none") {
        overlay.className = "arena-overlay";
        overlay.setAttribute("aria-hidden", "true");
        return;
    }

    setOverlayContent(type);

    overlay.className = `arena-overlay is-visible overlay-${type}`;

    if (type === "intro") {
    overlay.classList.add("overlay-intro");
}

if (type === "penalty") {
    overlay.classList.add("overlay-penalty");
}

    overlay.setAttribute("aria-hidden", "false");

    replayAnimation(overlay, "overlay-pulse");

    if (type === "teams") {
        return;
    }

    if (
    type === "category" ||
    type === "theme" ||
    type === "intro" ||
    type === "penalty"
)
    {

        playArenaTone("reveal");

        window.clearTimeout(showOverlay.timeout);

        showOverlay.timeout = window.setTimeout(
    () => showOverlay("none"),
    type === "intro"
        ? 6500
        : type === "penalty"
        ? 3000
        : 5200
);
    }
}

function updateAnimatedText(id, value, animationClass) {
    const element = getElement(id);

    if (!element) {
        return;
    }

    if (element.textContent !== String(value)) {
        element.textContent = value;
        replayAnimation(element, animationClass);
    }
}

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
        if (temps > 0) {
            timeUpShown = false;
        }
    }

    const current = {
        scoreRouge: readNumber("scoreRouge", defaultState.scoreRouge),
        scoreBleu: readNumber("scoreBleu", defaultState.scoreBleu),
        penaliteRouge: readNumber("penaliteRouge", defaultState.penaliteRouge),
        penaliteBleu: readNumber("penaliteBleu", defaultState.penaliteBleu),
        nomEquipeRouge: readValue("nomEquipeRouge"),
        nomEquipeBleue: readValue("nomEquipeBleue"),
        categorie: readValue("categorie"),
        theme: readValue("theme"),
        nomEvenement: readValue("nomEvenement"),
        logoTroupe: readValue("logoTroupe")
    };

    updateAnimatedText("scoreRougeAff", current.scoreRouge, "score-pop");
    updateAnimatedText("scoreBleuAff", current.scoreBleu, "score-pop");
    setText(
    "penaliteRougeAff",
    `🟥 ${current.penaliteRouge}`
);

setText(
    "penaliteBleuAff",
    `🟥 ${current.penaliteBleu}`
);
    setText("nomRougeAff", current.nomEquipeRouge);
    setText("nomBleuAff", current.nomEquipeBleue);
    updateAnimatedText("categorieAff", current.categorie, "info-swipe");
    updateAnimatedText("themeAff", current.theme, "info-swipe");
    setText("eventNameAff", current.nomEvenement);
    updateLogo(current.logoTroupe);
    afficherChrono();

    if (lastState.scoreRouge !== undefined && (lastState.scoreRouge !== current.scoreRouge || lastState.scoreBleu !== current.scoreBleu)) {
        playArenaTone("score");
    }

    const overlayStamp = readValue("arenaOverlayStamp");
    if (overlayStamp !== lastOverlayStamp) {
        lastOverlayStamp = overlayStamp;
        showOverlay(readValue("arenaOverlay"));
    }

    lastState = current;
}

setInterval(() => {
    if (localStorage.getItem("etatChrono") === "start" && temps > 0) {
        temps -= 1;
        localStorage.setItem("chronoRestant", temps);
        afficherChrono();
    }
}, 1000);

setInterval(mettreAJourAffichage, 300);

document.getElementById("pleinEcran").addEventListener("click", () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
});

mettreAJourAffichage();
