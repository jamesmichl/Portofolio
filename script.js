(() => {
    const header = document.getElementById('header');
    const navigation = document.getElementById('primary-navigation');
    const toggle = document.querySelector('.nav-toggle');
    const toggleLabel = document.querySelector('.nav-toggle-label');
    const links = [...document.querySelectorAll('.nav-link')];
    const sections = links.map(link => document.getElementById(link.hash.slice(1))).filter(Boolean);
    const mobile = window.matchMedia('(max-width: 700px)');
    let viewportWidth = window.innerWidth;
    let closedHeaderHeight = header.getBoundingClientRect().height;
    let scheduled = false;
    function setMenu(open, restoreFocus = false) {
        toggle.setAttribute('aria-expanded', String(open));
        toggleLabel.textContent = open ? 'Close' : 'Menu';
        navigation.classList.toggle('is-open', open);
        if (restoreFocus) toggle.focus();
    }

    // Keep the active section accurate after scrolling, direct hashes, and resizing.
    function updateActiveLink() {
        header.classList.toggle('has-scrolled', window.scrollY > 12);
        if (!sections.length) {
            // Dedicated project pages keep Portfolio selected. Their navigation
            // links point back to the original document and use normal history.
            links.forEach(link => {
                const active = link.hash === `#${document.body.dataset.activeSection}`;
                link.classList.toggle('active', active);
                if (active) link.setAttribute('aria-current', 'location');
                else link.removeAttribute('aria-current');
            });
            scheduled = false;
            return;
        }
        const readingLine = closedHeaderHeight + 48;
        let current = sections[0];
        for (const section of sections) {
            if (section.getBoundingClientRect().top <= readingLine) current = section;
        }
        if (window.scrollY > 0 && window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 3) {
            // Short final sections can share the viewport. Honor a visible anchor
            // destination rather than always highlighting the final section.
            const destinationHash = ['#projects', '#certificates'].includes(location.hash) ? '#portfolio' : location.hash;
            const destination = sections.find(section => `#${section.id}` === destinationHash);
            const top = destination?.getBoundingClientRect().top;
            current = destination && top >= closedHeaderHeight && top < window.innerHeight
                ? destination
                : sections[sections.length - 1];
        }
        for (const link of links) {
            const active = link.getAttribute('href') === `#${current.id}`;
            link.classList.toggle('active', active);
            if (active) link.setAttribute('aria-current', 'location');
            else link.removeAttribute('aria-current');
        }
        scheduled = false;
    }

    function scheduleUpdate() {
        if (!scheduled) {
            scheduled = true;
            window.requestAnimationFrame(updateActiveLink);
        }
    }

    function syncLayout() {
        setMenu(false);
        closedHeaderHeight = header.getBoundingClientRect().height;
        document.documentElement.style.setProperty('--header-height', `${closedHeaderHeight}px`);
        scheduleUpdate();

    }

    toggle.hidden = false;
    header.classList.add('nav-enhanced');
    toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
    navigation.addEventListener('click', event => {
        const link = event.target.closest('a[href^="#"]');
        if (!link) return;
        const wasMobile = mobile.matches;
        setMenu(false);
        // Move keyboard focus out of the collapsed menu to the chosen section.
        if (wasMobile) {
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                target.setAttribute('tabindex', '-1');
                target.focus({ preventScroll: true });
            }
        }
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') setMenu(false, true);
    });
    document.addEventListener('click', event => {
        if (!header.contains(event.target) && toggle.getAttribute('aria-expanded') === 'true') setMenu(false);
    });
    header.addEventListener('focusout', event => {
        if (event.relatedTarget && !header.contains(event.relatedTarget)) setMenu(false);
    });
    document.querySelector('.logo').addEventListener('click', () => setMenu(false));
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', () => {
        // Mobile browser chrome can change height while scrolling. Preserve
        // an open menu unless the layout width actually changes.
        if (window.innerWidth !== viewportWidth) {
            viewportWidth = window.innerWidth;
            syncLayout();
        } else {
            scheduleUpdate();
    
        }
    });
    window.addEventListener('hashchange', scheduleUpdate);
    window.addEventListener('load', syncLayout);
    if (document.fonts) document.fonts.ready.then(syncLayout);
    syncLayout();
})();

// Native buttons enhanced to the WAI-ARIA tabs pattern; no framework needed.
(() => {
    const portfolio = document.getElementById('portfolio');
    if (!portfolio) return;
    const tablist = portfolio.querySelector('.portfolio-tabs');
    const tabs = [...tablist.querySelectorAll('button')];
    const panels = tabs.map(tab => document.getElementById(tab.getAttribute('aria-controls')));
    tablist.hidden = false;
    tablist.setAttribute('role', 'tablist');
    tablist.setAttribute('aria-orientation', 'horizontal');
    portfolio.classList.add('portfolio-enhanced');
    tabs.forEach((tab, i) => {
        tab.setAttribute('role', 'tab');
        panels[i].setAttribute('role', 'tabpanel');
        panels[i].setAttribute('aria-labelledby', tab.id);
        panels[i].tabIndex = 0;
    });
    function select(id, { focus = false, updateUrl = false, animate = true } = {}) {
        tabs.forEach((tab, i) => {
            const selected = panels[i].id === id;
            tab.setAttribute('aria-selected', String(selected));
            tab.tabIndex = selected ? 0 : -1;
            panels[i].hidden = !selected;
            panels[i].classList.toggle('is-entering', selected && animate);
            if (selected && focus) tab.focus({ preventScroll: true });
        });
        // Remove trails measured against the previous panel immediately.
        portfolio.querySelectorAll('.shooting-star').forEach(star => star.remove());
        if (updateUrl) history.replaceState(null, '', `#${id}`);
        document.dispatchEvent(new Event('portfoliochange'));
        window.dispatchEvent(new Event('scroll'));
    }
    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => select(panels[index].id, { updateUrl: true }));
        tab.addEventListener('keydown', event => {
            let next;
            if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
            if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
            if (event.key === 'Home') next = 0;
            if (event.key === 'End') next = tabs.length - 1;
            if (next === undefined) return;
            event.preventDefault();
            select(panels[next].id, { focus: true, updateUrl: true });
        });
    });
    // Existing #projects / #certificates links still select the correct category.
    // Bring the selector into view too, rather than hiding it above the panel.
    function followCategory(id) {
        select(id);
        portfolio.scrollIntoView({ block: 'start' });
    }
    document.addEventListener('click', event => {
        const anchor = event.target.closest('a[href="#projects"], a[href="#certificates"]');
        if (!anchor) return;
        event.preventDefault();
        const id = anchor.hash.slice(1);
        select(id, { updateUrl: true });
        portfolio.setAttribute('tabindex', '-1');
        portfolio.focus({ preventScroll: true });
        portfolio.scrollIntoView({ block: 'start' });
    });
    window.addEventListener('hashchange', () => {
        const id = location.hash.slice(1);
        if (['projects', 'certificates'].includes(id)) followCategory(id);
    });
    const initial = location.hash === '#certificates' ? 'certificates' : 'projects';
    select(initial, { animate: false });
    if (['#projects', '#certificates'].includes(location.hash)) {
        window.addEventListener('load', () => followCategory(initial), { once: true });
    }
})();
