# Good Hope Missionary Baptist Church — Website

The website for Good Hope Missionary Baptist Church, 821 Sampson St., Westlake, Louisiana 70669.
Founded 1876. Celebrating 150 years in 2026.

## What this is

A small static site — plain HTML, CSS, and JavaScript. **No build step, no dependencies.**
To preview locally, just open `index.html` in a browser (or run any static server, e.g. `npx serve`).

## Files

| File | Purpose |
| --- | --- |
| `index.html` | The entire site (single page, anchor-linked sections). |
| `styles.css` | All styling. Section order mirrors `index.html`. Brand colors are CSS variables at the top. |
| `script.js` | Sticky header, mobile nav toggle, footer year. |
| `og-image.html` | A 1200×630 template used to generate `og-image.png` (the social link preview). Not linked from the site — see the comment at the top of the file for how to export it. |
| `Logos/` | Church logo lockups (full color / black / white, horizontal / vertical). |
| `netlify.toml` | Netlify config (no build; publishes the repo root). |

## Editing content

Everything is in `index.html`. Sections are clearly commented (`<!-- ... -->`). Common updates:

- **Service times** — currently marked *tentative*; search for `service-time` and the `services-note`.
- **Ministries** — nine `<article class="ministry-card">` blocks; the descriptions are placeholders awaiting the church's own copy.
- **Pastor** — the `#pastor` section.
- **Contact / address / social** — appear in the `#visit` section and the footer.
- **150th anniversary** — the announcement bar at the top of `<body>`, the hero badge, and the `#anniversary` section.

## Deployment

Hosted on Netlify. Pushing to the default branch triggers an automatic deploy.
(If not connected to Git yet: in the Netlify dashboard, "Add new site" → import this repo, or drag the project folder onto the Deploys area.)
