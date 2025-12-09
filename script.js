// 1. MAGIC CURSOR
const cursorDot = document.querySelector('[data-cursor-dot]');
const cursorOutline = document.querySelector('[data-cursor-outline]');
const hoverTargets = document.querySelectorAll('.hover-target'); // Елементи, на які реагує курсор

window.addEventListener('mousemove', (e) => {
    const posX = e.clientX;
    const posY = e.clientY;

    // Маленька точка рухається миттєво
    cursorDot.style.left = `${posX}px`;
    cursorDot.style.top = `${posY}px`;

    // Велике коло рухається з затримкою
    cursorOutline.animate({
        left: `${posX}px`,
        top: `${posY}px`
    }, { duration: 500, fill: "forwards" });
});

// Ефект збільшення при наведенні
hoverTargets.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
});


// 2. COUNTER ANIMATION (Лічильник статистики)
const counters = document.querySelectorAll('.counter');
const speed = 200; // Чим менше, тим швидше

const animateCounters = () => {
    counters.forEach(counter => {
        const updateCount = () => {
            const target = +counter.getAttribute('data-target'); // Отримуємо цільове число
            const count = +counter.innerText;
            const inc = target / speed;

            if (count < target) {
                counter.innerText = Math.ceil(count + inc);
                setTimeout(updateCount, 20); // Швидкість оновлення
            } else {
                counter.innerText = target + "+";
            }
        };
        updateCount();
    });
};

// лічильник тільки коли доскролили до секції
let counted = false;
window.addEventListener('scroll', () => {
    const statsSection = document.getElementById('stats');
    if(statsSection) {
        const sectionTop = statsSection.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        if (sectionTop < windowHeight && !counted) {
            animateCounters();
            counted = true;
        }
    }
});

window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    preloader.style.opacity = '0';
    setTimeout(() => { preloader.style.display = 'none'; }, 500);
});

// Canvas Background (Particles)
const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");
let particlesArray;
canvas.width = window.innerWidth; canvas.height = window.innerHeight;
class Particle {
    constructor(x, y, directionX, directionY, size, color) {
        this.x = x; this.y = y; this.directionX = directionX; this.directionY = directionY; this.size = size; this.color = color;
    }
    draw() { ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false); ctx.fillStyle = this.color; ctx.fill(); }
    update() {
        if (this.x > canvas.width || this.x < 0) this.directionX = -this.directionX;
        if (this.y > canvas.height || this.y < 0) this.directionY = -this.directionY;
        this.x += this.directionX; this.y += this.directionY; this.draw();
    }
}
function init() {
    particlesArray = [];
    let numberOfParticles = (canvas.height * canvas.width) / 15000;
    for (let i = 0; i < numberOfParticles; i++) {
        let size = (Math.random() * 3) + 1;
        let x = (Math.random() * ((innerWidth - size * 2) - (size * 2)) + size * 2);
        let y = (Math.random() * ((innerHeight - size * 2) - (size * 2)) + size * 2);
        let directionX = (Math.random() * 1) - 0.5; let directionY = (Math.random() * 1) - 0.5;
        particlesArray.push(new Particle(x, y, directionX, directionY, size, '#3498db'));
    }
}
function connect() {
    for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
            let distance = ((particlesArray[a].x - particlesArray[b].x) * (particlesArray[a].x - particlesArray[b].x)) + 
                           ((particlesArray[a].y - particlesArray[b].y) * (particlesArray[a].y - particlesArray[b].y));
            if (distance < (canvas.width/7) * (canvas.height/7)) {
                let opacity = 1 - (distance/20000);
                ctx.strokeStyle = 'rgba(52, 152, 219,' + opacity + ')';
                ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(particlesArray[a].x, particlesArray[a].y); ctx.lineTo(particlesArray[b].x, particlesArray[b].y); ctx.stroke();
            }
        }
    }
}
function animate() { requestAnimationFrame(animate); ctx.clearRect(0, 0, innerWidth, innerHeight); for (let i = 0; i < particlesArray.length; i++) { particlesArray[i].update(); } connect(); }
init(); animate();
window.addEventListener('resize', () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; init(); });

// Filters & Other Logic
const filterBtns = document.querySelectorAll('.filter-btn');
const projectItems = document.querySelectorAll('.portfolio-item');
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active')); btn.classList.add('active');
        const val = btn.getAttribute('data-filter');
        projectItems.forEach(item => {
            if (val === 'all' || item.getAttribute('data-category') === val) { item.classList.remove('hide'); item.classList.add('show'); }
            else { item.classList.remove('show'); item.classList.add('hide'); }
        });
    });
});
const texts = ["Digital Solutions", "Python Logic", "Database Systems"];
let count = 0; let index = 0; let currentText = ""; let letter = "";
(function type() {
    if (count === texts.length) count = 0;
    currentText = texts[count]; letter = currentText.slice(0, ++index);
    const el = document.getElementById('typewriter'); if(el) el.textContent = letter;
    if (letter.length === currentText.length) { count++; index = 0; setTimeout(type, 2000); } else { setTimeout(type, 100); }
})();
const cards = document.querySelectorAll('.tilt-card');
cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left; const y = e.clientY - rect.top;
        card.style.transform = `perspective(1000px) rotateX(${((y - rect.height/2) / (rect.height/2)) * -10}deg) rotateY(${((x - rect.width/2) / (rect.width/2)) * 10}deg) scale(1.05)`;
    });
    card.addEventListener('mouseleave', () => card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)');
});
const backToTopBtn = document.getElementById('back-to-top');
window.addEventListener('scroll', () => {
    document.querySelectorAll('.reveal').forEach(r => { if(r.getBoundingClientRect().top < window.innerHeight - 100) r.classList.add('active'); });
    if (window.scrollY > 500) backToTopBtn.classList.add('show'); else backToTopBtn.classList.remove('show');
});
function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }
function toggleMenu() { document.getElementById('nav-list').classList.toggle('active'); }
function toggleTheme() { document.body.classList.toggle('dark-theme'); const i = document.querySelector('#theme-toggle i'); i.className = document.body.classList.contains('dark-theme') ? 'fas fa-sun' : 'fas fa-moon'; }
function openModal(id) { document.getElementById(id).classList.add('open'); document.body.style.overflow = 'hidden'; }
function closeModal(id) { document.getElementById(id).classList.remove('open'); document.body.style.overflow = 'auto'; }
const ys = document.getElementById('year'); if(ys) ys.textContent = new Date().getFullYear();