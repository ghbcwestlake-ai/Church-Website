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

- [x] **Confirmed service times.** DECIDED 2026-06-10: Sundays only for launch —
  **Prayer 9:00 AM, Worship 9:30 AM.** Wednesday is being removed for now and
  rebuilt later. Now live in the hero info strip.
- [x] **Post-June hero plan.** DECIDED 2026-06-10: hero is now evergreen — logo,
  warm welcome line, one primary "Plan Your Visit" + three paths, and a service
  times/address strip. No anniversary content in the hero.
- [x] **Strip the 150 content NOW (don't wait for June 28).** DECIDED 2026-06-10:
  the site won't be ready to launch before the celebration, so serving the 150th
  is no longer this site's job. Tear it out — see **Batch E** below. ⚠️ Dorian to
  give Pastor a heads-up, but the direction is set.
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
  — BLOCKED on the 🤔 service-times decision. Not touched.
- [~] Read every section aloud once for typos, awkward phrasing, and consistency
  (e.g. curly vs straight apostrophes appear mixed in places).
  — 2026-06-09: MECHANICAL part done — converted all straight apostrophes in
  visible body copy to `&rsquo;` to match the site's dominant style (13 fixes in
  index.html; subpages were already clean). Left `<title>`/meta apostrophes
  straight on purpose (conventional, not on-page). The judgment part (reading
  for typos / awkward phrasing) still needs a human pass.
- [x] Confirm the church name is rendered consistently everywhere
  ("Good Hope Missionary Baptist Church") including image alt text — some logo
  alt text and file names use "GHPC" / "GHBC" inconsistently.
  — 2026-06-09: VERIFIED clean. All alt text reads "Good Hope Missionary Baptist
  Church" (no GHPC/GHBC anywhere in alt); visible full name is consistent.
  ⚠️ FLAG: og:title/twitter:title on /150 use "Good Hope MBC" (abbreviation) —
  left as-is (defensible for share-card length; your call to standardize).
  NOTE: logo *filenames* still use "GHPC-*" — intentionally parked to the photo
  pass per the brief (renaming files isn't a cosmetic-safe text edit).
- [ ] Beliefs section: confirm the 5 points read the way church leadership wants
  them stated (this is doctrine — worth a second set of eyes).
  — JUDGMENT / doctrine. Not touched; needs church leadership review.
- [x] Check the address is identical in all three places it appears (hero/connect,
  Find Us, footer): "821 Sampson St., Westlake, LA 70669."
  — 2026-06-09: now uniform across all 6 display spots as
  **"821 Sampson St., Westlake, Louisiana 70669"**. ⚠️ NOTE: I normalized to the
  site's dominant "Louisiana" (6 of 7 already used it; only the giving card said
  "LA"). The brief's example said "LA" — easy one-word flip if you'd rather
  abbreviate everywhere instead. (JSON-LD + map-link URLs left in their own
  required formats.)

## BATCH B — Links, contact info & technical hygiene
*One mode: clicking things and verifying they go where they should.*

- [x] Verify every nav anchor link jumps to the right section
  (#welcome, #services, #beliefs, #ministries, #connect, #visit, #pastor).
  — 2026-06-09: all 10 anchors resolve to real section IDs. ✓
- [x] Confirm phone link dials correctly: (337) 433-7403.
  — `tel:+13374337403` in all 7 spots, consistent. ✓
- [x] Confirm all `mailto:` links open with the right subject lines.
  — all → goodhopebap@outlook.com, contextual subjects correct. ✓
- [~] Test Facebook + YouTube links open the correct, live pages.
  — URLs resolve and page titles match the church, but a login wall blocks an
  automated check. NEEDS a manual click to confirm they're the right, active pages.
- [x] Confirm the Google Maps embed points to the correct address/pin.
  — embed `q=821 Sampson St, Westlake, LA 70669`. ✓
- [~] Check the favicon and the `og-image.png` (social share preview) look right
  when the link is pasted into a text/Facebook.
  — favicon OK (secondary full-color logo). 🔴 **og-image.png is MISSING**: all 3
  pages reference `/og-image.png` but the file was never generated, so social
  share previews are blank/broken. Template exists (`og-image.html`, 1200×630);
  needs rendering to a PNG at the repo root. PARKED for now (needs headless render).
- [x] Confirm meta description / titles are accurate (they reference 150 years —
  fine for now, revisit in post-June batch).
  — all 3 pages have accurate, distinct titles + descriptions. ✓

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

## BATCH E — Strip the 150th content (DONE 2026-06-10)
*The site won't launch before June 28, so the 150th is no longer its job. Torn
out cleanly; a recap can be rebuilt later if church leadership wants one.*

- [x] Swap hero to evergreen version. — DONE 2026-06-10.
- [x] Removed the sticky 150th / June 28 announcement bar (home + Our Story).
- [x] Removed the big "150 Years" anniversary section on the home page.
- [x] Retired the `/150/` page entirely (deleted); removed every nav/footer/CTA
  link to it across home, Our Story, and the thank-you page. Verified zero
  `/150/` references remain repo-wide.
- [x] **Removed the Services section entirely** (per decision — rebuild clean
  later). Sunday times now live only in the hero info strip. Also dropped the
  "Coming for the 150th" checkbox from the visit form.
- [x] Scrubbed stale 150/anniversary copy from meta description, OG/Twitter tags,
  JSON-LD, footers (home + Our Story), and the og-image template.
- [x] Fixed hero min-height (no longer subtracts the removed announcement bar).

**Kept on purpose (heritage, not the celebration):** Our Story's full 150-year
timeline + shepherds; the home Welcome + Heritage sections. ⚠️ These still say
"150 years" / "Debt Free. Mortgage Burned. 150 Years." — fine as heritage, but
revisit the phrasing for long-term freshness in Batch F.

**Follow-ups logged:**
- [ ] Dead-CSS sweep: `.anniversary-bar`/`.ab-*`/`.service-card*`/`.services-notice`
  are now unused on the home page. Confirm Our Story doesn't rely on them, then
  remove from styles.css. (Left in place now — harmless, and `.timeline`/
  `.anniversary-card` styling is still used by Our Story.)
- [ ] **Rebuild a Sunday section, fresh thinking** (replaces old Services): lead
  with "Sunday Worship 9:30 AM," explain what a Sunday looks like, note Children's
  Ministry (ages 3–12). Keep it simple; build back as content is ready.

## BATCH F — Section-by-section content & flow (from 2026-06-10 walkthrough)
*Captured during review. Content/copy/structure refinements — mostly need a
human voice pass, not mechanical edits.*

- [ ] **Welcome copy.** Rewrite so it reads like a real person wrote it, not
  generic filler.
- [x] **Connect — rebuilt newcomer-first (DONE 2026-06-10).** Heading → "Connect
  With Us." Removed Give (turnoff for newcomers); replaced Weekly Bulletin with a
  weekly-encouragement EMAIL sign-up; reframed Serve → "Find Your Place." Prayer
  is now a low-friction inline **Netlify form** (was a mailto). Kept Watch (YouTube)
  + Follow (Facebook). Section = prayer form → 3 cards → encouragement sign-up.
  ⚠️ ADMIN TODO (in Netlify dashboard, not code): after deploy, Forms → add email
  notifications for **prayer-request** and **weekly-encouragement** → route to
  goodhopebap@outlook.com / Pastor Tim.
- [ ] **Weekly encouragement — SENDING (later phase).** The form only *collects*
  sign-ups right now. Actually sending a weekly email needs (a) someone to write
  it and (b) a tool (MailerLite/Mailchimp/Brevo). Text/SMS deferred (cost +
  opt-in compliance). Decide with leadership.
- [ ] **Beliefs.** Content/clarity pass (also see doctrine review in Batch A).
- [ ] **Ministries.** Keep, but tighten and clarify.
- [ ] **Section order / flow.** Heritage/"our story" currently sits right after
  Welcome (hero → welcome → heritage → …). Evaluate moving visitor-facing
  sections (Plan Your Visit, beliefs) ahead of heritage — history matters more to
  members/shoppers than to a first-time stranger.
  → Claude's rec: move heritage lower; lead with what a stranger needs first.

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

- [x] **Form backend.** DONE — forms run on Netlify Forms (plan-your-visit,
  prayer-request, weekly-encouragement). Submissions collect in the Netlify
  dashboard. Remaining: turn on email notifications (admin step, see Batch F).
- [ ] **Outreach owner — WHO closes the loop (board decision).** The site
  captures interest, but a real person must respond. Define a point person /
  welcome team. Responsibilities: check requests regularly, respond within 48h,
  route prayer to Pastor/prayer team, welcome + follow up with first-time
  visitors, send the weekly encouragement note. Dorian may lead this to start.
- [ ] **Map the full journey (stranger → family).** Define what happens at every
  step after someone takes an action on the site — visit, prayer, talk, watch,
  email signup — and who does what. Drafted for the board presentation
  (2026-06-10); turn the agreed version into a written follow-up playbook.
- [ ] **Weekly encouragement — sending engine.** (See Batch F.) Tool + writer.

---

## 📓 SESSION LOG
*One line per morning: date — what got done — where to pick up next.*

- 2026-__-__ — Set up Project + foundation docs. Next: knock out 🤔 decisions.
- 2026-06-09 — Batch B verification pass: nav / phone / mailto / Maps / meta all
  ✓. FB + YouTube need a manual click to confirm. og-image.png is MISSING →
  blank social-share previews (logged, parked, needs headless render). Next:
  knock out 🤔 decisions, or start Batch A copy polish.
- 2026-06-10 — CONNECT SECTION REBUILT (newcomer-first) + PUSHED. Heading →
  "Connect With Us"; prayer is now an inline Netlify form (not a mailto); removed
  Give; Bulletin → weekly-encouragement EMAIL sign-up (collection only); Serve →
  "Find Your Place"; kept Watch (YouTube) + Follow (Facebook). Two new Netlify
  forms: prayer-request, weekly-encouragement.
  ▶▶ START HERE NEXT TIME:
     1. ADMIN (you, in Netlify — not code): Dashboard → Forms → turn on email
        notifications for "prayer-request" and "weekly-encouragement" so they
        reach goodhopebap@outlook.com / Pastor Tim. Also do the same for
        "plan-your-visit" if not already done.
     2. SECTION REORDER (the deferred decision): recommended order is
        Welcome → Beliefs → Connect → Visit → Pastor → Ministries → Our Story.
        Confirm, then I move the sections. Low-risk, do this first next session.
     3. Then remaining Batch F copy: Welcome (human voice), Beliefs, Ministries.
     4. Parked still: real photos, og-image.png render, dead-CSS sweep, rebuild a
        simple Sunday section (Worship 9:30, what Sunday looks like, kids 3–12).
- 2026-06-10 — BATCH E DONE (strip 150th sitewide). Removed announcement bar,
  the home 150 section, the entire Services section, and the `/150/` page; fixed
  every link that pointed to it across home / Our Story / thanks (zero `/150/`
  refs remain). Scrubbed stale 150 copy from meta/OG/JSON-LD/footers/og-image.
  Kept all genuine heritage content (Our Story timeline, home Heritage/Welcome).
  Hero min-height fixed. PUSHED hero earlier; Batch E changes UNCOMMITTED pending
  review. Next: review live, then push Batch E. Then Batch F (section content).
- 2026-06-10 — HERO REBUILT (cosmetics). Full-color logo in a refined cream card,
  evergreen copy, one primary "Plan Your Visit" (→#visit) + three pill paths
  (New Here?→#welcome, Need Prayer?→#connect, Talk With Us→#plan-form), and a new
  Sunday-times + address info strip. Removed all 150/anniversary content from the
  hero. Service times DECIDED (Sun: Prayer 9:00, Worship 9:30). Walkthrough
  logged new Batch E (strip 150 sitewide) + Batch F (section content). Changes
  UNCOMMITTED pending review/push. Next: push hero, then start Batch E teardown.
- 2026-06-09 — Batch A mechanical pass (no judgment calls): fixed all straight
  apostrophes in visible copy → `&rsquo;` (13 edits, index.html); normalized the
  address to a single uniform string everywhere ("Westlake, Louisiana 70669");
  verified church-name + alt-text consistency (clean). Left for a human:
  service-times disclaimer (blocked on decision), full read-aloud typo/phrasing
  pass, Beliefs doctrine review, and two flags (og:title "Good Hope MBC";
  LA-vs-Louisiana direction). Changes are UNCOMMITTED pending review.
