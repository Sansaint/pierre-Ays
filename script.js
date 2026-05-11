// JS commun: chaque comportement verifie ses elements avant de s'executer.
document.addEventListener('DOMContentLoaded', () => {
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

    const $ = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

    const menuToggle = $('.menu-toggle');
    const navLinks = $('.nav-links');

    if (menuToggle && navLinks) {
        if (!navLinks.id) navLinks.id = 'navigation-principale';
        menuToggle.setAttribute('aria-controls', navLinks.id);
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'Ouvrir le menu');

        if (menuToggle.tagName !== 'BUTTON') {
            menuToggle.setAttribute('role', 'button');
            menuToggle.setAttribute('tabindex', '0');
        }

        const closeMenu = () => {
            navLinks.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
            menuToggle.setAttribute('aria-label', 'Ouvrir le menu');
        };

        const toggleMenu = () => {
            const isOpen = navLinks.classList.toggle('active');
            menuToggle.setAttribute('aria-expanded', String(isOpen));
            menuToggle.setAttribute('aria-label', isOpen ? 'Fermer le menu' : 'Ouvrir le menu');
        };

        menuToggle.addEventListener('click', toggleMenu);
        menuToggle.addEventListener('keydown', (e) => {
            if (e.key !== 'Enter' && e.key !== ' ') return;
            e.preventDefault();
            toggleMenu();
        });

        $$('.nav-links a').forEach((link) => {
            link.addEventListener('click', closeMenu);
        });

        document.addEventListener('click', (e) => {
            if (!navLinks.classList.contains('active')) return;
            if (navLinks.contains(e.target) || menuToggle.contains(e.target)) return;
            closeMenu();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeMenu();
        });

        window.addEventListener('resize', () => {
            if (window.matchMedia('(min-width: 1051px)').matches) closeMenu();
        });
    }

    const contactForm = $('#contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Message envoye avec succes !');
            contactForm.reset();
        });
    }

    $$('a[href^="#"]').forEach((anchor) => {
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

    $$('.no-doc').forEach((link) => {
        const originalText = link.textContent.trim();

        link.addEventListener('click', (e) => {
            e.preventDefault();
            link.textContent = 'Document indisponible';
            link.setAttribute('aria-disabled', 'true');

            window.setTimeout(() => {
                link.textContent = originalText || 'Document a venir';
                link.removeAttribute('aria-disabled');
            }, 1800);
        });
    });

    const applyImageFallback = (img) => {
        if (img.dataset.fallbackApplied === '1') return;
        img.dataset.fallbackApplied = '1';

        const fallback = document.createElement('div');
        fallback.className = 'image-fallback';
        fallback.textContent = img.alt ? `Apercu indisponible : ${img.alt}` : 'Apercu indisponible';
        img.replaceWith(fallback);
    };

    $$('img').forEach((img) => {
        img.addEventListener('error', () => applyImageFallback(img), { once: true });
        if (img.complete && img.naturalWidth === 0) applyImageFallback(img);
    });

    const animatedItems = $$(
        '.project-card, .bts-projet-card, .competence-category, .cv-block, .veille-theme-card, .veille-outil-card, .veille-article-card, .document-card, .feature-card'
    );

    if (animatedItems.length) {
        if (prefersReducedMotion || !('IntersectionObserver' in window)) {
            animatedItems.forEach((item) => {
                item.style.opacity = '1';
                item.style.transform = 'none';
            });
        } else {
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (!entry.isIntersecting) return;
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                        observer.unobserve(entry.target);
                    });
                },
                { threshold: 0.12 }
            );

            animatedItems.forEach((item) => {
                item.style.opacity = '0';
                item.style.transform = 'translateY(18px)';
                item.style.transition = 'opacity 0.45s ease, transform 0.45s ease';
                observer.observe(item);
            });
        }
    }

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
                });
                reader.readAsDataURL(file);
            });

            input.click();
        });
    }

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
