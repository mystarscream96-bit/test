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

    if (id !== "login") {
        localStorage.setItem("hsPage", id);
    }
}

// ==========================================================
// PROFIL
// ==========================================================
async function loadProfil() {
    if (!currentUser || currentUser === "ADMIN") {
        document.getElementById("profilPhoto").src = DEFAULT_PHOTO;
        document.getElementById("profilName").innerText = "Admin";
        return;
    }

    let p = CACHE.players.find(x => x.name === currentUser);
    if (!p) return;

    document.getElementById("profilPhoto").src = p.photo || DEFAULT_PHOTO;
    document.getElementById("profilName").innerText = p.name;
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
    await loadAsistKr();
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
    let asist = Number(document.getElementById("gaAsist").value);

    if (!name) return alert("Oyuncu seç!");

    let p = CACHE.players.find(x => x.name === name);

    await db.collection("ga").add({
        name,
        gol,
        asist,
        photo: p?.photo || DEFAULT_PHOTO
    });

    document.getElementById("gaGol").value = "";
    document.getElementById("gaAsist").value = "";

    await loadAll();
    notify("Kaydedildi");
}

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
// ASİST KRALLIĞI
// ==========================================================
async function loadAsistKr() {
    const box = document.getElementById("asistList");
    box.innerHTML = "";

    let map = {};

    CACHE.ga.forEach(d => {
        if (!map[d.name]) map[d.name] = { asist: 0, photo: d.photo };
        map[d.name].asist += d.asist;
    });

    let arr = Object.entries(map).map(([name, data]) => ({
        name,
        photo: data.photo,
        asist: data.asist
    }));

    arr.sort((a, b) => b.asist - a.asist);

    arr.forEach(d => {
        if (d.asist <= 0) return;
        box.innerHTML += `
            <div class="kr-item">
                <div class="kr-left">
                    <img class="kr-photo" src="${d.photo}">
                    <div class="kr-name">${d.name}</div>
                </div>
                <div class="kr-score">${d.asist}</div>
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
        let totalAsist = userGA.reduce((t, g) => t + Number(g.asist), 0);

        // KAZANAN SAYISI
        let winCount = CACHE.winners.filter(w => w.players.includes(name)).length;

        // FİNAL PUAN
        let finalScore =
            totalPoints +
            (totalGol * 2) +
            totalAsist +
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
