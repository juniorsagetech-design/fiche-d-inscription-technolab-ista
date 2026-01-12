// =============================
// GESTION DU FORMULAIRE
// =============================

const form = document.getElementById("formInscription");

// Filieres chooser behavior
const btnFiliere = document.getElementById("btnFiliere");
const filiereList = document.getElementById("filiereList");
const filiereInput = document.getElementById("filiere");
const filiereChoisie = document.getElementById("filiereChoisie");

if (btnFiliere && filiereList) {
    btnFiliere.addEventListener("click", function () {
        filiereList.style.display = filiereList.style.display === 'none' ? 'block' : 'none';
    });

    // delegate click for filiere items
    filiereList.addEventListener('click', function (e) {
        if (e.target && e.target.classList.contains('filiere-item')) {
            const val = e.target.textContent.trim();
            filiereInput.value = val;
            filiereChoisie.textContent = val;
            filiereList.style.display = 'none';
        }
    });
}

if (form) {
    form.addEventListener("submit", function (e) {
        e.preventDefault();

        let nom = document.getElementById("nom").value.trim();
        let prenom = document.getElementById("prenom").value.trim();
        let email = document.getElementById("email").value.trim();
        let annexe = document.getElementById("annexe").value;
        let filiere = document.getElementById("filiere").value || '';
        let diplome = document.getElementById("diplome").value || '';
        let nationalite = document.getElementById("nationalite").value.trim() || '';
        let paysNaissance = document.getElementById("paysNaissance").value.trim() || '';
        let quartier = document.getElementById("quartier").value.trim() || '';

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
            filiere: filiere,
            diplome: diplome,
            nationalite: nationalite,
            paysNaissance: paysNaissance,
            quartier: quartier,
            statut: "Accepté",
            date: new Date().toLocaleString()
        });

        // Sauvegarde
        localStorage.setItem("inscrits", JSON.stringify(inscrits));

        alert("Inscription réussie !");
        form.reset();
        filiereChoisie.textContent = '';
    });
}



// =============================
// PAGE LISTE DES INSCRITS
// =============================

const table = document.getElementById("tableInscrits");

if (table) {
    // Restreindre l'accès aux pages de liste aux administrateurs uniquement.
    // Les étudiants sont redirigés vers `status.html` pour consulter leur statut.
    if (!sessionStorage.getItem('adminAuth')) {
        window.location.href = 'status.html';
        // stop further table rendering
    }
    function chargerListe() {
        let inscrits = JSON.parse(localStorage.getItem("inscrits")) || [];
        table.innerHTML = "";

        if (inscrits.length === 0) {
            table.innerHTML = '<tr><td colspan="10" class="empty">Aucun inscrit pour l\'instant.</td></tr>';
            return;
        }

        const isAdmin = !!sessionStorage.getItem('adminAuth');

        function statusBadge(s){
            const statut = (s || '').toLowerCase();
            if(statut === 'accepté' || statut === 'accepte' || statut === 'acceptee' || statut === 'accepted'){
                return `<span class="badge badge-accepted">${s}</span>`;
            }
            if(statut === 'en attente' || statut === 'enattente' || statut === 'waiting'){
                return `<span class="badge badge-waiting">${s}</span>`;
            }
            if(statut === 'annulé' || statut === 'annule' || statut === 'cancelled'){
                return `<span class="badge badge-cancelled">${s}</span>`;
            }
            return `<span class="badge">${s}</span>`;
        }

        inscrits.forEach((p, index) => {
            const actionsCell = isAdmin ? `
                    <td class="actions">
                        <button class="accept" onclick="accepter(${index})">Accepter</button>
                        <button class="wait" onclick="mettreEnAttente(${index})">En attente</button>
                        <button class="cancel" onclick="annuler(${index})">Annuler</button>
                        <button class="print" onclick="imprimer(${index})">Imprimer</button>
                        <button class="del" onclick="supprimer(${index})">Supprimer</button>
                    </td>
                ` : '<td></td>';

            let row = `
                <tr>
                    <td>${p.nom || ''}</td>
                    <td>${p.prenom || ''}</td>
                    <td>${p.email || ''}</td>
                    <td>${p.annexe || ''}</td>
                    <td>${p.filiere || ''}</td>
                    <td>${p.diplome || ''}</td>
                    <td>${p.nationalite || ''}</td>
                    <td>${p.paysNaissance || ''}</td>
                    <td>${p.quartier || ''}</td>
                    <td>${statusBadge(p.statut || '')}</td>
                    <td>${p.date || ''}</td>
                    ${actionsCell}
                </tr>
            `;
            table.innerHTML += row;
        });
    }

    chargerListe();



    // =============================
    // METTRE EN ATTENTE
    // =============================

    // Mettre explicitement en attente
    window.mettreEnAttente = function(index) {
        // Only admin can change status
        if (!sessionStorage.getItem('adminAuth')) { alert('Accès refusé : actions réservées à l\'administrateur.'); return; }
        let inscrits = JSON.parse(localStorage.getItem("inscrits")) || [];
        if (!inscrits[index]) return;
        inscrits[index].statut = "En attente";
        localStorage.setItem("inscrits", JSON.stringify(inscrits));
        chargerListe();
        try{ showToast('Statut mis en attente'); }catch(e){}
    }

    // Annuler l'inscription (statut Annulé)
    window.annuler = function(index) {
        // Only admin can change status
        if (!sessionStorage.getItem('adminAuth')) { alert('Accès refusé : actions réservées à l\'administrateur.'); return; }
        let inscrits = JSON.parse(localStorage.getItem("inscrits")) || [];
        if (!inscrits[index]) return;
        if (confirm("Voulez-vous vraiment annuler cette inscription ?")) {
            inscrits[index].statut = "Annulé";
            localStorage.setItem("inscrits", JSON.stringify(inscrits));
            chargerListe();
            try{ showToast('Inscription annulée'); }catch(e){}
        }
    }


    // =============================
    // SUPPRIMER INSCRIPTION
    // =============================

    window.supprimer = function(index) {
        // Only admin can delete
        if (!sessionStorage.getItem('adminAuth')) { alert('Accès refusé : actions réservées à l\'administrateur.'); return; }
        let inscrits = JSON.parse(localStorage.getItem("inscrits")) || [];
        if (confirm("Voulez-vous vraiment supprimer cette inscription ?")) {
            inscrits.splice(index, 1);
        }
        localStorage.setItem("inscrits", JSON.stringify(inscrits));
        chargerListe();
        try{ showToast('Inscription supprimée'); }catch(e){}
    }

    // Accepter l'inscription (admin)
    window.accepter = function(index) {
        if (!sessionStorage.getItem('adminAuth')) { alert('Accès refusé : actions réservées à l\'administrateur.'); return; }
        let inscrits = JSON.parse(localStorage.getItem("inscrits")) || [];
        if (!inscrits[index]) return;
        inscrits[index].statut = "Accepté";
        localStorage.setItem("inscrits", JSON.stringify(inscrits));
        chargerListe();
        try{ showToast('Inscription acceptée'); launchConfetti(); }catch(e){}
    }

        // Imprimer une fiche d'inscription (admin)
        window.imprimer = function(index){
                if (!sessionStorage.getItem('adminAuth')) { alert('Accès refusé : actions réservées à l\'administrateur.'); return; }
                let inscrits = JSON.parse(localStorage.getItem("inscrits")) || [];
                const p = inscrits[index];
                if(!p) { alert('Inscription introuvable'); return; }

                const printWindow = window.open('','_blank');
                const html = `<!doctype html>
                    <html>
                        <head>
                            <meta charset="utf-8">
                            <title>Fiche d'inscription - ${p.nom || ''} ${p.prenom || ''}</title>
                            <meta name="viewport" content="width=device-width,initial-scale=1">
                            <style>
                                body{font-family:Inter, Arial, sans-serif;padding:18px;color:#0f1724;background:#fff}
                                .print-wrap{max-width:820px;margin:0 auto}
                                .print-header{display:flex;align-items:center;gap:14px;border-bottom:2px solid #eef2ff;padding-bottom:12px;margin-bottom:16px}
                                .print-header img{height:64px}
                                .print-header .title{font-weight:700;font-size:20px;color:#0b5ed7}
                                .print-subtitle{color:#475569;font-size:13px}
                                .card{border-radius:8px;padding:16px}
                                h1{font-size:18px;margin:6px 0 12px}
                                table{width:100%;border-collapse:collapse}
                                td{padding:8px 6px;vertical-align:top}
                                .label{color:#475569;font-weight:700;width:200px}
                                .value{color:#0f1724}
                                .footer{margin-top:18px;color:#666;font-size:13px}
                                .print-actions{text-align:right;margin-top:14px}
                                .print-actions button{background:#0b5ed7;color:#fff;border:none;padding:8px 12px;border-radius:8px;cursor:pointer}
                                @media print{ .print-actions{display:none} }
                            </style>
                        </head>
                        <body>
                            <div class="print-wrap">
                                <div class="print-header">
                                    <img src="logo.png.png" alt="Logo Technolab ISTA">
                                    <div>
                                        <div class="title">Technolab ISTA</div>
                                        <div class="print-subtitle">Fiche d'inscription</div>
                                    </div>
                                </div>
                                <div class="card">
                                    <h1>Détails de l'inscription</h1>
                                    <table>
                                        <tr><td class="label">Nom</td><td class="value">${p.nom || ''}</td></tr>
                                        <tr><td class="label">Prénom</td><td class="value">${p.prenom || ''}</td></tr>
                                        <tr><td class="label">Email</td><td class="value">${p.email || ''}</td></tr>
                                        <tr><td class="label">Annexe</td><td class="value">${p.annexe || ''}</td></tr>
                                        <tr><td class="label">Filière</td><td class="value">${p.filiere || ''}</td></tr>
                                        <tr><td class="label">Diplôme</td><td class="value">${p.diplome || ''}</td></tr>
                                        <tr><td class="label">Nationalité</td><td class="value">${p.nationalite || ''}</td></tr>
                                        <tr><td class="label">Pays de naissance</td><td class="value">${p.paysNaissance || ''}</td></tr>
                                        <tr><td class="label">Quartier</td><td class="value">${p.quartier || ''}</td></tr>
                                        <tr><td class="label">Statut</td><td class="value">${p.statut || ''}</td></tr>
                                        <tr><td class="label">Date</td><td class="value">${p.date || ''}</td></tr>
                                    </table>
                                    <div class="footer">Imprimé le ${new Date().toLocaleString()}</div>
                                    <div class="print-actions"><button onclick="window.print()">Imprimer la fiche</button></div>
                                </div>
                            </div>
                        </body>
                    </html>`;

                printWindow.document.open();
                printWindow.document.write(html);
                printWindow.document.close();
                printWindow.focus();
                // small delay to ensure resources load before printing
                setTimeout(()=>{ try{ printWindow.print(); }catch(e){} }, 400);
        }
}

// Toast helper
function showToast(message, timeout = 2400){
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = message;
    document.body.appendChild(t);
    // force reflow
    void t.offsetWidth;
    t.classList.add('toast--visible');
    setTimeout(()=>{ t.classList.remove('toast--visible'); setTimeout(()=> t.remove(), 350); }, timeout);
}

// Confetti launcher: creates colorful pieces and animates them with CSS
function launchConfetti(count = 80){
    const colors = ['#ef4444','#f97316','#f59e0b','#16a34a','#059669','#0ea5e9','#3b82f6','#7c3aed','#ec4899'];
    let container = document.querySelector('.confetti-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'confetti-container';
        document.body.appendChild(container);
    }

    const w = window.innerWidth;

    for(let i=0;i<count;i++){
        const piece = document.createElement('span');
        piece.className = 'confetti-piece';
        const size = Math.floor(Math.random()*10)+6; // 6..16px width
        piece.style.width = size + 'px';
        piece.style.height = Math.floor(size * (Math.random()*1.6 + 1)) + 'px';
        const left = Math.random()*w;
        piece.style.left = (left|0) + 'px';
        piece.style.top = (-Math.random()*20 - 10) + 'vh';
        const color = colors[(Math.random()*colors.length)|0];
        piece.style.background = color;
        const duration = 1200 + Math.random()*1000; // 1.2s - 2.2s
        piece.style.animation = `confetti-fall ${duration}ms cubic-bezier(.2,.7,.2,1) forwards`;
        // horizontal sway
        if (Math.random() > 0.5) {
            const swayDur = 800 + Math.random()*1200;
            piece.style.animation += `, confetti-sway ${swayDur}ms ease-in-out infinite`;
            piece.style.transformOrigin = 'center';
        }

        // slight rotation
        piece.style.transform = `rotate(${Math.floor(Math.random()*360)}deg)`;

        container.appendChild(piece);

        // cleanup after animation
        setTimeout(()=>{ try{ piece.remove(); }catch(e){} }, duration + 500);
    }

    // remove container after a moment if empty
    setTimeout(()=>{
        if(container && container.children.length === 0){ try{ container.remove(); }catch(e){} }
    }, 3500);
}
