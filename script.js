// JS "safe" : s'exécute sur toutes les pages sans casser si certains éléments n'existent pas.
document.addEventListener('DOMContentLoaded', () => {
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

    const $ = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

    // 1) Formulaire de contact
    const contactForm = $('#contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Message envoyé avec succès !');
            contactForm.reset();
        });
    }

    // 2) Scroll smooth sur ancres internes (uniquement si la cible existe)
    $$( 'a[href^="#"]' ).forEach((anchor) => {
        anchor.addEventListener('click', (e) => {
            const href = anchor.getAttribute('href');
            const hash = href?.trim();
            if (!hash || hash === '#') return;

            const target = document.querySelector(hash);
            if (!target) return;

            e.preventDefault();
            target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        });
    });

    // 3) Animation des cartes de projet au scroll
    const projectCards = $$('.project-card');
    if (projectCards.length) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }
                });
            },
            { threshold: 0.1 }
        );

        projectCards.forEach((card) => {
            card.style.opacity = prefersReducedMotion ? '1' : '0';
            card.style.transform = prefersReducedMotion ? 'none' : 'translateY(20px)';
            card.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
            if (!prefersReducedMotion) observer.observe(card);
        });
    }

    // 4) Gestion de la photo de profil (upload local)
    const profileImage = $('#profile-img');
    const imageOverlay = $('.image-overlay');
    if (profileImage && imageOverlay) {
        imageOverlay.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';

            input.addEventListener('change', (e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                const reader = new FileReader();
                reader.addEventListener('load', () => {
                    profileImage.src = String(reader.result || '');
                    // Optionnel : envoyer l'image au serveur si tu as un backend.
                });
                reader.readAsDataURL(file);
            });

            input.click();
        });
    }

    // 5) Filtrage des articles du blog
    const filterButtons = $$('.filter-btn');
    const blogCards = $$('.blog-card');
    if (filterButtons.length && blogCards.length) {
        filterButtons.forEach((button) => {
            button.addEventListener('click', () => {
                filterButtons.forEach((btn) => btn.classList.remove('active'));
                button.classList.add('active');

                const filterValue = button.getAttribute('data-filter');

                blogCards.forEach((card) => {
                    const cardCategory = card.getAttribute('data-category');
                    const shouldShow = filterValue === 'all' || cardCategory === filterValue;
                    card.style.display = shouldShow ? 'block' : 'none';
                });
            });
        });
    }

    // 6) Animation des statistiques
    const stats = $$('.stat-number');
    if (stats.length) {
        const observerStats = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;

                    const target = entry.target;
                    const value = parseInt(target.textContent || '0', 10);
                    if (Number.isNaN(value)) return;

                    animateValue(target, 0, value, 2000, '+');
                    observerStats.unobserve(target);
                });
            },
            { threshold: 0.5 }
        );

        stats.forEach((stat) => observerStats.observe(stat));
    }

    // 7) Theme geek clair: effet typing discret sur titres
    if (!prefersReducedMotion) {
        const geekTitles = $$('h1, .logo');
        geekTitles.forEach((titleEl) => {
            if (titleEl.dataset.typed === '1') return;
            const finalText = (titleEl.textContent || '').trim();
            if (!finalText || finalText.length > 36) return;

            const chars = '01{}[]<>/\\';
            let frame = 0;
            const total = finalText.length * 2;
            titleEl.dataset.typed = '1';

            const timer = setInterval(() => {
                const reveal = Math.floor(frame / 2);
                let output = '';

                for (let i = 0; i < finalText.length; i++) {
                    if (i < reveal || finalText[i] === ' ') {
                        output += finalText[i];
                    } else {
                        output += chars[Math.floor(Math.random() * chars.length)];
                    }
                }

                titleEl.textContent = output;
                frame += 1;

                if (frame > total) {
                    clearInterval(timer);
                    titleEl.textContent = finalText;
                }
            }, 55);
        });
    }

    // 8) Badge "GEEK MODE" dans le coin
    const geekBadge = document.createElement('div');
    geekBadge.textContent = 'GEEK MODE';
    Object.assign(geekBadge.style, {
        position: 'fixed',
        right: '14px',
        bottom: '14px',
        padding: '7px 11px',
        borderRadius: '8px',
        fontFamily: 'Consolas, Courier New, monospace',
        fontSize: '11px',
        letterSpacing: '0.8px',
        color: '#0f4ea8',
        background: 'rgba(255, 255, 255, 0.88)',
        border: '1px solid rgba(47, 137, 255, 0.38)',
        boxShadow: '0 6px 18px rgba(47, 137, 255, 0.18)',
        zIndex: '15',
        pointerEvents: 'none'
    });
    document.body.appendChild(geekBadge);
});

function animateValue(obj, start, end, duration, suffix = '') {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.textContent = String(Math.floor(progress * (end - start) + start)) + suffix;
        if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
}