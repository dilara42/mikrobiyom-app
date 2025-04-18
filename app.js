document.addEventListener('DOMContentLoaded', () => {
    // Sayfa elementleri
    const homePage = document.getElementById('home-page');
    const profilePage = document.getElementById('profile-page');
    const productsPage = document.getElementById('products-page');
    const homeLink = document.getElementById('home-link');
    const profileLink = document.getElementById('profile-link');
    const productsLink = document.getElementById('products-link');
    
    // Kamera ve analiz elementleri
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const captureBtn = document.getElementById('capture-btn');
    const analyzeBtn = document.getElementById('analyze-btn');
    const resultsDiv = document.getElementById('results');
    const loadingDiv = document.getElementById('loading');
    const downloadReportBtn = document.getElementById('download-report');
    
    // Kullanıcı arayüzü elementleri
    const authButtons = document.getElementById('auth-buttons');
    const userMenu = document.getElementById('user-menu');
    const userEmail = document.getElementById('user-email');
    const logoutBtn = document.getElementById('logout-btn');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    // Profil form elementleri
    const profileForm = document.getElementById('profile-form');
    const profileName = document.getElementById('profile-name');
    const profileAge = document.getElementById('profile-age');
    const profileSkinType = document.getElementById('profile-skin-type');
    
    // Ürün form elementleri
    const addProductForm = document.getElementById('add-product-form');
    const productsBody = document.getElementById('products-body');
    
    // Analiz geçmişi
    const historyBody = document.getElementById('history-body');
    
    // Cilt Bakım Rutini
    const routineForm = document.getElementById('routine-form');
    const morningRoutine = document.getElementById('morning-routine');
    const eveningRoutine = document.getElementById('evening-routine');
    
    let stream = null;
    let currentUser = null;
    let currentAnalysis = null;

    // API URL'si
    const API_URL = 'http://localhost:5000/api';

    // Sayfa yönlendirme
    function showPage(page) {
        homePage.classList.add('d-none');
        profilePage.classList.add('d-none');
        productsPage.classList.add('d-none');
        page.classList.remove('d-none');
    }

    homeLink.addEventListener('click', (e) => {
        e.preventDefault();
        showPage(homePage);
    });

    profileLink.addEventListener('click', (e) => {
        e.preventDefault();
        showPage(profilePage);
        loadProfile();
    });

    productsLink.addEventListener('click', (e) => {
        e.preventDefault();
        showPage(productsPage);
        loadProducts();
    });

    // Kullanıcı durumunu kontrol et
    function checkAuth() {
        const token = localStorage.getItem('token');
        if (token) {
            authButtons.classList.add('d-none');
            userMenu.classList.remove('d-none');
            userEmail.textContent = localStorage.getItem('email');
            loadProfile();
            loadHistory();
            loadProducts();
        } else {
            authButtons.classList.remove('d-none');
            userMenu.classList.add('d-none');
            showPage(homePage);
        }
    }

    // Profil yükleme
    async function loadProfile() {
        try {
            const response = await fetch(`${API_URL}/profile`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const profile = await response.json();
                profileName.value = profile.name || '';
                profileAge.value = profile.age || '';
                profileSkinType.value = profile.skin_type || 'kuru';
            }
        } catch (err) {
            console.error('Profil yükleme hatası:', err);
        }
    }

    // Profil güncelleme
    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_URL}/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    name: profileName.value,
                    age: profileAge.value,
                    skin_type: profileSkinType.value
                })
            });

            if (response.ok) {
                alert('Profil güncellendi');
            } else {
                throw new Error('Profil güncellenemedi');
            }
        } catch (err) {
            console.error('Profil güncelleme hatası:', err);
            alert('Profil güncellenirken bir hata oluştu');
        }
    });

    // Ürün yükleme
    async function loadProducts() {
        try {
            const response = await fetch(`${API_URL}/products`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const products = await response.json();
                productsBody.innerHTML = products.map(product => `
                    <tr>
                        <td>${product.name}</td>
                        <td>${product.category}</td>
                        <td>${product.brand}</td>
                        <td>${product.rating}</td>
                        <td>${product.review || '-'}</td>
                        <td>${new Date(product.added_date).toLocaleDateString()}</td>
                        <td>
                            <button class="btn btn-sm btn-danger" onclick="deleteProduct(${product.id})">
                                Sil
                            </button>
                        </td>
                    </tr>
                `).join('');
            }
        } catch (err) {
            console.error('Ürün yükleme hatası:', err);
        }
    }

    // Ürün ekleme
    addProductForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_URL}/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    name: document.getElementById('product-name').value,
                    category: document.getElementById('product-category').value,
                    brand: document.getElementById('product-brand').value,
                    rating: document.getElementById('product-rating').value,
                    review: document.getElementById('product-review').value
                })
            });

            if (response.ok) {
                bootstrap.Modal.getInstance(document.getElementById('addProductModal')).hide();
                loadProducts();
                addProductForm.reset();
            } else {
                throw new Error('Ürün eklenemedi');
            }
        } catch (err) {
            console.error('Ürün ekleme hatası:', err);
            alert('Ürün eklenirken bir hata oluştu');
        }
    });

    // Ürün silme
    window.deleteProduct = async function(id) {
        if (confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
            try {
                const response = await fetch(`${API_URL}/products/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (response.ok) {
                    loadProducts();
                } else {
                    throw new Error('Ürün silinemedi');
                }
            } catch (err) {
                console.error('Ürün silme hatası:', err);
                alert('Ürün silinirken bir hata oluştu');
            }
        }
    };

    // Rapor indirme
    downloadReportBtn.addEventListener('click', async () => {
        if (!currentAnalysis) return;
        
        try {
            const response = await fetch(`${API_URL}/report/${currentAnalysis.id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `skin_analysis_report_${currentAnalysis.id}.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                a.remove();
            } else {
                throw new Error('Rapor indirilemedi');
            }
        } catch (err) {
            console.error('Rapor indirme hatası:', err);
            alert('Rapor indirilirken bir hata oluştu');
        }
    });

    // Analiz detaylarını göster
    window.showAnalysisDetails = function(id) {
        // Analiz detaylarını göster
        const analysis = history.find(a => a.id === id);
        if (analysis) {
            currentAnalysis = analysis;
            displayResults(analysis);
            showPage(homePage);
        }
    };

    // Giriş işlemi
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                localStorage.setItem('token', 'dummy-token'); // Gerçek uygulamada JWT token kullanılacak
                localStorage.setItem('email', email);
                currentUser = { email };
                checkAuth();
                bootstrap.Modal.getInstance(document.getElementById('loginModal')).hide();
            } else {
                alert('Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
            }
        } catch (err) {
            console.error('Giriş hatası:', err);
            alert('Bir hata oluştu. Lütfen tekrar deneyin.');
        }
    });

    // Misafir girişi
    document.getElementById('guest-login-btn').addEventListener('click', () => {
        currentUser = {
            isGuest: true,
            name: 'Misafir Kullanıcı',
            skin_type: 'karma'
        };
        authButtons.classList.add('d-none');
        userMenu.classList.remove('d-none');
        userEmail.textContent = 'Misafir Kullanıcı';
        showPage(homePage);
    });

    // Kayıt işlemi
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const passwordConfirm = document.getElementById('register-password-confirm').value;
        const skinType = document.getElementById('register-skin-type').value;

        if (password !== passwordConfirm) {
            alert('Şifreler eşleşmiyor!');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    name, 
                    email, 
                    password,
                    skin_type: skinType
                })
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('token', data.token);
                localStorage.setItem('email', email);
                currentUser = { email, name, skin_type: skinType };
                checkAuth();
                bootstrap.Modal.getInstance(document.getElementById('registerModal')).hide();
                alert('Kayıt başarılı! Hoş geldiniz.');
            } else {
                const data = await response.json();
                alert(data.error || 'Kayıt başarısız. Lütfen tekrar deneyin.');
            }
        } catch (err) {
            console.error('Kayıt hatası:', err);
            alert('Bir hata oluştu. Lütfen tekrar deneyin.');
        }
    });

    // Çıkış işlemi
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('email');
        currentUser = null;
        checkAuth();
    });

    // Analiz geçmişini yükle
    async function loadHistory() {
        try {
            const response = await fetch(`${API_URL}/history`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const history = await response.json();
                historyBody.innerHTML = history.map(item => `
                    <tr>
                        <td>${new Date(item.timestamp).toLocaleString()}</td>
                        <td>${item.microbiome_profile.diversity}%</td>
                        <td>${item.acne_tendency}%</td>
                        <td>${item.sensitivity}%</td>
                        <td>
                            <button class="btn btn-sm btn-info" onclick="showAnalysisDetails(${item.id})">
                                Detaylar
                            </button>
                        </td>
                    </tr>
                `).join('');
            }
        } catch (err) {
            console.error('Geçmiş yükleme hatası:', err);
        }
    }

    // Kamera erişimi
    async function initCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: "user"
                } 
            });
            video.srcObject = stream;
            video.play();
        } catch (err) {
            console.error('Kamera erişimi hatası:', err);
            alert('Kamera erişimi sağlanamadı. Lütfen kamera izinlerini kontrol edin.');
        }
    }

    // Fotoğraf çekme
    captureBtn.addEventListener('click', () => {
        if (!video.srcObject) {
            alert('Kamera başlatılamadı. Lütfen sayfayı yenileyin.');
            return;
        }

        const context = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Fotoğrafı görüntüle
        const imageData = canvas.toDataURL('image/jpeg');
        const img = document.createElement('img');
        img.src = imageData;
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        
        // Eski fotoğrafı temizle
        const cameraContainer = document.getElementById('camera-container');
        const oldImg = cameraContainer.querySelector('img');
        if (oldImg) {
            oldImg.remove();
        }
        
        // Yeni fotoğrafı ekle
        cameraContainer.appendChild(img);
        
        // Analiz butonunu aktif et
        analyzeBtn.disabled = false;
        
        // Video akışını durdur
        video.pause();
    });

    // Analiz işlemi
    analyzeBtn.addEventListener('click', async () => {
        if (!canvas.width || !canvas.height) {
            alert('Lütfen önce fotoğraf çekin.');
            return;
        }

        loadingDiv.classList.remove('d-none');
        resultsDiv.classList.add('d-none');
        
        try {
            const imageData = canvas.toDataURL('image/jpeg');
            const response = await fetch(`${API_URL}/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ image: imageData })
            });

            if (response.ok) {
                const results = await response.json();
                displayResults(results);
                loadHistory();
            } else {
                throw new Error('Analiz başarısız');
            }
        } catch (err) {
            console.error('Analiz hatası:', err);
            alert('Analiz sırasında bir hata oluştu.');
        } finally {
            loadingDiv.classList.add('d-none');
        }
    });

    // Sonuçları görüntüleme
    function displayResults(results) {
        resultsDiv.classList.remove('d-none');

        // Mikrobiyom profili
        const microbiomeProfile = document.getElementById('microbiome-profile');
        microbiomeProfile.innerHTML = `
            <div class="progress mb-2">
                <div class="progress-bar" role="progressbar" style="width: ${results.microbiome.diversity}%">
                    ${results.microbiome.diversity}% Çeşitlilik
                </div>
            </div>
            <p><strong>Baskın Bakteriler:</strong> ${results.microbiome.dominantBacteria.join(', ')}</p>
        `;

        // Akne eğilimi
        const acneTendency = document.getElementById('acne-tendency');
        acneTendency.innerHTML = `
            <div class="progress">
                <div class="progress-bar" role="progressbar" style="width: ${results.acneTendency}%">
                    ${results.acneTendency}% Akne Eğilimi
                </div>
            </div>
        `;

        // Hassasiyet seviyesi
        const sensitivityLevel = document.getElementById('sensitivity-level');
        sensitivityLevel.innerHTML = `
            <div class="progress">
                <div class="progress-bar" role="progressbar" style="width: ${results.sensitivity}%">
                    ${results.sensitivity}% Hassasiyet
                </div>
            </div>
        `;

        // Öneriler
        const recommendations = document.getElementById('recommendations');
        recommendations.innerHTML = results.recommendations
            .map(rec => `<div class="recommendation-item">${rec}</div>`)
            .join('');
    }

    // Rutin ekleme
    routineForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const type = document.getElementById('routine-type').value;
        const step = document.getElementById('routine-step').value;
        const product = document.getElementById('routine-product').value;

        try {
            const response = await fetch(`${API_URL}/routines`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ type, step, product })
            });

            if (response.ok) {
                loadRoutines();
                bootstrap.Modal.getInstance(document.getElementById('routineModal')).hide();
                routineForm.reset();
            }
        } catch (err) {
            console.error('Rutin ekleme hatası:', err);
        }
    });

    async function loadRoutines() {
        try {
            const response = await fetch(`${API_URL}/routines`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const routines = await response.json();
                morningRoutine.innerHTML = routines.morning.map(routine => `
                    <li class="list-group-item">
                        ${routine.step} ${routine.product ? `- ${routine.product}` : ''}
                    </li>
                `).join('');
                eveningRoutine.innerHTML = routines.evening.map(routine => `
                    <li class="list-group-item">
                        ${routine.step} ${routine.product ? `- ${routine.product}` : ''}
                    </li>
                `).join('');
            }
        } catch (err) {
            console.error('Rutin yükleme hatası:', err);
        }
    }

    // Beslenme Önerileri
    async function loadNutritionRecommendations() {
        try {
            const response = await fetch(`${API_URL}/nutrition`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                document.getElementById('recommended-foods').innerHTML = data.recommended.map(food => `
                    <li class="list-group-item">${food}</li>
                `).join('');
                document.getElementById('avoid-foods').innerHTML = data.avoid.map(food => `
                    <li class="list-group-item">${food}</li>
                `).join('');
            }
        } catch (err) {
            console.error('Beslenme önerileri yükleme hatası:', err);
        }
    }

    // Yaşam Tarzı Önerileri
    async function loadLifestyleRecommendations() {
        try {
            const response = await fetch(`${API_URL}/lifestyle`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                document.getElementById('sleep-recommendations').innerHTML = data.sleep;
                document.getElementById('stress-management').innerHTML = data.stress;
                document.getElementById('exercise-recommendations').innerHTML = data.exercise;
            }
        } catch (err) {
            console.error('Yaşam tarzı önerileri yükleme hatası:', err);
        }
    }

    // Cilt Problemleri
    const problemsForm = document.getElementById('problems-form');
    const currentProblems = document.getElementById('current-problems');
    const problemSolutions = document.getElementById('problem-solutions');

    problemsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('problem-name').value;
        const severity = document.getElementById('problem-severity').value;
        const notes = document.getElementById('problem-notes').value;

        try {
            const response = await fetch(`${API_URL}/problems`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ name, severity, notes })
            });

            if (response.ok) {
                loadProblems();
                bootstrap.Modal.getInstance(document.getElementById('problemsModal')).hide();
                problemsForm.reset();
            }
        } catch (err) {
            console.error('Problem ekleme hatası:', err);
        }
    });

    async function loadProblems() {
        try {
            const response = await fetch(`${API_URL}/problems`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                currentProblems.innerHTML = data.problems.map(problem => `
                    <li class="list-group-item">
                        ${problem.name} (Şiddet: ${problem.severity}/10)
                        ${problem.notes ? `<br><small>${problem.notes}</small>` : ''}
                    </li>
                `).join('');
                problemSolutions.innerHTML = data.solutions.map(solution => `
                    <li class="list-group-item">${solution}</li>
                `).join('');
            }
        } catch (err) {
            console.error('Problem yükleme hatası:', err);
        }
    }

    // İlerleme Takibi
    const goalsForm = document.getElementById('goals-form');
    const goalsList = document.getElementById('goals');
    let progressChart = null;

    goalsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('goal-name').value;
        const deadline = document.getElementById('goal-deadline').value;
        const priority = document.getElementById('goal-priority').value;

        try {
            const response = await fetch(`${API_URL}/goals`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ name, deadline, priority })
            });

            if (response.ok) {
                loadGoals();
                bootstrap.Modal.getInstance(document.getElementById('goalsModal')).hide();
                goalsForm.reset();
            }
        } catch (err) {
            console.error('Hedef ekleme hatası:', err);
        }
    });

    async function loadGoals() {
        try {
            const response = await fetch(`${API_URL}/goals`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                goalsList.innerHTML = data.goals.map(goal => `
                    <li class="list-group-item">
                        ${goal.name}
                        <br>
                        <small>Bitiş: ${new Date(goal.deadline).toLocaleDateString()}</small>
                        <span class="badge bg-${getPriorityColor(goal.priority)} float-end">
                            ${goal.priority}
                        </span>
                    </li>
                `).join('');

                // İlerleme grafiğini güncelle
                updateProgressChart(data.progress);
            }
        } catch (err) {
            console.error('Hedef yükleme hatası:', err);
        }
    }

    function getPriorityColor(priority) {
        switch (priority) {
            case 'low': return 'success';
            case 'medium': return 'warning';
            case 'high': return 'danger';
            default: return 'secondary';
        }
    }

    function updateProgressChart(progressData) {
        const ctx = document.getElementById('progress-chart').getContext('2d');
        
        if (progressChart) {
            progressChart.destroy();
        }

        progressChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: progressData.map(item => new Date(item.date).toLocaleDateString()),
                datasets: [{
                    label: 'İlerleme',
                    data: progressData.map(item => item.value),
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }

    // Uygulama başlatma
    initCamera();
    checkAuth();
    loadRoutines();
    loadNutritionRecommendations();
    loadLifestyleRecommendations();
    loadProblems();
    loadGoals();
}); 