/**
 * admin-improcast.js — ImproCast Arena
 * Régie du match
 * P1 : sifflet, fin de match, sauvegarde automatique, export TXT + PDF
 */

/* ============================================================
   VALEURS PAR DÉFAUT
============================================================ */
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
    sonsActifs: "false",
    dureeInitiale: 240,
    chronoRestant: 240,
    etatChrono: "pause",
    arenaOverlay: "none",
    arenaOverlayStamp: "0",
    derniereFauteRouge: "",
    derniereFauteBleue: "",
    historiqueRouge: "[]",
    historiqueBleu: "[]",
    themeArena: "classic",
};

/* ============================================================
   RÉFÉRENCES DOM
============================================================ */
const elements = {
    scoreRouge:     document.getElementById("scoreRouge"),
    scoreBleu:      document.getElementById("scoreBleu"),
    penaliteRouge:  document.getElementById("penaliteRouge"),
    penaliteBleu:   document.getElementById("penaliteBleu"),
    nomEquipeRouge: document.getElementById("nomEquipeRouge"),
    nomEquipeBleue: document.getElementById("nomEquipeBleue"),
    categorie:      document.getElementById("categorie"),
    theme:          document.getElementById("theme"),
    nomEvenement:   document.getElementById("nomEvenement"),
    sonsActifs:     document.getElementById("sonsActifs"),
    dureeChrono:    document.getElementById("dureeChrono"),
};

/* ============================================================
   LECTURE LOCALSTORAGE
============================================================ */
function readNumber(key) {
    const v = localStorage.getItem(key);
    if (v === null) return defaults[key] ?? 0;
    const n = Number(v);
    return Number.isFinite(n) ? n : (defaults[key] ?? 0);
}

function readString(key) {
    return localStorage.getItem(key) ?? defaults[key] ?? "";
}

/* ============================================================
   ÉCRITURE LOCALSTORAGE
============================================================ */
function writeNumber(key, value) {
    localStorage.setItem(key, Math.max(0, value));
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

/* ============================================================
   RAFRAÎCHISSEMENT ADMIN
============================================================ */
function refreshAdmin() {
    elements.scoreRouge.textContent    = readNumber("scoreRouge");
    elements.scoreBleu.textContent     = readNumber("scoreBleu");
    elements.penaliteRouge.textContent = readNumber("penaliteRouge");
    elements.penaliteBleu.textContent  = readNumber("penaliteBleu");
    elements.nomEquipeRouge.value      = readString("nomEquipeRouge");
    elements.nomEquipeBleue.value      = readString("nomEquipeBleue");
    elements.categorie.value           = readString("categorie");
    elements.theme.value               = readString("theme");
    elements.nomEvenement.value        = readString("nomEvenement");
    elements.sonsActifs.checked        = readString("sonsActifs") === "true";
    elements.dureeChrono.value         = Math.max(1, readNumber("dureeInitiale") / 60);
    document.getElementById("themeArena").value =
    readString("themeArena");
}

/* ============================================================
   SCORES
============================================================ */
document.getElementById("plusRouge").addEventListener("click",  () => changeNumber("scoreRouge",  1));
document.getElementById("moinsRouge").addEventListener("click", () => changeNumber("scoreRouge", -1));
document.getElementById("plusBleu").addEventListener("click",   () => changeNumber("scoreBleu",   1));
document.getElementById("moinsBleu").addEventListener("click",  () => changeNumber("scoreBleu",  -1));

/* ============================================================
   CHAMPS TEXTE & SELECTS
============================================================ */
elements.nomEquipeRouge.addEventListener("input", () => setStoredValue("nomEquipeRouge", elements.nomEquipeRouge.value));
elements.nomEquipeBleue.addEventListener("input", () => setStoredValue("nomEquipeBleue", elements.nomEquipeBleue.value));

elements.categorie.addEventListener("change", () => {
    setStoredValue("categorie", elements.categorie.value);
    triggerOverlay("category");
});

elements.theme.addEventListener("input", () => setStoredValue("theme", elements.theme.value));

// Bouton révéler le thème (nouveau)
document.getElementById("showThemeBtn").addEventListener("click", () => {
    setStoredValue("theme", elements.theme.value);
    triggerOverlay("theme");
});

elements.nomEvenement.addEventListener("input", () => setStoredValue("nomEvenement", elements.nomEvenement.value));
elements.sonsActifs.addEventListener("change",  () => setStoredValue("sonsActifs",   elements.sonsActifs.checked ? "true" : "false"));
document.getElementById("themeArena").addEventListener("change", (e) => {
    localStorage.setItem("themeArena", e.target.value);
});

/* ============================================================
   CHRONO
============================================================ */
document.getElementById("appliquerDuree").addEventListener("click", () => {
    const minutes = Math.max(1, Number(elements.dureeChrono.value) || 4);
    const seconds = minutes * 60;
    localStorage.setItem("dureeInitiale", seconds);
    localStorage.setItem("chronoRestant", seconds);
    localStorage.setItem("etatChrono", "pause");
    refreshAdmin();
});

document.getElementById("startChrono").addEventListener("click",  () => localStorage.setItem("etatChrono", "start"));
document.getElementById("pauseChrono").addEventListener("click",  () => localStorage.setItem("etatChrono", "pause"));
document.getElementById("resetChrono").addEventListener("click",  () => localStorage.setItem("etatChrono", "reset"));

/* ============================================================
   OVERLAYS — diffusion
============================================================ */
document.getElementById("showTeams").addEventListener("click",    () => triggerOverlay("teams"));
document.getElementById("showIntro").addEventListener("click",    () => triggerOverlay("intro"));
document.getElementById("showCategorie").addEventListener("click",() => triggerOverlay("category"));
document.getElementById("showTheme").addEventListener("click",    () => triggerOverlay("theme"));
document.getElementById("hideOverlay").addEventListener("click",  () => triggerOverlay("none"));

/* ============================================================
   🎵 SIFFLET — P1
============================================================ */
document.getElementById("sifflet").addEventListener("click", () => {
    triggerOverlay("whistle");
    // Flash visuel sur le bouton
    const btn = document.getElementById("sifflet");
    btn.classList.add("btn-flash");
    setTimeout(() => btn.classList.remove("btn-flash"), 600);
});

/* ============================================================
   🏆 FIN DE MATCH — P1
   Sauvegarde automatique + overlay
============================================================ */
document.getElementById("finMatch").addEventListener("click", () => {
    sauvegarderMatchData();
    triggerOverlay("endmatch");
});

/* ============================================================
   💾 SAUVEGARDE DE MATCH — P1
============================================================ */
function buildMatchRecord() {
    const now = new Date();
    const historiqueRouge = JSON.parse(localStorage.getItem("historiqueRouge") || "[]");
    const historiqueBleu  = JSON.parse(localStorage.getItem("historiqueBleu")  || "[]");

    return {
        id:            Date.now(),
        date:          now.toLocaleString("fr-FR"),
        nomEvenement:  readString("nomEvenement"),
        nomEquipeRouge: readString("nomEquipeRouge") || "Équipe Rouge",
        nomEquipeBleu:  readString("nomEquipeBleue") || "Équipe Bleue",
        scoreRouge:    readNumber("scoreRouge"),
        scoreBleu:     readNumber("scoreBleu"),
        penaliteRouge: readNumber("penaliteRouge"),
        penaliteBleu:  readNumber("penaliteBleu"),
        categorie:     readString("categorie"),
        theme:         readString("theme"),
        fautesRouge:   historiqueRouge,
        fautesBleu:    historiqueBleu,
        vainqueur: (() => {
            const r = readNumber("scoreRouge");
            const b = readNumber("scoreBleu");
            if (r > b) return readString("nomEquipeRouge") || "Équipe Rouge";
            if (b > r) return readString("nomEquipeBleue") || "Équipe Bleue";
            return "Égalité";
        })(),
    };
}

function sauvegarderMatchData() {
    const record = buildMatchRecord();
    const historique = JSON.parse(localStorage.getItem("matchsHistorique") || "[]");
    historique.unshift(record); // le plus récent en premier
    localStorage.setItem("matchsHistorique", JSON.stringify(historique));
    return record;
}

document.getElementById("sauvegarderMatch").addEventListener("click", () => {
    sauvegarderMatchData();
    const btn = document.getElementById("sauvegarderMatch");
    btn.textContent = "✅ Sauvegardé !";
    setTimeout(() => { btn.textContent = "💾 Sauvegarder le match"; }, 2000);
});

/* ============================================================
   📄 EXPORT TXT — P1
============================================================ */
function buildTxtContent(record) {
    const sep = "═".repeat(48);
    const line = "─".repeat(48);

    const fautesRTxt = record.fautesRouge.length
        ? record.fautesRouge.map((f, i) => `  ${i + 1}. ${f}`).join("\n")
        : "  Aucune";
    const fautesBTxt = record.fautesBleu.length
        ? record.fautesBleu.map((f, i) => `  ${i + 1}. ${f}`).join("\n")
        : "  Aucune";

    return [
        sep,
        `IMPROCAST ARENA — RÉSULTAT DE MATCH`,
        sep,
        ``,
        `Événement : ${record.nomEvenement}`,
        `Date      : ${record.date}`,
        ``,
        line,
        `SCORES`,
        line,
        `${record.nomEquipeRouge.padEnd(24)} ${record.scoreRouge}`,
        `${record.nomEquipeBleu.padEnd(24)} ${record.scoreBleu}`,
        ``,
        `🏆 Vainqueur : ${record.vainqueur}`,
        ``,
        line,
        `IMPROVISATION`,
        line,
        `Catégorie : ${record.categorie}`,
        `Thème     : ${record.theme || "Non défini"}`,
        ``,
        line,
        `PÉNALITÉS`,
        line,
        `${record.nomEquipeRouge} (${record.penaliteRouge} pénalité(s)) :`,
        fautesRTxt,
        ``,
        `${record.nomEquipeBleu} (${record.penaliteBleu} pénalité(s)) :`,
        fautesBTxt,
        ``,
        sep,
        `Généré par ImproCast Arena`,
        sep,
    ].join("\n");
}

document.getElementById("exportTxt").addEventListener("click", () => {
    const record = buildMatchRecord();
    const content = buildTxtContent(record);
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `improcast-match-${record.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

/* ============================================================
   📑 EXPORT PDF — P1 (HTML → window.print())
   Génère une page HTML stylée et lance l'impression PDF
============================================================ */
document.getElementById("exportPdf").addEventListener("click", () => {
    const record = buildMatchRecord();
    const fautesRHtml = record.fautesRouge.length
        ? `<ol>${record.fautesRouge.map(f => `<li>${f}</li>`).join("")}</ol>`
        : "<p>Aucune</p>";
    const fautesBHtml = record.fautesBleu.length
        ? `<ol>${record.fautesBleu.map(f => `<li>${f}</li>`).join("")}</ol>`
        : "<p>Aucune</p>";

    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>ImproCast Arena — Résultat</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Inter',Arial,sans-serif;color:#0a0a14;background:#fff;padding:40px}
  h1{font-size:2rem;font-weight:900;color:#0a0a14;text-transform:uppercase;letter-spacing:2px;margin-bottom:4px}
  .eyebrow{font-size:.8rem;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:2px;margin-bottom:12px}
  .sep{border:none;border-top:3px solid #0a0a14;margin:20px 0}
  .sep-thin{border:none;border-top:1px solid #ddd;margin:14px 0}
  h2{font-size:1rem;font-weight:900;text-transform:uppercase;letter-spacing:1px;color:#444;margin-bottom:12px}
  .score-table{width:100%;border-collapse:collapse;margin-bottom:12px}
  .score-table td{padding:10px 16px;font-size:1.1rem}
  .score-table .team-name{font-weight:700}
  .score-table .team-score{font-size:2rem;font-weight:900;text-align:right;width:80px}
  .rouge-row{background:#fff2f2;border-left:5px solid #ff2d46}
  .bleu-row{background:#f0f8ff;border-left:5px solid #00a7ff}
  .winner-badge{display:inline-block;background:#ffd44d;color:#07111f;font-weight:900;font-size:1rem;
    padding:8px 20px;border-radius:6px;text-transform:uppercase;letter-spacing:1px;margin:12px 0}
  .info-row{display:flex;gap:40px;margin-bottom:8px}
  .info-item label{font-size:.75rem;font-weight:700;text-transform:uppercase;color:#888;display:block;margin-bottom:2px}
  .info-item span{font-size:1rem;font-weight:700}
  ol{padding-left:20px;margin:8px 0}
  ol li{margin-bottom:4px;font-size:.95rem}
  .penalty-section{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:8px}
  .footer{margin-top:32px;font-size:.75rem;color:#aaa;text-align:center;border-top:1px solid #eee;padding-top:16px}
  @media print{body{padding:20px}}
</style>
</head>
<body>
  <p class="eyebrow">ImproCast Arena</p>
  <h1>Résultat de match</h1>
  <p style="color:#888;font-size:.9rem;margin-top:4px">${record.date} — ${record.nomEvenement}</p>

  <hr class="sep">
  <h2>Scores</h2>
  <table class="score-table">
    <tr class="rouge-row">
      <td class="team-name">${record.nomEquipeRouge}</td>
      <td class="team-score">${record.scoreRouge}</td>
    </tr>
    <tr class="bleu-row">
      <td class="team-name">${record.nomEquipeBleu}</td>
      <td class="team-score">${record.scoreBleu}</td>
    </tr>
  </table>
  <div class="winner-badge">🏆 ${record.vainqueur}</div>

  <hr class="sep">
  <h2>Improvisation</h2>
  <div class="info-row">
    <div class="info-item"><label>Catégorie</label><span>${record.categorie}</span></div>
    <div class="info-item"><label>Thème</label><span>${record.theme || "Non défini"}</span></div>
  </div>

  <hr class="sep">
  <h2>Pénalités</h2>
  <div class="penalty-section">
    <div>
      <h3 style="font-size:.85rem;text-transform:uppercase;color:#ff2d46;margin-bottom:8px">
        ${record.nomEquipeRouge} — ${record.penaliteRouge} pénalité(s)
      </h3>
      ${fautesRHtml}
    </div>
    <div>
      <h3 style="font-size:.85rem;text-transform:uppercase;color:#00a7ff;margin-bottom:8px">
        ${record.nomEquipeBleu} — ${record.penaliteBleu} pénalité(s)
      </h3>
      ${fautesBHtml}
    </div>
  </div>

  <div class="footer">Généré par ImproCast Arena · ${record.date}</div>

  <script>window.onload = () => { window.print(); }<\/script>
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    if (win) {
        win.onafterprint = () => {
            win.close();
            URL.revokeObjectURL(url);
        };
    }
});

/* ============================================================
   📋 HISTORIQUE DES MATCHS SAUVEGARDÉS — P1
============================================================ */
document.getElementById("voirHistorique").addEventListener("click", () => {
    const panel = document.getElementById("panelHistorique");
    panel.style.display = panel.style.display === "none" ? "block" : "none";
    if (panel.style.display === "block") renderMatchHistory();
});

document.getElementById("fermerHistorique").addEventListener("click", () => {
    document.getElementById("panelHistorique").style.display = "none";
});

function renderMatchHistory() {
    const historique = JSON.parse(localStorage.getItem("matchsHistorique") || "[]");
    const container = document.getElementById("listeMatchs");

    if (historique.length === 0) {
        container.innerHTML = '<p style="color:var(--muted)">Aucun match sauvegardé.</p>';
        return;
    }

    container.innerHTML = historique.map((m, idx) => `
        <div class="match-record">
            <div class="match-record-header">
                <span class="match-date">${m.date}</span>
                <span class="match-event">${m.nomEvenement}</span>
            </div>
            <div class="match-record-scores">
                <span class="mr-rouge">${m.nomEquipeRouge} <strong>${m.scoreRouge}</strong></span>
                <span class="mr-sep">–</span>
                <span class="mr-bleu"><strong>${m.scoreBleu}</strong> ${m.nomEquipeBleu}</span>
            </div>
            <div class="match-record-meta">
                🏆 ${m.vainqueur} · 📁 ${m.categorie} · 🎭 ${m.theme || "—"}
            </div>
            <button type="button" class="btn-delete-match btn-secondary" data-idx="${idx}">🗑 Supprimer</button>
        </div>
    `).join("");

    // Suppression d'un match
    container.querySelectorAll(".btn-delete-match").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const i = Number(e.currentTarget.dataset.idx);
            const h = JSON.parse(localStorage.getItem("matchsHistorique") || "[]");
            h.splice(i, 1);
            localStorage.setItem("matchsHistorique", JSON.stringify(h));
            renderMatchHistory();
        });
    });
}

/* ============================================================
   PÉNALITÉS — motifs personnalisés
============================================================ */
const fauteRouge = document.getElementById("fauteRouge");
const fauteRougeCustom = document.getElementById("fauteRougeCustom");
const fauteBleue = document.getElementById("fauteBleue");
const fauteBleueCustom = document.getElementById("fauteBleueCustom");

fauteRouge.addEventListener("change", () => {
    fauteRougeCustom.style.display = fauteRouge.value === "Autre..." ? "block" : "none";
});
fauteBleue.addEventListener("change", () => {
    fauteBleueCustom.style.display = fauteBleue.value === "Autre..." ? "block" : "none";
});

/* ============================================================
   PÉNALITÉS — ajout
============================================================ */
function ajouterFaute(equipe) {
    const select = equipe === "rouge" ? fauteRouge : fauteBleue;
    const custom  = equipe === "rouge" ? fauteRougeCustom : fauteBleueCustom;
    const keyPen  = equipe === "rouge" ? "penaliteRouge" : "penaliteBleu";
    const keyHist = equipe === "rouge" ? "historiqueRouge" : "historiqueBleu";
    const teamLabel = equipe === "rouge" ? "Rouge" : "Bleue";

    let faute = select.value === "Autre..." ? custom.value.trim() : select.value;
    if (!faute) return;

    changeNumber(keyPen, 1);
    localStorage.setItem(`derniereFaute${equipe.charAt(0).toUpperCase() + equipe.slice(1)}`, faute);

    const historique = JSON.parse(localStorage.getItem(keyHist) || "[]");
    historique.push(faute);
    localStorage.setItem(keyHist, JSON.stringify(historique));
    refreshHistorique();

    localStorage.setItem("penaltyTeam", teamLabel);
    localStorage.setItem("penaltyReason", faute);
    triggerOverlay("penalty");
}

function annulerFaute(equipe) {
    const keyHist = equipe === "rouge" ? "historiqueRouge" : "historiqueBleu";
    const keyPen  = equipe === "rouge" ? "penaliteRouge" : "penaliteBleu";

    const historique = JSON.parse(localStorage.getItem(keyHist) || "[]");
    if (historique.length === 0) return;
    historique.pop();
    localStorage.setItem(keyHist, JSON.stringify(historique));
    localStorage.setItem(keyPen, Math.max(0, readNumber(keyPen) - 1));
    refreshHistorique();
    refreshAdmin();
}

document.getElementById("ajouterFauteRouge").addEventListener("click", () => ajouterFaute("rouge"));
document.getElementById("ajouterFauteBleue").addEventListener("click", () => ajouterFaute("bleue"));
document.getElementById("annulerFauteRouge").addEventListener("click", () => annulerFaute("rouge"));
document.getElementById("annulerFauteBleue").addEventListener("click", () => annulerFaute("bleue"));

/* ============================================================
   HISTORIQUE DES FAUTES (affichage admin)
============================================================ */
function refreshHistorique() {
    const rouge = JSON.parse(localStorage.getItem("historiqueRouge") || "[]");
    const bleu  = JSON.parse(localStorage.getItem("historiqueBleu")  || "[]");

    document.getElementById("historiqueRouge").innerHTML = `
        <div><strong>Total : ${rouge.length}</strong></div>
        ${rouge.map(f => `<div>🟥 ${f}</div>`).join("")}
    `;
    document.getElementById("historiqueBleu").innerHTML = `
        <div><strong>Total : ${bleu.length}</strong></div>
        ${bleu.map(f => `<div>🟦 ${f}</div>`).join("")}
    `;
}

/* ============================================================
   REMISE À ZÉRO
============================================================ */
document.getElementById("resetMatch").addEventListener("click", () => {
    Object.entries(defaults).forEach(([key, value]) => {
        localStorage.setItem(key, value);
    });
    refreshAdmin();
    refreshHistorique();
});

/* ============================================================
   INIT
============================================================ */
refreshAdmin();
refreshHistorique();
