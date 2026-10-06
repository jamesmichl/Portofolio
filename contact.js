/* Same-origin Contact client. All delivery credentials stay in api/contact.js. */
(() => {
    'use strict';
    const form = document.getElementById('contact-form');
    if (!form) return;
    const submit = document.getElementById('contact-submit');
    const status = document.getElementById('contact-status');
    const fields = ['name', 'email', 'message'].map(name => form.elements.namedItem(name));
    const endpoint = '/api/contact';
    const EMAIL = /^(?!\.)(?![^@]*\.\.)[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]*[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    let requestId = '';
    let sending = false;
    function setState(state, message = '') {
        form.dataset.state = state;
        status.textContent = message;
    }
    function validate(field) {
        const value = field.value.trim();
        let error = '';
        if (!value) error = `Please enter your ${field.name}.`;
        else if (field.name === 'email' && (field.validity.typeMismatch || !EMAIL.test(value))) error = 'Please enter a valid email address.';
        else if (field.name === 'name' && /[\x00-\x1f\x7f]/.test(value)) error = 'Please enter a valid name.';
        else if (value.length > field.maxLength) error = `Please use ${field.maxLength} characters or fewer.`;
        document.getElementById(`${field.id}-error`).textContent = error;
        if (error) field.setAttribute('aria-invalid', 'true'); else field.removeAttribute('aria-invalid');
        return !error;
    }
    fields.forEach(field => {
        field.addEventListener('blur', () => { if (field.value || field.hasAttribute('aria-invalid')) validate(field); });
        field.addEventListener('input', () => {
            if (!sending) requestId = '';
            if (field.hasAttribute('aria-invalid')) validate(field);
            if (!sending && ['success', 'error', 'invalid'].includes(form.dataset.state)) setState('idle');
        });
    });
    submit.disabled = false;
    setState('idle');
    form.addEventListener('submit', async event => {
        event.preventDefault();
        if (sending) return;
        const validity = fields.map(validate);
        if (validity.includes(false)) {
            setState('invalid', 'Please check the highlighted fields.');
            fields[validity.indexOf(false)].focus();
            return;
        }
        sending = true;
        submit.disabled = true;
        submit.textContent = 'Sending…';
        form.setAttribute('aria-busy', 'true');
        fields.forEach(field => { field.readOnly = true; });
        setState('sending', 'Sending your message…');
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        try {
            // Keep the key for an unchanged retry after a lost response; Resend
            // deduplicates it server-side. Editing any field starts a new request.
            requestId ||= crypto.randomUUID();
            const payload = {
                name: fields[0].value.trim(), email: fields[1].value.trim(),
                message: fields[2].value.trim(), website: form.elements.namedItem('website').value,
                requestId
            };
            const response = await fetch(endpoint, {
                method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
                body: JSON.stringify(payload), signal: controller.signal,
                credentials: 'same-origin'
            });
            const result = await response.json();
            // Only an affirmative response is success. Never simulate delivery.
            if (!response.ok || result.ok !== true) throw new Error('Submission was not accepted');
            form.reset();
            requestId = '';
            setState('success', "Message sent successfully. I'll get back to you soon.");
        } catch {
            setState('error', 'Something went wrong while sending your message. Please try again or contact me directly by email.');
        } finally {
            clearTimeout(timeout);
            sending = false;
            submit.disabled = false;
            submit.replaceChildren(document.createTextNode('Send Message '));
            const arrow = document.createElement('span'); arrow.textContent = '↗'; arrow.setAttribute('aria-hidden', 'true'); submit.append(arrow);
            form.removeAttribute('aria-busy');
            fields.forEach(field => { field.readOnly = false; });
        }
    });
})();
