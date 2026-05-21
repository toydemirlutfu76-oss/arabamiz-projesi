const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

// Yüklenen resimlerin dışarıdan okunabilmesi için uploads klasörünü dışarı açıyoruz
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// --- JSON TABANLI VERİTABANI MOTORU (ÖDEV KURTARICI) ---
const jsonFilePath = path.join(__dirname, 'ilanlar.json');
const usersFilePath = path.join(__dirname, 'users.json');
const favoritesFilePath = path.join(__dirname, 'favorites.json');

// Gerekli JSON dosyaları yoksa otomatik boş diziyle oluştur kanka
if (!fs.existsSync(jsonFilePath)) fs.writeFileSync(jsonFilePath, JSON.stringify([]), 'utf8');
if (!fs.existsSync(usersFilePath)) fs.writeFileSync(usersFilePath, JSON.stringify([]), 'utf8');
if (!fs.existsSync(favoritesFilePath)) fs.writeFileSync(favoritesFilePath, JSON.stringify([]), 'utf8');

const db = {
    query: async (sql, params) => {
        const sqlLower = sql.toLowerCase();
        
        // 1. CARS TABLOSU İŞLEMLERİ
        if (sqlLower.includes('from cars') || sqlLower.includes('into cars') || sqlLower.includes('delete from cars')) {
            let cars = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
            
            if (sqlLower.includes('select * from cars where id = ?')) {
                const car = cars.find(c => c.id === parseInt(params[0]));
                return [car ? [car] : []];
            }
            if (sqlLower.includes('select user_id from cars where id = ?')) {
                const car = cars.find(c => c.id === parseInt(params[0]));
                return [car ? [car] : []];
            }
            if (sqlLower.includes('select')) {
                return [cars];
            }
            if (sqlLower.includes('insert')) {
                const newCar = {
                    id: cars.length > 0 ? cars[cars.length - 1].id + 1 : 1,
                    user_id: parseInt(params[0]) || 1,
                    title: params[1] && params[2] ? `${params[1]} ${params[2]}` : (params[1] || 'Yeni Araba İlanı'),
                    brand: params[1] || 'Belirtilmemiş',
                    model: params[2] || 'Belirtilmemiş',
                    year: Number(params[3]) || 2020,
                    price: Number(params[4]) || 0,
                    km: Number(params[5]) || 0,
                    fuel_type: params[6] || 'Benzin',
                    description: params[6] || '', 
                    image_url: params[7] ? `https://arabamiz-projesi.onrender.com/uploads/${params[7]}` : 'https://via.placeholder.com/400x250?text=Arabamiz+Projesi',
                    image_path: params[7] || '',
                    slider_img1: params[8] || '',
                    slider_img2: params[9] || '',
                    slider_img3: params[10] || ''
                };
                cars.push(newCar);
                fs.writeFileSync(jsonFilePath, JSON.stringify(cars, null, 2), 'utf8');
                return [{ insertId: newCar.id, affectedRows: 1 }];
            }
            if (sqlLower.includes('delete')) {
                const initialLength = cars.length;
                cars = cars.filter(c => c.id !== parseInt(params[0]) && c.user_id !== parseInt(params[0]));
                fs.writeFileSync(jsonFilePath, JSON.stringify(cars, null, 2), 'utf8');
                return [{ affectedRows: initialLength - cars.length }];
            }
        }

        // 2. USERS TABLOSU İŞLEMLERİ
        if (sqlLower.includes('users')) {
            let users = JSON.parse(fs.readFileSync(usersFilePath, 'utf8'));
            
            if (sqlLower.includes('select id, name_surname')) {
                const user = users.find(u => u.email === params[0] && u.password === params[1]);
                return [user ? [user] : []];
            }
            if (sqlLower.includes('select id')) {
                const user = users.find(u => u.email === params[0]);
                return [user ? [user] : []];
            }
            if (sqlLower.includes('insert')) {
                const newUser = {
                    id: users.length > 0 ? users[users.length - 1].id + 1 : 1,
                    name_surname: params[0],
                    email: params[1],
                    password: params[2]
                };
                users.push(newUser);
                fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
                return [{ insertId: newUser.id }];
            }
            if (sqlLower.includes('update')) {
                users = users.map(u => u.email === params[1] ? { ...u, password: params[0] } : u);
                fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
                return [{ affectedRows: 1 }];
            }
            if (sqlLower.includes('delete')) {
                users = users.filter(u => u.id !== parseInt(params[0]));
                fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
                return [{ affectedRows: 1 }];
            }
        }

        // 3. FAVORITES TABLOSU İŞLEMLERİ
        if (sqlLower.includes('favorites')) {
            let favorites = JSON.parse(fs.readFileSync(favoritesFilePath, 'utf8'));
            
            if (sqlLower.includes('select car_id from favorites where user_id = ?')) {
                const userFavs = favorites.filter(f => f.user_id === parseInt(params[0]));
                return [userFavs];
            }
            if (sqlLower.includes('inner join favorites')) {
                const cars = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
                const userFavIds = favorites.filter(f => f.user_id === parseInt(params[0])).map(f => f.car_id);
                const favCars = cars.filter(c => userFavIds.includes(c.id));
                return [favCars];
            }
            if (sqlLower.includes('select * from favorites')) {
                const exist = favorites.filter(f => f.user_id === parseInt(params[0]) && f.car_id === parseInt(params[1]));
                return [exist];
            }
            if (sqlLower.includes('insert')) {
                favorites.push({ user_id: parseInt(params[0]), car_id: parseInt(params[1]) });
                fs.writeFileSync(favoritesFilePath, JSON.stringify(favorites, null, 2), 'utf8');
                return [{}];
            }
            if (sqlLower.includes('delete')) {
                favorites = favorites.filter(f => !(f.user_id === parseInt(params[0]) && f.car_id === parseInt(params[1])));
                fs.writeFileSync(favoritesFilePath, JSON.stringify(favorites, null, 2), 'utf8');
                return [{}];
            }
        }
        return [[]];
    },
    execute: async (sql, params) => {
        return db.query(sql, params);
    }
};

// --- MULTER DOSYA YÜKLEME AYARLARI ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, 'public/uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// ==========================================
// 1. YENİ İLAN EKLEME API
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

        if (!user_id || user_id === "null" || user_id === "undefined") {
            return res.status(401).json({ error: "Kanka ilan vermek için önce giriş yapmalısın! 🛑" });
        }

        const image_url = files['image_file'] ? files['image_file'][0].filename : '';
        const slider_img1 = files['slider_file1'] ? files['slider_file1'][0].filename : '';
        const slider_img2 = files['slider_file2'] ? files['slider_file2'][0].filename : '';
        const slider_img3 = files['slider_file3'] ? files['slider_file3'][0].filename : '';

        const query = `INSERT INTO cars (user_id, title, brand, model, year, price, km, fuel_type, image_url, slider_img1, slider_img2, slider_img3) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        const [result] = await db.query(query, [user_id, title, brand, model, year, price, km, fuel_type, image_url, slider_img1, slider_img2, slider_img3]);
        res.json({ success: true, id: result.insertId });
    } catch (error) { 
        console.error("İlan ekleme hatası kanka:", error);
        res.status(500).json({ error: error.message }); 
    }
});

// ==========================================
// 2. TEKİL İLAN SİLME API (ÖN YÜZDEN TETİKLENEN GENEL SİLME)
// ==========================================
app.delete('/api/cars/:id', async (req, res) => {
    const carId = req.params.id;
    try {
        const [result] = await db.query('DELETE FROM cars WHERE id = ?', [carId]);
        if (result.affectedRows > 0) {
            res.status(200).json({ message: "İlan başarıyla silindi kanka!" });
        } else {
            res.status(404).json({ error: "Araba bulunamadı kanka!" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ALTERNATİF SİLME ROTASI (KULLANICI KONTROLLÜ)
app.delete('/api/delete-car/:carId', async (req, res) => {
    const carId = req.params.carId;
    const { user_id } = req.body;
    try {
        const [car] = await db.query('SELECT user_id FROM cars WHERE id = ?', [carId]);
        if (!car || car.length === 0) return res.status(404).json({ error: "İlan bulunamadı kanka!" });

        if (car[0].user_id !== parseInt(user_id)) {
            return res.status(403).json({ error: "Kanka başkasının ilanını silemezsin! 🛑" });
        }
        await db.query('DELETE FROM cars WHERE id = ?', [carId]);
        res.json({ success: true, message: "İlan başarıyla silindi." });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// ==========================================
// 3. KOMPLE HESAP SİLME API
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
        if (!user || user.length === 0) return res.status(404).json({ error: "E-posta bulunamadı kanka!" });

        await db.query('UPDATE users SET password = ? WHERE email = ?', [newPassword, email]);
        res.json({ message: "Şifre güncellendi." });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// ==========================================
// VİTRİN VE DETAY ROTALARI
// ==========================================
app.get('/api/cars', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM cars');
        res.json(rows);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/cars/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM cars WHERE id = ?', [req.params.id]);
        if (!rows || rows.length === 0) return res.status(404).json({ error: "Bulunamadı" });
        res.json(rows[0]);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// ==========================================
// AUTH (LOGIN/REGISTER) ROTALARI
// ==========================================
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
        if (!rows || rows.length === 0) return res.status(401).json({ error: "Hatalı şifre veya e-posta" });
        res.json({ message: "Başarılı", user: rows[0] });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// ==========================================
// FAVORİ SİSTEMİ ROTALARI
// ==========================================
app.post('/api/favorites/toggle', async (req, res) => {
    const { user_id, car_id } = req.body;
    if (!user_id || !car_id) return res.status(400).json({ error: "Eksik bilgi kanka!" });
    try {
        const [existing] = await db.query('SELECT * FROM favorites WHERE user_id = ? AND car_id = ?', [user_id, car_id]);
        if (existing && existing.length > 0) {
            await db.query('DELETE FROM favorites WHERE user_id = ? AND car_id = ?', [user_id, car_id]);
            return res.status(200).json({ status: "removed", message: "Favorilerden kaldırıldı kanka!" });
        } else {
            await db.query('INSERT INTO favorites (user_id, car_id) VALUES (?, ?)', [user_id, car_id]);
            return res.status(200).json({ status: "added", message: "Favorilere eklendi kanka!" });
        }
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/favorites/:user_id', async (req, res) => {
    const userId = req.params.user_id;
    try {
        const [rows] = await db.query('SELECT car_id FROM favorites WHERE user_id = ?', [userId]);
        const favoriteIds = rows.map(row => row.car_id);
        res.status(200).json(favoriteIds);
    } catch (error) { res.status(500).json({ error: "Favoriler çekilemedi kanka!" }); }
});

app.get('/api/favorites/details/:user_id', async (req, res) => {
    const userId = req.params.user_id;
    try {
        const [rows] = await db.query('INNER JOIN favorites ON cars.id = favorites.car_id WHERE favorites.user_id = ?', [userId]);
        res.status(200).json(rows);
    } catch (error) { res.status(500).json({ error: "Favori detayları çekilemedi kanka!" }); }
});

// Port dinamikleştirildi Render için hazır kanka!
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => { console.log(`🚀 Resim yükleme destekli sunucu ${PORT} portunda hazır kanka!`); });