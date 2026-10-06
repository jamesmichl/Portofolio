(() => {
    'use strict';
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const sections = [...document.querySelectorAll('.atmosphere-section')];
    const state = new Map();
    let layoutFrame = 0;
    let shootingTimer = 0;
    const burstTimers = new Set();
    const cleanupTimers = new Set();
    let seed = 41;
    const random = () => ((seed = seed * 16807 % 2147483647) - 1) / 2147483646;
    const candidates = Array.from({ length: 900 }, (_, i) => ({
        // Include outer margins so narrow layouts retain the visual identity.
        x: i % 4 === 0 ? (i % 8 ? .985 - random() * .015 : .008 + random() * .015) : random(),
        y: random(), size: 1.15 + random() * 1.4, alpha: .45 + random() * .35,
        cool: random() > .55, duration: 9 + random() * 9
    }));
    const overlaps = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
    function layoutStars() {
        layoutFrame = 0;
        const small = innerWidth <= 700;
        const tablet = innerWidth <= 1000;
        sections.forEach((section, sectionIndex) => {
            const field = section.querySelector('.star-field');
            const bounds = section.getBoundingClientRect();
            // Extra clearance covers the badge's full sway envelope, not just its
            // currently transformed position.
            const padding = small ? 10 : 24;
            const rectangles = [...section.querySelectorAll('[data-star-protect], .hero-copy > *, .hero-portrait, .lanyard-extension, .hero-bottom')]
                .map(node => node.getBoundingClientRect()).filter(rect => rect.width && rect.height)
                .map(rect => ({ left: rect.left - bounds.left - padding, right: rect.right - bounds.left + padding,
                    top: rect.top - bounds.top - padding, bottom: rect.bottom - bounds.top + padding }));
            // Fixed header is opaque; keep the initial Hero clearance clean too.
            if (section.id === 'home') rectangles.push({ left: 0, right: bounds.width, top: 0, bottom: 96 });
            const areaLimit = Math.ceil(bounds.width * bounds.height / (small ? 17000 : 20500));
            const limit = Math.min(small ? 22 : tablet ? 36 : 54, areaLimit);
            const fragment = document.createDocumentFragment();
            const points = [];
            for (let i = 0; i < candidates.length; i++) {
                const candidate = candidates[(i + sectionIndex * 137) % candidates.length];
                const x = candidate.x * bounds.width, y = candidate.y * bounds.height;
                if (y < 8 || y > bounds.height - 8) continue;
                const box = { left: x - 2, right: x + 2, top: y - 2, bottom: y + 2 };
                if (rectangles.some(rect => overlaps(box, rect))) continue;
                if (points.some(point => Math.hypot(point.x - x, point.y - y) < (small ? 33 : 45))) continue;
                const star = document.createElement('span');
                star.className = 'atmosphere-star';
                if (points.length % (small ? 12 : 8) === 5) star.classList.add('is-twinkling');
                const alpha = candidate.alpha * (section.id === 'home' ? 1 : .9);
                star.style.cssText = `--x:${x.toFixed(1)}px;--y:${y.toFixed(1)}px;--size:${candidate.size.toFixed(1)}px;--alpha:${alpha.toFixed(2)};--star-color:${candidate.cool ? '#a1d7ee' : '#e5eef8'};--duration:${candidate.duration.toFixed(1)}s;--delay:-${points.length * 1.3}s`;
                fragment.append(star); points.push({ x, y });
                if (points.length >= limit) break;
            }
            field.replaceChildren(fragment);
            state.set(section, { rectangles, width: bounds.width, height: bounds.height });
        });
    }
    const scheduleLayout = () => { if (!layoutFrame) layoutFrame = requestAnimationFrame(layoutStars); };
    function shootingEvent() {
        if (document.hidden || reducedMotion.matches || document.querySelector('dialog[open]')) return;
        const small = innerWidth <= 700;
        const existing = [...document.querySelectorAll('.shooting-star')];
        if (existing.length >= (small ? 1 : 3)) return;
        const visible = sections.filter(section => {
            const box = section.getBoundingClientRect();
            return box.bottom > 150 && box.top < innerHeight - 60;
        });
        const section = visible[Math.floor(Math.random() * visible.length)];
        const layout = state.get(section);
        if (!layout) return;
        const bounds = section.getBoundingClientRect();
        const trail = small ? 22 + Math.random() * 12 : 36 + Math.random() * 26;
        const travel = small ? 45 + Math.random() * 25 : 75 + Math.random() * 55;
        const angle = 12 + Math.random() * 18;
        const slope = Math.tan(angle * Math.PI / 180), drop = travel * slope;
        const duration = 650 + Math.random() * 400, brightness = .48 + Math.random() * .16;
        const top = Math.max(12, 100 - bounds.top), bottom = Math.min(layout.height - 14, innerHeight - bounds.top - 20);
        // A conservative rectangle contains the full rotated trail and its path.
        // Skip crowded regions instead of allowing trails over text or controls.
        for (let attempt = 0; attempt < 140; attempt++) {
            const x = 10 + Math.random() * Math.max(0, layout.width - trail - travel - 30);
            const y = top + trail * slope + Math.random() * Math.max(0, bottom - top - drop - trail * slope - 20);
            const sweep = { left: x - 5, right: x + trail + travel + 5, top: y - trail * slope - 5, bottom: y + drop + 5 };
            if (sweep.bottom > bottom || layout.rectangles.some(rect => overlaps(sweep, rect))) continue;
            if (existing.some(star => {
                const other = star.getBoundingClientRect();
                return Math.hypot(other.left - bounds.left - x, other.top - bounds.top - y) < 100;
            })) continue;
            const star = document.createElement('span'); star.className = 'shooting-star';
            star.style.cssText = `--x:${x}px;--y:${y}px;--trail:${trail}px;--travel:${travel}px;--drop:${drop}px;--angle:${angle}deg;--flight:${duration}ms;--brightness:${brightness}`;
            section.querySelector('.star-field').append(star);
            star.addEventListener('animationend', () => star.remove(), { once: true });
            const cleanup = setTimeout(() => { star.remove(); cleanupTimers.delete(cleanup); }, duration + 100);
            cleanupTimers.add(cleanup);
            break;
        }
    }
    function scheduleShooting() {
        clearTimeout(shootingTimer);
        if (document.hidden || reducedMotion.matches) return;
        shootingTimer = setTimeout(() => {
            shootingEvent();
            // Mostly solitary trails; occasional small staggered bursts. Mobile
            // keeps one at a time and shorter paths, with no pointer physics.
            if (Math.random() < .3) {
                const extra = innerWidth <= 700 ? 1 : Math.random() < .25 ? 2 : 1;
                for (let i = 0; i < extra; i++) {
                    const delay = innerWidth <= 700 ? 1150 + Math.random() * 350 : 220 + i * 280 + Math.random() * 180;
                    const burst = setTimeout(() => { burstTimers.delete(burst); shootingEvent(); }, delay);
                    burstTimers.add(burst);
                }
            }
            scheduleShooting();
        }, 3400 + Math.random() * 3600);
    }
    function syncMotion() {
        sections.forEach(section => {
            const bounds = section.getBoundingClientRect();
            section.querySelector('.star-field').classList.toggle('is-paused', document.hidden || bounds.bottom < 0 || bounds.top > innerHeight);
        });
        if (document.hidden || reducedMotion.matches) {
            burstTimers.forEach(clearTimeout); burstTimers.clear();
            cleanupTimers.forEach(clearTimeout); cleanupTimers.clear();
            document.querySelectorAll('.shooting-star').forEach(node => node.remove());
        }
        scheduleShooting();
    }
    if ('ResizeObserver' in window) {
        const observer = new ResizeObserver(scheduleLayout);
        sections.forEach(section => observer.observe(section));
    }
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(entries => entries.forEach(entry => {
            entry.target.querySelector('.star-field').classList.toggle('is-paused', document.hidden || !entry.isIntersecting);
        }));
        sections.forEach(section => observer.observe(section));
    }
    window.addEventListener('resize', scheduleLayout, { passive: true });
    window.addEventListener('load', scheduleLayout);
    document.addEventListener('portfoliochange', scheduleLayout);
    document.fonts?.ready.then(scheduleLayout);
    document.addEventListener('visibilitychange', syncMotion);
    reducedMotion.addEventListener('change', syncMotion);
    scheduleLayout(); syncMotion();
})();
