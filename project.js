/* One static detail document, populated from the same verified content source.
 * Real document links preserve refresh, sharing, new tabs and browser history. */
(() => {
    'use strict';
    const slug = new URLSearchParams(location.search).get('project');
    const project = window.portfolioContent?.projects.find(item => item.slug === slug);
    const view = document.getElementById('project-view');
    const el = (tag, className, text) => {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text) node.textContent = text;
        return node;
    };
    function externalLink(label, value, className) {
        if (!value) return null;
        try {
            const url = new URL(value, document.baseURI);
            if (!['https:', 'http:', 'file:'].includes(url.protocol)) return null;
            const anchor = el('a', className, label);
            anchor.href = url.href;
            anchor.target = '_blank';
            anchor.rel = 'noopener noreferrer';
            const arrow = el('span', '', '↗'); arrow.setAttribute('aria-hidden', 'true');
            anchor.append(arrow, el('span', 'sr-only', ' (opens in a new tab)'));
            return anchor;
        } catch { return null; }
    }
    if (!project) {
        const panel = el('div', 'project-unavailable'); panel.dataset.starProtect = '';
        const heading = el('h1', '', 'Project not found'); heading.id = 'project-title';
        panel.append(heading, el('p', '', 'Choose a project from the Portfolio to view its details.'));
        const back = el('a', 'button button-secondary', 'View projects'); back.href = 'index.html#projects';
        panel.append(back); view.append(panel);
        document.title = 'Project not found | James Michael Lionel';
        return;
    }
    document.title = `${project.title} | James Michael Lionel`;
    document.querySelector('meta[name="description"]').content = project.description;
    document.getElementById('project-crumb').textContent = project.title;
    const layout = el('div', 'project-detail-layout');
    const intro = el('div', 'project-detail-intro'); intro.dataset.starProtect = '';
    intro.append(el('p', 'section-kicker', 'Selected project'));
    const title = el('h1', '', project.title); title.id = 'project-title'; intro.append(title);
    if (project.fullTitle) intro.append(el('p', 'project-full-title', project.fullTitle));
    intro.append(el('p', 'project-summary', project.description || project.shortDescription));
    const metadata = el('dl', 'project-facts');
    for (const [label, value] of [['Project type', `${project.type} Project`], ['Primary area', project.area]]) {
        const row = el('div'); row.append(el('dt', '', label), el('dd', '', value)); metadata.append(row);
    }
    intro.append(metadata);
    const figure = el('figure', `project-detail-visual project-detail-visual--${project.visualStyle}`); figure.dataset.starProtect = '';
    const frame = el('div', 'project-image-frame');
    const img = el('img'); img.alt = project.imageAlt; img.src = project.image; img.decoding = 'async';
    img.addEventListener('error', () => { frame.replaceChildren(el('p', 'muted', 'The project visual is unavailable.')); }, { once: true });
    frame.append(img); figure.append(frame);
    const caption = el('figcaption', 'project-image-caption');
    if (project.imageNote) caption.append(el('p', '', project.imageNote));
    const imageLink = externalLink('Open full-size visual', project.image, 'text-link');
    if (imageLink) caption.append(imageLink);
    figure.append(caption);
    const technologies = el('section', 'project-technologies'); technologies.dataset.starProtect = '';
    const techTitle = el('h2', '', 'Technologies Used'); techTitle.id = 'technologies-title';
    technologies.setAttribute('aria-labelledby', techTitle.id); technologies.append(techTitle);
    const list = el('ul', 'tech-list');
    (project.technologies || []).forEach(technology => list.append(el('li', '', technology)));
    if (list.childElementCount) technologies.append(list);
    else technologies.append(el('p', 'muted', 'Technology details are not listed for this project.'));
    const actions = el('div', 'project-detail-actions'); actions.dataset.starProtect = '';
    [externalLink('GitHub', project.githubUrl, 'button button-secondary'), externalLink('Live Demo', project.demoUrl, 'button button-primary')]
        .filter(Boolean).forEach(anchor => actions.append(anchor));
    // Source order matches the mobile reading order; desktop uses grid placement.
    layout.append(intro, figure, technologies, actions); view.append(layout);
})();
