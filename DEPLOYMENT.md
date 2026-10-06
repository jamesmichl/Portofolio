# Contact delivery — Web3Forms on Vercel

The existing Contact UI submits JSON directly from the browser to the official `https://api.web3forms.com/submit` endpoint. Web3Forms recommends client-side submission. No email SDK, custom API function, Outlook password, sending domain or Resend configuration is needed. Delivery goes to the email associated with **your Web3Forms Access Key**; confirm that the form in your Web3Forms account targets the intended inbox.

## Set your existing Access Key

1. Open your existing **Vercel project → Settings → Environment Variables**.
2. Add **`WEB3FORMS_ACCESS_KEY`**, using the real Access Key from your Web3Forms form as the value. Select **Production**. Enable Preview/Development only if those environments should use this form too.
3. Remove the obsolete **`RESEND_API_KEY`** and **`CONTACT_FROM_EMAIL`** variables from this portfolio's Vercel environments and any local environment file. They are no longer read. If your old Resend key was created solely for this portfolio, you can revoke it in Resend; keep it if another application uses it.
4. Copy the updated source into your existing repository, explicitly delete `api/contact.js`, commit and push using the commands below. Existing Vercel Git integration should deploy the new commit automatically. If you change the variable after that build, redeploy to inject its new value.
5. Keep the existing Vercel project/root directory and Node.js **22.x** settings. The build command stays **`npm run build`**, and output stays **`dist`**. The obsolete function configuration is removed; there is now only one delivery path.
6. Submit a real test from the deployed site. Check the destination inbox and Junk folder, then confirm that Reply targets the visitor's email and that the message contains their name, email and message with subject **New Portfolio Contact — [visitor name]**. Real inbox delivery is not verified until that message arrives.

**Do not paste the Access Key into chat, `index.html`, `contact.js`, `.env.example`, or any committed file.** The build reads only `WEB3FORMS_ACCESS_KEY` and safely inserts it into a hidden input in generated `dist/index.html`; the source input stays empty, and `dist/` is Git-ignored. No real key is included in the supplied source or tests.

**The deployed key is visible to visitors by design.** Web3Forms documents this as a public form identifier, not a secret API credential. A Vercel environment variable keeps it out of source control; it does not make the generated browser value private. Messages go to the form account's configured email. The visitor's `email` field supplies Reply-To automatically.

## Local development

Copy `.env.example` to `.env.local` and put your real key after `WEB3FORMS_ACCESS_KEY=` in that local file only. It is excluded from Git and deployment uploads. Node 22 loads it during the build; an existing environment variable takes precedence. Run:

```sh
npm run check
npm test
npm run build
```

Serve **`dist`**, for example `npx serve dist`, and open its localhost URL. Opening the source `index.html` directly will not inject the key. Rebuild after changing `.env.local`. A build without a key still permits visual previews but prints a warning; a valid submission without a key shows the existing error feedback without sending any request. Local submissions with a real key send **real messages**.

## Commit and push (PowerShell, from your existing repository)

After copying the updated files, remove the old function if copying did not delete it:

```powershell
if (Test-Path api/contact.js) { Remove-Item api/contact.js }
npm run check
npm test
npm run build
git add -- index.html contact.js vercel.json scripts/build.cjs scripts/check.cjs tests/contact.test.cjs tests/build.test.cjs .env.example README.md DEPLOYMENT.md
git add -u -- api/contact.js
git diff --cached --stat
git diff --cached --check
git commit -m "Replace Resend contact delivery with Web3Forms"
git push origin main
```

`git add -u -- api/contact.js` stages only the removed tracked function. Inspect the staged summary before committing; do not include unrelated work. Do not force-add `.env.local` or `dist`. No Git commit or push has been performed on your behalf.

## Behavior and verification

- Required name/email/message validation, existing length limits, name header-control checks, loading feedback, locked fields/button and in-flight duplicate prevention remain intact.
- Only `access_key`, `name`, `email`, `message`, `subject` and `botcheck` are submitted. No cookies, backend credentials, recipient override or old request IDs are sent. The existing invisible honeypot maps to Web3Forms' `botcheck` field; filled traps are rejected before fetching. Web3Forms handles provider-side validation and spam checks.
- Success requires both a successful HTTP response and `success: true`. The existing success message then displays and the visitor's fields clear. Failures, malformed responses and the existing 15-second timeout show the existing error text and preserve input. The hidden key survives a successful form reset.
- No automatic retry or invented provider idempotency guarantee. The removed Resend implementation's retry keys and per-function rate limiter no longer apply. A timeout can leave delivery uncertain; manually retrying may send another message.
- Tests use mocked Web3Forms responses and non-working local fixtures. They do not send email. There is no separate lint tool or new application dependency.
- Verification completed: `npm run check`, all ten automated form/build tests, and `npm run build` passed. Browser tests covered validation, missing configuration, sending/duplicate prevention, network/provider errors, timeout, retry and success using intercepted requests only. Before/after homepage and Contact screenshots were pixel-identical at 1440, 1024, 768, 430 and 390px, with identical measured layouts and social links. Styles, assets, unrelated scripts and visible copy are unchanged.
- **Real delivery has not been verified in this workspace.** The owner must configure the key, redeploy and confirm inbox arrival.

Official references:
- https://docs.web3forms.com/how-to-guides/html-and-javascript
- https://docs.web3forms.com/getting-started/api-reference
- https://docs.web3forms.com/getting-started/customizations/custom-reply-to
- https://docs.web3forms.com/getting-started/faq
