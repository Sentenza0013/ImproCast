let scoreRouge = 0;
let scoreBleu = 0;

const affichageRouge = document.getElementById("scoreRouge");
const affichageBleu = document.getElementById("scoreBleu");

document.getElementById("plusRouge").addEventListener("click", () => {
    scoreRouge++;
affichageRouge.textContent = scoreRouge;

localStorage.setItem("scoreRouge", scoreRouge);
});

document.getElementById("moinsRouge").addEventListener("click", () => {
    if (scoreRouge > 0) {
        scoreRouge--;
        affichageRouge.textContent = scoreRouge;
        localStorage.setItem("scoreRouge", scoreRouge);
    }
});

document.getElementById("plusBleu").addEventListener("click", () => {
    scoreBleu++;
    affichageBleu.textContent = scoreBleu;
    localStorage.setItem("scoreBleu", scoreBleu);
});

document.getElementById("moinsBleu").addEventListener("click", () => {
    if (scoreBleu > 0) {
        scoreBleu--;
        affichageBleu.textContent = scoreBleu;
        localStorage.setItem("scoreBleu", scoreBleu);
    }
});
const nomEquipeRouge =
    document.getElementById("nomEquipeRouge");

const nomEquipeBleue =
    document.getElementById("nomEquipeBleue");
nomEquipeRouge.addEventListener("input", () => {

    localStorage.setItem(
        "nomEquipeRouge",
        nomEquipeRouge.value
    );

});

nomEquipeBleue.addEventListener("input", () => {

    localStorage.setItem(
        "nomEquipeBleue",
        nomEquipeBleue.value
    );

});
document
.getElementById("startChrono")
.addEventListener("click", () => {

    localStorage.setItem(
        "etatChrono",
        "start"
    );

});

document
.getElementById("pauseChrono")
.addEventListener("click", () => {

    localStorage.setItem(
        "etatChrono",
        "pause"
    );

});

document
.getElementById("resetChrono")
.addEventListener("click", () => {

    localStorage.setItem(
        "etatChrono",
        "reset"
    );

});
const inputDuree =
    document.getElementById("dureeChrono");

const boutonDuree =
    document.getElementById("appliquerDuree");
    boutonDuree.addEventListener("click", () => {

    const minutes =
        Number(inputDuree.value);

    const secondes =
        minutes * 60;

    localStorage.setItem(
        "dureeInitiale",
        secondes
    );

});
const categorie =
    document.getElementById("categorie");
    categorie.addEventListener("change", () => {

    localStorage.setItem(
        "categorie",
        categorie.value
    );

});
const theme =
    document.getElementById("theme");

theme.addEventListener("input", () => {

    localStorage.setItem(
        "theme",
        theme.value
    );

});