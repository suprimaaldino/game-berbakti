// State game
var gameState = {
    coins: 0,
    completedMissions: new Set(),
    redeemedRewards: new Set()
};

// Variabel untuk PWA Install Prompt
var deferredPrompt;
var installBtn = document.getElementById('installBtn');

// Tangkap event sebelum install (hanya berjalan di mobile + Chrome)
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    // Tampilkan tombol install hanya jika di perangkat mobile
    if (installBtn) {
        installBtn.style.display = 'inline-block';
    }
});

// Tambahkan event listener ke tombol install (jika ada)
if (installBtn) {
    installBtn.addEventListener('click', async () => {
        if (!deferredPrompt) {
            showNotification('📱 Aplikasi sudah terpasang atau tidak bisa diinstall.');
            return;
        }

        // Tampilkan prompt install
        deferredPrompt.prompt();

        // Tunggu respons pengguna
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult.outcome === 'accepted') {
            showNotification('🎉 Selamat! Aplikasi berhasil diinstall!');
        } else {
            showNotification('❌ Install dibatalkan.');
        }

        // Reset prompt
        deferredPrompt = null;
        installBtn.style.display = 'none';
    });
}

// Daftar misi
var missions = [
    { id: 1, title: "Bersihkan Kamar", description: "Rapikan tempat tidur dan bersihkan lantai kamar", reward: 5 },
    { id: 2, title: "Bantu Masak", description: "Bantu ibu memasak makanan untuk keluarga", reward: 8 },
    { id: 3, title: "Cuci Piring", description: "Cuci semua piring setelah makan", reward: 4 },
    { id: 4, title: "Jemur Pakaian", description: "Bantu menjemur pakaian yang sudah dicuci", reward: 3 },
    { id: 5, title: "Belanja Kebutuhan", description: "Beli kebutuhan rumah di warung terdekat", reward: 6 },
    { id: 6, title: "Temani Orang Tua", description: "Duduk dan ngobrol dengan orang tua selama 30 menit", reward: 7 },
    { id: 7, title: "Sapu Halaman", description: "Bersihkan halaman rumah dari daun dan sampah", reward: 4 },
    { id: 8, title: "Isi Galon", description: "Beli dan pasang galon air minum", reward: 5 },
    { id: 9, title: "Cuci Sepatu", description: "Cuci sepatu sekolah agar siap dipakai", reward: 6 },
    { id: 10, title: "Bantu Adik Belajar", description: "Temani adik belajar selama 1 jam", reward: 7 },
    { id: 11, title: "Rapikan Lemari", description: "Susun pakaian di lemari dengan rapi", reward: 5 },
    { id: 12, title: "Bersihkan Kulkas", description: "Buang makanan basi dan lap rak kulkas", reward: 6 },
    { id: 13, title: "Setrika Baju", description: "Setrika pakaian kerja orang tua", reward: 8 },
    { id: 14, title: "Buat Sarapan", description: "Siapkan sarapan sehat untuk keluarga", reward: 7 },
    { id: 15, title: "Bantu Cuci Motor", description: "Cuci motor agar terlihat bersih dan kinclong", reward: 9 }
];

// Daftar hadiah
var rewards = [
    { id: 1, name: "Mainan Baru", description: "Pilih satu mainan baru di toko favorit", cost: 15 },
    { id: 2, name: "Waktu Game Ekstra", description: "Tambahan 30 menit bermain game favorit", cost: 20 },
    { id: 3, name: "Liburan Mini", description: "Jalan-jalan ke tempat seru seperti taman atau museum", cost: 50 },
    { id: 4, name: "Hari Bebas PR", description: "Boleh istirahat dari PR hari ini (dengan izin guru)", cost: 25 },
    { id: 5, name: "Nonton Film Favorit", description: "Nonton film pilihan dengan camilan enak", cost: 18 },
    { id: 6, name: "Sarapan Spesial", description: "Sarapan dengan menu favorit seperti pancake atau roti bakar", cost: 22 },
    { id: 7, name: "Kado Kejutan", description: "Dapat hadiah kejutan dari orang tua", cost: 30 },
    { id: 8, name: "Hari Bebas Tugas Rumah", description: "Boleh istirahat dari tugas rumah selama sehari", cost: 35 },
    { id: 9, name: "Foto Seru", description: "Sesi foto lucu dengan kostum atau tema pilihan", cost: 28 },
    { id: 10, name: "Playlist Anak", description: "Putar lagu-lagu favorit anak sepanjang hari", cost: 12 },
    { id: 11, name: "Bikin Kue Sendiri", description: "Bikin kue bersama keluarga dan makan bareng", cost: 16 },
    { id: 12, name: "Surat Pujian", description: "Dapat surat pujian dari orang tua atas kerja keras", cost: 10 },
    { id: 13, name: "Tidur Lebih Lama", description: "Boleh bangun lebih siang di akhir pekan", cost: 14 },
    { id: 14, name: "Minuman Favorit", description: "Dapat minuman kesukaan seperti bubble tea atau jus", cost: 11 },
    { id: 15, name: "Dekorasi Meja Belajar", description: "Dekorasi meja belajar dengan tema favorit", cost: 40 }
];

// DOM Elements
var coinCountEl = document.getElementById('coinCount');
var missionListEl = document.getElementById('missionList');
var rewardListEl = document.getElementById('rewardList');
var coinSound = document.getElementById('coinSound');
var toastEl = document.getElementById('toast');
var toastMessageEl = document.getElementById('toastMessage');

// Fungsi: Tampilkan notifikasi toast
function showNotification(message) {
    if (!toastEl) return;
    toastMessageEl.textContent = message;
    toastEl.classList.add('show');
    setTimeout(() => {
        toastEl.classList.remove('show');
    }, 3000);
}

// Fungsi: Update tampilan koin
function updateCoinDisplay() {
    if (coinCountEl) coinCountEl.textContent = gameState.coins;
}

// Fungsi: Cek status misi
function isMissionCompleted(id) {
    return gameState.completedMissions.has(id);
}

// Fungsi: Cek status hadiah
function isRewardRedeemed(id) {
    return gameState.redeemedRewards.has(id);
}

// Fungsi: Simpan state ke localStorage
function saveState() {
    const state = {
        coins: gameState.coins,
        completedMissions: Array.from(gameState.completedMissions),
        redeemedRewards: Array.from(gameState.redeemedRewards)
    };
    localStorage.setItem('family-mission-game', JSON.stringify(state));
}

// Fungsi: Muat state dari localStorage
function loadState() {
    const saved = localStorage.getItem('family-mission-game');
    if (saved) {
        const parsed = JSON.parse(saved);
        gameState.coins = parsed.coins || 0;
        gameState.completedMissions = new Set(parsed.completedMissions || []);
        gameState.redeemedRewards = new Set(parsed.redeemedRewards || []);
    }
}

// Fungsi: Mainkan suara koin
function playCoinSound() {
    if (!coinSound) return;
    coinSound.currentTime = 0;
    coinSound.play().catch(e => console.log("Gagal memainkan suara:", e));
}

// Render Misi
function renderMissions() {
    if (!missionListEl) return;
    missionListEl.innerHTML = '';
    missions.forEach(m => {
        const completed = isMissionCompleted(m.id);
        const missionEl = document.createElement('div');
        missionEl.className = 'mission' + (completed ? ' completed' : '');
        missionEl.innerHTML = `
            <div class="mission-reward">
                <img src="assets/icons/coin.gif" alt="Koin" width="20" height="20">
                +${m.reward} 🪙
            </div>
            <div class="mission-content">
                <div class="mission-title">${m.title}</div>
                <div class="mission-desc">${m.description}</div>
            </div>
            <button class="claim-btn" ${completed ? 'disabled' : ''}
                onclick="claimMission(${m.id}, ${m.reward})">
                ${completed ? 'Selesai ✅' : 'Selesaikan'}
            </button>
        `;
        missionListEl.appendChild(missionEl);
    });
}

// Klaim Misi
function claimMission(id, reward) {
    if (isMissionCompleted(id)) return;
    gameState.coins += reward;
    gameState.completedMissions.add(id);
    playCoinSound();
    updateCoinDisplay();
    renderMissions();
    renderRewards();
    saveState();
    showNotification(`🎉 Selamat! Anda dapat ${reward} koin!`);
}

// Render Hadiah
function renderRewards() {
    if (!rewardListEl) return;
    rewardListEl.innerHTML = '';
    rewards.forEach(r => {
        const redeemed = isRewardRedeemed(r.id);
        const canRedeem = !redeemed && gameState.coins >= r.cost;
        const rewardEl = document.createElement('div');
        rewardEl.className = 'reward';
        rewardEl.innerHTML = `
            <div class="reward-name" style="font-weight:600;margin-bottom:6px;">${r.name}</div>
            <div class="reward-desc" style="font-size:0.9rem;color:#666;margin-bottom:10px;">${r.description}</div>
            <div class="reward-cost">
                <img src="assets/icons/coin.gif" alt="Koin" width="24" height="24">
                ${r.cost} 🪙
            </div>
            <button class="redeem-btn" ${canRedeem ? '' : 'disabled'}
                onclick="redeemReward(${r.id}, ${r.cost}, '${r.name.replace(/'/g, "\\'")}')">
                ${redeemed ? 'Ditukar ✅' : (canRedeem ? 'Tukar' : 'Kurang')}
            </button>
        `;
        rewardListEl.appendChild(rewardEl);
    });
}

// Tebus Hadiah
function redeemReward(id, cost, name) {
    if (isRewardRedeemed(id)) return;
    if (gameState.coins < cost) {
        showNotification(`❌ Koin tidak cukup! Butuh ${cost}, punya ${gameState.coins}.`);
        return;
    }
    gameState.coins -= cost;
    gameState.redeemedRewards.add(id);
    updateCoinDisplay();
    renderRewards();
    saveState();
    showNotification(`🎁 Hore! Kamu dapat "${name}"!`);
}

// Cetak Misi Harian
function printDailyMissions() {
    const today = new Date().toLocaleDateString('id-ID', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
    let list = '';
    missions.forEach(m => {
        list += `
        <tr>
            <td style="border:1px solid #ccc;padding:12px"><strong>${m.title}</strong></td>
            <td style="border:1px solid #ccc;padding:12px">${m.description}</td>
            <td style="border:1px solid #ccc;padding:12px;text-align:center">⬜</td>
        </tr>`;
    });
    const w = window.open();
    w.document.write(`
    <html>
    <head>
        <title>Misi Harian - ${today}</title>
        <style>
            body { font-family: 'Poppins', Arial, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th { background: #4facfe; color: white; padding: 12px; text-align: left; }
            td { padding: 12px; border: 1px solid #ccc; }
            h1 { text-align: center; color: #333; }
            p { text-align: center; color: #777; }
        </style>
    </head>
    <body>
        <h1>🎮 Misi Membantu Orang Tua</h1>
        <p><strong>Hari:</strong> ${today}</p>
        <table>
            <thead>
                <tr>
                    <th>Misi</th>
                    <th>Deskripsi</th>
                    <th>Selesai</th>
                </tr>
            </thead>
            <tbody>${list}</tbody>
        </table>
        <p>✅ Centang kotak saat misi selesai. Tukarkan koin dengan hadiah!</p>
        <script>window.print(); window.onafterprint = () => window.close();<\/script>
    </body>
    </html>`);
}

// Inisialisasi
function init() {
    loadState();
    updateCoinDisplay();
    renderMissions();
    renderRewards();
}

// Jalankan saat DOM siap
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}