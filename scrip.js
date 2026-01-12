// =============================
// GESTION DU FORMULAIRE
// =============================

const form = document.getElementById("formInscription");

if (form) {
    form.addEventListener("submit", function (e) {
        e.preventDefault();

        let nom = document.getElementById("nom").value.trim();
        let prenom = document.getElementById("prenom").value.trim();
        let email = document.getElementById("email").value.trim();
        let annexe = document.getElementById("annexe").value;

        // Récupération existante
        let inscrits = JSON.parse(localStorage.getItem("inscrits")) || [];

        // Vérification doublon (email unique)
        if (inscrits.some(x => x.email.toLowerCase() === email.toLowerCase())) {
            alert("Cette personne est déjà inscrite !");
            return;
        }

        // Ajout de l'inscription
        inscrits.push({
            nom: nom,
            prenom: prenom,
            email: email,
            annexe: annexe,
            statut: "Accepté",
            date: new Date().toLocaleString()
        });

        // Sauvegarde
        localStorage.setItem("inscrits", JSON.stringify(inscrits));

        alert("Inscription réussie !");
        form.reset();
    });
}



// Ce fichier était un doublon nommé `scrip.js`.
// Il a été neutralisé pour éviter la confusion.
// Toutes les fonctionnalités sont désormais centralisées dans `script.js`.
// Si vous préférez supprimer ce fichier, vous pouvez le faire manuellement.
const table = document.getElementById("tableInscrits");
