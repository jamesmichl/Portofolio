(() => {
    const hero = document.getElementById('home');
    const words = [...hero.querySelectorAll('.interest-word')];
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    let index = 0;
    let timer = 0;
    let visible = hero.getBoundingClientRect().bottom > 0;
    function show(next) {
        index = next;
        words.forEach((word, i) => word.classList.toggle('is-current', i === index));
    }
    function sync() {
        clearTimeout(timer);
        const paused = document.hidden || !visible;
        hero.classList.toggle('is-motion-paused', paused);
        if (reducedMotion.matches) { show(0); return; }
        if (paused) return;
        // Four seconds of reading time plus a short opacity/translation transition.
        timer = setTimeout(() => { show((index + 1) % words.length); sync(); }, 4400);
    }
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
        observer.observe(hero);
    }
    reducedMotion.addEventListener('change', sync);
    document.addEventListener('visibilitychange', sync);
    sync();
})();
