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
            const sayilar = params.filter(p => typeof p === 'number' || !isNaN(p));
            const metinler = params.filter(p => typeof p === 'string' && isNaN(p));

            // Kanka formdan gelen gerçek resmi bulmak için akıllı arama:
            // params içindeki dosya adı olabilecek (jpg, png, avif içeren) veya link olan metni seçiyoruz
            const gelenResim = params.find(p => typeof p === 'string' && (p.includes('.') || p.includes('/') || p.includes('http')));

            const newCar = {
                id: currentData.length + 1,
                brand: params[0] || 'BMW',
                title: params[0] || 'BMW',
                model: params[1] || 'M5',
                year: params[2] || 2020,
                price: params[3] ? Math.max(Number(params[3]), Number(params[4] || 0)) : 3500000,
                km: params[4] ? Math.min(Number(params[3]), Number(params[4])) : 90000,
                mileage: params[4] ? Math.min(Number(params[3]), Number(params[4])) : 90000,
                fuel_type: params[5] || 'Benzin',
                gear_type: params[6] || 'Otomatik',
                description: params[7] || 'Temiz araç.',
                // İŞTE BURASI! Eğer formdan resim geldiyse onu kullan, gelmediyse varsayılan yap kanka:
                image_url: gelenResim || 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=500',
                image: gelenResim || 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=500'
            };
            
            currentData.push(newCar);
            fs.writeFileSync(jsonFilePath, JSON.stringify(currentData, null, 2), 'utf8');
            return [{ insertId: newCar.id }];
        }
            
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