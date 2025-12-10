// 1. PRELOADER
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if(preloader) {
        preloader.style.opacity = '0';
        setTimeout(() => { preloader.style.display = 'none'; }, 500);
    }
    loadProjects(); // Завантажуємо проєкти
});

// --- ГОЛОВНА ФУНКЦІЯ: ЗАВАНТАЖЕННЯ ---
async function loadProjects() {
    try {
        const response = await fetch('/api/projects');
        const projects = await response.json();

        const grid = document.querySelector('.portfolio-grid');
        
        // Збираємо HTML у змінну (так надійніше, ніж додавати по черзі)
        let cardsHTML = '';
        
        projects.forEach(proj => {
            // Формуємо картку
            cardsHTML += `
                <div class="portfolio-item tilt-card show" data-category="${proj.category}" onclick="openModal('modal${proj.id}')">
                    <div class="portfolio-img ${proj.image_class}"><i class="${proj.image_icon}"></i></div>
                    <div class="portfolio-info">
                        <h3>${proj.title}</h3>
                        <div class="tags"><span>${proj.category.toUpperCase()}</span></div>
                    </div>
                </div>
            `;

            // Модальні вікна додаємо окремо в body
            // Перевіряємо, чи такого вікна ще немає, щоб не дублювати
            if (!document.getElementById(`modal${proj.id}`)) {
                const modalHTML = `
                    <div id="modal${proj.id}" class="modal" onclick="closeModal('modal${proj.id}')">
                        <div class="modal-content" onclick="event.stopPropagation()">
                            <span class="close-modal" onclick="closeModal('modal${proj.id}')">&times;</span>
                            <h2>${proj.title}</h2>
                            <p class="modal-text">${proj.modal_text}</p>
                        </div>
                    </div>
                `;
                document.body.insertAdjacentHTML('beforeend', modalHTML);
            }
        });

        // Вставляємо всі картки разом
        grid.innerHTML = cardsHTML;

        // Вмикаємо ефекти
        initTiltEffect(); 

    } catch (error) {
        console.error('Помилка:', error);
    }
}

// 2. ЛОГІКА ФІЛЬТРІВ (Виправлена)
const filterBtns = document.querySelectorAll('.filter-btn');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Активна кнопка
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const val = btn.getAttribute('data-filter');
        // Шукаємо елементи заново, бо вони були створені динамічно
        const items = document.querySelectorAll('.portfolio-item'); 

        items.forEach(item => {
            if (val === 'all' || item.getAttribute('data-category') === val) {
                item.classList.remove('hide');
                item.classList.add('show');
            } else {
                item.classList.remove('show');
                item.classList.add('hide');
            }
        });
    });
});

// 3. 3D ЕФЕКТ
function initTiltEffect() {
    const cards = document.querySelectorAll('.tilt-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const rotateX = ((y - rect.height/2) / (rect.height/2)) * -10;
            const rotateY = ((x - rect.width/2) / (rect.width/2)) * 10;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        });
    });
}

// 4. CANVAS BACKGROUND (Спрощений і стабільний)
const canvas = document.getElementById("particles");
if (canvas) {
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let particlesArray = [];

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 3 + 1;
            this.speedX = Math.random() * 1 - 0.5;
            this.speedY = Math.random() * 1 - 0.5;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
            if (this.y > canvas.height || this.y < 0) this.speedY *= -1;
        }
        draw() {
            ctx.fillStyle = '#3498db';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function init() {
        particlesArray = [];
        for (let i = 0; i < 50; i++) particlesArray.push(new Particle());
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
            particlesArray[i].draw();
            for (let j = i; j < particlesArray.length; j++) {
                const dx = particlesArray[i].x - particlesArray[j].x;
                const dy = particlesArray[i].y - particlesArray[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 100) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(52, 152, 219, ${1 - distance/100})`;
                    ctx.lineWidth = 1;
                    ctx.moveTo(particlesArray[i].x, particlesArray[i].y);
                    ctx.lineTo(particlesArray[j].x, particlesArray[j].y);
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animate);
    }
    init();
    animate();
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// 5. ДОДАТКОВІ ФУНКЦІЇ (Меню, Тема, Курсор, Статистика)
function toggleMenu() { document.getElementById('nav-list').classList.toggle('active'); }
function toggleTheme() { document.body.classList.toggle('dark-theme'); }
function openModal(id) { 
    const m = document.getElementById(id); 
    if(m) { m.classList.add('open'); document.body.style.overflow = 'hidden'; }
}
function closeModal(id) { 
    const m = document.getElementById(id); 
    if(m) { m.classList.remove('open'); document.body.style.overflow = 'auto'; }
}

// Cursor
const cursorDot = document.querySelector('[data-cursor-dot]');
const cursorOutline = document.querySelector('[data-cursor-outline]');
if(cursorDot) {
    window.addEventListener('mousemove', (e) => {
        cursorDot.style.left = `${e.clientX}px`; cursorDot.style.top = `${e.clientY}px`;
        cursorOutline.animate({ left: `${e.clientX}px`, top: `${e.clientY}px` }, { duration: 500, fill: "forwards" });
    });
}

// Typewriter
const texts = ["Code", "Create", "Deploy"];
let count=0, index=0, currentText="", letter="";
(function type(){
    if(count===texts.length)count=0;
    currentText=texts[count]; letter=currentText.slice(0,++index);
    const el=document.getElementById('typewriter'); if(el)el.textContent=letter;
    if(letter.length===currentText.length){count++;index=0;setTimeout(type,2000);}else{setTimeout(type,100);}
})();

// Stats
const statsSec = document.getElementById('stats');
let counted = false;
window.addEventListener('scroll', ()=>{
    if(statsSec && !counted && statsSec.getBoundingClientRect().top < window.innerHeight){
        document.querySelectorAll('.counter').forEach(c=>{
            const target=+c.getAttribute('data-target');
            let count=0;
            const update=()=>{ if(count<target){count+=Math.ceil(target/100);c.innerText=count;setTimeout(update,20);}else{c.innerText=target+"+";} };
            update();
        });
        counted=true;
    }
    // Reveal
    document.querySelectorAll('.reveal').forEach(r=>{
        if(r.getBoundingClientRect().top < window.innerHeight-100) r.classList.add('active');
    });
});