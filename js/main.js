/* ========================================
   LOGIQUE DU SITE - LE TEMPLE DES STAFFIES
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.querySelector('.navbar');
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const body = document.body;
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;

    const setMenuOpen = (open) => {
        if (!navMenu || !navToggle) return;
        navMenu.classList.toggle('active', open);
        navToggle.setAttribute('aria-expanded', String(open));
        body.classList.toggle('nav-open', open);

        // Animation des barres du menu burger (simple + fiable)
        const spans = navToggle.querySelectorAll('span');
        if (spans.length >= 3) {
            spans[0].style.transform = open ? 'rotate(45deg) translate(5px, 5px)' : '';
            spans[1].style.opacity = open ? '0' : '1';
            spans[2].style.transform = open ? 'rotate(-45deg) translate(7px, -7px)' : '';
        }
    };

    // 1. Changement de style de la barre de navigation au scroll
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // 2. Menu Mobile (Toggle)
    if (navToggle && navMenu) {
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.addEventListener('click', () => {
            const open = !navMenu.classList.contains('active');
            setMenuOpen(open);
        });
    }

    // 3. Fermer le menu mobile quand on clique sur un lien
    if (navLinks?.length && navMenu) {
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                setMenuOpen(false);
            });
        });
    }

    // 4. Fermer au clavier
    window.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        if (navMenu?.classList.contains('active')) setMenuOpen(false);
        if (document.querySelector('.lightbox.is-open')) closeLightbox();
    });

    // 5. Animations "reveal" (IntersectionObserver)
    const revealEls = Array.from(document.querySelectorAll('.reveal'));
    if (!prefersReducedMotion && revealEls.length && 'IntersectionObserver' in window) {
        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        io.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12, rootMargin: '0px 0px -10% 0px' }
        );
        revealEls.forEach((el) => io.observe(el));
    } else {
        revealEls.forEach((el) => el.classList.add('is-visible'));
    }

    // 6. Galerie: Lightbox simple (toutes pages)
    let lightboxState = { images: [], index: 0 };
    const galleryImgs = Array.from(document.querySelectorAll('.gallery-grid img, .galerie-grid img, .gallery-masonry img'));
    galleryImgs.forEach((img, idx) => {
        img.style.cursor = 'zoom-in';
        img.addEventListener('click', () => openLightboxFrom(img));
        img.dataset.lbIndex = String(idx);
    });

    function ensureLightbox() {
        let el = document.querySelector('.lightbox');
        if (el) return el;
        el = document.createElement('div');
        el.className = 'lightbox';
        el.innerHTML = `
            <div class="lightbox__backdrop" data-lb-close="1"></div>
            <div class="lightbox__dialog" role="dialog" aria-modal="true" aria-label="Aperçu photo">
                <button class="lightbox__close" type="button" aria-label="Fermer" data-lb-close="1">×</button>
                <button class="lightbox__nav lightbox__nav--prev" type="button" aria-label="Photo précédente">‹</button>
                <figure class="lightbox__figure">
                    <img class="lightbox__img" alt="">
                    <figcaption class="lightbox__caption"></figcaption>
                </figure>
                <button class="lightbox__nav lightbox__nav--next" type="button" aria-label="Photo suivante">›</button>
            </div>
        `;
        document.body.appendChild(el);

        el.addEventListener('click', (e) => {
            const target = e.target;
            if (target?.dataset?.lbClose) closeLightbox();
        });
        el.querySelector('.lightbox__nav--prev')?.addEventListener('click', () => stepLightbox(-1));
        el.querySelector('.lightbox__nav--next')?.addEventListener('click', () => stepLightbox(1));
        return el;
    }

    function openLightboxFrom(clickedImg) {
        const imgs = Array.from(document.querySelectorAll('.gallery-grid img, .galerie-grid img, .gallery-masonry img'));
        if (!imgs.length) return;
        lightboxState.images = imgs.map((i) => ({
            src: i.getAttribute('src') || '',
            alt: i.getAttribute('alt') || '',
        }));
        const clickedSrc = clickedImg.getAttribute('src');
        const startIndex = Math.max(0, imgs.findIndex((i) => i.getAttribute('src') === clickedSrc));
        lightboxState.index = startIndex;
        const lb = ensureLightbox();
        renderLightbox();
        lb.classList.add('is-open');
        body.classList.add('lightbox-open');
    }

    function renderLightbox() {
        const lb = document.querySelector('.lightbox');
        if (!lb) return;
        const img = lb.querySelector('.lightbox__img');
        const cap = lb.querySelector('.lightbox__caption');
        const item = lightboxState.images[lightboxState.index];
        if (!item || !img) return;
        img.src = item.src;
        img.alt = item.alt || 'Photo';
        if (cap) cap.textContent = item.alt || '';
    }

    function stepLightbox(delta) {
        if (!lightboxState.images.length) return;
        lightboxState.index = (lightboxState.index + delta + lightboxState.images.length) % lightboxState.images.length;
        renderLightbox();
    }

    function closeLightbox() {
        const lb = document.querySelector('.lightbox');
        if (!lb) return;
        lb.classList.remove('is-open');
        body.classList.remove('lightbox-open');
    }
});