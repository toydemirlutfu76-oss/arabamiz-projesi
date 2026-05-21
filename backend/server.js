const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

// Yüklenen resimlerin dışarıdan okunabilmesi için uploads klasörünü dışarı açıyoruz
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// MySQL Veritabanı Bağlantı Havuzu
// MySQL Veritabanı Bağlantı Havuzu (Render Ortam Değişkenlerine Uyarlandı kanka)
const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'arabamiz_db',
    port: process.env.DB_PORT || 3306
});

// --- MULTER DOSYA YÜKLEME AYARLARI ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, 'public/uploads');
        if (!fs.existsSync(uploadDir)){
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// ==========================================
// 1. YENİ İLAN EKLEME API (GÜVENLİ VE DOSYA YÜKLEMELİ)
// ==========================================
app.post('/api/cars', upload.fields([
    { name: 'image_file', maxCount: 1 },
    { name: 'slider_file1', maxCount: 1 },
    { name: 'slider_file2', maxCount: 1 },
    { name: 'slider_file3', maxCount: 1 }
]), async (req, res) => {
    try {
        const { title, brand, model, year, price, km, fuel_type, user_id } = req.body;
        const files = req.files;

        // Giriş yapmayan biri ilan vermeye çalışırsa engelle kanka
        if (!user_id || user_id === "null" || user_id === "undefined") {
            return res.status(401).json({ error: "Kanka ilan vermek için önce giriş yapmalısın! 🛑" });
        }

        const image_url = files['image_file'] ? `http://localhost:3000/uploads/${files['image_file'][0].filename}` : '';
        const slider_img1 = files['slider_file1'] ? `http://localhost:3000/uploads/${files['slider_file1'][0].filename}` : '';
        const slider_img2 = files['slider_file2'] ? `http://localhost:3000/uploads/${files['slider_file2'][0].filename}` : '';
        const slider_img3 = files['slider_file3'] ? `http://localhost:3000/uploads/${files['slider_file3'][0].filename}` : '';

        const query = `INSERT INTO cars (user_id, title, brand, model, year, price, km, fuel_type, image_url, slider_img1, slider_img2, slider_img3) 
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        const [result] = await db.query(query, [user_id, title, brand, model, year, price, km, fuel_type, image_url, slider_img1, slider_img2, slider_img3]);
        res.json({ success: true, id: result.insertId });
    } catch (error) { 
        console.error("İlan ekleme hatası kanka:", error);
        res.status(500).json({ error: error.message }); 
    }
});

// ==========================================
// 2. TEKİL İLAN SİLME API (SADECE SAHİBİ SİLEBİLİR)
// ==========================================
app.delete('/api/delete-car/:carId', async (req, res) => {
    const carId = req.params.carId;
    const { user_id } = req.body;

    try {
        const [car] = await db.query('SELECT user_id FROM cars WHERE id = ?', [carId]);
        if (car.length === 0) return res.status(404).json({ error: "İlan bulunamadı kanka!" });

        if (car[0].user_id !== parseInt(user_id)) {
            return res.status(403).json({ error: "Kanka başkasının ilanını silemezsin! 🛑" });
        }

        await db.query('DELETE FROM cars WHERE id = ?', [carId]);
        res.json({ success: true, message: "İlan başarıyla silindi." });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// ==========================================
// 3. KOMPLE HESAP SİLME API (PEŞİNDEN İLANLARI DA SİLİR)
// ==========================================
app.delete('/api/delete-account/:id', async (req, res) => {
    const userId = req.params.id;
    try {
        await db.query('DELETE FROM cars WHERE user_id = ?', [userId]);
        await db.query('DELETE FROM users WHERE id = ?', [userId]);
        res.json({ success: true, message: "Hesap silindi." });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// ==========================================
// 4. ŞİFRE SIFIRLAMA API
// ==========================================
app.post('/api/reset-password', async (req, res) => {
    const { email, newPassword } = req.body;
    try {
        const [user] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (user.length === 0) return res.status(404).json({ error: "E-posta bulunamadı kanka!" });

        await db.query('UPDATE users SET password = ? WHERE email = ?', [newPassword, email]);
        res.json({ message: "Şifre güncellendi." });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// ==========================================
// VİTRİN, LOGIN, REGISTER ROTALARI
// ==========================================
app.get('/api/cars', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM cars ORDER BY id DESC');
        res.json(rows);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/cars/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM cars WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: "Bulunamadı" });
        res.json(rows[0]);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/register', async (req, res) => {
    const { name_surname, email, password } = req.body;
    try {
        await db.query('INSERT INTO users (name_surname, email, password) VALUES (?, ?, ?)', [name_surname, email, password]);
        res.json({ message: "Kayıt başarılı" });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows] = await db.query('SELECT id, name_surname FROM users WHERE email = ? AND password = ?', [email, password]);
        if (rows.length === 0) return res.status(401).json({ error: "Hatalı şifre veya e-posta" });
        res.json({ message: "Başarılı", user: rows[0] });
    } catch (error) { res.status(500).json({ error: error.message }); }
});





// --- VERİTABANINDAN İLAN SİLME ROTASI (BACKEND) ---
app.delete('/api/cars/:id', async (req, res) => {
    const carId = req.params.id;
    
    try {
        // Veritabanından o ID'ye ait arabayı siliyoruz kanka
        const [result] = await db.query('DELETE FROM cars WHERE id = ?', [carId]);
        
        if (result.affectedRows > 0) {
            res.status(200).json({ message: "İlan başarıyla silindi kanka!" });
        } else {
            res.status(404).json({ error: "Araba bulunamadı kanka!" });
        }
    } catch (error) {
        console.error("Backend silme hatası:", error);
        res.status(500).json({ error: "Veritabanından silerken backend çöktü kanka!" });
    }
});





// --- FAVORİ EKLEME VEYA KALDIRMA (TOGGLE) API ---
app.post('/api/favorites/toggle', async (req, res) => {
    const { user_id, car_id } = req.body;
    if (!user_id || !car_id) return res.status(400).json({ error: "Eksik bilgi kanka!" });

    try {
        // Önce bu ilan zaten favoride mi diye bak kanka
        const [existing] = await db.query('SELECT * FROM favorites WHERE user_id = ? AND car_id = ?', [user_id, car_id]);

        if (existing.length > 0) {
            // Varsa favorilerden kaldır kanka (Unfavorite)
            await db.query('DELETE FROM favorites WHERE user_id = ? AND car_id = ?', [user_id, car_id]);
            return res.status(200).json({ status: "removed", message: "Favorilerden kaldırıldı kanka!" });
        } else {
            // Yoksa favorilere ekle kanka (Favorite)
            await db.query('INSERT INTO favorites (user_id, car_id) VALUES (?, ?)', [user_id, car_id]);
            return res.status(200).json({ status: "added", message: "Favorilere eklendi kanka!" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Favori işlemi esnasında backend çöktü kanka!" });
    }
});

// --- KULLANICININ FAVORİ İLAN ID'LERİNİ ÇEKME API ---
app.get('/api/favorites/:user_id', async (req, res) => {
    const userId = req.params.user_id;
    try {
        const [rows] = await db.query('SELECT car_id FROM favorites WHERE user_id = ?', [userId]);
        const favoriteIds = rows.map(row => row.car_id);
        res.status(200).json(favoriteIds);
    } catch (error) {
        res.status(500).json({ error: "Favoriler çekilemedi kanka!" });
    }
});

// --- SADECE FAVORİ İLANLARIN DETAYLARINI ÇEKME API ---
app.get('/api/favorites/details/:user_id', async (req, res) => {
    const userId = req.params.user_id;
    try {
        const [rows] = await db.query(`
            SELECT cars.* FROM cars 
            INNER JOIN favorites ON cars.id = favorites.car_id 
            WHERE favorites.user_id = ?
        `, [userId]);
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ error: "Favori detayları çekilemedi kanka!" });
    }
});





app.listen(3000, () => { console.log("🚀 Resim yükleme destekli sunucu 3000 portunda hazır kanka!"); });