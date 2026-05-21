const mysql = require('mysql2/promise');

// MySQL Veritabanı Bağlantı Havuzu (Render ve Railway Uyumu %100 Sağlandı kanka)
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'arabamiz_db',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Modern ve hatasız bağlantı test motoru kanka
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log('🚀 MUAZZAM! Railway veritabanına internet üzerinden canlı köprü kuruldu kanka!');
        connection.release();
    } catch (err) {
        console.error('❌ Veritabanı köprüsü kurulurken motor su kaynattı kanka! Hata:', err.message);
    }
})();

module.exports = pool;