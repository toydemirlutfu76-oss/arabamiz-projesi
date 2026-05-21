const mysql = require('mysql2');

// MySQL Veritabanı Bağlantı Havuzu
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',      // XAMPP veya phpMyAdmin kullanıyorsan varsayılan kullanıcı 'root'tur
    password: '',      // Varsayılan şifre boştur kanka
    database: 'arabamiz_db', // phpMyAdmin'de açtığımız veritabanı adı
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
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