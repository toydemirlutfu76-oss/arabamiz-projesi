const fs = require('fs');
const path = require('path');
const jsonFilePath = path.join(__dirname, 'ilanlar.json');

if (!fs.existsSync(jsonFilePath)) {
    fs.writeFileSync(jsonFilePath, JSON.stringify([]), 'utf8');
}

const db = {
    query: async (sql, params) => {
        const currentData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
        
        if (sql.toLowerCase().includes('select')) {
            return [currentData];
        }
        
        if (sql.toLowerCase().includes('insert')) {
            // Kanka formdan gelen verilerin sırası kaymasın diye akıllı eşitleme yapıyoruz:
            // params içindeki sayıları ve metinleri türlerine göre ayıklayıp doğru yerlere koyuyoruz
            const sayilar = params.filter(p => typeof p === 'number' || !isNaN(p));
            const metinler = params.filter(p => typeof p === 'string' && isNaN(p));

            const newCar = {
                id: currentData.length + 1,
                // Eğer metin varsa ilkini marka yap, yoksa varsayılan isim ver
                brand: metinler[0] || 'Araba İlanı',
                model: metinler[1] || 'Model',
                description: metinler[2] || 'Temiz araç',
                // Resim linki olabilecek en uzun metni veya son metni seçiyoruz
                image_url: metinler.find(m => m.includes('http') || m.includes('.') || m.includes('/') || m.length > 10) || 'https://via.placeholder.com/300x200?text=Araba+Resmi',
                // Sayılardan büyük olanı fiyat, küçük olanı kilometre yapıyoruz (Mühendislik zekası kanka!)
                price: sayilar.length > 1 ? Math.max(...sayilar.map(Number)) : (sayilar[0] || 500000),
                km: sayilar.length > 1 ? Math.min(...sayilar.map(Number)) : (sayilar[1] || 120000),
                mileage: sayilar.length > 1 ? Math.min(...sayilar.map(Number)) : (sayilar[1] || 120000),
                year: 2020,
                fuel_type: 'Benzin'
            };
            
            currentData.push(newCar);
            fs.writeFileSync(jsonFilePath, JSON.stringify(currentData, null, 2), 'utf8');
            return [{ insertId: newCar.id }];
        }
        return [[]];
    },
    execute: async (sql, params) => {
        const currentData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
        return [currentData];
    }
};