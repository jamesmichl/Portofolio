(() => {
    'use strict';
    const data = window.portfolioContent;
    if (!data) return;
    const byId = id => document.getElementById(id);
    const el = (tag, className, text) => {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text) node.textContent = text;
        return node;
    };
    // Content is text, not injected HTML. Only local paths and HTTPS/HTTP URLs
    // can become links or image sources; missing values produce no dead links.
    function safeUrl(value, externalOnly = false) {
        if (typeof value !== 'string' || !value.trim()) return '';
        try {
            const url = new URL(value, document.baseURI);
            if (['https:', 'http:'].includes(url.protocol)) return url.href;
            if (!externalOnly && url.protocol === 'file:' && !/^[a-z][\w+.-]*:/i.test(value)) return value;
        } catch { /* Invalid optional URL is omitted. */ }
        return '';
    }
    function link(label, url, className = 'text-link', externalOnly = true) {
        const href = safeUrl(url, externalOnly);
        if (!href) return null;
        const anchor = el('a', className, label);
        anchor.href = href;
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';
        const arrow = el('span', '', '↗'); arrow.setAttribute('aria-hidden', 'true');
        anchor.append(arrow, el('span', 'sr-only', ' (opens in a new tab)'));
        return anchor;
    }
    function chips(items, className = 'tech-list') {
        const list = el('ul', className);
        (items || []).forEach(item => list.append(el('li', '', item)));
        return list;
    }
    function highlights(items) {
        const list = el('ul', 'highlights');
        (items || []).forEach(item => list.append(el('li', '', item)));
        return list;
    }
    function image(src, alt, className, onError) {
        const img = el('img', className);
        img.alt = alt || '';
        img.loading = 'lazy';
        img.decoding = 'async';
        img.addEventListener('error', () => { img.remove(); onError?.(); }, { once: true });
        img.src = safeUrl(src);
        return img;
    }
    const resumeUrl = safeUrl(data.resumeUrl);
    if (resumeUrl) {
        byId('resume-download').href = resumeUrl;
        byId('resume-download').hidden = false;
        byId('resume-unavailable').hidden = true;
        byId('resume-status').textContent = 'PDF résumé';
    }

    (data.education || []).forEach(record => {
        const article = el('article', 'education-entry');
        article.append(el('h4', 'education-school', record.institution), el('p', 'education-program', record.program));
        if (record.specialization) {
            const detail = el('dl', 'education-detail');
            detail.append(el('dt', '', 'Specialization'), el('dd', '', record.specialization));
            article.append(detail);
        }
        if (record.dates) article.append(el('p', 'record-dates', record.dates));
        byId('education-list').append(article);
    });
    (data.skills || []).forEach(group => {
        const article = el('div', 'skill-group');
        article.dataset.starProtect = '';
        const symbol = el('span', 'skill-symbol', group.symbol || '</>'); symbol.setAttribute('aria-hidden', 'true');
        article.append(symbol, el('h3', '', group.title), chips(group.items, 'skill-list'));
        byId('skills-grid').append(article);
    });
    (data.experience || []).forEach(record => {
        const article = el('article', 'experience-entry'); article.dataset.starProtect = '';
        const heading = el('div');
        if (record.type) heading.append(el('p', 'section-kicker', record.type));
        heading.append(el('h3', '', record.role), el('p', 'experience-organization', record.organization));
        if (record.dates) heading.append(el('p', 'record-dates', record.dates));
        const body = el('div');
        if (record.description) body.append(el('p', 'experience-description', record.description));
        if (record.highlights?.length) body.append(highlights(record.highlights));
        article.append(heading, body);
        byId('experience-list').append(article);
    });
    byId('experience').hidden = !data.experience?.length;

    const dialog = byId('detail-dialog');
    let dialogOpener;
    function openDetails(opener, content) {
        dialogOpener = opener;
        byId('detail-content').replaceChildren(content);
        dialog.showModal();
        document.body.classList.add('modal-open');
        dialog.scrollTop = 0;
    }
    dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
        const box = dialog.getBoundingClientRect();
        if (event.target === dialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) dialog.close();
    });
    dialog.addEventListener('close', () => {
        document.body.classList.remove('modal-open');
        dialogOpener?.focus({ preventScroll: true });
    });
    function detailHeading(title, kicker) {
        const content = el('div');
        if (kicker) content.append(el('p', 'section-kicker', kicker));
        const heading = el('h2', '', title); heading.id = 'detail-title'; content.append(heading);
        return content;
    }
    (data.projects || []).forEach(project => {
        const card = el('article', 'project-card'); card.dataset.starProtect = '';
        const visual = el('div', 'project-visual');
        const style = ['mobile', 'screenshot', 'illustration'].includes(project.visualStyle) ? project.visualStyle : 'screenshot';
        visual.classList.add(`project-visual--${style}`);
        if (project.slug) visual.dataset.project = project.slug;
        if (safeUrl(project.image)) {
            visual.append(image(project.image, project.imageAlt || `${project.title} preview`, '', () => {
                visual.replaceChildren(el('span', 'project-visual-fallback', 'Preview unavailable'));
            }));
            if (style === 'mobile') {
                const label = el('div', 'mobile-visual-copy'); label.setAttribute('aria-hidden', 'true');
                label.append(el('span', '', project.title), el('span', '', project.shortDescription)); visual.append(label);
            }
        } else visual.append(el('span', 'project-visual-fallback', 'Preview to be added'));
        const body = el('div', 'project-body');
        body.append(el('h3', '', project.title), el('p', 'project-description', project.shortDescription));
        const actions = el('div', 'project-actions');
        const details = el('a', 'text-link', 'View details');
        details.href = `project.html?project=${encodeURIComponent(project.slug)}`;
        details.id = `project-link-${project.slug}`;
        details.setAttribute('aria-label', `View ${project.title} details`);
        const arrow = el('span', '', '↗'); arrow.setAttribute('aria-hidden', 'true'); details.append(arrow);
        actions.append(details);
        body.append(actions); card.append(visual, body); byId('projects-grid').append(card);
    });

    const certificates = data.certificates || [];
    let certificateCount = 0;
    function certificateDetails(certificate, opener) {
        const content = detailHeading(certificate.fullTitle || certificate.title, certificate.category || 'Certificate');
        content.append(el('p', 'certificate-meta', [certificate.issuer, certificate.date].filter(Boolean).join(' · ')));
        if (certificate.distinction) content.append(el('p', 'certificate-distinction', certificate.distinction));
        if (certificate.details) content.append(el('p', 'certificate-details', certificate.details));
        const source = certificate.image || certificate.thumbnail;
        if (safeUrl(source)) content.append(image(source, certificate.imageAlt || certificate.title, 'detail-image', () => {
            content.append(el('p', 'detail-body', 'The certificate preview is unavailable.'));
        }));
        if (certificate.credentialId) content.append(el('p', 'certificate-meta', `${certificate.credentialLabel || 'Credential ID'}: ${certificate.credentialId}`));
        const actions = el('div', 'detail-actions');
        [link('Open original PDF', certificate.pdfUrl, 'button button-secondary', false), link('View credential', certificate.credentialUrl), link('Open full image', source, 'text-link', false)].filter(Boolean).forEach(a => actions.append(a));
        content.append(actions); openDetails(opener, content);
    }
    function renderCertificates() {
        const start = certificateCount;
        certificates.slice(start, start + 3).forEach(certificate => {
            const card = el('article', 'certificate-card'); card.dataset.starProtect = '';
            const preview = el('div', 'certificate-preview');
            const source = certificate.thumbnail || certificate.image;
            const fallback = () => preview.append(el('span', '', 'Preview unavailable'));
            if (safeUrl(source)) preview.append(image(source, certificate.imageAlt || certificate.title, '', fallback)); else fallback();
            const body = el('div', 'certificate-body');
            if (certificate.category) body.append(el('p', 'section-kicker', certificate.category));
            body.append(el('h3', '', certificate.title), el('p', 'certificate-meta', [certificate.issuer, certificate.date].filter(Boolean).join(' · ')));
            if (certificate.distinction) body.append(el('p', 'certificate-distinction', certificate.distinction));
            const button = el('button', 'text-link', 'View certificate ↗'); button.type = 'button';
            button.setAttribute('aria-label', `View certificate: ${certificate.title}`);
            button.setAttribute('aria-haspopup', 'dialog');
            button.addEventListener('click', () => certificateDetails(certificate, button));
            body.append(button); card.append(preview, body); byId('certificates-grid').append(card);
            certificateCount++;
        });
        byId('certificates-more').hidden = certificateCount >= certificates.length;
        if (certificates.length) byId('certificates-count').textContent = `Showing ${certificateCount} of ${certificates.length} certificates`;
        if (start) {
            // Keep keyboard/touch focus at the newly revealed content, even when
            // the Show more control disappears after the final batch.
            byId('certificates-grid').children[start]?.querySelector('button').focus({ preventScroll: true });
        }
    }
    byId('certificates-empty').hidden = Boolean(certificates.length);
    byId('certificates-more').addEventListener('click', renderCertificates);
    renderCertificates();
})();
