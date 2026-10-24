# Our Little Universe ♡

A personal, animated, mobile-first website made for Nikitha — a tiny universe of
photos, little letters, a quiz about us, chat screenshots, songs, surprises and a
final gift reveal — plus a secure admin dashboard to manage everything without
touching code.

- **Frontend:** React 19 · Vite · React Router · Tailwind CSS v4 · Framer Motion · Lucide icons
- **Backend:** Supabase (Postgres + Row Level Security, Auth, Storage) — free tier
- **Hosting:** Vercel (free tier)

> The site runs immediately in **demo mode** (clearly-labelled placeholders, no
> account needed). Connect Supabase when you're ready to add real memories.

---

## Contents

1. [What's inside](#whats-inside)
2. [How privacy & security work](#how-privacy--security-work)
3. [Step-by-step setup](#step-by-step-setup)
   1. [Install Node.js](#1-install-nodejs)
   2. [Install the project dependencies](#2-install-the-project-dependencies)
   3. [Run the site locally (demo mode)](#3-run-the-site-locally-demo-mode)
   4. [Create a free Supabase project](#4-create-a-free-supabase-project)
   5. [Configure the environment variables](#5-configure-the-environment-variables)
   6. [Run the SQL setup scripts](#6-run-the-sql-setup-scripts)
   7. [Create the first administrator (securely)](#7-create-the-first-administrator-securely)
   8. [Storage buckets and policies](#8-storage-buckets-and-policies)
   9. [Run locally with Supabase](#9-run-locally-with-supabase)
   10. [Deploy the frontend to Vercel](#10-deploy-the-frontend-to-vercel)
   11. [Configure production environment variables](#11-configure-production-environment-variables)
   12. [Upload the first photograph](#12-upload-the-first-photograph)
   13. [Add quiz questions and answers](#13-add-quiz-questions-and-answers)
   14. [Upload chat screenshots](#14-upload-chat-screenshots)
   15. [Update the final surprise](#15-update-the-final-surprise)
   16. [Troubleshooting](#16-troubleshooting)
4. [Managing the rest of the content](#managing-the-rest-of-the-content)
5. [Free-tier limits worth knowing](#free-tier-limits-worth-knowing)
6. [Project structure](#project-structure)
7. [Customising the look](#customising-the-look)
8. [Quality checks that were run](#quality-checks-that-were-run)

---

## What's inside

**Ten public chapters**, each with its own animations, loading/empty/error states and a mobile layout:

| # | Chapter | Highlights |
|---|---|---|
| 1 | **Welcome Home** | Staged hero animation, her photo in a Polaroid with floating hearts, “There’s something for you…” secret note, rotating message carousel, chapter map |
| 2 | **Our Memories** | Scrapbook Polaroids, categories, favourites, “show more”, full-screen lightbox (swipe, arrow keys, Esc) |
| 3 | **How Well Do You Know Us?** | One question at a time, mascot reactions, gentle feedback, confetti, editable result messages, optional saved results |
| 4 | **Our Little Chats** | Screenshots in phone frames, collections, lightbox — private by default |
| 5 | **Reasons I Love You** | 3D flip cards and “Give me another reason” |
| 6 | **Our Timeline** | Scroll-drawn line, alternating milestones |
| 7 | **Little Things** | Gift-box messages, mood picker, 20-second “catch the hearts” game, the mystery button |
| 8 | **Our Soundtrack** | Custom player (never autoplays), song links, voice notes (private by default) |
| 9 | **Open When…** | Envelopes that open and slide out a letter — private by default |
| 10 | **One Last Surprise** | Gift box → staged reveal; letter / photo / collage / date / gift / video / custom — private by default |

**Admin dashboard** at `/admin`: counts and shortcuts, full create / edit / reorder / publish / archive /
delete for every section with live previews, uploads with progress and in-browser image optimisation,
quiz results, theme and privacy settings, unsaved-changes protection and confirmation before deleting.

**Flirty pop-ups:** every minute by default (adjustable from 1 to 60) a small card pops up on any
public page with a line about her (“Psst, Nikitha… your laugh is officially my favourite sound
effect”). It stays for about 15 seconds (hover to keep it longer), never covers an open dialog or
another pop-up, always leaves a short quiet gap, and shuffles the lines without repeats. If one comes
due while the tab is in the background, it appears as soon as she looks at the page again.
She can pause them (“Pause these” or the footer switch); you can edit the lines in
**Admin → Flirty pop-ups** and change the timing or switch them off in **Admin → Settings**.

**Demo mode:** when no Supabase keys are configured, the site shows placeholder content marked
“Placeholder” / “Example”, and `/admin` offers a sandbox preview whose edits live only in the
current browser tab. Demo content can never reach a real database.

---

## How privacy & security work

> **Hiding is not the same as protecting.** Hiding a page from the menu only changes what people
> see; anyone who guesses the address could still load it. This project *protects* content in the
> database itself.

- **Three kinds of visitor**
  - **Anyone with the link** — sees chapters set to *public*.
  - **Viewer (Nikitha, signed in)** — also sees chapters set to *private*.
  - **Admin (you, signed in)** — sees everything, including *hidden* chapters, and is the only one who can change anything.
- **Roles live in the `user_roles` table**, which only an admin (or the Supabase SQL editor) can change.
  Signing up never grants any access — and sign-ups should be switched off anyway (step 7).
- **Row Level Security (RLS)** is enabled on every table. Each chapter's visibility
  (`public` / `private` / `hidden`, set in **Admin → Settings**) is enforced by database policies, so
  private rows are never sent to someone who isn't allowed to see them — even if they call the API directly.
- **Storage**
  | Bucket | Type | Holds |
  |---|---|---|
  | `public-media` | public | landing photo, memories, timeline photos, song artwork |
  | `private-media` | private | chat screenshots, letter photos, final-surprise photos/videos |
  | `audio` | private | songs, voice notes, letter audio |

  Private files are served through short-lived **signed URLs**, and Storage only signs a file if the
  visitor is allowed to see that file's section. Public-bucket files have long random names, but anyone
  who has a file's exact link can open it — so put anything sensitive in a private chapter.
- **Default privacy:** Chats, Open When letters, voice notes and the Final Surprise are *private*;
  everything else is *public*. Change it any time in **Admin → Settings → Who can see each chapter**.
- **Keys:** the frontend only ever uses the public *anon/publishable* key. **Never** put the
  `service_role`/secret key in the code, in `.env.local`, or in Vercel.
- **Quiz results:** when enabled (Settings), finishing the quiz stores the score, total, time and the
  chosen answer per question. Visitors can only *insert*; only the admin can read them
  (**Admin → Quiz results**). Switch it off to store nothing.
- Content you type is rendered as plain text (no HTML injection); links must start with `http(s)://`;
  file types and sizes are validated in the browser *and* enforced by the storage buckets.
- The site asks search engines not to index it (`noindex`), and no personal details are placed in the
  page metadata.

---

## Step-by-step setup

### 1. Install Node.js

Install **Node.js 22 LTS** (20.19+ also works) from <https://nodejs.org> — on Windows choose the
“Windows Installer (.msi)” and keep the defaults. Open a **new** terminal and check:

```bash
node -v   # v22.x (or newer)
npm -v
```

### 2. Install the project dependencies

```bash
cd path/to/the/project
npm install
```

> **Corporate network?** If `npm install` fails with `SELF_SIGNED_CERT_IN_CHAIN`, your network
> inspects HTTPS traffic. Tell Node to trust your computer's certificate store instead of disabling
> security: on Windows run `setx NODE_USE_SYSTEM_CA 1`, open a new terminal, and try again
> (macOS/Linux: `export NODE_USE_SYSTEM_CA=1`).
>
> **Project inside OneDrive/Dropbox?** Pause syncing while installing — `node_modules` contains
> thousands of small files.

### 3. Run the site locally (demo mode)

```bash
npm run dev
```

Open <http://localhost:5173>. With no Supabase keys the site runs in **demo mode** — a small
“Demo mode” note appears in the corner. Visit <http://localhost:5173/admin> and choose
**Preview the admin (demo)** to try the dashboard; edits there last until you reload the tab.

Other scripts: `npm run build` (production build into `dist/`), `npm run preview` (serve the build),
`npm run lint`, `npm run check` (lint + build).

### 4. Create a free Supabase project

1. Sign up at <https://supabase.com> and click **New project**.
2. Pick a name (e.g. `our-little-universe`), a strong database password (store it in a password
   manager — you won't need it in this project), and the region closest to you.
3. Wait a minute for the project to be ready.

### 5. Configure the environment variables

1. In Supabase open **Project Settings → API** (called **API Keys** / **Data API** in newer dashboards).
2. Copy the **Project URL** and the **anon** key (or the newer **publishable** key, `sb_publishable_…`).
3. In the project folder copy `.env.example` to `.env.local` and fill it in:

   ```dotenv
   VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...   # or sb_publishable_...
   VITE_SITE_URL=                          # optional locally
   ```

`.env.local` is git-ignored. Both values are meant to be public; the database policies are what keep
data safe. **Do not** use the `service_role`/secret key anywhere in this project.

### 6. Run the SQL setup scripts

In Supabase open **SQL Editor → New query**, paste each file's contents and click **Run**, in this order:

| Order | File | What it does |
|---|---|---|
| 1 | `supabase/migrations/20261024000000_init.sql` | All tables, constraints, indexes, `updated_at` triggers, role helpers, **RLS policies**, the three **storage buckets** and their policies |
| 2 | `supabase/migrations/20261024000100_admin_functions.sql` | Atomic admin helpers (reorder rows, save a quiz question with its answers) |
| 3 | `supabase/migrations/20261024000200_flirty_lines.sql` | Flirty pop-up lines table (with 20 example lines), its RLS policies and the pop-up settings |
| 4 | `supabase/seed.sql` *(optional)* | Clearly-marked placeholder content (example messages, placeholder quiz questions, letters…) so the site isn't empty. Safe to re-run — it only fills empty tables |
| 5 | `supabase/setup/verify.sql` *(optional)* | Read-only check: every table should show `rls_enabled = true` and the three buckets should be listed |

**Shortcut:** `supabase/setup/run-all.sql` contains files 1–4 in order — paste it once and run.

All scripts are idempotent (safe to run again). If you use the Supabase CLI instead, `supabase db push`
applies the migrations and `supabase db reset` also loads `seed.sql`.

### 7. Create the first administrator (securely)

The admin is created **from the Supabase dashboard**, never from the website — so nobody can make
themselves an admin.

1. **Turn off public sign-ups:** **Authentication → Sign In / Providers** → disable
   **“Allow new users to sign up”**.
2. **Create your account:** **Authentication → Users → Add user → Create new user**. Enter your email
   and a strong password and tick **Auto Confirm User**.
3. **Create Nikitha's account** the same way (she'll use it to open private chapters). Give her the
   password personally.
4. **Grant the roles:** open `supabase/setup/grant_roles.sql`, replace the two example email addresses
   with the real ones, paste it into the **SQL Editor** and run it. The final query should list
   `admin` for you and `viewer` for her.

Only accounts listed in `user_roles` get any extra access. To remove access later, delete the row
(`delete from public.user_roles where user_id = '…';`) or delete the user.

### 8. Storage buckets and policies

Nothing to click — step 6 created them:

- `public-media` (public, images, 10 MB per file)
- `private-media` (private, images + MP4/WebM video, 50 MB per file)
- `audio` (private, MP3/M4A/AAC/OGG/WAV/WebM, 25 MB per file)

You can see them under **Storage**. Files are organised in folders named after their section
(`memories/…`, `chats/…`, `voice_notes/…`) — the private-file policies rely on those folder names, so
always upload through the admin dashboard rather than dragging files into the Storage UI.

The admin also optimises images before uploading (WebP, longest side 2000 px; 2600 px for tall chat
screenshots), which keeps you comfortably inside the free 1 GB.

### 9. Run locally with Supabase

1. In Supabase open **Authentication → URL Configuration** and add
   `http://localhost:5173/**` to **Redirect URLs** (needed for password-reset links).
2. Restart the dev server so it picks up `.env.local`:

   ```bash
   npm run dev
   ```

3. The “Demo mode” note should be gone. Go to <http://localhost:5173/admin>, sign in with your admin
   account, and you'll land on the dashboard.
4. Open a private chapter (e.g. `/chats`) in a private/incognito window — you should see
   “This chapter is just for Nikitha ♡” with a sign-in form.

### 10. Deploy the frontend to Vercel

Vercel builds the site straight from a Git repository.

1. **Put the project on GitHub** (a *private* repository is recommended):

   ```bash
   git init
   git add .
   git commit -m "Our little universe ♡"
   # create an empty private repo on github.com, then:
   git remote add origin https://github.com/<you>/our-little-universe.git
   git push -u origin main
   ```

   `.env.local`, `node_modules` and `dist` are ignored automatically — check that no keys were committed.
2. Sign in at <https://vercel.com> with GitHub → **Add New… → Project** → import the repository.
3. Vercel detects **Vite**. Keep: Build Command `npm run build`, Output Directory `dist`,
   Install Command `npm install`.
4. Add the environment variables from the next step **before** the first deploy, then click **Deploy**.

`vercel.json` already makes deep links like `/memories` work on refresh and adds security headers.

*(Alternative: `npm i -g vercel`, then `vercel` in the project folder and follow the prompts.)*

### 11. Configure production environment variables

In Vercel open **Project → Settings → Environment Variables** and add (for *Production*, and
*Preview* if you use preview deployments):

| Name | Value |
|---|---|
| `VITE_SUPABASE_URL` | your Project URL |
| `VITE_SUPABASE_ANON_KEY` | your anon / publishable key |
| `VITE_SITE_URL` | your site address, e.g. `https://our-little-universe.vercel.app` (used for link previews) |

Vite bakes these values in **at build time**, so after adding or changing them go to
**Deployments → ⋯ → Redeploy**.

Then, in Supabase **Authentication → URL Configuration**:

- set **Site URL** to your Vercel address, and
- add `https://<your-site>/**` to **Redirect URLs**.

### 12. Upload the first photograph

1. Go to `https://<your-site>/admin` and sign in.
2. **Landing page → Hero photo → Choose file** (or drag a photo onto the box).
   JPG, PNG, WebP, GIF or AVIF up to 15 MB. iPhone *HEIC* photos aren't supported by browsers —
   share/export them as JPEG first.
3. Add a short **photo description** (read aloud by screen readers) and a caption.
4. Click **Save changes**. The landing page now shows her photo.

For memories: **Memories → Add memory**, upload the photo, add a title, caption, date and category,
then **Create**. Use the arrows to reorder, the switch to publish/unpublish, and **Featured** to show
it under “Featured ♡”. Manage categories in the **Categories** panel at the top.

### 13. Add quiz questions and answers

1. **Admin → Quiz.** The seeded questions are *placeholders* with made-up answers (“Placeholder
   answer A…”) — edit each one with the real answers or delete it.
2. Click a question (or **Add question**): choose a category, write the question, type 2–6 answers,
   **tap the letter** next to the right answer (exactly one), and optionally add a short explanation
   shown after answering.
3. **Save changes.** The question and its answers are saved together in one step.
4. Result messages (low / medium / high / perfect score) and whether results are saved are in
   **Admin → Settings → Quiz**. Saved attempts appear in **Admin → Quiz results**.

### 14. Upload chat screenshots

1. **Admin → Chat screenshots → Add screenshot.**
2. Upload the screenshot (stored in the *private* bucket), add a caption, date, a collection
   (Funniest, Cute, Goodnight…) and a short description for screen readers.
3. **Create.** Only people allowed to see the Chats chapter (by default: Nikitha and you, signed in)
   can load these images. Only upload screenshots you're both comfortable keeping.

### 15. Update the final surprise

1. **Admin → Final surprise.**
2. Pick the **type**: personalised letter, photograph, photo collage (up to 6), planned date/outing,
   gift description, video (upload MP4/WebM up to 50 MB or paste a link) or a custom message. The form
   shows the fields for that type.
3. Edit the heading, button label, title, message (use `{name}` for her name; blank lines make new
   paragraphs) and sign-off. The preview updates as you type.
4. **Save changes.** Visit `/surprise` and use **Replay the surprise** to see it again.

### 16. Troubleshooting

| Problem | Fix |
|---|---|
| `npm install` fails with `SELF_SIGNED_CERT_IN_CHAIN` | See the corporate-network note in step 2 (`NODE_USE_SYSTEM_CA=1`). Don't disable `strict-ssl`. |
| Site still says **Demo mode** | `.env.local` missing/misnamed, values still the examples, or the dev server wasn't restarted. On Vercel: variables missing or you didn't redeploy after adding them. |
| Every chapter shows “a little cloud got in the way” | The SQL in step 6 hasn't been run, the URL/key is wrong, or the free project is **paused** (open the Supabase dashboard and click *Restore*). |
| `/admin` says **“Couldn't check your access”** | The migration hasn't been run (the `my_role` function is missing). Run step 6. |
| You can sign in but see **“No admin access”** | Your user isn't in `user_roles` — run `grant_roles.sql` with your exact email (step 7). |
| Nikitha signs in but private chapters stay locked | Her account needs the `viewer` role (step 7), and the chapter must be *private* (not *hidden*) in Settings. |
| “You don't have permission to do that” when saving | Signed in with a non-admin account or the session expired — sign out and in again. |
| Upload fails: “This storage area doesn't accept that kind of file” | Wrong file type for that field, or the buckets weren't created — rerun the init migration. |
| Upload fails: file too large | Images ≤ 15 MB (GIF ≤ 8 MB), audio ≤ 20 MB, video ≤ 50 MB. Compress the file first. |
| Private photos/voice notes don't show | The visitor isn't signed in as viewer/admin, or the file was added outside the admin (wrong folder name). Re-upload it via the admin. |
| Password-reset email never arrives | Add your site to **Redirect URLs** (steps 9 & 11). Supabase's built-in email sender only delivers to members of your Supabase team (so it works for **your** account) and is limited to a couple of emails per hour. For Nikitha's account either set up **Custom SMTP** (Authentication → Emails / SMTP settings — e.g. Resend or Brevo have free tiers), or delete her user, create it again with a new password and re-run `grant_roles.sql`. |
| A refresh on `/memories` gives 404 on another host | Configure an SPA fallback to `index.html` (Vercel uses `vercel.json` automatically). |
| Images look blurry | They're optimised to max 2000 px wide; that's plenty for phones and laptops. Upload the original (not a screenshot of it) for best results. |
| Edits in the admin don't appear on the site | Make sure the item is **published** (switch on), and the chapter isn't **hidden** in Settings. Refresh the public page. |

---

## Managing the rest of the content

| Admin page | What you can do |
|---|---|
| **Dashboard** | Counts for every section, placeholders still to personalise, shortcuts |
| **Landing page** | Label, heading, welcome message, affectionate line, hero photo, captions, button texts |
| **Cute messages** | Lines for the carousel, the secret note and the gift box |
| **Flirty pop-ups** | The lines that pop up every few minutes (add, edit, reorder, publish) |
| **Memories** | Photos, captions, dates, locations, categories, featured, order, publish |
| **Quiz / Quiz results** | Questions, answers, explanations; see and delete saved attempts |
| **Chat screenshots** | Private screenshots, captions, collections |
| **Reasons I love you** | Card titles + reasons; archive instead of deleting |
| **Timeline** | Milestones with date, story, optional photo, location and label |
| **Mood messages** | A message per mood (add your own moods too) |
| **Soundtrack** | Songs (with a Spotify/YouTube/Apple Music link) and voice notes (uploaded audio you recorded or may share) — nothing autoplays |
| **Open When letters** | Envelope label, letter text, optional photo and voice note |
| **Final surprise** | See step 15 |
| **Settings** | Her name, site title, signature, colour theme (blush / lavender / peach), decorations, chapter visibility, flirty pop-ups (on/off + every how many minutes), quiz options, soundtrack intro |

Good to know:

- Anything still marked **Placeholder** is example wording. Saving an item in the admin clears the flag.
- **Draft** items (switch off) are kept but hidden from the website.
- Deleting an item also deletes its files — unless another item still uses the same file.
- Replacing or removing a file deletes the old one after you save; files uploaded in an editor you
  then discard are cleaned up automatically.
- Closing an editor or leaving a page with unsaved changes always asks first.
- Use `{name}` in headings and messages to insert her name from Settings.

---

## Free-tier limits worth knowing

- **Supabase Free:** 500 MB database, **1 GB file storage**, 5 GB bandwidth/month (at the time of
  writing). Thanks to image optimisation a photo is typically 100–400 KB.
- **Free Supabase projects pause after about a week without activity.** The website will show its
  friendly error cards until you open the Supabase dashboard and click **Restore project**. Visiting
  the site regularly (or using the admin) keeps it active.
- **Auth emails** from Supabase's built-in sender only reach your Supabase team members and are
  limited to about 2 per hour (see Troubleshooting).
- **Vercel Hobby** is free for personal, non-commercial sites like this one.

---

## Project structure

```
├── index.html                 # page shell + metadata (noindex, social preview)
├── vite.config.js             # React, Tailwind, font preloading, social-preview tags
├── vercel.json                # SPA rewrites + security headers
├── .env.example               # copy to .env.local
├── public/                    # favicon.svg, apple-touch-icon.png, og-image.png
├── supabase/
│   ├── migrations/
│   │   ├── 20261024000000_init.sql            # schema, RLS, storage buckets & policies
│   │   ├── 20261024000100_admin_functions.sql # reorder + save-quiz RPCs
│   │   └── 20261024000200_flirty_lines.sql    # flirty pop-up lines + settings
│   ├── seed.sql                               # optional placeholder content
│   └── setup/
│       ├── grant_roles.sql                    # make yourself admin, Nikitha viewer
│       └── verify.sql                         # read-only sanity check
└── src/
    ├── main.jsx
    ├── app/        # App, routes (code-split), chapters list, public layout, error boundary
    ├── pages/      # the ten public chapters + 404
    ├── components/ # shared UI: Navbar, MobileNavigation, PageShell, PageTransition, PhotoCard,
    │               # Lightbox, Modal, AudioPlayer, Envelope, GiftBox, Confetti, HeartBurst,
    │               # SectionGate, Loading/Empty/Error states, illustrations/, home/, quiz/, little/,
    │               # auth/ (sign-in form), admin/ (form fields, media upload, previews)
    ├── admin/      # login, password reset, route guard, layout, dashboard,
    │               # CollectionManager / ContentEditor engines, managers/ (one per section),
    │               # media/ (upload session + cleanup), ui/ (toasts + confirm dialogs)
    ├── context/    # AuthProvider, SiteSettingsProvider
    ├── hooks/      # useContent, useAuth, useDialog, useMediaUrl, useVisibleChapters, …
    ├── lib/        # supabase client, database (public reads), adminApi (writes), auth,
    │               # storage + media (uploads/cleanup), mappers, defaults, demo database
    ├── styles/     # index.css — design tokens, themes, base styles
    └── utils/      # formatting, sounds, demo audio, random
```

Data access is kept out of the components: pages call `useContent('listMemories')` →
`lib/database.js`; the admin calls `lib/adminApi.js`. Both work against the in-memory demo database
or Supabase with the same row shapes.

---

## Customising the look

- **Colours & fonts:** `src/styles/index.css` (`@theme` tokens; the three selectable themes are the
  `[data-theme=…]` blocks).
- **Chapter names, order, icons and default subtitles:** `src/app/chapters.js`.
- **Default wording** (used when the database is empty): `src/lib/defaults.js`.
- **Animations** respect the visitor's “reduce motion” setting automatically.

---

## Quality checks that were run

- **Database:** the migrations, seed and every RLS rule were exercised in real Postgres (PGlite) as
  anonymous visitor, signed-up stranger, viewer and admin — 66 checks (private sections, role
  escalation, quiz-attempt insert-only, storage folder policies, file-in-use checks, atomic quiz saves).
- **Live integration:** sign-in, public reads, signed URLs, admin writes and uploads were tested
  end-to-end against a simulated Supabase API.
- **Accessibility:** axe-core (WCAG 2.2 AA + best practices) reports 0 issues on 23 page states;
  full keyboard support (skip link, visible focus, focus-trapped dialogs, arrow keys in the lightbox).
- **Responsive:** 20 pages × 7 widths (320, 375, 390, 430, 768, 1024, 1440 px) — no horizontal
  overflow, all touch targets ≥ 24 px (most ≥ 44 px).
- **Performance:** code-split chapters, lazy-loaded images with reserved space, preloaded fonts,
  layout shift ≈ 0.003 on a throttled phone.

Made with love, just for you ♡
