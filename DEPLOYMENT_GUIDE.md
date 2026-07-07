# Dental Zone Mianwali — Deployment & SEO Guide

This package contains a production-ready version of your site. Here's what's inside, and exactly what to do with each piece.

## Files in this package

| File | Purpose |
|---|---|
| `index.html` | The website itself (semantic HTML, full SEO tags, real booking form) |
| `styles.css` | All styling, separated out for browser caching + faster repeat loads |
| `script.js` | All interactivity: animations, 3D tooth, testimonial slider, and the real booking flow |
| `favicon.svg`, `favicon.ico`, `apple-touch-icon.png` | Browser tab icon / mobile home-screen icon |
| `og-image.jpg` | The image shown when your site is shared on Facebook/WhatsApp/Twitter |
| `robots.txt` | Tells search engines what they can crawl |
| `sitemap.xml` | Tells search engines what pages exist |
| `Code.gs` | Google Apps Script backend — receives bookings and writes them to a Google Sheet |

**Three things you must personalize before this goes live** (all marked `REPLACE_...` in the files):
1. Your real domain, wherever you see `https://dentalzonemianwali.com/`
2. Your Google Apps Script deployment URL, in `script.js` (`APPS_SCRIPT_URL`)
3. Your clinic's email address, in `Code.gs` (`OWNER_EMAIL`)

---

## PART 1 — Hosting the website

1. Buy hosting (or use free options like GitHub Pages / Netlify / Vercel) and a domain, e.g. `dentalzonemianwali.com`.
2. Upload **all files** (`index.html`, `styles.css`, `script.js`, `favicon.svg`, `favicon.ico`, `apple-touch-icon.png`, `og-image.jpg`, `robots.txt`, `sitemap.xml`) to the same root folder — they must sit next to each other, not in subfolders, since the HTML references them with relative paths (`styles.css`, not `/assets/styles.css`).
3. Once live, open the site in a real browser and check:
   - The page loads with styling (confirms `styles.css` path is correct)
   - The 3D tooth in the hero spins and can be dragged (confirms `script.js` + Three.js loaded)
   - The booking form is visible with all fields

---

## PART 2 — Connecting a custom domain

1. In your domain registrar (GoDaddy, Namecheap, etc.), point the domain to your host:
   - For most hosts: add an **A record** pointing to your host's IP address, or a **CNAME** if using Netlify/Vercel/GitHub Pages.
2. Wait for DNS propagation (can take a few minutes to 24 hours).
3. Enable **HTTPS/SSL** on your host (most hosts, including free ones, offer free SSL via Let's Encrypt — usually a one-click toggle).
4. Once your real domain is live, replace every instance of `https://dentalzonemianwali.com/` in `index.html` and `sitemap.xml` with your actual domain if it's different.

---

## PART 3 — Google Sheets + Apps Script backend (the real booking system)

### Step 1: Create the Sheet
1. Go to [sheets.google.com](https://sheets.google.com) and create a new blank spreadsheet.
2. Rename it something like "Dental Zone Mianwali — Appointments".
3. Rename the first tab (bottom-left) to **Appointments**.
4. In row 1, add these headers exactly: `Timestamp | Name | Phone Number | Which Checkup | Preferred Date | Status`
   (If you skip this, the script will create it automatically on first run — but it's good practice to set it up yourself.)

### Step 2: Add the script
1. In the Sheet, go to **Extensions → Apps Script**.
2. Delete any starter code in the editor.
3. Paste in the entire contents of `Code.gs` (included in this package).
4. At the top of the file, update:
   ```js
   OWNER_EMAIL: 'REPLACE_WITH_CLINIC_OWNER_EMAIL@example.com',
   ```
   with the real email that should receive booking notifications (e.g. Dr. Hanif's own email or the clinic's).
5. Click the **Save** icon (or Ctrl/Cmd+S).

### Step 3: Deploy as a Web App
1. Click **Deploy → New deployment**.
2. Click the gear icon next to "Select type" → choose **Web app**.
3. Fill in:
   - Description: "Dental Zone booking backend"
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Click **Deploy**.
5. The first time, Google will ask you to authorize the script — click through the consent screens (choose your Google account, click "Advanced" → "Go to (project name)" if you see an "unverified app" warning — this is expected for personal scripts).
6. Copy the **Web app URL** it gives you (ends in `/exec`).

### Step 4: Connect the frontend to the backend
1. Open `script.js`.
2. Find this line near the top:
   ```js
   var APPS_SCRIPT_URL = 'https://script.google.com/macros/s/REPLACE_WITH_YOUR_DEPLOYMENT_ID/exec';
   ```
3. Replace the URL with the one you copied in Step 3.
4. Re-upload `script.js` to your host.

### Step 5: Test it
1. Open your live site, fill out the appointment form with a real phone number, and submit.
2. Confirm:
   - You see "Appointment request submitted successfully."
   - A new row appears in your Google Sheet.
   - An email notification arrives at the owner's inbox.

### Re-deploying after future edits
If you ever edit `Code.gs` again, you must go to **Deploy → Manage deployments → Edit (pencil icon) → New version → Deploy** for changes to take effect. Editing the script alone does **not** update the live endpoint.

---

## PART 4 — Email notifications (already wired in)

`Code.gs` automatically emails the clinic owner on every successful booking, with subject line **"New Appointment Booking"** and the patient's name, phone, checkup type, and preferred date in the body. This uses Google's built-in `MailApp` service — no extra setup, no SMTP credentials needed. Emails are sent **from the Google account that deployed the script**, so deploy it from whichever Gmail account should appear as the sender.

---

## PART 5 — Security & spam protection (already built in)

- **Honeypot field**: a hidden `company` field in the form. Real visitors never see or fill it (hidden via CSS, not `display:none`, so basic bots that skip hidden fields still get caught). If it's filled, the submission is silently discarded.
- **Client + server-side validation**: name, phone format, and future-dated appointments are checked both in the browser and again in Apps Script (never trust the client alone).
- **Duplicate protection**: the script checks the last 20 rows in the sheet for the same phone number submitted within the last 2 minutes, and rejects repeat submissions.
- **Input sanitization**: angle brackets are stripped from all fields before they're written to the sheet or emailed, reducing injection risk.
- **Rate limiting on the client**: the submit button disables itself and shows a spinner while a request is in flight, and blocks resubmission for 8 seconds.

---

## PART 6 — Google Search Console setup

1. Go to [search.google.com/search-console](https://search.google.com/search-console).
2. Add your property (choose "URL prefix" and enter your full domain, e.g. `https://dentalzonemianwali.com/`).
3. Verify ownership — the simplest method for a static site: choose the **HTML tag** method, copy the `content="..."` value it gives you, and paste it into `index.html` here:
   ```html
   <meta name="google-site-verification" content="REPLACE_WITH_YOUR_GSC_VERIFICATION_CODE">
   ```
4. Re-upload `index.html`, then click **Verify** in Search Console.
5. Once verified, go to **Sitemaps** in the left sidebar, enter `sitemap.xml`, and click **Submit**.

---

## PART 7 — Google Analytics (GA4) setup

1. Go to [analytics.google.com](https://analytics.google.com) and create a new GA4 property for your clinic.
2. It will give you a **Measurement ID** that looks like `G-XXXXXXXXXX`.
3. In `index.html`, replace both occurrences of `G-REPLACE_WITH_YOUR_ID` with your real Measurement ID:
   ```html
   <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
   <script>
     ...
     gtag('config', 'G-XXXXXXXXXX');
   </script>
   ```
4. Re-upload `index.html`. Analytics data usually appears in the dashboard within a few hours.

---

## PART 8 — On-page SEO checklist (already implemented)

- [x] Optimized `<title>`: "Dental Zone Mianwali | Best Dental Clinic in Mianwali"
- [x] Meta description covering all core services and location
- [x] Meta keywords (dental clinic Mianwali, dentist in Mianwali, root canal, teeth whitening, etc.)
- [x] Canonical URL tag
- [x] Robots meta tag (`index, follow`)
- [x] `robots.txt` and `sitemap.xml`
- [x] Open Graph tags (Facebook/WhatsApp preview)
- [x] Twitter Card tags
- [x] Favicon + Apple touch icon
- [x] JSON-LD structured data (`Dentist` schema with address, phone, hours, geo-coordinates)
- [x] Semantic HTML (`header`, `nav`, `main`, `section`, `footer`, one `<h1>`, logical `<h2>`/`<h3>` hierarchy)
- [x] Descriptive `alt` text on the doctor photo
- [x] Lazy-loading on non-critical images

**Recommended next step for stronger rankings**: this is currently a single-page site with anchor sections (`/#services`, `/#booking`, etc.). Anchor links aren't separately indexable pages in Google's eyes. For real keyword-by-keyword ranking (e.g. ranking specifically for "root canal Mianwali" or "teeth whitening Mianwali"), the strongest long-term move is to build **dedicated pages** for your top services (e.g. `/root-canal-treatment-mianwali.html`, `/teeth-whitening-mianwali.html`) that link back to the homepage. The sitemap in this package lists the homepage plus anchors as a starting point — expand it as you add real pages.

---

## PART 9 — Performance notes

- CSS and JS are now external files (`styles.css`, `script.js`) instead of inline, so returning visitors load them from cache instead of re-downloading the whole page.
- The doctor photo uses `loading="lazy"` and `decoding="async"`.
- The 3D tooth (Three.js) initializes via `requestIdleCallback` so it never blocks the initial page paint.
- Fonts use `display=swap` so text renders immediately in a fallback font while custom fonts load.
- For a further speed boost once you have real hosting: enable **gzip/Brotli compression** and **browser caching headers** on your host (most hosts, including Netlify/Vercel, do this automatically; on shared hosting/cPanel you may need to enable it via `.htaccess`).
- Run the live site through [PageSpeed Insights](https://pagespeed.web.dev) after deployment to confirm your real-world Core Web Vitals — scores depend partly on your hosting provider's server speed, which isn't something the code alone controls.

---

## Quick reference: what you must edit before going live

| File | What to change |
|---|---|
| `script.js` | `APPS_SCRIPT_URL` → your deployed Apps Script `/exec` URL |
| `Code.gs` | `OWNER_EMAIL` → the clinic's real notification email |
| `index.html` | `https://dentalzonemianwali.com/` → your real domain (if different) |
| `index.html` | `google-site-verification` content → your real Search Console code |
| `index.html` | `G-REPLACE_WITH_YOUR_ID` (×2) → your real GA4 Measurement ID |
| `sitemap.xml` | Same domain replacement as above |
