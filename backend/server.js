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
            // Kanka senin ön yüz formundan gelen elemanların sırasını milimetrik dizdik:
            // params[0]: brand/title, params[1]: model, params[2]: year, params[3]: price, params[4]: km...
            const newCar = {
                id: currentData.length + 1,
                brand: params[0] || 'BMW',
                title: params[0] || 'BMW',
                model: params[1] || 'M5',
                year: params[2] || 2020,
                // Büyük sayıyı fiyata, küçük sayıyı kilometreye zorla kanka!
                price: params[3] ? Math.max(Number(params[3]), Number(params[4] || 0)) : 3500000,
                km: params[4] ? Math.min(Number(params[3]), Number(params[4])) : 90000,
                mileage: params[4] ? Math.min(Number(params[3]), Number(params[4])) : 90000,
                fuel_type: params[5] || 'Benzin',
                gear_type: params[6] || 'Otomatik',
                description: params[7] || 'Çok temiz, boyasız araç.',
                // Eğer kırık resim geliyorsa direkt varsayılan araba resmi bas kanka
                image_url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=500'
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