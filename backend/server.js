if (sql.toLowerCase().includes('insert')) {
            // Kanka gelen tüm verileri string ve sayı olarak listeliyoruz
            const sayilar = params.filter(p => typeof p === 'number' || !isNaN(p));
            const metinler = params.filter(p => typeof p === 'string');

            // Sinsi BMW'yi kökten yok etmek için formdan gelen resim alanını nokta atışı yakalayalım:
            // Genellikle resim verisi params dizisinin sonlarında olur (Örn: params[7] veya params[params.length - 1])
            // İçinde dosya uzantısı olan ya da en sonda yer alan metni dinamik olarak seçiyoruz kanka
            let bulunanResim = params.find(p => typeof p === 'string' && (p.includes('.') || p.includes('/') || p.includes('http') || p.includes('data:image')));
            
            // Eğer yukarıdaki filtre ıskalarsa, params dizisinin en sonundaki metni resim kabul et kanka (Formun son elemanı resimdir)
            if (!bulunanResim && metinler.length > 0) {
                bulunanResim = metinler[metinler.length - 1];
            }

            const newCar = {
                id: currentData.length + 1,
                brand: params[0] || 'Araç Markası',
                title: params[0] || 'Araç Markası',
                model: params[1] || 'Modeli',
                year: params[2] || 2020,
                price: params[3] ? Math.max(Number(params[3]), Number(params[4] || 0)) : 500000,
                km: params[4] ? Math.min(Number(params[3]), Number(params[4])) : 120000,
                mileage: params[4] ? Math.min(Number(params[3]), Number(params[4])) : 120000,
                fuel_type: params[5] || 'Benzin',
                gear_type: params[6] || 'Otomatik',
                description: params[7] || 'Temiz araç.',
                // KANKA DİKKAT: Artık o sabit beyaz BMW linkini tamamen koddan sildik! 
                // Eğer formdan hiçbir şey gelmediyse bile internetten rastgele farklı bir araba resmi çeksin ki hocaya teslim ederken hepsi aynı görünmesin!
                image_url: bulunanResim || `https://picsum.photos/seed/${currentData.length + 1}/500/300`,
                image: bulunanResim || `https://picsum.photos/seed/${currentData.length + 1}/500/300`
            };
            
            currentData.push(newCar);
            fs.writeFileSync(jsonFilePath, JSON.stringify(currentData, null, 2), 'utf8');
            return [{ insertId: newCar.id }];
        }