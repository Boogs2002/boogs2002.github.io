// Handles two scroll-reveal animations:
//   1. Pyramid layers (.pyramid-layer): slide up + fade in, staggered
//   2. Experience rows (.hidden-left):  slide in from left + fade in

document.addEventListener('DOMContentLoaded', () => {

    const navBtn = document.getElementById('nav-btn');
    const scarabNav = document.getElementById('scarab-nav');

    navBtn.addEventListener('click', () => {
        // Toggles the slide-down animation
        scarabNav.classList.toggle('active');
        
        // Toggles the tilted glowing state of the beetle icon
        navBtn.classList.toggle('is-open'); 
    });

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

});