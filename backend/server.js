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
            // Formdan gelen tüm sayıları ve metinleri ayıklıyoruz kanka
            const sayilar = params.filter(p => typeof p === 'number' || !isNaN(p));
            const metinler = params.filter(p => typeof p === 'string' && isNaN(p));

            // Kanka yüklenen resim dosyası adlarını (içinde .jpg, .png, .avif, .jpeg geçenleri) filtreliyoruz
            const yuklenenResimler = params.filter(p => typeof p === 'string' && (p.includes('.') || p.includes('/') || p.includes('http')));

            // Ön yüzünün slider ve kapak için tam olarak beklediği nesne yapısı:
            const newCar = {
                id: currentData.length + 1,
                brand: params[0] || 'Araba İlanı',
                title: params[0] || 'Araba İlanı',
                model: params[1] || 'Model',
                year: params[2] || 2020,
                // Sayı kayma koruması
                price: params[3] ? Math.max(Number(params[3]), Number(params[4] || 0)) : 3500000,
                km: params[4] ? Math.min(Number(params[3]), Number(params[4])) : 90000,
                mileage: params[4] ? Math.min(Number(params[3]), Number(params[4])) : 90000,
                fuel_type: params[5] || 'Benzin',
                gear_type: params[6] || 'Otomatik',
                description: params[7] || 'Temiz araç.',
                
                // 1 TANE İLAN KAPAĞI İÇİN RESİM (İlk yüklenen resmi kapak yapıyoruz kanka)
                image_url: yuklenenResimler[0] || 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=500',
                image: yuklenenResimler[0] || 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=500',

                // SLIDER İÇİN 3 TANE FOTOĞRAF (Formdan gelen ilk 3 resmi slider dizisine koyuyoruz kanka)
                slider_image1: yuklenenResimler[0] || 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=500',
                slider_image2: yuklenenResimler[1] || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=500',
                slider_image3: yuklenenResimler[2] || 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=500'
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