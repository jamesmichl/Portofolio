# Contact email delivery — Vercel + Resend

The frontend remains vanilla HTML/CSS/JavaScript. `POST /api/contact` is a Vercel Node.js function using native `fetch` to Resend; no email SDK or runtime dependency is installed. The recipient is fixed on the server as **james.lionel@binus.ac.id**. The visitor cannot change it. Resend was chosen for its small HTTPS API, verified senders, Reply-To support and idempotency protection.

**Implementation and mocked tests are complete. Real email delivery is not configured or inbox-verified.** No account, DNS records, API credential or sender address has been invented. A successful API response means Resend accepted the message, not proof that Outlook delivered it to the inbox.

## Owner setup

1. Create an account at https://resend.com/.
2. In **Domains**, add a domain or subdomain you control. Add the exact DNS verification records Resend supplies at your DNS provider, then wait for **Verified**. You need DNS control; a Vercel-provided `vercel.app` address or the university's `binus.ac.id` domain cannot be used as your verified sender without the domain owner's control/authorization. The recipient can still be the BINUS address.
3. In **API Keys**, create a **Sending access** key restricted to that verified domain. Copy it privately. Set `RESEND_API_KEY` to this actual key.
4. Choose a sender mailbox/address on the verified domain. Set `CONTACT_FROM_EMAIL` to that bare email address, without a display name. This is the From address; the form visitor's email becomes **Reply-To**. No university password is needed.
5. Import this project into Vercel, with **Root Directory** pointing to the `portfolio` folder (or repository root if its contents are at root). Use **Other** as framework and Node.js **22.x**. Keep the included `vercel.json`: `npm run build`, output `dist`, plus the automatically deployed `api/contact.js` function. Deploying `dist` alone to a static host does **not** deploy email delivery.
6. In the Vercel project, open **Settings → Environment Variables**. Add `RESEND_API_KEY` and `CONTACT_FROM_EMAIL` for **Production**. Add them to **Preview** only if you want preview deployments to send real mail; use Development as needed locally. Mark the API key sensitive where supported. Do not use client-public prefixes or enter secrets in `content.js`. Redeploy after saving/changing values.
7. Submit one real message from the deployed HTTPS form. Check Resend's email log and the **james.lionel@binus.ac.id** inbox/Junk folder. Verify sender name, sender email, message, subject `Portfolio Contact — [Sender Name]`, and that **Reply** targets the submitted email. Only after the message actually arrives is real delivery verified. If Resend reports accepted/delivered but Outlook filters it, inspect DNS authentication and university mail filtering with the relevant administrators.

## Local development and checks

Use Node.js 22. There are no application dependencies to install.

```sh
npm run check
npm test
npm run build
```

There is no separate lint tool configured. `check` syntax-checks browser scripts, function, build/check scripts and tests. `test` uses Node's test runner with mocked Resend responses, never a live email. `build` copies an explicit public-file allowlist into `dist`; credentials, backend, tests and documentation stay out of public static output.

For a working local function, run `npx vercel dev` from this folder and link the Vercel project when prompted. Copy `.env.example` to `.env.local` and fill the two real values, or run `npx vercel env pull .env.local` after setting Development variables in Vercel. Restart the dev server after changing variables. Keep `.env.local` private; it is excluded from Git, deployment uploads and static output. Local submissions with real credentials send **real emails**. A plain static server/file preview supports the design only; Contact requires the function.

## Behavior and protection

- Client and server require name, valid email and message; limits are 100, 254 and 5,000 characters. Server also enforces JSON, a 32 KiB body limit, types and safe header values.
- POST and same-origin requests only; no permissive CORS. Offscreen non-focusable honeypot, fixed recipient, bounded per-instance hashed-IP limit (five validated attempts per ten minutes), no message-content logging or browser storage.
- The rate limiter is deliberately lightweight and **not a global distributed quota**: cold starts/multiple function instances reset or split limits. Same-origin checks and honeypots deter simple automated abuse but do not authenticate visitors. If abuse occurs, configure a persistent rate-limit rule for `/api/contact` in Vercel Firewall as supported by your plan; no extra service is necessary for this initial implementation.
- Sending locks the fields/button; duplicate submits are ignored. Successful provider acceptance clears inputs; every error or timeout keeps them. Server provider timeout is 10 seconds; client timeout is 15 seconds. No automatic retry.
- Unchanged retries reuse a request ID and payload hash; Resend's idempotency window is 24 hours. Editing a field, reloading the page or retrying after that window starts a new submission and can send another message.
- Missing configuration returns a generic error, never fake success. Provider details/secrets stay server-side. No Outlook/BINUS credentials are required.

Official references: https://vercel.com/docs/functions/runtimes/node-js · https://vercel.com/docs/environment-variables · https://resend.com/docs/api-reference/emails/send-email · https://resend.com/docs/dashboard/domains/introduction · https://resend.com/docs/dashboard/api-keys/introduction
