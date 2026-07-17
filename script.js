// Handles scrolling, navigation, parallax, torchlight, scroll reveals, slideshows, and the cinematic session-gated welcome overlay
document.addEventListener('DOMContentLoaded', () => {

    // ── CINEMATIC WELCOME OVERLAY (SESSION GATED) ─────────────────
    const enterPortfolioBtn = document.getElementById('enter-portfolio-btn');
    const introGate = document.getElementById('intro-gate');

    // Helper function to normalize paths (handles index.html vs root '/' domains flawlessly)
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

    if (introGate) {
        const currentPath = normalizePath(window.location.pathname);
        const lastPage = normalizePath(sessionStorage.getItem('lastPage'));

        // If they navigated here from a different internal page, skip the intro entirely
        if (lastPage && lastPage !== currentPath) {
            introGate.style.display = 'none'; // Instant vanish, no transition flash
            document.body.style.overflow = ''; // Instantly restore page scrollability
        } else {
            // Otherwise, it's their first load or a reload: show intro and lock scroll
            document.body.style.overflow = 'hidden';
        }
    }

    // Always record the current page in sessionStorage so other pages can read it
    sessionStorage.setItem('lastPage', window.location.pathname);

    if (enterPortfolioBtn && introGate) {
        enterPortfolioBtn.addEventListener('click', () => {
            // Trigger seamless opacity dissolve transition
            introGate.classList.add('fade-out');
            
            // Restore native document page scrollability
            document.body.style.overflow = '';
        });
    }

    // ── NAVIGATION BAR TOGGLE ──────────────────────────────
    const navBtn = document.getElementById('nav-btn');
    const scarabNav = document.getElementById('scarab-nav');

    if (navBtn && scarabNav) {
        navBtn.addEventListener('click', () => {
            // Toggles the slide-down animation
            scarabNav.classList.toggle('active');
            
            // Toggles the tilted glowing state of the beetle icon
            navBtn.classList.toggle('is-open'); 
        });
    }

    // ── CINEMATIC TOMB DESCENT SCROLL (FIXED FOR BROWSER CONFLICTS) ──
    function smoothScrollTo(targetSelector, duration) {
        const target = document.querySelector(targetSelector);
        if (!target) return;

        // Temporarily disable native 'scroll-behavior: smooth' to allow pixel-perfect JS control
        const htmlElement = document.documentElement;
        const originalScrollBehavior = htmlElement.style.scrollBehavior;
        htmlElement.style.scrollBehavior = 'auto';

        const targetPosition = target.getBoundingClientRect().top + window.scrollY;
        const startPosition = window.scrollY;
        const distance = targetPosition - startPosition;
        let startTime = null;

        // Cinematic quintic curve: slow start, rapid drop, gentle cushion halt
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
            
            // Programmatically update the coordinates instantly
            window.scrollTo(0, run);
            
            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            } else {
                window.scrollTo(0, targetPosition); // Secure the final frame lock
                
                // Restore the native CSS smooth scroll behavior for normal link clicks
                htmlElement.style.scrollBehavior = originalScrollBehavior;
            }
        }
        requestAnimationFrame(animation);
    }

    // Bind custom scroll to all scroll-indicator links (works on Home & About pages)
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
        {
            root: null,
            threshold: 0.25
        }
    );

    document.querySelectorAll('.pyramid-layer').forEach((layer) => {
        pyramidObserver.observe(layer);
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
        }, {
            root: null,
            threshold: thresholdVal
        });

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
        {
            root: null,
            threshold: 0.15
        }
    );

    document.querySelectorAll('.hidden-left').forEach((row) => {
        tombObserver.observe(row);
    });

    // ── HERO PARALLAX DEPTH ──────────────────────────────
    const heroSection = document.getElementById('hero');
    const moonFrame = document.querySelector('.moon-frame');

    if (heroSection && moonFrame) {
        heroSection.addEventListener('mousemove', (e) => {
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;

            const moveX = (e.clientX - centerX) / centerX;
            const moveY = (e.clientY - centerY) / centerY;

            // Move the Moon (Opposite to cursor for 3D depth)
            const moonOffsetX = moveX * -20; 
            const moonOffsetY = moveY * -20;
            moonFrame.style.transform = `translate(${moonOffsetX}px, ${moonOffsetY}px)`;

            // Shift the Dunes Background (With the cursor)
            const bgOffsetX = 50 + (moveX * 1.5); 
            const bgOffsetY = 100 + (moveY * 1.5);
            heroSection.style.backgroundPosition = `${bgOffsetX}% ${bgOffsetY}%`;
        });

        heroSection.addEventListener('mouseleave', () => {
            moonFrame.style.transform = 'translate(0px, 0px)';
            heroSection.style.backgroundPosition = 'center bottom';
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
            e.stopPropagation(); // Prevents bubbling event so we don't trigger double-toggles
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
        {
            root: null,
            threshold: 0.2
        }
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
            {
                root: null,
                threshold: [0, 0.1, 0.25, 0.4, 0.5, 0.6, 0.75, 0.9, 0.999, 1]
            }
        );

        doorObserver.observe(blueprintContainer);
    }

    // ── PROJECT RELIC SLIDESHOW (spike-trap transition) ─────
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
        const SLIDE_VISIBLE_MS = 4200; // how long each image stays visible
        const SPIKE_CLOSE_MS = 500;    // must roughly match the CSS transition duration

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

    // ── WORK PAGE PROJECT SLIDESHOW (plain crossfade, no spikes) ──
    if (!prefersReducedMotion) {
        document.querySelectorAll('.project-detail-image').forEach((frame, frameIndex) => {
            const slides = frame.querySelectorAll('img');
            const dots = frame.querySelectorAll('.slide-dots .dot');
            if (slides.length < 2) return;

            let current = 0;
            let timer = null;

            // Staggers each card's cadence slightly so they don't swap in visual sync
            const interval = 4200 + (frameIndex * 650);

            function goToNext() {
                slides[current].classList.remove('active');
                if (dots[current]) dots[current].classList.remove('active');
                current = (current + 1) % slides.length;
                slides[current].classList.add('active');
                if (dots[current]) dots[current].classList.add('active');
            }

            function start() {
                if (timer) return;
                timer = setInterval(goToNext, interval);
            }

            function stop() {
                clearInterval(timer);
                timer = null;
            }

            start();

            // Pause slideshow rotation on mouse hovers
            frame.addEventListener('mouseenter', stop);
            frame.addEventListener('mouseleave', start);
        });
    }

    // ── PROJECT DUST REVEAL (Work page touch fallback) ─────
    if (window.matchMedia('(hover: none)').matches) {
        const dustObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('uncovered');
                    } else {
                        entry.target.classList.remove('uncovered');
                    }
                });
            },
            {
                root: null,
                threshold: 0.4
            }
        );

        document.querySelectorAll('.project-detail-image').forEach((img) => {
            dustObserver.observe(img);
        });
    }

    // ── SANCTUM CONTACT FORM (crack-flash validation + seal) ────
    // The form has novalidate, so the browser's native red-outline
    // popup never fires — this does the required-field check itself
    // and flashes a "crack" across the chiselled line under any empty
    // field instead. Once everything's filled in, it plays a short
    // sealing beat on the button, then swaps the form out for a
    // confirmation message.
    //
    // Note: there's no backend behind action="#" yet, so this seals
    // the ritual but doesn't actually deliver the message anywhere —
    // wire it up to a real endpoint (e.g. Formspree, EmailJS, or your
    // own server) whenever you're ready to receive real submissions.
    const sanctumForm = document.getElementById('sanctum-form');
    const altarConfirmation = document.getElementById('altar-confirmation');

    if (sanctumForm && altarConfirmation) {
        const requiredFields = sanctumForm.querySelectorAll('[required]');

        // Clear a field's error state as soon as the person starts
        // fixing it, rather than making them resubmit to find out.
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

                // Restart the crack animation even on repeat failures
                group.classList.remove('field-error');
                void group.offsetWidth; // force reflow
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