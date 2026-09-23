# Good Hope Kids — the children's ministry site

Everything the children's ministry needs in one place, at `/kids` on the church
site: teachers present the lesson and print what they need, parents see what was
taught and reinforce it at home, and both see the feed.

Two doors, one code each. **Everything under `/kids` is behind that code** —
pages, lesson files, art and photographs alike.

---

## How a lesson gets here

Nothing in this folder is written by hand. A lesson is built by the pipeline in
the Atlas repo (`childrens-ministry/`) and published into this folder:

```
Juliet writes the lesson
  -> atlas-os/childrens-ministry/lessons/<slug>/slide-map.yaml   (the source)
  -> python scripts/build_deck.py ...          Drive: Deck.pptx
  -> python scripts/build_teacher_guide.py     Drive: Teacher Guide.pdf
  -> python scripts/build_faith_builders.py    Drive: Faith Builders.pdf
  -> python scripts/build_site.py lessons/<slug>
         kids/data/lessons/<slug>.json   the lesson, slides and all
         kids/data/lessons.json          the index, rebuilt
         kids/art/<slug>/*.jpg           web-sized art
         kids/files/<slug>/*.pdf         the two PDFs, copied out of Drive
  -> commit and push this repo
```

**Three places, three jobs.** The Atlas repo is the source and the only thing
anyone edits. Drive holds the finished PDFs as the archive — and as the backup a
teacher can open if the site is ever down on a Sunday morning. This folder is
how the lesson actually gets used.

To post to the feed, from the Atlas repo:

```
python scripts/post_to_feed.py --by "Juliet Hayes" --text "..." --photos IMG_1.jpg
```

That copies the photos in, writes `kids/data/feed.json`, and the post goes live
on the next push.

---

## The gate

`netlify/edge-functions/kids-auth.js`, at the **repo root** — Netlify reads edge
functions from there only. Read the comment at the top of that file before
changing anything about it.

It needs two environment variables on the Netlify site. Neither is ever in this
repo:

| Variable | What |
| --- | --- |
| `KIDS_SESSION_SECRET` | Any long random string. Changing it signs everybody out. |
| `KIDS_CODES` | JSON, one entry per code (below) |

```json
[
  {"code":"1234","role":"leader","name":"Dorian Hayes"},
  {"code":"5678","role":"leader","name":"Juliet Hayes"},
  {"code":"2468","role":"parent","name":"Parent"}
]
```

**Every leader gets their own code.** That is what signs a feed post with the
right name, and what lets one volunteer be removed without re-texting every
parent in the ministry. Parents share one code.

Edge functions read their environment at deploy time, so **a code change needs a
deploy**, not just a save in the Netlify UI.

If either variable is missing the gate serves nothing at all rather than
everything. An unconfigured gate must never be an open one.

### What is public under /kids

Only `kids/public/` (the gate screen and its logo) and, when the registration
forms move over, `/kids/register` and `/kids/volunteer` — a family that has not
signed up yet cannot have a code. Everything else is refused without a session,
including direct links to art and photographs.

The whole section is `noindex`, so nothing here is ever crawled or searchable.

---

## What is in here

| Path | What |
| --- | --- |
| `index.html` | The app shell. All of it renders from `app.js`. |
| `app.js` | Routes and every screen. Hash routes, no framework. |
| `app.css` | Styles. Children's ministry palette, not the church site's. |
| `slides.js` | **Draws a slide.** Ported from `build_deck.py` coordinate for coordinate. |
| `data/lessons.json` | Index of lessons, newest first |
| `data/lessons/<slug>.json` | One lesson: slides, verse, take-home, guide |
| `data/feed.json` | The feed |
| `art/<slug>/` | Lesson art, web-sized |
| `files/<slug>/` | The lesson's PDFs |
| `photos/<post>/` | Feed photographs. Behind the gate, never linked from Drive. |
| `public/gate.html` | The two-door screen and the keypad. The only public page. |
| `sw.js` | Offline: a lesson opened once presents with no network |
| `manifest.webmanifest` | So it installs to a home screen |

### slides.js and build_deck.py must stay in step

Both lay slides out on the same 1440 x 810 canvas at the same coordinates, so
the room sees the same thing either way. **Change a layout in one and change it
in the other**, then look at both.

---

## Working on it

No build step, on purpose: this folder has to be able to fold into the main
church site, which Netlify publishes as-is.

The gate is an edge function, so plain `python -m http.server` will serve the
app but `/kids/__me` will 404 and the app will not start. Either run
`netlify dev` from the repo root, or stub that one endpoint.

## Classes

Only **ages 4 to 8** runs today. Nursery and preteen appear on the teacher's
Sunday screen as "No class yet" and start working the moment a lesson is
published with that class set — the structure is there, nothing is built for
them until there is a leader.
