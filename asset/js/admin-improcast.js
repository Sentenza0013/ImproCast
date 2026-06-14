const defaults = {
    scoreRouge: 0,
    scoreBleu: 0,
    penaliteRouge: 0,
    penaliteBleu: 0,
    nomEquipeRouge: "",
    nomEquipeBleue: "",
    categorie: "Libre",
    theme: "",
    nomEvenement: "Match d'improvisation",
    logoTroupe: "",
    sonsActifs: "false",
    dureeInitiale: 240,
    chronoRestant: 240,
    etatChrono: "pause",
    arenaOverlay: "none",
    arenaOverlayStamp: "0"
};

const elements = {
    scoreRouge: document.getElementById("scoreRouge"),
    scoreBleu: document.getElementById("scoreBleu"),
    penaliteRouge: document.getElementById("penaliteRouge"),
    penaliteBleu: document.getElementById("penaliteBleu"),
    nomEquipeRouge: document.getElementById("nomEquipeRouge"),
    nomEquipeBleue: document.getElementById("nomEquipeBleue"),
    categorie: document.getElementById("categorie"),
    theme: document.getElementById("theme"),
    nomEvenement: document.getElementById("nomEvenement"),
    logoTroupe: document.getElementById("logoTroupe"),
    sonsActifs: document.getElementById("sonsActifs"),
    dureeChrono: document.getElementById("dureeChrono")
};

function readNumber(key) {
    const storedValue = localStorage.getItem(key);

    if (storedValue === null) {
        return defaults[key];
    }

    const value = Number(storedValue);
    return Number.isFinite(value) ? value : defaults[key];
}

function readString(key) {
    return localStorage.getItem(key) ?? defaults[key];
}

function writeNumber(key, value) {
    const safeValue = Math.max(0, value);
    localStorage.setItem(key, safeValue);
    refreshAdmin();
}

function setStoredValue(key, value) {
    localStorage.setItem(key, value);
    refreshAdmin();
}

function changeNumber(key, delta) {
    writeNumber(key, readNumber(key) + delta);
}

function triggerOverlay(type) {
    localStorage.setItem("arenaOverlay", type);
    localStorage.setItem("arenaOverlayStamp", Date.now().toString());
}

function refreshAdmin() {
    elements.scoreRouge.textContent = readNumber("scoreRouge");
    elements.scoreBleu.textContent = readNumber("scoreBleu");
    elements.penaliteRouge.textContent = readNumber("penaliteRouge");
    elements.penaliteBleu.textContent = readNumber("penaliteBleu");
    elements.nomEquipeRouge.value = readString("nomEquipeRouge");
    elements.nomEquipeBleue.value = readString("nomEquipeBleue");
    elements.categorie.value = readString("categorie");
    elements.theme.value = readString("theme");
    elements.nomEvenement.value = readString("nomEvenement");
    elements.logoTroupe.value = readString("logoTroupe");
    elements.sonsActifs.checked = readString("sonsActifs") === "true";
    elements.dureeChrono.value = Math.max(1, readNumber("dureeInitiale") / 60);
}

document.getElementById("plusRouge").addEventListener("click", () => changeNumber("scoreRouge", 1));
document.getElementById("showTeams")
    .addEventListener("click", () => triggerOverlay("teams"));
document.getElementById("moinsRouge").addEventListener("click", () => changeNumber("scoreRouge", -1));
document.getElementById("plusBleu").addEventListener("click", () => changeNumber("scoreBleu", 1));
document.getElementById("moinsBleu").addEventListener("click", () => changeNumber("scoreBleu", -1));

document.getElementById("plusPenaliteRouge").addEventListener("click", () => changeNumber("penaliteRouge", 1));
document.getElementById("moinsPenaliteRouge").addEventListener("click", () => changeNumber("penaliteRouge", -1));
document.getElementById("plusPenaliteBleu").addEventListener("click", () => changeNumber("penaliteBleu", 1));
document.getElementById("moinsPenaliteBleu").addEventListener("click", () => changeNumber("penaliteBleu", -1));

elements.nomEquipeRouge.addEventListener("input", () => setStoredValue("nomEquipeRouge", elements.nomEquipeRouge.value));
elements.nomEquipeBleue.addEventListener("input", () => setStoredValue("nomEquipeBleue", elements.nomEquipeBleue.value));
elements.categorie.addEventListener("change", () => {
    setStoredValue("categorie", elements.categorie.value);
    triggerOverlay("category");
});
elements.theme.addEventListener("input", () => setStoredValue("theme", elements.theme.value));
elements.nomEvenement.addEventListener("input", () => setStoredValue("nomEvenement", elements.nomEvenement.value));
elements.logoTroupe.addEventListener("input", () => setStoredValue("logoTroupe", elements.logoTroupe.value));
elements.sonsActifs.addEventListener("change", () => setStoredValue("sonsActifs", elements.sonsActifs.checked ? "true" : "false"));

document.getElementById("appliquerDuree").addEventListener("click", () => {
    const minutes = Math.max(1, Number(elements.dureeChrono.value) || 4);
    const seconds = minutes * 60;

    localStorage.setItem("dureeInitiale", seconds);
    localStorage.setItem("chronoRestant", seconds);
    localStorage.setItem("etatChrono", "pause");
    refreshAdmin();
});

document.getElementById("startChrono").addEventListener("click", () => {
    localStorage.setItem("etatChrono", "start");
});

document.getElementById("pauseChrono").addEventListener("click", () => {
    localStorage.setItem("etatChrono", "pause");
});

document.getElementById("resetChrono").addEventListener("click", () => {
    localStorage.setItem("etatChrono", "reset");
});

document.getElementById("showIntro").addEventListener("click", () => triggerOverlay("intro"));
document.getElementById("showCategorie").addEventListener("click", () => triggerOverlay("category"));
document.getElementById("showTheme").addEventListener("click", () => triggerOverlay("theme"));
document.getElementById("hideOverlay").addEventListener("click", () => triggerOverlay("none"));

document.getElementById("resetMatch").addEventListener("click", () => {
    Object.entries(defaults).forEach(([key, value]) => {
        localStorage.setItem(key, value);
    });

    refreshAdmin();
});

refreshAdmin();
