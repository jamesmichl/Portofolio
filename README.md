# James Michael Lionel — portfolio

A dependency-free HTML/CSS/JavaScript portfolio with a Vercel Node.js Contact function. Static previews work with any web server; real email delivery requires the backend and two server-only environment variables. See [DEPLOYMENT.md](DEPLOYMENT.md) for current setup and verification. Keep file paths case-sensitive when deploying.

## Files

- `index.html`: page structure, existing Hero, About copy, contact channels, accessible navigation, shared detail dialog, no-JavaScript fallback.
- `style.css`: design tokens, established Hero styles, all section layouts, responsive breakpoints, interaction states and reduced-motion rules.
- `content.js`: **the editable data source** for projects, certificates, skills, education, experience, CV URL.
- `content-renderer.js`: renders the profile, project cards, certificate batches and certificate modal. Uses text nodes rather than inserting content as HTML.
- `project.html`, `project.js`, `project.css`: shared static detail-page template, data renderer and scoped responsive styling. URLs use `project.html?project=SLUG`; no server routing or build step is needed.
- `script.js`: shared mobile navigation, active section tracking, header sizing and accessible Portfolio tabs. It also handles navigation on dedicated project pages.
- `hero-motion.js`: the timed interest phrase, reduced-motion handling and offscreen animation pause. Lanyard keyframes live in `style.css`.
- `atmosphere.js`: layout-aware stars and occasional shooting stars. No particle library.
- `contact.js`: contact validation, submission states, and same-origin `/api/contact` transport.
- `api/contact.js`: server validation, lightweight abuse protection and Resend delivery.
- `vercel.json`, `package.json`, `scripts/`, `tests/`: deployment, static build, syntax checks and mocked backend tests.
- `DEPLOYMENT.md`, `.env.example`: exact owner setup and blank server environment-variable template.
- `assets/certificates/`: seven unchanged original PDFs, full-size WebP renders and smaller card thumbnails.
- `assets/projects/`: six supplied visuals, copied without altering their pixels. `foto-james.png` remains the Hero portrait. The unused legacy `Logos.jpeg` was removed during production cleanup.

## Edit project data

Edit `window.portfolioContent.projects` in **content.js**. Add one object and, if available, its image. No card markup or rendering code changes are required.

```js
{
    title: '',
    slug: '', // Required unique URL key, e.g. 'vigileye'
    fullTitle: '', // Optional longer research/project name, shown in details
    type: 'Personal', // 'Personal' or 'Group'
    area: '', // A factual short category, e.g. Computer vision
    shortDescription: '',
    description: '', // Longer description shown in View details
    technologies: [], // Verified technologies only
    image: '', // Local image path, e.g. assets/projects/project-name.webp
    imageAlt: '',
    visualStyle: 'screenshot', // screenshot, illustration, or mobile
    imageNote: '', // Optional caption clarifying illustrative artwork
    githubUrl: '',
    demoUrl: '',
    highlights: [],
    contribution: '', // Especially useful for group projects
    status: ''
}
```

Empty values stay out of the UI. Cards retain their approved visual, title, subtitle and View details link. Project order, card dimensions and styling are unchanged. Metadata, technology chips and external links appear only on the dedicated page. A missing or invalid project slug gets a clear fallback and a working Portfolio link.

### Dedicated project pages

Each card navigates to `project.html?project=<slug>`. The page reads the selected entry from the same `content.js` data. It sets the document title, description, breadcrumb and project content. Normal document links support direct loading, refresh, new tabs, browser Back/Forward and normal history scroll restoration without a router. The visible Back to Portfolio and breadcrumb links always return to `index.html#projects`, selecting the Projects tab. The existing certificate dialog is preserved separately.

On desktop the description, metadata, technologies and actions are on the left, with the original full image on the right. Tablet keeps the introductory columns while technologies and actions use the full width below. Mobile source order is title/description/metadata → visual → technologies → actions. Images remain undistorted and have a full-size link. External links open in a new tab with `noopener noreferrer`, an arrow and assistive text. No project-detail modal, case-study filler, results claims or new entrance animation is added.

The six entries follow the supplied order: VigilEye (personal), Trimly (personal), BlurIn (group), MoodWatch (group), Early Diabetes Detection (group), LastBite (group). Descriptions, categories and URLs follow the supplied brief. Every project has a GitHub link; only Trimly, BlurIn and MoodWatch have Live Demo links. LastBite retains the supplied concept description. Per-project technologies were verified from the actual public repositories in this pass; the main Skills section was not changed.

### Banner framing

All six original PNG files are byte-identical to the supplied assets. Each card keeps the same 3:2 preview container and equal grid height. Framing is keyed by project slug in `style.css` using `data-project`, so project order does not determine the crop. The detail-page visual remains the full image, not the cropped thumbnail.

| Project | Asset in `assets/projects/` | Card framing |
| --- | --- | --- |
| VigilEye | `vigileye-cover.png` | Original contained scale preserved |
| Trimly | `trimly-screenshot.png` | 154% width, left aligned, vertical offset removes top/navigation whitespace; retains hero text and booking buttons |
| BlurIn | `blurin-screenshot.png` | 131% width (132% on mobile), horizontal/top offsets retain title, both input panels and processing action |
| MoodWatch | `moodwatch-results.png` | 123% width with slight left offset; trims excess right space while retaining the query, keywords, results, both pack headings and movie posters |
| Early Diabetes Detection | `diabetes-cover.png` | Original contained scale preserved |
| LastBite | `lastbite-mobile.png` | Existing navy/green landscape composition; unstretched phone raised from 88% to 94% of the frame height |

Illustration captions distinguish the artwork's example charts/interface values from verified results. No UI has been regenerated or altered. On very small thumbnails, fine application text naturally needs the full-size visual to read comfortably; important content is preserved in the crop.

### Verified Technologies Used

Checked against publicly accessible repository files on 5 October 2026. Dependencies and source imports are evidence of project technology, not a claim about James's individual contribution or proficiency. No repository code was executed. Only a concise selection of verified main technologies is displayed; transitive dependencies and routine utilities are omitted.

| Project | Displayed technologies | Evidence inspected |
| --- | --- | --- |
| VigilEye | Python, OpenCV, MediaPipe, NumPy, Pygame | `requirements.txt`; `main.py` imports OpenCV; `detector.py` imports OpenCV/MediaPipe/NumPy; `alarm.py` imports Pygame; README stack |
| Trimly | TypeScript, Next.js, React, Tailwind CSS, Prisma, PostgreSQL, Better Auth | `package.json`; `src/app/globals.css` imports Tailwind; `prisma/schema.prisma` declares PostgreSQL; `src/lib/auth.ts` uses Better Auth/Prisma |
| BlurIn | Python, Streamlit, OpenCV, NumPy, FFmpeg | `requirements.txt`; `app.py` imports those libraries and calls `imageio_ffmpeg.get_ffmpeg_exe()` |
| MoodWatch | Python, Streamlit, pandas, scikit-learn, Google Gemini, Optuna | `requirements.txt`; `app.py` imports Streamlit/pandas/scikit-learn and configures a Gemini model; `movie_recommender.ipynb` imports and uses Optuna |
| Early Diabetes Detection | Python, scikit-learn, XGBoost, LightGBM, CatBoost, Optuna, SHAP | `main.ipynb` imports the corresponding libraries and model classes |
| LastBite | TypeScript, React Native, Expo, Node.js, Express, MySQL | `LastBite_App/package.json` and `src/app/home.tsx`; `backend/package.json`, `backend/index.js`, `backend/src/config/db.js` (`mysql2/promise`) |

Repository evidence links:

- VigilEye: https://github.com/jamesmichl/VigilEye/blob/main/requirements.txt
- Trimly: https://github.com/jamesmichl/Trimly/blob/main/package.json and https://github.com/jamesmichl/Trimly/blob/main/prisma/schema.prisma
- BlurIn: https://github.com/jamesmichl/BlurIn/blob/main/requirements.txt and https://github.com/jamesmichl/BlurIn/blob/main/app.py
- MoodWatch: https://github.com/jamesmichl/MoodWatch----Movie-Recommendation-System/blob/main/requirements.txt and https://github.com/jamesmichl/MoodWatch----Movie-Recommendation-System/blob/main/movie_recommender.ipynb
- Early Diabetes Detection: https://github.com/jamesmichl/Comparative-Analysis-of-Ensemble-Learning-for-Early-Diabetes-Detection/blob/main/main.ipynb
- LastBite: https://github.com/jamesmichl/LastBite/blob/main/LastBite_App/package.json and https://github.com/jamesmichl/LastBite/blob/main/backend/package.json

No additional individual responsibilities, performance numbers, dates, achievements, deployment URLs, or screenshots were inferred from these sources. The missing detail-page reference image was not supplied with this pass; the written information hierarchy guided the implementation.

## Certificates

Seven real certificates from the supplied ZIP are published in relevance order. Original PDFs are copied byte-for-byte; previews are page-one rasterizations, with 1600px full images and 720px thumbnails encoded as WebP. There are no generated or retouched certificate contents. Cards use uncropped, proportional previews and short metadata; the native dialog supplies larger previews, exact course details, and **Open original PDF** / **Open full image** links in new tabs for closer inspection.

| Certificate | Issuer shown | Verified details |
| --- | --- | --- |
| Databases for Developers: Foundations | Oracle Corporation · Dev Gym | Certificate of Excellence; grade 99%; taught by Chris Saxon; no supplied date or ID |
| Mobile Development | BNCC · BINUS University | Certificate of Completion; class of 2024/2025; Low Distinction |
| UI/UX | BNCC · BINUS University | Certificate of Completion; class of 2024/2025; Low Distinction |
| BNCC HRD Activist 2024/2025 | Bina Nusantara Computer Club Bandung | Contribution and participation as Activist of Human Resource Development during academic year 2024/2025 |
| Beyond the Earth: Computer Science in the Space Age | BINUS University · School of Computer Science | Participant; 22 November 2024 |
| Professional Office — C1.2 | BINUS University · Beelingua | Full course: Professional Office (V2) (CEFR C1.2); passing grade; issued September 2025 |
| Market Research & Business Communication — C2.2 | BINUS University · Beelingua | Full course: Market Research & Business Communication (V2) (CEFR C2.2); passing grade; issued October 2025 |

Certificate numbers/IDs appear only in the detailed view where actually printed. BNCC certificate numbers are reproduced as written, including the identical number on the two course certificates. No issue dates are inferred from those numbers. CEFR labels describe the supplied courses, not a separately verified proficiency claim. The HRD certificate is not expanded into invented responsibilities in Experience; no new programming technologies are inferred from certificate titles.

Edit `window.portfolioContent.certificates` in **content.js** to maintain the collection:

```js
{
    title: '', // Concise card title
    fullTitle: '', // Optional exact longer course name for the dialog
    issuer: '',
    date: '', // Only a date visibly supplied by the document
    distinction: '', // Only a grade/distinction printed on the certificate
    details: '', // Verified course, participation or completion information
    image: '', // Readable rendered image
    thumbnail: '', // Smaller card preview
    pdfUrl: '', // Original PDF, never an unrelated document
    imageAlt: '',
    credentialUrl: '', // Optional authentic verification page
    credentialId: '',
    credentialLabel: '', // Optional "Certificate number" instead of "Credential ID"
    category: ''
}
```

Certificates render in batches of three. Show more reveals the next batch and focuses its first View certificate button; the counter is announced for screen readers. The native modal supports Escape, focus containment and restoration to the opener. All seven original PDF links remain available without JavaScript. Keep that fallback in `index.html` aligned if changing the collection. Unknown fields are omitted and the empty state appears only if the array is empty.

## Add the real CV

1. Create `assets/` if needed.
2. Place your final PDF at **assets/James-Michael-Lionel-CV.pdf**.
3. Set `resumeUrl: 'assets/James-Michael-Lionel-CV.pdf'` in **content.js**.
4. Test the download on the deployed website.

Until then the Download CV control stays disabled, with a visible “Résumé in preparation” label. No PDF or dummy document is included.

## Skills, education and experience

Edit the corresponding arrays in **content.js**:

- `skills`: `{ title, symbol, items: [] }`. The current 13 items come from the existing portfolio; the two requested removals are excluded from the data and no-JavaScript fallback. There are no proficiency levels. Revisit the list when project source files are supplied; do not infer technologies from project names.
- `education`: `{ institution, program, specialization, dates }`. Only BINUS University / Computer Science / Intelligence System is currently supplied. Dates, degree title and GPA are intentionally omitted.
- `experience`: `{ role, organization, type, dates, description, highlights: [] }`. The array is empty because the source portfolio contained no factual entries. The section becomes visible automatically when populated. It is placed with the profile below Skills and is accessible via `#experience`; About remains its primary navigation group.

The main Hero and About prose remain in `index.html` so they are readable without JavaScript. Static no-JavaScript summaries are also in that file; if you materially change facts in the data, update those fallback summaries too. Normal project/certificate/skill additions require only editing `content.js` and adding images where needed.

## Contact and navigation

Four explicit, user-supplied destinations live directly in `index.html` and remain available without JavaScript:

- Email: `mailto:james.lionel@binus.ac.id`
- Instagram: `https://www.instagram.com/jamesmichl_?stkn=dm9idTRrd3c0YnNw`
- LinkedIn: `https://www.linkedin.com/in/james-michael-lionel`
- GitHub: `https://github.com/jamesmichl`

Lightweight inline SVG icons use a shared 20px size, stroke and accent color; no icon package, remote PNG or external script is required. Accessible names describe each destination. Social links use `target="_blank" rel="noopener noreferrer"`; the separate email link opens an email client and is never used to submit the form. The existing Contact composition and responsive ordering are preserved.

### Contact delivery setup (required before live delivery)

The current implementation uses **Vercel Functions + Resend**, replacing the former unconfigured Formspree adapter. See [DEPLOYMENT.md](DEPLOYMENT.md) for all steps, protection limits and testing instructions. Required server-only variables are `RESEND_API_KEY` and `CONTACT_FROM_EMAIL`; the sender must belong to a verified domain you control. The recipient is fixed as **james.lionel@binus.ac.id**, with the visitor's address as Reply-To. No secrets belong in browser scripts.

The form supports idle, validation error, sending, success and submission error. It prevents duplicate submissions, keeps input after failure, and clears only after provider acceptance. Missing configuration produces an honest error. No real email has been delivered or inbox-verified during this implementation.

## Portfolio categories and Hero motion

The Portfolio selector uses native buttons enhanced with `tablist`, `tab` and `tabpanel` roles, `aria-selected`, linked labels and roving keyboard focus. Left/Right arrows, Home and End switch categories. Both mouse and touch work without hover. Only the selected panel is visible, with a brief opacity transition and no delayed content access. Existing `#projects` / `#certificates` links still choose the correct category and bring the selector into view. `#portfolio` is the navbar destination. Without JavaScript, both sections remain readable and the tab controls are hidden.

The Hero uses “Hi, I'm” and “James.”; the formal name appears with the supplied About copy. The lanyard strap, connector and photo badge share one transform parent. A 23-second CSS keyframe sequence varies small rotations and translations with a near-still interval. The maximum sway is 1 degree on desktop, 0.7 on tablet and 0.45 on mobile. There is no dragging, cursor tracking or physics dependency.

“Interested in” stays fixed. Three overlapping grid items reserve the size of the longest phrase, so switching cannot move the buttons or change the Hero height. A small timer cycles Computer Vision → Software Engineering → Intelligence System every 4.4 seconds, using a 260ms fade and 3px shift. Assistive technology receives one stable sentence listing all three interests instead of repeated live announcements. Reduced motion shows Computer Vision statically, with all three still available to assistive technology. Offscreen/hidden-tab rotation and lanyard animation pause.

## Atmosphere and accessibility

Stars occupy measured empty regions and stay clear of text, cards, controls and the lanyard's movement envelope. Up to 54 points per section on desktop, 36 on tablet and 22 on mobile, further limited by area. Points are 1.15–2.55px, with varied soft white/cool blue tones and 45–80% opacity (slightly lower outside the Hero). A small subset slowly twinkles at different speeds; offscreen/hidden-tab twinkles pause.

Shooting-star events are attempted every 3.4–7 seconds. Most are single trails; around 30% of events may add one or two staggered trails with different positions, 12–30 degree trajectories, lengths, brightness and 650–1050ms durations. Desktop allows no more than three simultaneous trails; mobile allows one at a time and staggers occasional follow-up trails further apart. Every full swept path must fit a clear visible region. Crowded events are skipped. No library or continuous JavaScript animation loop is involved.

Reduced motion disables lanyard sway, interest rotation, twinkling, shooting stars and transitions. Hidden tabs cancel shooting/burst timers. Decorative layers ignore pointer events and are hidden from assistive technology. The native certificate dialog retains keyboard containment, Escape and focus restoration. Dedicated project pages reuse the same atmosphere script and reduced-motion behavior.

## Verification and remaining content

The implementation was checked in Chromium at 320, 360, 390, 430, 441, 600, 700, 701, 768, 900, 1024, 1100, 1366, 1440 and 1920 pixels. Checks covered both categories, all three interest phrases, overflow, anchors, keyboard and mobile navigation, image loading, star exclusion zones, the unavailable CV state and no-JavaScript fallback. Timed checks exercised interest rotation, occasional desktop bursts, the one-trail mobile limit and live reduced-motion changes. Temporary test data exercised project/certificate dialogs, certificate batches, future experience and CV activation; it is not included in this project.

Before publication, manually verify on your own Safari/iOS and Android devices and confirm the real email and GitHub destination. Still needed: any further project source details and verified individual contributions, fuller factual experience (if desired), the final CV PDF, and contact delivery configuration described above. The seven certificate documents and all four Contact destinations are now supplied. Check new images, credentials and the CV download on the deployed host after supplying them.

## Historical completion notes

The following records describe earlier revisions. Their Formspree/unavailable-form statements are superseded by the Vercel + Resend implementation and DEPLOYMENT.md above.

## Completion check — 5 October 2026

The interrupted refinement was audited against `Pasted text(6).txt`. All requested features were already present in the working source: the two Portfolio categories and four-link navbar, the connected lanyard with automatic sway, all three rotating interests, the concise Hero name, exact About copy and full name, skill removals, and brighter stars with occasional bursts. This continuation removed redundant CSS, disabled native photo dragging and completed verification without redesigning those features.

The responsive checks passed at all 15 widths listed above, including both Portfolio categories, keyboard and touch-sized controls, fixed interest layout, image loading, old category anchors and future-content dialogs. Desktop and mobile timed checks completed full interest cycles, confirmed bounded bursts and clear trail paths, and verified reduced-motion and offscreen pause behavior. No console errors or broken image requests were detected. Physical-device Safari/iOS and Android checks remain recommended before publication.

## Projects and Contact completion — 5 October 2026

The six supplied projects and visuals replace the earlier three-project placeholders. Home, About, navbar, typography, lanyard, atmosphere, certificates, education and skills were preserved. Contact now has a responsive labeled form and restrained Find me area. No build tooling, packages or external scripts were added.

Responsive QA covered 320, 360, 390, 430, 600, 700, 768, 900, 1024, 1100, 1101, 1280, 1440 and 1920px. Checks cover six dialogs per viewport, image loading/aspect ratios, equal card heights, grid breakpoints, overflow, accessible external links, Escape/focus restoration, tabs, unchanged Hero/skills, input target sizes and no-JavaScript fallback. Form tests intercept all requests and cover required/invalid fields, sending/duplicate prevention, provider/network errors, false-success responses, timeout, retry and confirmed success. Real Outlook delivery is pending owner configuration and a live test.

## Dedicated details and banner QA — 5 October 2026

This pass normalizes only the six banner crops and replaces the project modal with a dedicated static detail page. Main-page HTML, Home, About, Contact logic, image files, Hero motion and atmosphere code remain unchanged. The Contact architecture and configuration instructions above still apply: the endpoint is empty, delivery is disabled, and Outlook delivery has not been tested or activated.

Responsive QA covers 320, 360, 390, 430, 600, 700, 701, 768, 900, 1024, 1100, 1101, 1200, 1366, 1440 and 1920px. Checks include crop focal points, identical preview ratios, all six detail pages, text/chip wrapping, mobile order, external links, touch targets, direct URL/reload, browser Back/Forward and scroll restoration, explicit return links, mobile navigation, invalid project URLs, certificate-modal preservation, Contact states using mocked requests, and reduced motion. No live email or other person-directed message was sent. Physical Safari/iOS/Android checks and a deployed Outlook delivery test remain unperformed.

## Continuation audit and completion — 6 October 2026

The interrupted files were inspected before changes. The six banner crops, dedicated project pages, verified technology chips, GitHub/demo links, certificate metadata/rendering, four Contact SVG links, complete Formspree frontend, subject field and setup instructions had survived. No whole feature needed rebuilding.

Two certificate assets were incomplete: `mobile-development.pdf` was truncated and `professional-office-thumb.webp` could not decode. The PDF was restored byte-for-byte from the supplied ZIP; the thumbnail was restored from the complete certificate render. All seven published PDFs now match their original ZIP entries, and all raster images fully decode. Visual QA also found certificate preview clipping caused by intrinsic image sizing in the aspect-ratio container. The preview image now fills a positioned box with `object-fit: contain`, preserving the entire document at every width.

### Requirement status

| Requirement | At continuation start | Final status |
| --- | --- | --- |
| Six project banners | Complete | Preserved; unchanged 3:2 containers and project-specific crops verified |
| Six dedicated detail pages | Complete | Preserved; back/breadcrumb, metadata, full visuals, technologies and links verified |
| Verified technologies | Complete | Existing repository evidence rechecked; see per-project table above |
| GitHub and Live Demo links | Complete | Six GitHub links; only Trimly, BlurIn and MoodWatch have demos |
| Seven selected certificates | Partially complete | Two damaged files repaired; full preview containment fixed; all seven card/modal/PDF paths verified |
| Four Contact destinations and icons | Complete | Exact supplied URLs, inline SVGs, labels and secure external-link attributes verified |
| Contact form frontend/integration adapter | Complete | All requested states, payload, duplicate guard and failure preservation verified with intercepted requests |
| Actual email delivery | Not configured | Still requires owner Formspree account/form and verified recipient; no real message sent |
| Responsive/interaction QA | Incomplete for new certificate/Contact work | Completed across 16 widths, including visual desktop/tablet/mobile review |
| Updated package and final report | Missing | Updated source package, previews and this completion record prepared |

### Exact files changed in this continuation

- `style.css`: certificate preview containment only.
- `assets/certificates/mobile-development.pdf`: replaced the truncated copy with the exact supplied original.
- `assets/certificates/professional-office-thumb.webp`: repaired the damaged thumbnail.
- `README.md`: this audit, repair log and final verification status.

No other application source file changed in this continuation. The previous interrupted pass had already changed `index.html`, `content.js`, `content-renderer.js`, `contact.js`, `style.css` and `README.md`, and created the 21 files in `assets/certificates/` (seven PDFs, seven full previews, seven thumbnails). Dedicated detail files were already implemented before that pass.

Temporary QA scripts/results remain outside the deployable portfolio. This continuation corrected the certificate test's same-URL reload assumption, waited for browser intersection callbacks in the motion test, and added full-image containment assertions. These test-harness fixes do not change website behavior.

### Final QA results

Chromium checks passed at **320, 360, 390, 430, 600, 700, 701, 768, 900, 1024, 1100, 1101, 1200, 1366, 1440 and 1920px**. Tests covered all six banner focal areas and identical ratios, all six detail pages, titles/chips/actions, mobile reading order, browser Back/Forward/reload, breadcrumbs, mobile navigation, invalid project routes, seven certificates per viewport, 3/6/7 batch behavior, modal Escape and focus restoration, original PDF responses, full preview containment, long titles/IDs, icon sizing, touch targets, no-JavaScript fallbacks and horizontal overflow. No broken local assets or uncaught browser errors were found after repairs.

Mocked Contact requests verified required/invalid input, exact sender/email/message/subject payload, sending state, duplicate prevention, provider/network failure, rejected success responses, timeout, retained inputs, retry and success reset. No request was delivered to a real form endpoint. Timed desktop/mobile checks verified unchanged motion limits, offscreen pause and live reduced-motion preferences. Visual screenshots were reviewed for desktop, tablet and mobile. No additional project crop, spacing or navigation changes were necessary.

All implementable requirements are complete. **Real email delivery is not active:** `contactEndpoint` remains empty until the owner follows the exact Formspree steps above for `james.lionel@binus.ac.id`. Required deployment environment variables: **none** for this integration. Physical Safari/iOS/Android checks and a real deployed inbox test remain unperformed. External social/demo URL values are correct; uptime and sign-in behavior on third-party services are outside the local QA.

Unverified technologies, individual contributions, metrics, issue dates inferred from certificate numbers, additional English proficiency claims and a fabricated CV remain omitted. The existing CV unavailable state is preserved. Certificate content and original project assets were not edited or regenerated.


## Production cleanup — 6 October 2026

Removed five legacy images after checking both HTML documents, all CSS/JavaScript, data-driven project/certificate paths and dynamic rendering: `Logos.jpeg` (superseded Trimly graphic), `foto-cermin.png` (unused alternate photo), and `ai-icon.png`, `cv-icon.png`, `problem-icon.png` (unused former floating-card artwork). No current banner, portrait or certificate asset was removed. No byte-identical duplicate assets were found.

Removed 11 unreachable CSS rules for the former project-modal/status presentation: `.project-status`, `.detail-subtitle`, `.detail-area`, `.detail-full-title`, `.detail-figure` and descendants, `.detail-caption`, and mobile `.project-detail .detail-actions` rules. The active certificate dialog and dedicated project-page styles are retained. No JavaScript removal was justified; no debug logging or debugger statements were present.

Kept future CV/Experience support, certificate empty/error states, no-JavaScript fallbacks, dynamic project visual classes, accessibility states and all motion/responsive rules. None is safely classifiable as abandoned solely because it is inactive in the current view. This project has no package manifest, dependency installation, build command or configured linter; deployment remains plain static files. Workspace QA scripts, source attachments and previous archives are outside the production folder and are not included in the deployment ZIP.


Cleanup verification: all seven JavaScript files passed `node --check`; all 37 unique local image/PDF/script/stylesheet references resolve. Existing browser checks passed at 16 widths from 320px to 1920px for six project banners/detail pages, seven certificates and original PDFs, keyboard/navigation behavior, no-JavaScript fallbacks, social links, and Contact states using intercepted requests. Twenty-four before/after screenshots at 1440px, 768px and 390px showed no visible regressions: 23 were pixel-identical; one differed only at five edge pixels. Home and About were pixel-identical. All retained non-CSS/non-documentation files remain byte-identical to the approved version. No new dependencies were introduced. Contact delivery and the CV PDF remain unconfigured as before.

## Final production polish — 6 October 2026

Only the explicit homepage divider and Contact functionality changed. `.hero-bottom` keeps its 1px border, with alpha reduced from 0.12 to 0.04 (67%). The current source has no additional horizontal borders between major sections; backgrounds and component borders were preserved rather than introducing new dividers. No spacing, section dimensions, responsive rules or animations changed.

Contact now uses `/api/contact` and server-only Resend delivery, replacing the inactive Formspree configuration. The existing form design is preserved; its availability notice is replaced by neutral guidance and Send Message is enabled when JavaScript loads. An offscreen, non-focusable honeypot does not affect layout. See DEPLOYMENT.md for exact setup and remaining activation steps.

Validation: syntax checks, ten mocked backend tests, static build, browser form-state tests and local HTTP client/function integration passed. Provider failures and missing credentials preserve input. No real email was sent. At 1440, 1024, 768, 430 and 390px, measured section/card/form/social geometry matched the saved approved version, with no horizontal overflow or page errors. All six project visuals/detail pages and seven certificates/PDF viewers loaded from the built output; social URLs remain identical. Project/certificate image and PDF bytes are unchanged. Checks also passed under the configured Node.js 22 runtime. Tooling emitted environment-supplied npm `http-proxy` and experimental `EnvHttpProxyAgent` warnings, unrelated to project code; no lint tool is configured.

Modified: `style.css`, `index.html`, `contact.js`, `content.js`, `README.md`.
Created: `api/contact.js`, `package.json`, `vercel.json`, `.env.example`, `.gitignore`, `.vercelignore`, `scripts/build.cjs`, `scripts/check.cjs`, `tests/contact.test.cjs`, `DEPLOYMENT.md`.

Pending: configure the actual `RESEND_API_KEY` and verified-domain `CONTACT_FROM_EMAIL` in Vercel, redeploy, and verify a real message in **james.lionel@binus.ac.id**. Implementation tests do not establish inbox delivery. A deployed Vercel build and physical-device testing were not performed in this workspace.
