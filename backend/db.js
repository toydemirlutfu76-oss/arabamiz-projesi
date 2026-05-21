const mysql = require('mysql2');

// MySQL Veritabanı Bağlantı Havuzu
// Giriş/Kayıt Veritabanı Bağlantısı (Render Ortam Değişkenlerine Uyarlandı kanka)
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'arabamiz_db',
    port: process.env.DB_PORT || 3306
});

// Bağlantıyı test edip konsola yazdıralım kanka
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Veritabanına bağlanırken motor su kaynattı kanka! Hata:', err.message);
    } else {
        console.log('🚀 Muazzam! arabamiz_db veritabanına canlı köprü kuruldu.');
        connection.release();
    }
});

module.exports = pool.promise();