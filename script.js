// Handles scrolling, navigation, parallax, torchlight, scroll reveals, slideshows, and the cinematic session-gated welcome overlay
document.addEventListener('DOMContentLoaded', () => {

    // Page transition doors: closed on load then slide open; reversed then navigated on internal link clicks
    const pageTransition = document.getElementById('page-transition');
    const TRANSITION_MS = 750; // must match the CSS transition duration

    if (pageTransition) {
        const openDoors = () => {
            requestAnimationFrame(() => {
                setTimeout(() => pageTransition.classList.add('is-open'), 60);
            });
        };

        if (document.readyState === 'complete') {
            openDoors();
        } else {
            window.addEventListener('load', openDoors, { once: true });
        }

        document.querySelectorAll('a[href]').forEach((link) => {
            const href = link.getAttribute('href');
            if (!href) return;

            const isSamePageHash = href.startsWith('#');
            const isExternal = /^https?:\/\//i.test(href) && !href.includes(window.location.hostname);
            const isSpecialProtocol = /^(mailto:|tel:|javascript:)/i.test(href);
            const opensNewTab = link.target === '_blank';

            if (isSamePageHash || isExternal || isSpecialProtocol || opensNewTab) return;

            link.addEventListener('click', (e) => {
                if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

                e.preventDefault();
                pageTransition.classList.remove('is-open');
                setTimeout(() => {
                    window.location.href = href;
                }, TRANSITION_MS);
            });
        });
    }

    // ── CUSTOM CURSOR (ankh glyph, fine-pointer devices only) ──
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        const root = document.documentElement;
        root.classList.add('has-custom-cursor');

        document.addEventListener('mousemove', (e) => {
            root.style.setProperty('--cx', `${e.clientX}px`);
            root.style.setProperty('--cy', `${e.clientY}px`);
        });

        const HOVER_TARGETS = 'a, button, [role="button"], input, textarea, select';

        document.addEventListener('mouseover', (e) => {
            if (e.target.closest(HOVER_TARGETS)) {
                root.classList.add('custom-cursor-hover');
            }
        });

        document.addEventListener('mouseout', (e) => {
            if (e.target.closest(HOVER_TARGETS)) {
                root.classList.remove('custom-cursor-hover');
            }
        });
    }

    // Chisel text reveal: wraps each heading letter in a span for staggered CSS reveal on scroll
    document.querySelectorAll('.section-heading').forEach((heading) => {
        Array.from(heading.childNodes).forEach((node) => {
            if (node.nodeType !== Node.TEXT_NODE || !node.textContent.trim()) return;

            const fragment = document.createDocumentFragment();
            let letterIndex = 0;

            Array.from(node.textContent).forEach((char) => {
                if (char.trim() === '') {
                    fragment.appendChild(document.createTextNode(char));
                    return;
                }
                const span = document.createElement('span');
                span.className = 'chisel-letter';
                span.style.setProperty('--i', letterIndex);
                span.textContent = char;
                fragment.appendChild(span);
                letterIndex += 1;
            });

            heading.replaceChild(fragment, node);
        });
    });

    const chiselObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-chiseled');
                } else {
                    entry.target.classList.remove('is-chiseled');
                }
            });
        },
        { root: null, threshold: 0.4 }
    );

    document.querySelectorAll('.section-heading').forEach((heading) => {
        chiselObserver.observe(heading);
    });

    // ── CINEMATIC WELCOME OVERLAY (SESSION GATED) ─────────────────
    const enterPortfolioBtn = document.getElementById('enter-portfolio-btn');
    const introGate = document.getElementById('intro-gate');

    function normalizePath(path) {
        if (!path) return '';
        let normalized = path.toLowerCase().trim();
        if (normalized === '/' || normalized === '') {
            return 'index.html';
        }
        const parts = normalized.split('/');
        let lastSegment = parts[parts.length - 1];
        if (lastSegment === '') {
            lastSegment = 'index.html';
        }
        return lastSegment;
    }

    const currentPath = normalizePath(window.location.pathname);

 
    function revealHeroName() {
        const hero = document.getElementById('hero');
        if (hero) hero.classList.add('hero-revealed');
    }

    if (introGate) {
        const lastPage = normalizePath(sessionStorage.getItem('lastPage'));

        if (lastPage && lastPage !== currentPath) {
            introGate.style.display = 'none';
            document.body.style.overflow = '';
            revealHeroName();
        } else {
            document.body.style.overflow = 'hidden';
        }
    } else {
        revealHeroName();
    }

    // Records this page on every page so "lastPage" is accurate when navigating back to Home
    sessionStorage.setItem('lastPage', currentPath);

    if (enterPortfolioBtn && introGate) {
        enterPortfolioBtn.addEventListener('click', () => {
            introGate.classList.add('fade-out');
            document.body.style.overflow = '';
            revealHeroName();
        });
    }

    // Add this inside the document.addEventListener('DOMContentLoaded', () => { ... }) block:

    document.querySelectorAll('.tracer-name .name-line').forEach((line) => {
        const text = line.textContent;
        line.textContent = ''; // Clear original text
        
        let letterIndex = 0;
        Array.from(text).forEach((char) => {
            const span = document.createElement('span');
            if (char === ' ') {
                span.innerHTML = '&nbsp;';
            } else {
                span.textContent = char;
                span.className = 'tracer-char';
                span.style.setProperty('--li', letterIndex);
                letterIndex++;
            }
            line.appendChild(span);
        });
    });

    // ── NAVIGATION BAR TOGGLE ──────────────────────────────
    const navToggleTrigger = document.getElementById('nav-toggle-trigger');
    const scarabNav = document.getElementById('scarab-nav');

    if (navToggleTrigger && scarabNav) {
        navToggleTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const isClosed = scarabNav.classList.toggle('is-closed');
            navToggleTrigger.setAttribute('aria-expanded', !isClosed);
        });

        navToggleTrigger.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navToggleTrigger.click();
            }
        });
    }

    // ── UNIVERSAL EASTER EGG FOOTER ASCENT ENGINE ──
    const easterEggBeetle = document.getElementById('easter-egg-ascent');

    window.addEventListener('scroll', () => {
        if (!scarabNav) return;

        // Work/Contact use a small fixed threshold since their first section is oversized
        const isCompactHeroPage = currentPath === 'work.html' || currentPath === 'contact.html';

        let collapseThreshold;
        if (isCompactHeroPage) {
            collapseThreshold = 120;
        } else {
            const topSection = document.querySelector('section') || document.querySelector('header');
            collapseThreshold = topSection ? Math.min(topSection.offsetHeight / 2, window.innerHeight) : 300;
        }

        if (window.scrollY <= collapseThreshold) {
            scarabNav.classList.add('on-hero');
        } else {
            scarabNav.classList.remove('on-hero');
            if (!scarabNav.classList.contains('is-closed')) {
                scarabNav.classList.add('is-closed');
                if (navToggleTrigger) {
                    navToggleTrigger.setAttribute('aria-expanded', 'false');
                }
            }
        }
    });

    if (easterEggBeetle) {
        easterEggBeetle.addEventListener('click', (e) => {
            e.preventDefault();
            smoothScrollTo('html', 2200); // scrolls to the root <html>, not a specific section
        });
    }

    // ── CINEMATIC TOMB DESCENT SCROLL ──
    function smoothScrollTo(targetSelector, duration) {
        const target = document.querySelector(targetSelector);
        if (!target) return;

        const htmlElement = document.documentElement;
        const originalScrollBehavior = htmlElement.style.scrollBehavior;
        htmlElement.style.scrollBehavior = 'auto';

        const targetPosition = target.getBoundingClientRect().top + window.scrollY;
        const startPosition = window.scrollY;
        const distance = targetPosition - startPosition;
        let startTime = null;

        function easeInOutQuint(t, b, c, d) {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t * t * t * t + b;
            t -= 2;
            return c / 2 * (t * t * t * t * t + 2) + b;
        }

        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const run = easeInOutQuint(timeElapsed, startPosition, distance, duration);

            window.scrollTo(0, run);

            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            } else {
                window.scrollTo(0, targetPosition);
                htmlElement.style.scrollBehavior = originalScrollBehavior;
            }
        }
        requestAnimationFrame(animation);
    }

    document.querySelectorAll('.scroll-indicator').forEach(indicator => {
        indicator.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = indicator.getAttribute('href');
            smoothScrollTo(targetId, 2200);
        });
    });

    // ── PYRAMID LAYERS ──────────────────────────────────────
    const pyramidObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                const layer = entry.target;
                const delayIndex = parseInt(layer.dataset.delay ?? '0', 10);

                if (entry.isIntersecting) {
                    const totalLayers = document.querySelectorAll('.pyramid-layer').length;
                    const delay = (totalLayers - delayIndex) * 0.14;
                    layer.style.transitionDelay = `${delay}s`;
                    layer.classList.remove('hidden');
                    layer.classList.add('visible');
                } else {
                    layer.style.transitionDelay = '0s';
                    layer.classList.remove('visible');
                    layer.classList.add('hidden');
                }
            });
        },
        { root: null, threshold: 0.25 }
    );

    document.querySelectorAll('.pyramid-layer').forEach((layer) => {
        pyramidObserver.observe(layer);
    });

    // Mouse clicks shouldn't leave a pyramid block "stuck" glowing via
    // :focus-within — only actual hover, or genuine keyboard focus, should.
    // preventDefault on mousedown stops the click from focusing the block,
    // while Tab-key navigation (which uses keydown, not mousedown) still works.
    document.querySelectorAll('.pyramid-layer .block').forEach((block) => {
        block.addEventListener('mousedown', (e) => e.preventDefault());
    });

    // ── RESPONSIVE CHAMBER REVEAL OBSERVER ──
    const skillsSection = document.getElementById('skills');
    const hallway = document.querySelector('.tomb-hallway');

    if (skillsSection && hallway) {
        const sectionHeight = skillsSection.offsetHeight;
        const viewportHeight = window.innerHeight;
        const thresholdVal = (sectionHeight > viewportHeight) ? 0.1 : 0.4;

        const chamberObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    hallway.classList.add('chamber-revealed');
                } else {
                    if (entry.boundingClientRect.top > 0) {
                        hallway.classList.remove('chamber-revealed');
                    }
                }
            });
        }, { root: null, threshold: thresholdVal });

        chamberObserver.observe(skillsSection);
    }

    // ── EXPERIENCE TABLET ROWS ──────────────────────────────
    const tombObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const allRows = document.querySelectorAll('.hidden-left');
                    const index = Array.from(allRows).indexOf(entry.target);
                    entry.target.style.transitionDelay = `${index * 0.18}s`;
                    entry.target.classList.add('visible');
                } else {
                    entry.target.style.transitionDelay = '0s';
                    entry.target.classList.remove('visible');
                }
            });
        },
        { root: null, threshold: 0.15 }
    );

    document.querySelectorAll('.hidden-left').forEach((row) => {
        tombObserver.observe(row);
    });

    // ── HERO PARALLAX DEPTH ──────────────────────────────
    const heroSection = document.getElementById('hero');
    const moonFrame = document.querySelector('.moon-frame');
    const foregroundDunes = document.querySelector('.hero-dunes-foreground');

    if (heroSection && moonFrame && foregroundDunes) {
        heroSection.addEventListener('mousemove', (e) => {
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;

            const moveX = (e.clientX - centerX) / centerX;
            const moveY = (e.clientY - centerY) / centerY;

            const moonOffsetX = moveX * -20;
            const moonOffsetY = moveY * -20;
            moonFrame.style.transform = `translate(${moonOffsetX}px, ${moonOffsetY}px)`;
        });

        heroSection.addEventListener('mouseleave', () => {
            moonFrame.style.transform = 'translate(0px, 0px)';
        });
    }

    // ── THE TOMB TORCHLIGHT & ACCESSIBILITY ──────────────────────────────
    const experienceSection = document.getElementById('experience');
    const torchToggle = document.getElementById('torch-toggle');

    if (experienceSection) {
        experienceSection.addEventListener('mousemove', (e) => {
            const rect = experienceSection.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            experienceSection.style.setProperty('--cursor-x', `${x}px`);
            experienceSection.style.setProperty('--cursor-y', `${y}px`);
        });

        if (torchToggle) {
            if (window.matchMedia('(hover: none)').matches) {
                experienceSection.classList.add('no-torch');
                torchToggle.querySelector('.btn-text').textContent = 'Torch: OFF';
            }

            torchToggle.addEventListener('click', () => {
                experienceSection.classList.toggle('no-torch');
                const isOff = experienceSection.classList.contains('no-torch');
                torchToggle.querySelector('.btn-text').textContent = isOff ? 'Torch: OFF' : 'Torch: ON';
            });
        }
    }

    // ── CLICK-ANYWHERE EXPANSION CARD DETAILED TOGGLE ─────
    const expansionTrigger = document.querySelector(".expansion-trigger");
    const expansionCard = document.querySelector(".expansion-card");
    const expansionContent = document.querySelector(".expansion-content");

    if (expansionTrigger && expansionCard && expansionContent) {
        expansionTrigger.addEventListener("click", (e) => {
            e.stopPropagation();
            toggleExpansion();
        });

        expansionCard.addEventListener("click", () => {
            toggleExpansion();
        });

        function toggleExpansion() {
            const isOpen = expansionCard.classList.toggle("is-open");
            expansionTrigger.setAttribute("aria-expanded", isOpen);
            expansionContent.setAttribute("aria-hidden", !isOpen);
        }
    }

    // ── GENERIC SCROLL REVEAL ──────────────────────────────
    const revealObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                } else {
                    entry.target.classList.remove('visible');
                }
            });
        },
        { root: null, threshold: 0.2 }
    );

    document.querySelectorAll('.reveal').forEach((el) => {
        revealObserver.observe(el);
    });

    // ── BLUEPRINT DOORS (About page) ────────────────────────
    const blueprintContainer = document.querySelector('.blueprint-container');

    if (blueprintContainer) {
        const isSmallScreen = () => window.matchMedia('(max-width: 640px)').matches;

        const doorObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const requiredRatio = isSmallScreen() ? 0.5 : 0.999;
                    if (entry.intersectionRatio >= requiredRatio) {
                        blueprintContainer.classList.add('doors-open');
                    } else {
                        blueprintContainer.classList.remove('doors-open');
                    }
                });
            },
            { root: null, threshold: [0, 0.1, 0.25, 0.4, 0.5, 0.6, 0.75, 0.9, 0.999, 1] }
        );

        doorObserver.observe(blueprintContainer);
    }

    // ── PROJECT RELIC SLIDESHOW (spike-trap transition) ─────
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
        const SLIDE_VISIBLE_MS = 4200;
        const SPIKE_CLOSE_MS = 500;

        document.querySelectorAll('.relic-slideshow').forEach((slideshow) => {
            const slides = slideshow.querySelectorAll('.relic-image');
            const frameBorder = slideshow.closest('.frame-border');
            const trap = frameBorder ? frameBorder.querySelector('.spike-trap') : null;

            if (slides.length < 2 || !trap) return;

            let current = 0;

            setInterval(() => {
                trap.classList.add('closing');

                setTimeout(() => {
                    slides[current].classList.remove('active');
                    current = (current + 1) % slides.length;
                    slides[current].classList.add('active');
                    trap.classList.remove('closing');
                }, SPIKE_CLOSE_MS);

            }, SLIDE_VISIBLE_MS);
        });
    }

    // Work page slideshow: sandy overlay acts as a timed door — closes, swaps slide, reopens
    if (!prefersReducedMotion) {
        const DOOR_CLOSE_MS = 900;     // matches the CSS clip-path transition
        const SLIDE_VISIBLE_MS = 4200; // how long the photo stays uncovered

        document.querySelectorAll('.project-detail-image').forEach((frame, frameIndex) => {
            const slides = frame.querySelectorAll('img');
            const dots = frame.querySelectorAll('.slide-dots .dot');
            if (slides.length < 2) return;

            let current = 0;
            let timer = null;
            const interval = SLIDE_VISIBLE_MS + (frameIndex * 650);

            function cycle() {
                frame.classList.add('door-closed');

                setTimeout(() => {
                    slides[current].classList.remove('active');
                    if (dots[current]) dots[current].classList.remove('active');
                    current = (current + 1) % slides.length;
                    slides[current].classList.add('active');
                    if (dots[current]) dots[current].classList.add('active');
                    frame.classList.remove('door-closed');
                }, DOOR_CLOSE_MS);
            }

            function start() {
                if (timer) return;
                timer = setInterval(cycle, interval);
            }

            function stop() {
                clearInterval(timer);
                timer = null;
            }

            start();
            // Hovering pauses the cycle so visitors can linger on a slide
            frame.addEventListener('mouseenter', stop);
            frame.addEventListener('mouseleave', start);
        });
    }

    // ── SANCTUM CONTACT FORM ──
    const sanctumForm = document.getElementById('sanctum-form');
    const altarConfirmation = document.getElementById('altar-confirmation');

    if (sanctumForm && altarConfirmation) {
        const requiredFields = sanctumForm.querySelectorAll('[required]');

        requiredFields.forEach((field) => {
            field.addEventListener('input', () => {
                const group = field.closest('.altar-input-group');
                if (group) group.classList.remove('field-error');
            });
        });

        sanctumForm.addEventListener('submit', (e) => {
            e.preventDefault();
            let firstInvalid = null;

            requiredFields.forEach((field) => {
                const group = field.closest('.altar-input-group');
                if (!group) return;

                group.classList.remove('field-error');
                void group.offsetWidth;
                if (!field.checkValidity()) {
                    group.classList.add('field-error');
                    if (!firstInvalid) firstInvalid = field;
                }
            });

            if (firstInvalid) {
                firstInvalid.focus();
                return;
            }

            sanctumForm.classList.add('is-sealing');

            setTimeout(() => {
                sanctumForm.classList.add('is-hidden');
                altarConfirmation.classList.add('visible');
            }, 650);
        });
    }

});