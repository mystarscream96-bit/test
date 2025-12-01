/* ==========================================================
   V17 PRO — GLOBAL OPTIMIZED (TEK DOSYA)
========================================================== */

const upload = Upload({
    apiKey: "public_G22nj4G4oJqYwoLB52gv3yHBP462"
});

const DEFAULT_PHOTO = "https://i.hizliresim.com/hw8yfje.png";
let currentUser = null;
const db = firebase.firestore();

let selects = {};
let multiSelects = {};

// ==========================================================
// GLOBAL CACHE — TÜM VERİLERİ 1 KERE ÇEKER
// ==========================================================

let CACHE = {
    players: [],
    ratings: [],
    ga: [],
    winners: []
};
/* ============================================
   FM24 MEVKİ SEÇİM — PERFECT RESET SYSTEM
============================================ */
/* ============================================
   FM24 MEVKİ SEÇİM — 3. MEVKİ ENGELLİ FINAL
============================================ */
let mainPos = null;
let subPos = null;
const POS_MAP = {
    "ST": "Santrafor",
    "CM-R": "Merkez Orta",
    "LW": "Sol Kanat",
    "RW": "Sağ Kanat",
    "LB": "Sol Bek",
    "CB-R": "Stoper",
    "RB": "Sağ Bek",
    "GK": "Kaleci"
};

const POS_MAP_REVERSE = {
    "Santrafor": "ST",
    "Merkez Orta": "CM-R",
    "Sol Kanat": "LW",
    "Sağ Kanat": "RW",
    "Sol Bek": "LB",
    "Stoper": "CB-R",
    "Sağ Bek": "RB",
    "Kaleci": "GK"
};


document.querySelectorAll(".fm-card").forEach(card => {
    card.onclick = () => {

        const posCode = card.dataset.pos;      // LB, RW, ST
        const posName = card.dataset.name;     // Sol Bek, Sağ Kanat

        const mainPos = document.getElementById("mainPos").value;
        const subPos  = document.getElementById("subPos").value;

        // Aynı karta yeniden tıklarsa kaldır
        if (card.classList.contains("selected-main")) {
            document.getElementById("mainPos").value = "";
            card.classList.remove("selected-main");
            return;
        }
        if (card.classList.contains("selected-sub")) {
            document.getElementById("subPos").value = "";
            card.classList.remove("selected-sub");
            return;
        }

        // 3. seçim engellemesi
        if (mainPos && subPos) {
            notify("3. mevki seçilmesine izin verilmiyor.");
            return;
        }

        // Ana mevki
        if (!mainPos) {
            document.getElementById("mainPos").value = posName;  // TÜRKÇE KAYIT
            card.classList.add("selected-main");
            return;
        }

        // Yedek mevki
        if (!subPos) {
            document.getElementById("subPos").value = posName;   // TÜRKÇE KAYIT
            card.classList.add("selected-sub");
            return;
        }
    };
});









// Tek seferde tüm verileri yükler
async function refreshCache() {
    const [p, r, g, w] = await Promise.all([
        db.collection("players").get(),
        db.collection("ratings").get(),
        db.collection("ga").get(),
        db.collection("winners").get()
    ]);

    CACHE.players = p.docs.map(d => ({ id: d.id, ...d.data() }));
    CACHE.ratings = r.docs.map(d => ({ id: d.id, ...d.data() }));
    CACHE.ga = g.docs.map(d => ({ id: d.id, ...d.data() }));
    CACHE.winners = w.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ==========================================================
// NOTIFICATION
// ==========================================================
function notify(msg = "Kaydedildi") {
    const n = document.getElementById("notify");
    n.innerText = msg;
    n.style.display = "block";
    setTimeout(() => (n.style.display = "none"), 2000);
}

// ==========================================================
// CUSTOM SELECT ENGINE
// ==========================================================
document.addEventListener("click", e => {
    document.querySelectorAll(".custom-options").forEach(opt => {
        if (!opt.parentElement.contains(e.target)) opt.style.display = "none";
    });
});

function buildSingleSelect(wrapper, items) {
    const display = wrapper.querySelector(".custom-display");
    const options = wrapper.querySelector(".custom-options");

    options.innerHTML = "";
    let selected = null;

    items.forEach(name => {
        let div = document.createElement("div");
        div.className = "custom-option";
        div.innerText = name;

        div.onclick = () => {
            selected = name;
            display.innerText = name;
            options.style.display = "none";
        };

        options.appendChild(div);
    });

    display.onclick = () => {
        options.style.display = options.style.display === "block" ? "none" : "block";
    };

    return {
        get value() {
            return selected;
        },
        reset() {
            selected = null;
            display.innerText = "Seç";
        }
    };
}

function buildMultiSelect(wrapper, items) {
    const chipArea = wrapper.querySelector(".multi-selected");
    const options = wrapper.querySelector(".custom-options");

    options.innerHTML = "";
    chipArea.innerHTML = "";

    let selected = [];

    items.forEach(name => {
        let div = document.createElement("div");
        div.className = "custom-option";
        div.innerText = name;

        div.onclick = () => {
            if (selected.includes(name)) {
                selected = selected.filter(x => x !== name);
                div.classList.remove("selected");
            } else {
                selected.push(name);
                div.classList.add("selected");
            }
            refreshChips();
        };

        options.appendChild(div);
    });

    chipArea.onclick = () => {
        options.style.display = options.style.display === "block" ? "none" : "block";
    };

    function refreshChips() {
        chipArea.innerHTML = "";
        selected.forEach(name => {
            let chip = document.createElement("div");
            chip.className = "chip";
            chip.innerHTML = `${name} <span class="chip-remove">×</span>`;
            chip.querySelector(".chip-remove").onclick = () => {
                selected = selected.filter(x => x !== name);
                refreshChips();
                [...options.children].forEach(o => {
                    if (o.innerText === name) o.classList.remove("selected");
                });
            };
            chipArea.appendChild(chip);
        });
    }

    return {
        get values() {
            return selected;
        }
    };
}

// ==========================================================
// PAGE SYSTEM
// ==========================================================
function showPage(id) {
    document.querySelectorAll(".page").forEach(p => {
        p.classList.remove("active");
        p.style.display = "none";
    });

    const page = document.getElementById(id);
    page.style.display = "block";
    page.classList.add("active");

    if (currentUser === "ADMIN" && id === "profilim") {
        alert("Admin için profil bölümü kapalı.");
        return;
    }

    // 🔥 PROFİLE GEÇİNCE PROFİLİ YÜKLE
    if (id === "profilim") {
        loadProfil();
    }

    if (id !== "login") {
        localStorage.setItem("hsPage", id);
    }
}


// ==========================================================
// PROFIL
// ==========================================================
async function loadProfil() {
    if (!currentUser || currentUser === "ADMIN") return;

    const p = CACHE.players.find(x => x.name === currentUser);
    if (!p) return;

    // Karttaki fotoğraf, isim, pozisyon
  
    document.getElementById("fifa-name").textContent = p.name;
    document.getElementById("fifa-position").textContent = p.mainPos || "-";

    // Statlar
    const stats = p.stats || {
        sut:0,pas:0,kondisyon:0,hiz:0,fizik:0,defans:0,oyunGorusu:0
    };

    // Tüm kartı çiz
    renderFifaCard({ ...p, stats });

    // Mevki inputlarına yaz
    document.getElementById("mainPos").value = p.mainPos || "";
    document.getElementById("subPos").value = p.subPos || "";
	
highlightSavedPositions(p.mainPos, p.subPos);
}







function markSelectedCards() {
    const main = document.getElementById("mainPos").value;
    const sub  = document.getElementById("subPos").value;

    cards.forEach(card => {
        card.classList.remove("selected-main", "selected-sub");

        if (card.dataset.name === main)
            card.classList.add("selected-main");

        if (card.dataset.name === sub)
            card.classList.add("selected-sub");
    });
}

function highlightSavedPositions(mainPos, subPos) {

    document.querySelectorAll(".fm-card").forEach(c => {
        c.classList.remove("selected-main", "selected-sub");
    });

    if (mainPos) {
        const code = POS_MAP_REVERSE[mainPos];  
        const el = document.querySelector(`.fm-card[data-pos="${code}"]`);
        if (el) el.classList.add("selected-main");
    }

    if (subPos) {
        const code = POS_MAP_REVERSE[subPos];
        const el = document.querySelector(`.fm-card[data-pos="${code}"]`);
        if (el) el.classList.add("selected-sub");
    }
}




// ==========================================================
// LOGIN
// ==========================================================
async function login() {
    let name = selects["loginUser"]?.value;
    if (!name) return alert("Kullanıcı seç!");

    if (name === "ADMIN") {
        return alert("ADMIN girişi için şifreli giriş yap!");
    }

    currentUser = name;
    localStorage.setItem("hsUser", name);

    hideAdminButtons();
    openApp();
    notify("Giriş Yapıldı");
}

async function adminLogin() {
    let pass = document.getElementById("adminPass").value;
    if (pass !== "2611") return alert("Hatalı şifre!");

    currentUser = "ADMIN";
    localStorage.setItem("hsUser", "ADMIN");

    hideAdminButtons();
    showAdminButtons();

    openApp();
    notify("Admin Girişi");
}

function showAdminButtons() {
    document.getElementById("adminBtn").style.display = "inline-block";
    document.getElementById("gaBtn").style.display = "inline-block";
    document.getElementById("winBtn").style.display = "inline-block";
}
function hideAdminButtons() {
    document.getElementById("adminBtn").style.display = "none";
    document.getElementById("gaBtn").style.display = "none";
    document.getElementById("winBtn").style.display = "none";
}

// ==========================================================
// APP OPEN
// ==========================================================
async function openApp() {
    document.getElementById("login").style.display = "none";
    document.getElementById("navbar").style.display = "flex";

    hideAdminButtons();
    if (currentUser === "ADMIN") showAdminButtons();

    document.getElementById("profilBtn").style.display =
        currentUser === "ADMIN" ? "none" : "inline-block";

    await loadAll();

    let savedPage = localStorage.getItem("hsPage") || "oyuncular";
    setTimeout(() => showPage(savedPage), 150);
}

// ==========================================================
// SELECT SETUP
// ==========================================================
async function setupSelects() {
    const list = CACHE.players.map(d => d.name);

    selects["loginUser"] = buildSingleSelect(
        document.querySelector('[data-id="loginUser"]'),
        [...list, "ADMIN"]
    );

    selects["puanTarget"] = buildSingleSelect(
        document.querySelector('[data-id="puanTarget"]'),
        list
    );

    selects["deleteUser"] = buildSingleSelect(
        document.querySelector('[data-id="deleteUser"]'),
        list
    );

    selects["gaPlayer"] = buildSingleSelect(
        document.querySelector('[data-id="gaPlayer"]'),
        list
    );

    multiSelects["winnerSelect"] = buildMultiSelect(
        document.querySelector('[data-id="winnerSelect"]'),
        list
    );
}

// ==========================================================
// DOM LOADED
// ==========================================================
window.addEventListener("DOMContentLoaded", async () => {
    let savedUser = localStorage.getItem("hsUser");

    if (!savedUser || savedUser === "null" || savedUser.trim() === "") {
        currentUser = null;

        document.getElementById("navbar").style.display = "none";

        document.querySelectorAll(".page").forEach(p => {
            p.classList.remove("active");
            p.style.display = "none";
        });

        const loginPage = document.getElementById("login");
        loginPage.style.display = "block";
        loginPage.classList.add("active");

        await refreshCache();
        await setupSelects();

        return;
    }

    currentUser = savedUser.trim();
    await openApp();
});

// ==========================================================
// LOAD ALL DATA
// ==========================================================
async function loadAll() {
    await refreshCache();
    await loadPlayers();
    await loadGecmis();
    await loadGolKr();
    await loadKazananlar();
    await loadEnIyi();
    await setupSelects();
}

// ==========================================================
// OYUNCULAR
// ==========================================================
async function loadPlayers() {
    const box = document.getElementById("oyuncuListe");
    box.innerHTML = "";

    CACHE.players.forEach(p => {
        const photo = p.photo || DEFAULT_PHOTO;

        box.innerHTML += `
            <div class="card">
                <img src="${photo}">
                <h3>${p.name}</h3>

                <div class="player-pos">
                    <p><strong>Asıl Mevki:</strong> ${p.mainPos || '-'}</p>
                    <p><strong>Yedek Mevki:</strong> ${p.subPos || '-'}</p>
                </div>

                ${
                    currentUser === "ADMIN"
                        ? `<button class="rate-btn" onclick="openRatePanel('${p.id}', '${p.name}')">Puanla</button>`
                        : ``
                }
            </div>
        `;
    });
}





// ==========================================================
// PUAN GÖNDER
// ==========================================================
async function puanGonder() {
    let hedef = selects["puanTarget"].value;
    let val = Number(document.getElementById("puanValue").value);

    if (!hedef) return alert("Oyuncu seç!");
    if (!val || val < 1 || val > 10) return alert("1-10 arası puan!");
    if (hedef === currentUser) return alert("Kendine puan veremezsin!");
    if (!Number.isInteger(val)) return alert("Puan tam sayı olmalı!");
    let kontrol = CACHE.ratings.filter(
        r => r.from === currentUser && r.to === hedef
    )[0];

    if (kontrol) {
        let lastDate = new Date(kontrol.date);
        let diffDays = Math.floor((Date.now() - lastDate) / 86400000);

        if (diffDays < 5) {
            return alert(`Tekrar puan verebilmek için ${5 - diffDays} gün daha bekle.`);
        }
    }

    await db.collection("ratings").add({
        from: currentUser,
        to: hedef,
        score: val,
        date: new Date().toISOString()
    });

    await refreshCache();
    await loadGecmis();
    await loadEnIyi();

    document.getElementById("puanValue").value = "";
    notify("Puan Gönderildi");
}

// ==========================================================
// GEÇMİŞ
// ==========================================================
async function loadGecmis() {
    const list = document.getElementById("gecmisList");
    list.innerHTML = "";

    let sorted = [...CACHE.ratings].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
    );

    sorted.forEach(r => {
        list.innerHTML += `
            <li>${r.from} → ${r.to} | ${r.score} puan | ${r.date.slice(0, 10)}</li>
        `;
    });
}

// ==========================================================
// OYUNCU SİL
// ==========================================================
async function deletePlayer() {
    let name = selects["deleteUser"].value;
    if (!name) return alert("Oyuncu seç!");

    let p = CACHE.players.find(x => x.name === name);
    if (p) await db.collection("players").doc(p.id).delete();

    CACHE.ratings
        .filter(x => x.from === name || x.to === name)
        .forEach(r => db.collection("ratings").doc(r.id).delete());

    CACHE.ga
        .filter(x => x.name === name)
        .forEach(g => db.collection("ga").doc(g.id).delete());

    CACHE.winners.forEach(w => {
        if (w.players.includes(name)) {
            let arr = w.players.filter(x => x !== name);
            db.collection("winners").doc(w.id).update({ players: arr });
        }
    });

    await loadAll();
    notify("Oyuncu Silindi");
}

// ==========================================================
// GOL-ASİST EKLE
// ==========================================================
async function ekleGolAsist() {
    let name = selects["gaPlayer"].value;
    let gol = Number(document.getElementById("gaGol").value);

    if (!name) return alert("Oyuncu seç!");

    let p = CACHE.players.find(x => x.name === name);

    await db.collection("ga").add({
        name,
        gol,
        photo: p?.photo || DEFAULT_PHOTO
    });

    document.getElementById("gaGol").value = "";

    await loadAll();
    notify("Kaydedildi");
}
.
// ==========================================================
// GOL KRALLIĞI
// ==========================================================
async function loadGolKr() {
    const box = document.getElementById("golList");
    box.innerHTML = "";

    let map = {};

    CACHE.ga.forEach(g => {
        if (!map[g.name]) map[g.name] = { gol: 0, photo: g.photo };
        map[g.name].gol += Number(g.gol);   // 🔥 kesin çözüm
    });

    let arr = Object.entries(map).map(([name, data]) => ({
        name,
        photo: data.photo,
        gol: data.gol
    }));

    // 0 olanları gizle + sırala
    arr = arr
        .filter(p => p.gol > 0)
        .sort((a, b) => b.gol - a.gol);

    arr.forEach(p => {
        box.innerHTML += `
            <div class="kr-item">
                <div class="kr-left">
                    <img class="kr-photo" src="${p.photo}">
                    <div class="kr-name">${p.name}</div>
                </div>
                <div class="kr-score">${p.gol}</div>
            </div>
        `;
    });
}



// ==========================================================
// EN İYİ OYUNCULAR — MEGA OPTIMIZED
// ==========================================================
async function loadEnIyi() {
    const box = document.getElementById("eniyiList");
    box.innerHTML = "";

    let arr = [];

    CACHE.players.forEach(player => {
        let name = player.name;
        let photo = player.photo || DEFAULT_PHOTO;

        // PUAN TOPLAMI
        let userRatings = CACHE.ratings.filter(r => r.to === name);
        let totalPoints = userRatings.reduce((t, r) => t + Number(r.score), 0);

        // GOL + ASİST TOPLAMI
        let userGA = CACHE.ga.filter(g => g.name === name);
        let totalGol = userGA.reduce((t, g) => t + Number(g.gol), 0);


        // KAZANAN SAYISI
        let winCount = CACHE.winners.filter(w => w.players.includes(name)).length;

        // FİNAL PUAN
        let finalScore =
            totalPoints +
            (totalGol * 2) +
            (winCount * 5);

        arr.push({
            name,
            photo,
            total: finalScore
        });
    });

    // 0 PUANLILARI KALDIR + SIRALA
    arr = arr
        .filter(p => p.total > 0)
        .sort((a, b) => b.total - a.total);

    // EKRANA BAS
    arr.forEach(p => {
        box.innerHTML += `
            <div class="kr-item">
                <div class="kr-left">
                    <img class="kr-photo" src="${p.photo}">
                    <div class="kr-name">${p.name}</div>
                </div>
                <div class="kr-score">${p.total.toFixed(1)}</div>
            </div>
        `;
    });
}




// ==========================================================
// KAZANANLAR
// ==========================================================
async function loadKazananlar() {
    const box = document.getElementById("kazananList");
    box.innerHTML = "";

    let winMap = {};

    CACHE.winners.forEach(w => {
        w.players.forEach(name => {
            if (!winMap[name]) winMap[name] = 0;
            winMap[name]++;
        });
    });

    let arr = CACHE.players
        .map(p => ({
            name: p.name,
            photo: p.photo || DEFAULT_PHOTO,
            total: winMap[p.name] || 0
        }))
        .filter(p => p.total > 0);

    arr.sort((a, b) => b.total - a.total);

    arr.forEach(p => {
        box.innerHTML += `
            <div class="kr-item">
                <div class="kr-left">
                    <img class="kr-photo" src="${p.photo}">
                    <div class="kr-name">${p.name}</div>
                </div>
                <div class="kr-score">${p.total}</div>
            </div>
        `;
    });
}

// ==========================================================
// KAZANAN KAYDET
// ==========================================================
async function kazananKaydet() {
    let arr = multiSelects["winnerSelect"].values;
    if (!arr.length) return alert("Oyuncu seç!");

    await db.collection("winners").add({
        players: arr,
        date: new Date().toISOString()
    });

    await loadAll();
    notify("Kaydedildi");
}

// ==========================================================
// LOGOUT
// ==========================================================
function logout() {
    window.stop();

    localStorage.removeItem("hsUser");
    localStorage.removeItem("hsPage");
    currentUser = null;

    hideAdminButtons();
    document.getElementById("navbar").style.display = "none";

    document.querySelectorAll(".page").forEach(p => {
        p.classList.remove("active");
        p.style.display = "none";
    });

    const loginPage = document.getElementById("login");
    loginPage.style.display = "block";
    loginPage.classList.add("active");

    notify("Çıkış Yapıldı");
}
async function updatePhoto() {
    const fileInput = document.getElementById("profilUpload");
    const file = fileInput.files[0];

    if (!file) {
        notify("Lütfen bir dosya seç!");
        return;
    }

    const btn = document.querySelector('button[onclick="updatePhoto()"]');
    btn.classList.add("loading");

    try {
        const { fileUrl } = await upload.uploadFile(file);

        let p = CACHE.players.find(x => x.name === currentUser);
        if (p) {
            await db.collection("players").doc(p.id).update({
                photo: fileUrl
            });

            // Karttaki fotoğrafı anında güncelle
            document.getElementById("fifa-photo").src = fileUrl;

            renderFifaCard({
                ...p,
                photo: fileUrl
            });
        }

        notify("Fotoğraf Güncellendi");
    } catch (e) {
        notify("Fotoğraf Güncellendi");
    }

    btn.classList.remove("loading");
}
document.getElementById("selectFileBtn").onclick = () => {
    document.getElementById("profilUpload").click();
};




async function savePositions() {

    const mainP = document.getElementById("mainPos").value;
    const subP  = document.getElementById("subPos").value;

    let p = CACHE.players.find(x => x.name === currentUser);

    await db.collection("players").doc(p.id).update({
        mainPos: mainP,
        subPos: subP
    });

    notify("Mevkiler Kaydedildi");

    // PROFİL KARTINI YENİLE
    await refreshCache();
    const updated = CACHE.players.find(x => x.name === currentUser);
    if (updated) renderFifaCard(updated);
}


function renderStars(elId, value) {
    const el = document.getElementById(elId);
    el.innerHTML = "";

    for (let i = 1; i <= 5; i++) {
        const span = document.createElement("span");
        span.textContent = "★";
        if (i <= value) span.classList.add("active");
        el.appendChild(span);
    }
}


// Firebase'den stat çekildikten sonra:
function loadPlayerStats(stats) {
    renderStars("stat-sut", stats.sut);
    renderStars("stat-pas", stats.pas);
    renderStars("stat-kondisyon", stats.kondisyon);
    renderStars("stat-hiz", stats.hiz);
    renderStars("stat-fizik", stats.fizik);
    renderStars("stat-defans", stats.defans);
    renderStars("stat-oyunGorusu", stats.oyunGorusu);
}

function openRatePanel(id, name) {
    selectedPlayerId = id;

    document.getElementById("ratePlayerName").textContent = name;
    document.getElementById("rateModal").style.display = "flex";

    // Eski değerleri doldur
    const p = CACHE.players.find(x => x.id === id);
    const s = p.stats || {};

    document.getElementById("rate-sut").value = s.sut ?? 0;
    document.getElementById("rate-pas").value = s.pas ?? 0;
    document.getElementById("rate-kond").value = s.kondisyon ?? 0;
    document.getElementById("rate-hiz").value = s.hiz ?? 0;
    document.getElementById("rate-fizik").value = s.fizik ?? 0;
    document.getElementById("rate-def").value = s.defans ?? 0;
    document.getElementById("rate-oyunGorusu").value = s.oyunGorusu ?? 0;
}


function closeRatePanel() {
    document.getElementById("rateModal").style.display = "none";
}

document.getElementById("saveRating").onclick = async () => {

    const newStats = {
        sut: Number(document.getElementById("rate-sut").value),
        pas: Number(document.getElementById("rate-pas").value),
        kondisyon: Number(document.getElementById("rate-kond").value),
        hiz: Number(document.getElementById("rate-hiz").value),
        fizik: Number(document.getElementById("rate-fizik").value),
        defans: Number(document.getElementById("rate-def").value),
        oyunGorusu: Number(document.getElementById("rate-oyunGorusu").value)
    };

    await db.collection("players")
        .doc(selectedPlayerId)
        .update({ stats: newStats });

    await refreshCache();

    closeRatePanel();
    notify("Puanlar Kaydedildi");

    // Eğer profil kendi profili ise kartı güncelle
    const p = CACHE.players.find(x => x.id === selectedPlayerId);
    if (p.name === currentUser) {
        renderFifaCard({ ...p, stats: newStats });
    }
};






function renderFifaCard(p) {

    const stats = p.stats ? p.stats : {
        sut: 0,
        pas: 0,
        kondisyon: 0,
        hiz: 0,
        fizik: 0,
        defans: 0,
        oyunGorusu: 0
    };

   
    document.getElementById("fifa-name").textContent = p.name?.toUpperCase() ?? "-";
    document.getElementById("fifa-position").textContent = p.mainPos || "-";

    document.getElementById("fifa-sut").textContent = stats.sut ?? 0;
    document.getElementById("fifa-pas").textContent = stats.pas ?? 0;
    document.getElementById("fifa-kondisyon").textContent = stats.kondisyon ?? 0;
    document.getElementById("fifa-hiz").textContent = stats.hiz ?? 0;
    document.getElementById("fifa-fizik").textContent = stats.fizik ?? 0;
    document.getElementById("fifa-defans").textContent = stats.defans ?? 0;

    // OVR hesapla
    const ovr = Math.round(
        (stats.sut + stats.pas + stats.kondisyon +
         stats.hiz + stats.fizik + stats.defans) / 6
    );

    document.getElementById("fifa-overall").textContent = ovr;
}



