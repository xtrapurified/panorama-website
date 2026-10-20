# Working on the Panorama Films website

Read `project.md` first: it holds the product context, rules, site structure and milestones.

## Git workflow
- Several chats may work on this repo at the same time. Run `git pull --rebase origin dev` before starting work and again before every push.
- `main` can also change without a chat: saving on panoramafilms.tv/slideshow/ commits photos straight to `main`. Before starting work, and before merging `dev` into `main`, bring those commits into `dev`: `git fetch origin && git merge origin/main` on `dev` (they only touch `media/bts/`).
- Work on `dev`. Every push gets a Cloudflare Pages preview at dev.panorama-website.pages.dev.
- Never push or merge to `main` without Andrija's explicit approval. Every `main` deploy is production (panoramafilms.tv).
- Commit and push each finished change to `dev`, with a commit message that says in plain words what changed and why.

## Keep project.md current
- Update `project.md` in the same commit whenever the site structure, a rule, the workflow, the evidence on hand or a milestone changes. Bump its "Last updated" date.
- A new approved milestone gets an `archive/<name>` branch and a line under Milestones.
- After changing `project.md`, also save it to the claude.ai Project as `claude/project.md` (Projects tool, `project_write` with `local_path`) when that tool is available.

## Rules that are easy to break
- Never invent years, roles, credits, clients or claims; panoramafilms.tv or Andrija is the source.
- Project list and order are the website's own, set by Andrija (see "Project list and order" in `project.md`); they no longer follow panoramafilms.tv.
- Never write the contact email in the page source; it is assembled by script.
- `project.md` and `CLAUDE.md` must stay off the live site: the Cloudflare Pages build command leaves out every `.md` file (see Hosting in `project.md`).
- After any change to projects (list, order, titles, clients, years, credits, films), run `node tools/seo/build.mjs` from the repo root and commit what it writes (see "SEO" in `project.md`).
