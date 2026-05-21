const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'ilanlar.json');

// Eğer dosya yoksa boş diziyle oluştur kanka
if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([]), 'utf8');
}

const pool = {
    query: async (sql, params) => {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        // İlanları Getirme İsteyi (SELECT)
        if (sql.toLowerCase().includes('select')) {
            return [data];
        }
        
        // İlan Ekleme İsteği (INSERT)
        if (sql.toLowerCase().includes('insert')) {
            const newCar = {
                id: data.length + 1,
                title: params[0] || '',
                price: params[1] || 0,
                description: params[2] || '',
                image_url: params[3] || '' // senin kolon isimlerine göre burayı doldurur kanka
            };
            data.push(newCar);
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
            return [{ insertId: newCar.id }];
        }
        return [[]];
    },
    promise: () => pool
};

module.exports = pool;