# Good Hope Website — Project Brief

> The constitution for this project. This rarely changes. It exists so that any
> fresh Claude chat (or any collaborator) has full context without a recap.
> Read this first. The day-to-day work lives in `PUNCH-LIST.md`.

---

## 1. The one goal

Turn a stranger into a visitor, and a visitor into a member of Good Hope
Missionary Baptist Church.

The site exists to get more people through the doors on Sunday. Every element on
the page either moves someone one step closer to showing up — or it's decoration.

**The test for any decision:** "Does this help someone decide to show up to
church?" If the answer is no, it's not a priority.

The visitor's journey we're designing for:
1. Someone lands on the site (sent a link, or found it).
2. They trust that Good Hope is real, warm, and for them.
3. They know exactly when and where to come.
4. They either hand us their info (the form) or just show up.

---

## 2. Who we're talking to

- People searching for a church home in/around Westlake, LA.
- People returning to faith or visiting the area.
- Folks invited by a current member who want to "check it out" first online.
- During 2026: anyone connected to the 150th anniversary celebration.

Tone: warm, plain-spoken, not slick. "Come as you are." A real church family,
not a corporate brand. The current copy nails this — protect it.

---

## 3. The stack & who does what

| Tool | Role |
|------|------|
| **GitHub** | Source of truth. Every change lives here. |
| **Netlify** | Hosts the live site. Auto-deploys on every push to GitHub. |
| **Claude Code (in VS Code)** | The *hands*. Reads/writes the actual files locally. You push from here. |
| **Claude desktop app** | The *strategy room*. Plan, decide, write copy, turn vague ideas into exact instructions. Cannot touch files. |

**Keep these roles separate.**
- Desktop Claude *thinks*; Claude Code *executes*.
- Don't make design decisions inside Claude Code — it'll run ahead and edit ten files.
- Don't try to hand-code in the desktop app — it can't reach your files.
- The handoff is always: decide here → get an exact prompt → paste into Claude Code → review the live result.

---

## 4. Current site architecture

- **One main page** (single long scroll): hero → welcome → heritage → 150 →
  services → beliefs → ministries → connect → pastor → plan your visit → find us → footer.
- **`/our-story/`** — separate page.
- **`/150/`** — separate page.

A single scrolling page is the *right* format for a "come visit us" site — it
removes navigation decisions and keeps people moving toward the CTA. **Resist
adding new pages** unless something genuinely doesn't fit the flow. The two
sub-pages earn their place; don't sprawl beyond them without a reason.

---

## 5. Standing rules (the guardrails)

**Photos — parked.** We are NOT sourcing real photos right now. Stock photos
stay as placeholders site-wide. Do not spend daily sessions hunting images.
Instead, every spot needing a real photo gets logged in the Photo Shot List
section of the punch list, so a future church photoshoot has an exact list to
fill. Photo replacement is a single later phase, not a daily chore.

**Form — parked.** The site isn't live yet. The "Tell us you're coming" form
exists visually but its backend is not today's concern. Likely future plan:
Netlify Forms piping to Google Sheets (or Airtable) — to be decided with church
leadership. Logged in the punch list as a later phase. **Do not spend cosmetic
sessions on form functionality.**

**Current phase = COSMETICS ONLY.** Shell and look first. Functionality
(form backend, follow-up system) comes after the shell is polished.

**Post-June plan.** The homepage leans hard on the 150th celebration and the
June 28 anniversary service. After June 2026 this will read as stale. We need a
plan for what the hero and 150 section become once the celebration passes.
Logged as its own batch — handle before the celebration ends.

---

## 6. Phases (rough order)

1. **Cosmetics / shell polish** ← we are here
2. Real photo swap (after photoshoot)
3. Form backend + lead capture (Netlify Forms → Google Sheets/Airtable)
4. Follow-up / outreach system for captured leads
5. Post-June content transition

---

## 7. How we work each morning

30–45 min sessions, one day at a time. The rhythm:
1. Open a fresh chat here; say which **batch** you're attacking.
2. We refine 3–5 punch-list items into exact Claude Code prompts.
3. Run them in VS Code → push to GitHub → Netlify deploys.
4. Eyeball the live site. Review each change before moving on.
5. Check items off in `PUNCH-LIST.md`. Note where you stopped.

The failure mode to avoid: unreviewed edits piling up until something subtly
broke days ago and you can't tell where. **Review as you go.**
