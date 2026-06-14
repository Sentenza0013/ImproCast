let dureeInitiale =
    Number(
        localStorage.getItem("dureeInitiale")
    ) || 240;

let temps = dureeInitiale;
setInterval(() => {

    const etatChrono =
        localStorage.getItem("etatChrono");

    if (
        etatChrono === "start"
        &&
        temps > 0
    ) {

        temps--;

        afficherChrono();

    }

    if (etatChrono === "reset") {

        temps = dureeInitiale;

        afficherChrono();

        localStorage.setItem(
            "etatChrono",
            "pause"
        );

    }

}, 1000);
function afficherChrono() {

    let minutes = Math.floor(temps / 60);

    let secondes = temps % 60;

document.getElementById("chronoAff").textContent =

    String(minutes).padStart(2, "0")

    + ":"

    + String(secondes).padStart(2, "0");
}
function mettreAJourScores() {
    const categorie =
    localStorage.getItem("categorie");

if (categorie) {

    document.getElementById(
        "categorieAff"
    ).textContent = categorie;

}

    const scoreRouge =
        localStorage.getItem("scoreRouge") || 0;

    const scoreBleu =
        localStorage.getItem("scoreBleu") || 0;

    document.getElementById("scoreRougeAff").textContent =
        scoreRouge;

    document.getElementById("scoreBleuAff").textContent =
        scoreBleu;
    const nomRouge =
    localStorage.getItem("nomEquipeRouge");

const nomBleu =
    localStorage.getItem("nomEquipeBleue");

if (nomRouge) {
    document.getElementById("nomRougeAff")
        .textContent = nomRouge;
}

if (nomBleu) {
    document.getElementById("nomBleuAff")
        .textContent = nomBleu;
}
}

setInterval(mettreAJourScores, 500);
afficherChrono();
const boutonPleinEcran =
    document.getElementById("pleinEcran");

boutonPleinEcran.addEventListener(
    "click",
    () => {

        document.documentElement
            .requestFullscreen();

    }
);