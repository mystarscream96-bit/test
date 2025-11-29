/* ==========================================================
   V15 FINAL — GLOBAL
========================================================== */

const upload = Upload({
    apiKey: "public_G22nj4G4oJqYwoLB52gv3yHBP462"
});

const DEFAULT_PHOTO = "https://i.hizliresim.com/hw8yfje.png";
let currentUser = null;
const db = firebase.firestore();

let selects = {};       // single selects
let multiSelects = {};  // multi selects


/* ==========================================================
   GLOBAL NOTIFICATION
========================================================== */
function notify(msg = "Kaydedildi") {
    const n = document.getElementById("notify");
    n.innerText = msg;
    n.style.display = "block";

    setTimeout(() => {
        n.style.display = "none";
    }, 2000);
}



/* ==========================================================
   CUSTOM SELECT ENGINE (V15 — SIFIR ÇAKIŞMA)
========================================================== */

document.addEventListener("click", e => {
    document.querySelectorAll(".custom-options").forEach(opt => {
        if (!opt.parentElement.contains(e.target)) {
            opt.style.display = "none";
        }
    });
});

/* ========== SINGLE SELECT ========== */
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

/* ========== MULTI SELECT (CHIP STYLE) ========== */
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
                refreshChips();
            } else {
                selected.push(name);
                div.classList.add("selected");
                refreshChips();
            }
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



/* ==========================================================
   SAYFA GEÇİŞİ + NAVBAR AKTİF BUTON
========================================================== */
/* ==========================================================
   SAYFA GEÇİŞİ
========================================================== */
function showPage(id) {

    // Tüm sayfaları kapat
    document.querySelectorAll(".page").forEach(p => {
        p.classList.remove("active");
        p.style.display = "none";
    });

    // Açılacak sayfa
    const page = document.getElementById(id);
    page.style.display = "block";
    page.classList.add("active");

    // PROFİL SAYFASI AÇILIYORSA → FOTOĞRAFI GETİR
    if (currentUser === "ADMIN" && id === "profilim") {
    alert("Admin için profil bölümü kapalı.");
    return;
}

    // Login dışında sayfayı kaydet
    if (id !== "login") {
        localStorage.setItem("hsPage", id);
    }
}


/* ==========================================================
   PROFİL YÜKLEME
========================================================== */
async function loadProfil() {
    console.log("Profil yükleniyor... Kullanıcı =", currentUser);

    if (!currentUser || currentUser === "ADMIN") {
        document.getElementById("profilPhoto").src = DEFAULT_PHOTO;
        document.getElementById("profilName").innerText = "Admin";
        return;
    }

    const snap = await db.collection("players")
        .where("name", "==", currentUser)
        .get();

    if (snap.empty) {
        console.warn("Profil bulunamadı:", currentUser);
        return;
    }

    const data = snap.docs[0].data();

    document.getElementById("profilPhoto").src = data.photo || DEFAULT_PHOTO;
    document.getElementById("profilName").innerText = data.name;
}






/* ==========================================================
   LOGIN
========================================================== */
async function login() {
    let name = selects["loginUser"]?.value;

    if (!name) return alert("Kullanıcı seç!");

    // ❌ ADMIN seçildi ama adminLogin fonksiyonu kullanılmadı
    if (name === "ADMIN") {
        return alert("ADMIN girişi için şifreli giriş yapmalısın!");
    }

    currentUser = name;
    localStorage.setItem("hsUser", currentUser);

    hideAdminButtons(); // Normal kullanıcı → admin butonları kapat

    openApp();
    notify("Giriş Yapıldı");
}


/* ==========================================================
   ADMIN LOGIN
========================================================== */
async function adminLogin() {
    let pass = document.getElementById("adminPass").value;

    if (pass !== "2611") return alert("Hatalı şifre!");

    currentUser = "ADMIN";
    localStorage.setItem("hsUser", currentUser);

    hideAdminButtons();   // Her ihtimale karşı önce kapat
    showAdminButtons();   // Sonra aç

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


/* ==========================================================
   UYGULAMAYI AÇ (YENİLEME + LOGIN ORTAK FONKSİYON)
========================================================== */
async function openApp() {
    document.getElementById("login").style.display = "none";
    document.getElementById("navbar").style.display = "flex";

    hideAdminButtons();

    if (currentUser === "ADMIN") {
        showAdminButtons();
    }
	if (currentUser === "ADMIN") {
    document.getElementById("profilBtn").style.display = "none";
} else {
    document.getElementById("profilBtn").style.display = "inline-block";
}

    await loadAll();

    let savedPage = currentUser ? localStorage.getItem("hsPage") : null;

    if (!savedPage) savedPage = "oyuncular";

    setTimeout(() => {
        if (currentUser) showPage(savedPage);
    }, 150);
}




/* ==========================================================
   SELECTLERİ OLUŞTUR
========================================================== */
async function setupSelects() {
    const snap = await db.collection("players").get();
    const list = snap.docs.map(d => d.data().name);

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



/* ==========================================================
   YÜKLEME SIRASI
========================================================== */

window.addEventListener("DOMContentLoaded", async () => {
    let savedUser = localStorage.getItem("hsUser");

    if (
    !savedUser ||
    savedUser === "null" ||
    savedUser === "undefined" ||
    savedUser.trim() === ""
) {
    currentUser = null;

    // Navbar kapalı
    document.getElementById("navbar").style.display = "none";

    // Tüm sayfaları kapat
    document.querySelectorAll(".page").forEach(p => {
        p.classList.remove("active");
        p.style.display = "none";
    });

    // Login ekranını aç
    const loginPage = document.getElementById("login");
    loginPage.style.display = "block";
    loginPage.classList.add("active");

    // ❗ LOGIN EKRANI İÇİN SELECTLERİ YÜKLE
    await setupSelects();

    return;
}

    currentUser = savedUser.trim();
    openApp();
});



/* ==========================================================
   TÜM VERİLERİ YÜKLE
========================================================== */
async function loadAll() {
    await loadPlayers();
    await loadGecmis();
    await loadGolKr();
    await loadAsistKr();
    await loadKazananlar();
    await loadEnIyi();
    await setupSelects();
}



/* ==========================================================
   OYUNCULAR
========================================================== */
async function loadPlayers() {
    const box = document.getElementById("oyuncuListe");
    box.innerHTML = "";

    const snap = await db.collection("players").get();

    snap.forEach(doc => {
        const p = doc.data();
        const photo = p.photo || DEFAULT_PHOTO;

        box.innerHTML += `
            <div class="card">
                <img src="${photo}">
                <h3>${p.name}</h3>
            </div>
        `;
    });
}



/* ==========================================================
   PUAN GÖNDER
========================================================== */
async function puanGonder() {
    let hedef = selects["puanTarget"].value;
    let val = Number(document.getElementById("puanValue").value);

    if (!hedef) return alert("Oyuncu seç!");
    if (!val || val < 1 || val > 10) return alert("1-10 arası puan gir!");
    if (hedef === currentUser) return alert("Kendine puan veremezsin!");

    // ⏳ 5 Gün kontrolü
    let kontrol = await db.collection("ratingLocks")
        .where("from", "==", currentUser)
        .where("to", "==", hedef)
        .get();

    if (!kontrol.empty) {
        let veri = kontrol.docs[0].data();
        let lastDate = new Date(veri.date);
        let now = new Date();

        let diffDays = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));

        if (diffDays < 5) {
            return alert(`Bu oyuncuya tekrar puan verebilmek için ${5 - diffDays} gün daha beklemelisin.`);
        }
    }

    // 🔥 PUANI EKLE
    await db.collection("ratings").add({
        from: currentUser,
        to: hedef,
        score: val,
        date: new Date().toISOString()
    });

    // 🔥 PUAN KİLİDİ EKLE / GÜNCELLE
    if (!kontrol.empty) {
        await db.collection("ratingLocks").doc(kontrol.docs[0].id).update({
            date: new Date().toISOString()
        });
    } else {
        await db.collection("ratingLocks").add({
            from: currentUser,
            to: hedef,
            date: new Date().toISOString()
        });
    }

    document.getElementById("puanValue").value = "";

    await loadGecmis();
    await loadEnIyi();

    notify("Puan Gönderildi");
}




/* ==========================================================
   GEÇMİŞ
========================================================== */
async function loadGecmis() {
    const list = document.getElementById("gecmisList");
    list.innerHTML = "";

    const snap = await db.collection("ratings").orderBy("date", "desc").get();

    snap.forEach(doc => {
        const r = doc.data();
        list.innerHTML += `
            <li>${r.from} → ${r.to} | ${r.score} puan | ${r.date.slice(0, 10)}</li>
        `;
    });
}

async function updatePhoto() {
    if (currentUser === "ADMIN") {
        alert("Admin fotoğraf güncelleyemez.");
        return;
    }

    let file = document.getElementById("profilUpload").files[0];
    if (!file) return alert("Fotoğraf seç!");

    const btn = document.querySelector("#profilim .btn");
    btn.classList.add("loading");
    btn.innerText = "Güncelleniyor...";

    try {
        // 🔥 Foto yükleniyor
        const uploaded = await upload.uploadFile(file);
        const url = uploaded.fileUrl;

        // 🔥 Veritabanına kaydet
        const snap = await db.collection("players")
            .where("name", "==", currentUser)
            .get();

        snap.forEach(doc => {
            db.collection("players").doc(doc.id).update({ photo: url });
        });

        notify("Fotoğraf Güncellendi");
        loadProfil();

    } catch (err) {
        alert("Foto yüklenirken hata oluştu!");
        console.error(err);
    }

    // 🔥 Butonu normale döndür
    btn.classList.remove("loading");
    btn.innerText = "Fotoğrafı Güncelle";
}




/* ==========================================================
   OYUNCU EKLE
========================================================== */
async function addPlayer() {
    let name = document.getElementById("newPlayerName").value.trim();
    let file = document.getElementById("newPlayerPhoto").files[0];

    if (!name) return;

    let photoURL = DEFAULT_PHOTO;

    if (file) {
        const uploaded = await upload.uploadFile(file);
        photoURL = uploaded.fileUrl;
    }

    await db.collection("players").add({ name, photo: photoURL });

    document.getElementById("newPlayerName").value = "";
    document.getElementById("newPlayerPhoto").value = "";

    loadAll();
    notify("Oyuncu Eklendi");
}

async function resetAllData() {

    if (!confirm("Tüm puanlar, gol & asistler ve kazananlar SİLİNECEK. Emin misin?")) {
        return;
    }

    // PUANLAR (ratings)
    let ratings = await db.collection("ratings").get();
    ratings.forEach(doc => db.collection("ratings").doc(doc.id).delete());

    // GOL & ASİST (ga)
    let ga = await db.collection("ga").get();
    ga.forEach(doc => db.collection("ga").doc(doc.id).delete());

    // KAZANANLAR (winners)
    let winners = await db.collection("winners").get();
    winners.forEach(doc => db.collection("winners").doc(doc.id).delete());

    // PUAN KİLİTLERİ (ratingLocks) — istersen silinir
    let locks = await db.collection("ratingLocks").get();
    locks.forEach(doc => db.collection("ratingLocks").doc(doc.id).delete());

    // SAYFALARI GÜNCELLE
    await loadAll();

    notify("Tüm veriler sıfırlandı!");
}


/* ==========================================================
   OYUNCU SİL
========================================================== */
async function deletePlayer() {
    let name = selects["deleteUser"].value;
    if (!name) return alert("Oyuncu seç!");

    // Player
    let snap = await db.collection("players").where("name", "==", name).get();
    snap.forEach(d => db.collection("players").doc(d.id).delete());

    // Ratings
    let r1 = await db.collection("ratings").where("from", "==", name).get();
    r1.forEach(d => db.collection("ratings").doc(d.id).delete());

    let r2 = await db.collection("ratings").where("to", "==", name).get();
    r2.forEach(d => db.collection("ratings").doc(d.id).delete());

    // GA
    let ga = await db.collection("ga").where("name", "==", name).get();
    ga.forEach(d => db.collection("ga").doc(d.id).delete());

    // Winners array cleanup
    let w = await db.collection("winners").get();
    w.forEach(d => {
        let arr = d.data().players.filter(x => x !== name);
        db.collection("winners").doc(d.id).update({ players: arr });
    });

    loadAll();
    notify("Oyuncu Silindi");
}



/* ==========================================================
   GOL-ASİST EKLE
========================================================== */
async function ekleGolAsist() {
    let name = selects["gaPlayer"].value;
    let gol = Number(document.getElementById("gaGol").value);
    let asist = Number(document.getElementById("gaAsist").value);

    if (!name) return alert("Oyuncu seç!");

    let photo = DEFAULT_PHOTO;

    const snap = await db.collection("players").where("name", "==", name).get();
    snap.forEach(d => {
        if (d.data().photo) photo = d.data().photo;
    });

    await db.collection("ga").add({ name, gol, asist, photo });

    document.getElementById("gaGol").value = "";
    document.getElementById("gaAsist").value = "";

    loadGolKr();
    loadAsistKr();
    loadEnIyi();

    notify("Kaydedildi");
}



/* ==========================================================
   GOL KRALLIĞI
========================================================== */
async function loadGolKr() {
    const box = document.getElementById("golList");
    box.innerHTML = "";

    const snap = await db.collection("ga").get();

    let map = {};

    snap.forEach(doc => {
        const d = doc.data();
        if (!map[d.name]) map[d.name] = { gol: 0, photo: d.photo };
        map[d.name].gol += d.gol;
    });

    let arr = Object.entries(map).map(([name, data]) => ({
        name,
        photo: data.photo,
        gol: data.gol
    }));

    arr.sort((a, b) => b.gol - a.gol);

    arr.forEach(d => {
		 if (d.asist <= 0) return;
        box.innerHTML += `
            <div class="kr-item">
                <div class="kr-left">
                    <img class="kr-photo" src="${d.photo}">
                    <div class="kr-name">${d.name}</div>
                </div>
                <div class="kr-score">${d.gol}</div>
            </div>
        `;
    });
}



/* ==========================================================
   ASİST KRALLIĞI
========================================================== */
async function loadAsistKr() {
    const box = document.getElementById("asistList");
    box.innerHTML = "";

    const snap = await db.collection("ga").get();

    let map = {};

    snap.forEach(doc => {
        const d = doc.data();

        // Asist boşsa 0 yap
        let asist = Number(d.asist) || 0;

        if (!map[d.name]) {
            map[d.name] = {
                asist: 0,
                photo: d.photo || DEFAULT_PHOTO
            };
        }

        map[d.name].asist += asist;
    });

    let arr = Object.entries(map).map(([name, data]) => ({
        name,
        photo: data.photo,
        asist: Number(data.asist) || 0
    }));

    // Büyükten küçüğe sırala
    arr.sort((a, b) => b.asist - a.asist);

    arr.forEach(d => {
        if (d.asist <= 0) return; // 0 asist varsa gösterme

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


async function profilFotoGuncelle() {
    let file = document.getElementById("profilYeniFoto").files[0];
    if (!file) return alert("Fotoğraf seç!");

    const uploaded = await upload.uploadFile(file);
    let url = uploaded.fileUrl;

    const snap = await db.collection("players")
        .where("name", "==", currentUser)
        .get();

    if (snap.empty) return;

    let id = snap.docs[0].id;

    await db.collection("players").doc(id).update({ photo: url });

    notify("Fotoğraf Güncellendi");

    loadProfil();
    loadPlayers();
}





/* ==========================================================
   EN İYİ OYUNCULAR
========================================================== */
async function loadEnIyi() {
    const box = document.getElementById("eniyiList");
    box.innerHTML = "";

    const players = await db.collection("players").get();
    let arr = [];

    for (let doc of players.docs) {
        let name = doc.data().name;
        let photo = doc.data().photo || DEFAULT_PHOTO;

        let ga = await db.collection("ga").where("name", "==", name).get();
        let rating = await db.collection("ratings").where("to", "==", name).get();
        let win = await db.collection("winners").where("players", "array-contains", name).get();

        let g = 0, a = 0;
        ga.forEach(s => { g += s.data().gol; a += s.data().asist; });

        let scores = [];
        rating.forEach(s => scores.push(s.data().score));
        let avg = scores.length ? (scores.reduce((x,y) => x+y) / scores.length) : 0;

        let total = (g * 2) + (a * 1) + (win.size * 5) + avg;

        arr.push({ name, photo, total });
    }

    arr.sort((a,b) => b.total - a.total);

    arr.forEach(p => {
		if (p.total <= 0) return;
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



/* ==========================================================
   KAZANANLAR
========================================================== */
async function loadKazananlar() {
    const box = document.getElementById("kazananList");
    box.innerHTML = "";

    const players = await db.collection("players").get();
    let arr = [];

    for (let doc of players.docs) {
        let name = doc.data().name;
        let photo = doc.data().photo || DEFAULT_PHOTO;

        let wins = await db.collection("winners").where("players", "array-contains", name).get();

        arr.push({ name, photo, total: wins.size });
    }

    arr.sort((a,b) => b.total - a.total);

    arr.forEach(p => {
		if (p.total <= 0) return;
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



/* ==========================================================
   KAZANAN EKLE
========================================================== */
async function kazananKaydet() {
    let arr = multiSelects["winnerSelect"].values;
    if (!arr.length) return alert("Oyuncu seç!");

    await db.collection("winners").add({
        players: arr,
        date: new Date().toISOString()
    });

    loadKazananlar();
    loadEnIyi();
    notify("Kaydedildi");
}



/* ==========================================================
   ÇIKIŞ
========================================================== */
function logout() {

    window.stop(); // ✨ Yenileme sonrası eski sayfanın açılmasını tamamen durdurur

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

