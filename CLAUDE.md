# Working on the Panorama Films website

Read `project.md` first: it holds the product context, rules, site structure and milestones.

## Git workflow
- Several chats may work on this repo at the same time. Run `git pull --rebase origin dev` before starting work and again before every push.
- Work on `dev`. Its Netlify branch deploys are free previews.
- Never push or merge to `main` without Andrija's explicit approval. Every `main` deploy is production and costs Netlify credits.
- Commit and push each finished change to `dev`, with a commit message that says in plain words what changed and why.

## Keep project.md current
- Update `project.md` in the same commit whenever the site structure, a rule, the workflow, the evidence on hand or a milestone changes. Bump its "Last updated" date.
- A new approved milestone gets an `archive/<name>` branch and a line under Milestones.
- After changing `project.md`, also save it to the claude.ai Project as `claude/project.md` (Projects tool, `project_write` with `local_path`) when that tool is available.

## Rules that are easy to break
- Never invent years, roles, credits, clients or claims; panoramafilms.tv or Andrija is the source.
- Project order mirrors the Work page on panoramafilms.tv.
- Never write the contact email in the page source; it is assembled by script.
- `project.md` and `CLAUDE.md` must stay off the live site (redirects in `netlify.toml`).
