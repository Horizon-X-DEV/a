/* =========================================================
   HorizonX — script.js
   Vanilla JavaScript, tanpa framework.
   ========================================================= */
(function () {
    'use strict';

    var reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    function prefersReducedMotion() {
        return reduceMotionQuery.matches;
    }

    /* =====================================================
       1. NAVBAR — sticky state, mobile menu
       ===================================================== */
    var navbar = document.getElementById('navbar');
    var navToggle = document.getElementById('navToggle');
    var navLinks = document.getElementById('primaryNav');

    function isMenuOpen() {
        return !!navLinks && navLinks.classList.contains('open');
    }

    function setMenuIcon(open) {
        if (!navToggle) return;
        var icon = navToggle.querySelector('i');
        if (!icon) return;
        if (open) {
            icon.classList.remove('bx-menu');
            icon.classList.add('bx-x');
        } else {
            icon.classList.remove('bx-x');
            icon.classList.add('bx-menu');
        }
    }

    function openMenu() {
        if (!navLinks || !navToggle) return;
        navLinks.classList.add('open');
        navToggle.setAttribute('aria-expanded', 'true');
        navToggle.setAttribute('aria-label', 'Tutup menu navigasi');
        setMenuIcon(true);
    }

    function closeMenu() {
        if (!navLinks || !navToggle) return;
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Buka menu navigasi');
        setMenuIcon(false);
    }

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function () {
            if (isMenuOpen()) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        /* Tutup dengan tombol Escape */
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && isMenuOpen()) {
                closeMenu();
                navToggle.focus();
            }
        });

        /* Tutup saat klik di luar navbar */
        document.addEventListener('click', function (event) {
            if (!isMenuOpen()) return;
            if (navbar && !navbar.contains(event.target)) {
                closeMenu();
            }
        });

        /* Tutup saat kembali ke layout desktop */
        window.addEventListener('resize', function () {
            if (window.innerWidth > 780 && isMenuOpen()) {
                closeMenu();
            }
        });
    }

    /* =====================================================
       2. SMOOTH SCROLL untuk tautan internal
       ===================================================== */
    function smoothScrollTo(target) {
        if (!target) return;
        var behavior = prefersReducedMotion() ? 'auto' : 'smooth';

        if (target.id === 'home') {
            window.scrollTo({ top: 0, left: 0, behavior: behavior });
        } else if (typeof target.scrollIntoView === 'function') {
            target.scrollIntoView({ behavior: behavior, block: 'start' });
        }
    }

    var internalLinks = document.querySelectorAll('a[href^="#"]');

    Array.prototype.forEach.call(internalLinks, function (link) {
        link.addEventListener('click', function (event) {
            var hash = link.getAttribute('href');
            if (!hash || hash === '#') return;

            var target = document.getElementById(hash.slice(1));
            if (!target) return;

            event.preventDefault();

            if (isMenuOpen()) closeMenu();

            smoothScrollTo(target);

            if (window.history && typeof window.history.pushState === 'function') {
                window.history.pushState(null, '', hash);
            }

            /* Pindahkan fokus agar pengguna keyboard / screen reader mengikuti */
            if (!target.hasAttribute('tabindex')) {
                target.setAttribute('tabindex', '-1');
            }
            try {
                target.focus({ preventScroll: true });
            } catch (err) {
                /* Browser lama mengabaikan opsi; tidak masalah. */
            }
        });
    });

    /* =====================================================
       3. ANIMASI SAAT SCROLL (Intersection Observer)
       ===================================================== */
    var revealElements = document.querySelectorAll('.reveal');

    if (revealElements.length) {
        var canObserve = 'IntersectionObserver' in window;

        if (prefersReducedMotion() || !canObserve) {
            Array.prototype.forEach.call(revealElements, function (el) {
                el.classList.add('is-visible');
            });
        } else {
            var revealObserver = new IntersectionObserver(function (entries, observer) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.12,
                rootMargin: '0px 0px -40px 0px'
            });

            Array.prototype.forEach.call(revealElements, function (el) {
                revealObserver.observe(el);
            });
        }
    }

    /* =====================================================
       4. MENU AKTIF + TOMBOL KEMBALI KE ATAS (scroll handler)
       ===================================================== */
    var toTop = document.getElementById('toTop');
    var sectionEntries = [];

    Array.prototype.forEach.call(document.querySelectorAll('.nav-link'), function (link) {
        var hash = link.getAttribute('href');
        if (!hash || hash.charAt(0) !== '#') return;
        var el = document.getElementById(hash.slice(1));
        if (el) {
            sectionEntries.push({ el: el, link: link });
        }
    });

    function updateActiveLink() {
        if (!sectionEntries.length) return;

        var headerHeight = navbar ? navbar.offsetHeight : 0;
        var scrollPos = (window.pageYOffset || document.documentElement.scrollTop) + headerHeight + 24;
        var current = sectionEntries[0];

        for (var i = 0; i < sectionEntries.length; i++) {
            if (sectionEntries[i].el.offsetTop <= scrollPos) {
                current = sectionEntries[i];
            }
        }

        /* Jika sudah di dasar halaman, tandai bagian terakhir */
        var docHeight = Math.max(
            document.body.scrollHeight,
            document.documentElement.scrollHeight
        );
        if (window.innerHeight + (window.pageYOffset || 0) >= docHeight - 4) {
            current = sectionEntries[sectionEntries.length - 1];
        }

        sectionEntries.forEach(function (entry) {
            var isActive = entry === current;
            entry.link.classList.toggle('active', isActive);
            if (isActive) {
                entry.link.setAttribute('aria-current', 'true');
            } else {
                entry.link.removeAttribute('aria-current');
            }
        });
    }

    var scrollTicking = false;

    function handleScroll() {
        if (scrollTicking) return;
        scrollTicking = true;

        window.requestAnimationFrame(function () {
            var y = window.pageYOffset || document.documentElement.scrollTop;

            if (navbar) {
                navbar.classList.toggle('scrolled', y > 8);
            }
            if (toTop) {
                toTop.classList.toggle('show', y > 480);
            }

            updateActiveLink();
            scrollTicking = false;
        });
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    /* =====================================================
       5. TOMBOL KEMBALI KE ATAS
       ===================================================== */
    if (toTop) {
        toTop.addEventListener('click', function () {
            window.scrollTo({
                top: 0,
                left: 0,
                behavior: prefersReducedMotion() ? 'auto' : 'smooth'
            });
        });
    }

    /* =====================================================
       6. TAHUN FOOTER
       ===================================================== */
    var yearEl = document.getElementById('year');
    if (yearEl) {
        yearEl.textContent = String(new Date().getFullYear());
    }

})();
