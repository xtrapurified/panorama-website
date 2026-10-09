# Panorama Films website — project

<!-- impeccable:product-schema 1 -->

Last updated: 2026-10-09. Keep this file current: update it whenever the site structure, a rule, the workflow or a milestone changes. Copies live in the repo root and in the claude.ai Project ("PANORAMA Website") as `claude/project.md`; the repo copy is the one to trust if they differ.

## Platform

web

## Users

Clients commissioning films: institutions, foundations, NGOs and brands in the UAE, Europe and Serbia who are deciding whether to hire Panorama Films for a film. They arrive to judge the work, see who the studio has made films for, and understand what the studio can do. Success is an enquiry through the contact form on panoramafilms.tv.

## Product Purpose

The website is the portfolio and front door of Panorama Films, an independent creative storytelling studio in Belgrade, Serbia, available worldwide. It shows the films, the studio and its approach, and turns a convinced visitor into a commissioning enquiry.

## Positioning

A full-service studio that takes a film from first question to final frame: research, writing, shooting and editing under one creative direction, by a small team (Andrija Kovač, Creative Director; Mina Strugar, Producer; Marija Kovačina, Editorial Director) working with collaborators.

Supporting facts already in use on the site:
- Identity line: "Seeing the bigger picture." Supporting selected phrases: "Stories with perspective", "The future, documented."
- Work spans documentaries, series, campaigns and brand films, with an interest in science, technology, culture and human stories. A large part of the client base is in the UAE (Dubai Future Foundation, Museum of the Future, World Government Summit, World Sports Summit).
- Generative media is one method among live action, archive, design and animation, always under human judgement ("Human in the loop"). It is not the proposition.

## Operating Context

- **Code:** GitHub repo `xtrapurified/panorama-website`. A static site with no build step: `index.html` (the whole page, styles and scripts inline) plus `media/`. Netlify serves the repo root as is (`netlify.toml`).
- **Hosting:** Netlify project `panoramafilms` (panoramafilms.netlify.app), linked to the repo.
- **Branches:** `main` = production; every deploy costs Netlify credits, so merge into `main` only when a version is approved. `dev` = working branch; its branch deploys are free and get their own preview link. Work on `dev`, review the preview, then merge.
- The public domain panoramafilms.tv is still the old Cargo site.
- Full films live on Vimeo (vimeo.com/panoramafilmstv) and YouTube and play in a lightbox. Background loops stream from Vimeo; YouTube films use hosted clips because YouTube's player shows its own interface.
- The source of truth for projects, titles, clients, years, roles, thumbnails and GIFs is panoramafilms.tv: its Work page lists 35 projects in a fixed order.
- `project.md` and `CLAUDE.md` are blocked from being served on the live site (redirects in `netlify.toml`).
- `CLAUDE.md` holds the working rules every chat reads when it opens the repo: pull `dev` first, never push to `main` without approval, keep this file current.

## Milestones (revert targets)

Approved versions to go back to before trying new things. Each one is a git branch (`archive/…`) with the full site; the page sources are also saved in the claude.ai Project under `claude/milestones/`.

- **2026-10-08 v95** — branch `archive/v95`; artifact version 95 (id 1791452296-3054), `claude/milestones/2026-10-08-v95-index.html`. Chapters featured layout (parallax off), Films/Studio/Contact folds, nav Work · Studio · Contact, dark default with footer Dark/Light switch, Services vs Credits on project pages, catalogue Load more → archive.
- **2026-10-08 v102** — branch `archive/v102`; latest approved, the revert target before the Enhance experiments. Artifact version 102 (id 1791474471-490e), `claude/milestones/2026-10-08-v102-index.html`. Collective graph, team columns removed, mixed client strip with throw physics, Approach "Seen in" film links, "Let's make a film together." Header overlap issue deliberately left for later.
- **2026-10-09** — site moved to git (first commit on `main`). New milestones get their own `archive/<name>` branch and a line here.

## Capabilities and Constraints

- Project order and numbering always mirror the Work page on panoramafilms.tv (01 Ask More … 35 Fruškać).
- Collaborator name spelling: Nevena Krivokapić-Martinović (her full name; used everywhere, credits included).
- Never invent years, roles, credits, clients, descriptions or claims. A fact that is not on panoramafilms.tv, its Vimeo channel, or confirmed by Andrija stays out. New copy is labelled as a proposal until approved.
- Contact: the contact form on panoramafilms.tv (the closing "Let's make a film together." and the Contact link in the menu lead to it), the email hello@panoramafilms.tv, Vimeo and Instagram (@panoramafilmscollective). The email is shown with a click-to-copy button and is assembled by script, never written in the page source, to keep it from address harvesters. No phone number is published. The studio address (Hilandarska 13, Belgrade) was removed from the contact section at Andrija's request.
- Some site data is inconsistent on panoramafilms.tv itself (the "Valamar Arba Resort" page carries Dubai Future Forum 2023 text and video; Miracles Don't Happen lists year 2023 though it was made for Dubai Future Forum 2024). These need Andrija's confirmation before being treated as settled.
- Several films have subtitles burned into the picture; these cannot be switched off, only cropped or avoided.

## Brand Commitments

- Name: Panorama Films. The authentic Panorama globe logo (white) from panoramafilms.tv is used as is, never redrawn.
- Voice: call the work "films", never "content". No hype words: powerful, compelling, innovative, unique, cutting-edge, world-class, high-quality, impactful, captivating. Short, specific, concrete copy.
- Manifesto (Fields of Work: Impact, Innovation, Culture, Expression) and team bios are taken word for word from the About page on panoramafilms.tv.

## Evidence on Hand

- Films and credits for all 35 projects on panoramafilms.tv/Work, with the site's own thumbnails and GIFs (processed into `media/hover`, `media/stills`).
- Showreel: vimeo.com/1232743611/7e23d97b0f (1:05); muted header loop in `media/clips`.
- 88 behind-the-scenes photos (`media/bts`): the About page slideshow on panoramafilms.tv without its repeats, plus photos restored from the site's other galleries. Shown in colour in "Human in the loop".
- Client logos for 17 selected collaborators, chosen by Andrija, sourced from the clients' own sites or Wikimedia Commons (`media/logos`), shown in a mixed strip of logos and names. Dubai Sports Council has no logo yet (shown as text until Andrija supplies it).
- Team portraits of Andrija Kovač, Mina Strugar and Marija Kovačina, supplied by Andrija (`media/team`), used in the Collective graph.
- Placeholder silhouette portrait for collaborators, supplied by Andrija (`media/team/placeholder.webp`). Portraits supplied by Andrija on 2026-10-09, cropped 4:5 into `media/team/<id>.webp` and mapped in `PHOTOS`: Piki, Nemanja Babić, Danilo Pantović, Nemanja Stojanović, Bojan Palikuća, Zoran Rašić, Milovan Ilić, Nevena Krivokapić-Martinović; new main portraits for Andrija (`andrija-4`) and Marija (`marija-2`). Still without a photo: Marko Cile Mladenović, Matija Đukanović, Ana Ćurčin. Collaborator bios: not yet supplied (lorem ipsum stands in).
- ImagineBoka.ai exhibition photos and poster from panoramafilms.tv/ImagineBoka-ai (`media/proj/ImagineBoka-ai`); venue and dates are taken from the poster.
- Client list from the About page (41 names) plus Dubai Sports Council, confirmed by Andrija.
- Original brand brief: `Panorama_Films_Claude_Brief.txt` (uploaded); the T-shirt work in it is out of scope for the website.
- Absent and not to be fabricated: testimonials, awards, press quotes, pricing, a phone number, reply-time promises.

## Product Principles

1. The films carry the site. Every decision should help a commissioning client see the work quickly and in good quality.
2. One studio, first question to final frame: show the full research-to-edit capability through real projects, not service lists.
3. Truth over polish: real titles, clients, years and roles from panoramafilms.tv, in its order, or nothing.
4. Human judgement leads; tools, including generative media, are methods in service of the film.
5. Every path ends at an enquiry through the contact form.
6. Andrija Kovač, Mina Strugar and Marija Kovačina are the core of Panorama Films: their names, roles, bios and photos must be very visible to Google (real HTML text and images, plus structured data), whatever the design of the Collective ends up being. (Andrija, 2026-10-09; SEO work still to do)

## Site structure (as of v102 / 2026-10-09)

- **Header:** globe logo (30% smaller, near-full white), links ending a quarter of the page in from the right edge (no underline, red underline on hover; no search icon, search stays on `/` and in Contact), the reel's Rec counter in the top right corner while the reel plays; the globe which gives way to a bold "Panorama Films®" wordmark (nav size, Helvetica) once the page has scrolled half the reel's height; the globe with the "Pan" animation (a soft band of light crosses the globe left to right every 14 s; the logo rests at 68% white; off with reduced motion) (dev, 2026-10-09); nav Work · About · Contact (About leads to #studio), plus search (`/` shortcut). Known issue: header overlap, left for later.
- **Hero** with showreel loop (no "Showreel" label).
- **Work** (`#films`): Featured is one section for now (01–06, documentaries not told apart yet), every film runs edge to edge like the reel, its title, logline and Rec lined up with the logo and page text. Over each film only the running Rec counter (top right) and the title + logline in inverted colour, holding the middle of the window as the film scrolls past; below, the client only (title and logline also kept as hidden real text for search). Then the catalogue: cards with title and client at one size, no year (client left out when the title already names it).
- **Studio** (`#studio`): the Collective graph (portraits, profile drawer, a round moving web of team and collaborators, keyboard-accessible list), replacing the old team columns. A centred Graph / List switch at subheading size (remembered per browser) swaps the web for a names-only list set at statement size: the three of us bright, everyone else quieter the fewer films made together; clicking a name opens the same profile; on phones the profile opens inside the list, right under the tapped name, so the names stay scrollable. In the list, pointing at a name previews that profile (the name is found from the rows, so the line between two names never flickers); moving across to the profile keeps it open and fades in an X to close it by hand, and coming back to the list picks up the names again; clicking keeps one open. The profile panel has the same height in both views. Profile: a small 4:5 photo, grayscale, darkened to ~30%; photo, name and title on the panel's left edge, the photo top level with the first name of the list; links without underline at the bottom; the close X appears only once a name is clicked; opening a profile never scrolls the page. Collaborators without a portrait use a dark silhouette photo (`media/team/placeholder.webp`, supplied by Andrija); their bios are lorem ipsum placeholders (`BIO_PH` in the code) until real bios arrive; selected collaborators as a mixed logo/name strip with throw physics.
- **Approach** (`#approach`): Approach with "Seen in" links to the films that show each point, the Manifesto, and the Human in the loop slideshow.
- **Contact** (`#contact`): "Let's make a film together.", contact form link, click-to-copy email, Vimeo, Instagram.
- The page is organised in Films / Studio / Contact folds; their labels use a sharp-line down arrow (SVG). Dark by default, with a Dark/Light switch in the footer.
- Type (scaled down for laptops, 2026-10-09, after a check on Andrija's MacBook Pro): at 1512 px wide the hero and closing line are 56 px (`--h1` 3.7vw, growing to ~95 px at 2560), section statements 46 px (`--d1` 3.05vw, cap 56), subheadings 24 px (`--t1`, cap 26), nav 21 px (cap 22), body text 16 px (`--small`, 15 × `--fz`), interface text (labels, Rec, counters, the reel's play line, footer) 10 px (`--ui`, 9.2 × `--fz`; Back to top 12 × `--fz`). `--fz` is 1px up to a 1440 px window, then grows with it up to 1.6×.
- **Project pages:** top bar: project title left, Prev / Next centred, Close in the corner; thin arrows at the left and right edges of the window, level with the middle of the film (desktop), step to the previous / next project. No caption line and no Open on Vimeo / YouTube link under the player. Client, Year, Services; service work carries a red stamp with black text (e.g. "Service for Orca & Aura Films"); Credits are grouped under red headings "For Panorama Films" / "For <partner>" (an unnamed group stays "External"); films (4:3 films get black bars). At the bottom: Previous / Next project with titles, then "Like what you see? Let's make a film together." with the same Instagram / email / search links as the homepage, set as large as Get in touch, close above the footer.
- **Search** covers every project, its films, credits and text. Projects 28–35 are reachable through the archive, search, and Previous / Next.

## Catalogue

Opens with 12 films (from p07) → "Load more" shows the rest (p07–p27) → "Load more from the archive" adds p28–p35 → "Show fewer".

## Services, roles and credits (system approved by Andrija, 2026-10-09)

Full audit and decisions: the claude.ai doc "Services & Roles — audit and system".

- **Services** = what Panorama Films did for the client. Fixed list, always in this order, sentence case, comma-separated: Concept, Script, Creative direction, Direction, Production, Service production, Cinematography, Aerial cinematography, Editing, Sound production, Animation, Design. Old spellings map in: Script writing/Words → Script, Video production → Production, Edit → Editing, Sound design → Sound production, Delivery → Production. A project's Services line (`F[k].roles`, label "Services") is the union of its films' services. Never a description ("Official event films", "Video partner") or a film type ("Interview").
- **Roles** = who did what, as titles, in this order: Creative Director, Creative Supervisor, Director, Producer, Executive Producer, Writer, Interviewer, Director of Photography, Cinematographer, Aerial Cinematographer, Camera Assistant, Photographer, Sound, Voice-over, Music, Editor, Assistant Editor, Animation, Production Assistant, Curator, Team (no role). Labels go plural automatically when a row names more than one person.
- **Credits live in `crdata`** (a JSON block next to `pjdata`), one entry per project: `type` (commission / service / own), an optional `note` (the stamp for service work, e.g. "Service for Orca & Aura Films") or `partner` ("Partner organisation", SHARE), and `blocks`: "Panorama Films" (our crew) and external blocks (`ext: true`, headed by the company, or "External"). This is the only source for credits on project pages, the Collective graph and search; `pjdata` keeps films, text and per-film services.
- **Service work is someone else's film**: the page carries the stamp at the top, and the external block (their director, producer) comes before ours. Our own projects carry "A Panorama Films project". External crew is shown but never counted in the Collective.
- **Nevena Krivokapić-Martinović, Zoja Kukić and Ana Ćurčin are always Production Assistants**, on every project, never Executive Producers (Andrija, 2026-10-09).
- **Clients' people stay external**: Hessa Al Eassa (Dubai Future Foundation), Nađa Gluhaček, Hrvoje Šepić, Judita Gamulin, Firefly, Whatif.ae and European Western Balkans crews.
- Name spellings: Marko Cile Mladenović, Vladimir Miladinović Piki, Nevena Krivokapić-Martinović, Mina Padežanin, Nemanja Mosurović, Emina Muminović, Filip Lukić. Neda Mojsilović is in the Collective.

## Project media checklist (for the CMS)

1. Video link(s): normal Vimeo/YouTube URL; unlisted Vimeo needs the privacy key (`vimeo.com/ID/KEY`). No embed code.
2. Cover image: featured 1600×900, catalogue 900×506, WebP/JPG.
3. Preview loop (optional): silent H.264 MP4, never GIF. Featured 854×480, 3–5 s, ~300–400 KB; catalogue 640×360, ~1.5 s, ~100 KB.
4. Title, client, year, **services**.
5. Description (featured: one line + intro).
6. Credits: role + names, names spelled consistently.
7. Photos (photo projects): ~1100 px long side; poster at same width.
8. Extra-film thumbnails (optional): 640×360.
