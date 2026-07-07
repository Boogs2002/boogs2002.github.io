// Handles two scroll-reveal animations:
//   1. Pyramid layers (.pyramid-layer): slide up + fade in, staggered
//   2. Experience rows (.hidden-left):  slide in from left + fade in

document.addEventListener('DOMContentLoaded', () => {

    // ── CINEMATIC TOMB DESCENT SCROLL ──
    function smoothScrollTo(targetSelector, duration) {
        const target = document.querySelector(targetSelector);
        if (!target) return;

        // 1. Temporarily disable native 'scroll-behavior: smooth' to allow pixel-perfect JS control
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
                
                // 2. Restore the native CSS smooth scroll behavior for normal link clicks
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
            // 2200ms (2.2s) represents a slow, deliberate cinematic transition
            smoothScrollTo(targetId, 2200);
        });
    });

    // ── CHAMBER THRESHOLD REVEAL ──────────────────────────
    // ── RESPONSIVE CHAMBER REVEAL OBSERVER ──
    const skillsSection = document.getElementById('skills');
    const hallway = document.querySelector('.tomb-hallway');

    if (skillsSection && hallway) {
        // Measure heights: if section is taller than the viewport (like on stacked mobile views),
        // trigger as soon as 10% enters the screen. Otherwise, maintain the suspense threshold (40%).
        const sectionHeight = skillsSection.offsetHeight;
        const viewportHeight = window.innerHeight;
        const thresholdVal = (sectionHeight > viewportHeight) ? 0.1 : 0.4;

        const chamberObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    hallway.classList.add('chamber-revealed');
                } else {
                    // Re-shroud when scrolling back up past the threshold toward the hero
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

    // ── PYRAMID LAYERS ──────────────────────────────────────
    // Each layer has a data-delay attribute (0, 1, 2, 3)
    // that drives the stagger timing.
    const pyramidObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                const layer = entry.target;
                const delayIndex = parseInt(layer.dataset.delay ?? '0', 10);

                if (entry.isIntersecting) {
                    // Stagger: first layer in (top of pyramid) gets
                    // the longest delay so layers build bottom-to-top visually.
                    // Reversed: index 0 (top) is last to appear.
                    const totalLayers = document.querySelectorAll('.pyramid-layer').length;
                    const delay = (totalLayers - delayIndex) * 0.14;
                    layer.style.transitionDelay = `${delay}s`;
                    layer.classList.remove('hidden');
                    layer.classList.add('visible');
                } else {
                    // Reset so it re-animates if user scrolls back up
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


    // ── EXPERIENCE TABLET ROWS ──────────────────────────────
    // Each row slides in from the left when it enters the viewport.
    // The second row gets a slightly longer delay than the first.
    const tombObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry, i) => {
                if (entry.isIntersecting) {
                    // Find position among all rows to stagger
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

    // ── 1. HERO PARALLAX DEPTH ──────────────────────────────
    const heroSection = document.getElementById('hero');
    const moonFrame = document.querySelector('.moon-frame');

    if (heroSection && moonFrame) {
        heroSection.addEventListener('mousemove', (e) => {
            // Find the center of the screen
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;

            // Calculate how far the mouse is from the center (-1 to 1)
            const moveX = (e.clientX - centerX) / centerX;
            const moveY = (e.clientY - centerY) / centerY;

            // 1. Move the Moon (Opposite to cursor for 3D depth)
            // Multiplier (20) controls how far it drifts
            const moonOffsetX = moveX * -20; 
            const moonOffsetY = moveY * -20;
            moonFrame.style.transform = `translate(${moonOffsetX}px, ${moonOffsetY}px)`;

            // 2. Shift the Dunes Background (With the cursor)
            // Starts at 50% 100% (center bottom) and shifts slightly
            const bgOffsetX = 50 + (moveX * 1.5); 
            const bgOffsetY = 100 + (moveY * 1.5);
            heroSection.style.backgroundPosition = `${bgOffsetX}% ${bgOffsetY}%`;
        });

        // Reset everything smoothly when the mouse leaves the hero section
        heroSection.addEventListener('mouseleave', () => {
            moonFrame.style.transform = 'translate(0px, 0px)';
            heroSection.style.backgroundPosition = 'center bottom';
        });
    }
            // ── 2. THE TOMB TORCHLIGHT & ACCESSIBILITY ──────────────────────────────
            const experienceSection = document.getElementById('experience');
            const torchToggle = document.getElementById('torch-toggle');

            if (experienceSection) {
                // Torchlight Mouse Tracking
                experienceSection.addEventListener('mousemove', (e) => {
                    const rect = experienceSection.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    experienceSection.style.setProperty('--cursor-x', `${x}px`);
                    experienceSection.style.setProperty('--cursor-y', `${y}px`);
                });

                // Accessibility Toggle
                if (torchToggle) {
                    // Touch devices never fire mousemove, so the torch mask
                    // would otherwise stay permanently dark. Default it off.
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




    document.querySelectorAll('.hidden-left').forEach((row) => {
        tombObserver.observe(row);
    });


    // ── GENERIC SCROLL REVEAL (About page: bio, timeline, project cards) ──
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
    // On desktop, the two stone doors only swing open once the
    // ENTIRE blueprint-container frame is visible on screen. On
    // smaller screens the container is often taller than the
    // viewport, so it can never actually reach full visibility —
    // there the doors trigger as soon as half the frame is on
    // screen instead. Either way, they swing shut again as soon as
    // that threshold is no longer met, whether the person scrolls
    // further down or back up.
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


    // ── PROJECT DUST REVEAL (Work page, touch fallback) ─────
    // The sandy overlay is designed to clear on :hover, but touch
    // devices don't really have a hover state — so there, each
    // image uncovers itself automatically as it scrolls into view
    // instead of waiting for a hover that will never come.
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

});