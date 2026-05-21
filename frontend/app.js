// 1. VİTRİN LİSTELEME
async function loadLiveCars() {
    const carsGrid = document.getElementById('cars-grid');
    if (!carsGrid) return; 

    try {
        const response = await fetch('http://localhost:3000/api/cars');
        const cars = await response.json();
        carsGrid.innerHTML = '';

        cars.forEach(car => {
            carsGrid.insertAdjacentHTML('beforeend', `
                <div class="car-card">
                    <div class="card-image"><img src="${car.image_url}"></div>
                    <div class="card-info">
                        <h3>${car.title}</h3>
                        <div class="card-footer">
                            <span class="car-price">${Number(car.price).toLocaleString('tr-TR')} TL</span>
                            <a href="detail.html?id=${car.id}" class="btn-detail">Detayları Gör</a>
                        </div>
                    </div>
                </div>
            `);
        });
    } catch (e) { console.error(e); }
}
document.addEventListener('DOMContentLoaded', loadLiveCars);

// 2. YENİ İLAN GÖNDERME
document.addEventListener('submit', async (e) => {
    if (e.target && e.target.id === 'form-add-car') {
        e.preventDefault();
        const carData = {
            title: document.getElementById('listing-title').value,
            brand: document.getElementById('listing-brand').value,
            model: document.getElementById('listing-model').value,
            year: parseInt(document.getElementById('listing-year').value),
            price: parseFloat(document.getElementById('listing-price').value),
            km: parseInt(document.getElementById('listing-km').value),
            fuel_type: document.getElementById('listing-fuel').value,
            image_url: document.getElementById('listing-image').value,
            slider_img1: document.getElementById('listing-slider-1').value,
            slider_img2: document.getElementById('listing-slider-2').value,
            slider_img3: document.getElementById('listing-slider-3').value
        };

        try {
            const res = await fetch('http://localhost:3000/api/cars', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(carData)
            });
            if (res.ok) {
                alert("🚀 İlan başarıyla veritabanına mühürlendi kanka!");
                window.location.href = 'index.html';
            }
        } catch (err) { console.error(err); }
    }
});

// 3. CANLI DETAY VE SLIDER MOTORU
async function loadLiveCarDetail() {
    const sliderMain = document.getElementById('dynamic-slider');
    if (!sliderMain) return;

    const urlParams = new URLSearchParams(window.location.search);
    const carId = urlParams.get('id');

    try {
        const response = await fetch(`http://localhost:3000/api/cars/${carId}`);
        if (!response.ok) return;
        const car = await response.json();

        // Resimleri ve butonları basıyoruz kanka
        sliderMain.innerHTML = `
            <img src="${car.slider_img1}" class="slide active">
            <img src="${car.slider_img2}" class="slide">
            <img src="${car.slider_img3}" class="slide">
            <button class="slider-btn prev-btn"><i class="fa-solid fa-chevron-left"></i></button>
            <button class="slider-btn next-btn"><i class="fa-solid fa-chevron-right"></i></button>
        `;

        document.getElementById('detail-title').innerText = car.title;
        document.getElementById('detail-price').innerText = Number(car.price).toLocaleString('tr-TR') + ' TL';
        document.getElementById('spec-year').innerText = car.year;
        document.getElementById('spec-km').innerText = Number(car.km).toLocaleString('tr-TR') + ' km';
        document.getElementById('spec-fuel').innerText = car.fuel_type;

        initSliderControls();
    } catch (error) { console.error(error); }
}

function initSliderControls() {
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    let index = 0;

    if (slides.length === 0) return;

    function show(idx) {
        if (idx >= slides.length) index = 0;
        else if (idx < 0) index = slides.length - 1;
        else index = idx;

        slides.forEach(s => s.classList.remove('active'));
        slides[index].classList.add('active');
    }

    nextBtn.addEventListener('click', () => show(index + 1));
    prevBtn.addEventListener('click', () => show(index - 1));
}
document.addEventListener('DOMContentLoaded', loadLiveCarDetail);