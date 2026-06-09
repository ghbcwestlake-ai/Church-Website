# Good Hope Website — Punch List & Working Tracker

> The living document. Burn this down one morning at a time.
> Read `PROJECT-BRIEF.md` first if you haven't.
> Phase right now: **COSMETICS ONLY.** Photos and form backend are parked.

**How to use this:**
- Items are grouped into **batches by *type of work*** (not by section). Stay in
  one batch per session — switching modes is where time leaks.
- `[ ]` = to do · `[x]` = done · `[~]` = in progress / partially done.
- **DECISION items** (🤔) are things only *you* can answer. They block execution.
  Knock these out first, on a fresh morning, because everything else waits on them.
- Each `[ ]` item is meant to be tight enough to paste into Claude Code. If it
  isn't that specific yet, it's probably a hidden decision — move it up to 🤔.

---

## 🤔 DECISIONS NEEDED (do these first — they unblock everything)

- [ ] **Confirmed service times.** The site currently says Sunday/Wednesday
  times are "still being confirmed" and tells people to call. Lock the real
  times so we can remove that disclaimer. → Sun: ____  Wed: ____
- [ ] **Post-June hero plan.** What does the top of the page say after the 150th
  celebration ends? (Options: rotate to an evergreen "Welcome / Plan a Visit"
  hero, keep a smaller "we just celebrated 150 years" banner, etc.) Decide the
  direction; we'll write it.
- [ ] **Post-June 150 section.** Same question for the big "150 Years" section
  and the `/150/` page — archive it? Turn it into a recap with photos? Decide.
- [ ] **Pastor bio accuracy.** Confirm every detail in Pastor Tim's bio is
  current and correct before we treat that section as locked.
- [ ] **Ministry contacts.** Do any ministries (Youth, Music, Missions, etc.)
  have a specific leader/contact we should name or route interest to? Or does
  everything funnel through the main church email for now?
- [ ] **Domain.** Staying on `ghbcwestlake.netlify.app`, or is there a plan to
  point a custom domain (e.g. goodhopewestlake.org) before launch? Affects
  canonical URLs and meta tags.

---

## BATCH A — Copy & text polish
*One mode: reading and tightening words. No layout, no images.*

- [ ] Remove the "service times still being confirmed / please call to verify"
  disclaimer once times are locked (see decision above).
- [ ] Read every section aloud once for typos, awkward phrasing, and consistency
  (e.g. curly vs straight apostrophes appear mixed in places).
- [ ] Confirm the church name is rendered consistently everywhere
  ("Good Hope Missionary Baptist Church") including image alt text — some logo
  alt text and file names use "GHPC" / "GHBC" inconsistently.
- [ ] Beliefs section: confirm the 5 points read the way church leadership wants
  them stated (this is doctrine — worth a second set of eyes).
- [ ] Check the address is identical in all three places it appears (hero/connect,
  Find Us, footer): "821 Sampson St., Westlake, LA 70669."

## BATCH B — Links, contact info & technical hygiene
*One mode: clicking things and verifying they go where they should.*

- [ ] Verify every nav anchor link jumps to the right section
  (#welcome, #services, #beliefs, #ministries, #connect, #visit, #pastor).
- [ ] Confirm phone link dials correctly: (337) 433-7403.
- [ ] Confirm all `mailto:` links open with the right subject lines.
- [ ] Test Facebook + YouTube links open the correct, live pages.
- [ ] Confirm the Google Maps embed points to the correct address/pin.
- [ ] Check the favicon and the `og-image.png` (social share preview) look right
  when the link is pasted into a text/Facebook.
- [ ] Confirm meta description / titles are accurate (they reference 150 years —
  fine for now, revisit in post-June batch).

## BATCH C — Visual & layout polish
*One mode: how it looks. Spacing, alignment, color, type, mobile.*

- [ ] **Mobile pass.** View the whole site on a phone-width screen. Note every
  spot where text crowds, images squish, or buttons are hard to tap.
- [ ] Check the sticky announcement bar (150th / June 28) doesn't overlap content
  or feel cramped on mobile.
- [ ] Confirm consistent vertical spacing between sections (some feel tighter
  than others).
- [ ] Check button styles are consistent (primary vs secondary CTAs).
- [ ] Verify brand colors (navy #1F4173 + gold) are applied consistently.
- [ ] Check heading hierarchy/sizes are consistent section to section.
- [ ] Confirm the two CTAs in the hero ("Plan Your Visit" / "Join Our 150th")
  are clearly distinguished and both obviously clickable.

## BATCH D — Conversion / "does this drive a visit?" pass
*One mode: walk the site as a stranger. Where would you hesitate or bounce?*

- [ ] Is the single most important action (Plan a Visit) obvious within the first
  screen, without scrolling? If not, fix.
- [ ] Does a first-time visitor know *exactly* when to show up and where to park
  before they have to hunt? (Service times + address high enough on the page.)
- [ ] Is there a clear, low-pressure CTA repeated at natural stopping points down
  the page (not just at the top and bottom)?
- [ ] "Plan Your Visit" Q&A — does it answer the real first-timer fears? (Looks
  strong already; just confirm nothing's missing.)

## BATCH E — Post-June content transition
*Handle BEFORE the celebration ends so the site never reads stale.*
*(Blocked on the post-June decisions above.)*

- [ ] Swap hero to evergreen version per decision.
- [ ] Resolve the "150 Years" section per decision (archive / recap / shrink).
- [ ] Remove or update the sticky June 28 announcement bar.
- [ ] Update meta description / OG tags if they lean on the celebration.
- [ ] Decide fate of the `/150/` page.

---

## 📸 PHOTO SHOT LIST (parked — fill during a future photoshoot)
*Do NOT work on these now. This is the shopping list for photo day so the swap
is a single afternoon later.*

- [ ] **Pastor Tim** — real portrait/headshot (currently generic stock).
  *This is the highest-value photo on the site.*
- [ ] **Hero / worship** — real congregation gathered for Sunday worship
  (currently Unsplash stock).
- [ ] **Welcome section** — candid of the church family / fellowship.
- [ ] Consider: building exterior, ministries in action (choir, ushers, youth,
  children's class), 150th celebration events.
- [ ] Note: replace logo image alt text / filenames if needed during this pass.

---

## 🔌 LATER PHASES (parked — not cosmetics)

- [ ] **Form backend.** Wire "Tell us you're coming" form. Likely Netlify Forms
  → Google Sheets (or Airtable). Decide with church leadership.
- [ ] **Lead follow-up system.** How captured info reaches Pastor Tim and gets
  acted on. Comes after the form is wired.

---

## 📓 SESSION LOG
*One line per morning: date — what got done — where to pick up next.*

- 2026-__-__ — Set up Project + foundation docs. Next: knock out 🤔 decisions.
