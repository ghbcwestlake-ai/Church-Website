/* ============================================================================
   GOOD HOPE KIDS — app.js

   One page, hash routes, no framework and no build step. That last part is not
   laziness: this folder has to be able to sit inside the church website repo,
   which Netlify publishes as-is, and fold into the main site later without a
   rewrite.

   WHAT THIS FILE TRUSTS

   Nothing here decides who may see what. The gate
   (netlify/edge-functions/kids-auth.js) has already refused the request if the
   visitor has no session, and it refuses the lesson JSON, the art and the
   photographs the same way. `me.role` below only decides which screens are
   worth showing someone — it is a convenience, never a control.

   WHERE THE CONTENT COMES FROM

   kids/data/lessons.json and kids/data/lessons/<slug>.json are written by
   childrens-ministry/scripts/build_site.py in the Atlas repo, out of Juliet's
   slide map. Nothing in this app writes or edits lesson content, and no
   string in this file is lesson content.
   ========================================================================== */

(function () {
  "use strict";

  var CLASSES = [
    { key: "4-8", name: "Ages 4–8" },
    { key: "1-3", name: "Nursery, 1–3" },
    { key: "9-12", name: "Preteen, 9–12" }
  ];

  var MONTHS = ["January", "February", "March", "April", "May", "June", "July",
                "August", "September", "October", "November", "December"];

  var state = {
    me: null,
    index: [],
    feed: [],
    lessons: {},          // slug -> full lesson, fetched once
    present: null         // { slug, n } while presenting
  };

  var view = document.getElementById("view");
  var topbar = document.getElementById("topbar");
  var tabs = document.getElementById("tabs");

  /* ---------------------------------------------------------- helpers -- */

  function esc(text) {
    return String(text == null ? "" : text)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function getJSON(path) {
    return fetch(path, { credentials: "same-origin" }).then(function (response) {
      if (response.status === 401) {
        // The session expired while the app was open. The gate will draw its
        // own screen on a fresh page load.
        window.location.reload();
        throw new Error("signed out");
      }
      if (!response.ok) throw new Error(path + " " + response.status);
      return response.json();
    });
  }

  /* "2026-09-13" -> "Sunday, September 13". Parsed as local noon so a
     timezone never shifts a Sunday to a Saturday. */
  function longDate(iso) {
    var parts = String(iso).split("-");
    var date = new Date(+parts[0], +parts[1] - 1, +parts[2], 12);
    var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[date.getDay()] + ", " + MONTHS[date.getMonth()] + " " + date.getDate();
  }

  function shortDate(iso) {
    var parts = String(iso).split("-");
    return MONTHS[+parts[1] - 1] + " " + (+parts[2]);
  }

  function className(key) {
    for (var i = 0; i < CLASSES.length; i++) if (CLASSES[i].key === key) return CLASSES[i].name;
    return key;
  }

  function isLeader() { return state.me && state.me.role === "leader"; }

  function latestLesson() { return state.index.length ? state.index[0] : null; }

  function initials(name) {
    var trimmed = String(name || "").trim();
    return trimmed ? trimmed.charAt(0).toUpperCase() : "·";
  }

  function icon(paths, options) {
    var o = options || {};
    return '<svg width="' + (o.size || 22) + '" height="' + (o.size || 22) +
      '" viewBox="0 0 24 24" fill="none" stroke="' + (o.color || "currentColor") +
      '" stroke-width="' + (o.weight || 2) +
      '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + paths + '</svg>';
  }

  var ICONS = {
    home:    '<path d="M3 11.2 12 4l9 7.2"/><path d="M5.5 10v9h13v-9"/>',
    photos:  '<rect x="3" y="4.5" width="18" height="15" rx="2.5"/><path d="M3 15.5 8 11l4.5 4"/><circle cx="15.5" cy="9.5" r="1.6"/>',
    book:    '<path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5Z"/><path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H13v16h5.5a1.5 1.5 0 0 0 1.5-1.5Z"/>',
    calendar:'<rect x="3.5" y="5" width="17" height="15.5" rx="2.4"/><path d="M3.5 10h17"/><path d="M8 3v4"/><path d="M16 3v4"/>',
    printer: '<path d="M7 9V3.5h10V9"/><rect x="4" y="9" width="16" height="7" rx="1.6"/><path d="M7 16h10v4.5H7z"/>',
    guide:   '<rect x="5" y="2.5" width="14" height="19" rx="2.2"/><path d="M9 7h6"/><path d="M9 11h6"/><path d="M9 15h3.5"/>',
    chat:    '<path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9.5 9.5 0 0 1-2.9-.4L3 21l1.6-4.4A8.1 8.1 0 0 1 3.6 11 8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5Z"/>',
    back:    '<path d="m15 6-6 6 6 6"/>',
    next:    '<path d="m9 6 6 6-6 6"/>',
    check:   '<path d="m5 12.5 4.5 4.5L19 7"/>',
    doc:     '<path d="M14 3H7a1.8 1.8 0 0 0-1.8 1.8v14.4A1.8 1.8 0 0 0 7 21h10a1.8 1.8 0 0 0 1.8-1.8V7.8Z"/><path d="M14 3v5h4.8"/>',
    out:     '<path d="M15 3h3.5A1.5 1.5 0 0 1 20 4.5v15a1.5 1.5 0 0 1-1.5 1.5H15"/><path d="M10 8 6 12l4 4"/><path d="M6 12h10"/>'
  };

  /* ------------------------------------------------------------ chrome -- */

  function setChrome(options) {
    var o = options || {};
    if (o.bare) {
      topbar.innerHTML = "";
      topbar.style.display = "none";
      tabs.innerHTML = "";
      view.classList.add("bare");
      return;
    }
    topbar.style.display = "";
    view.classList.remove("bare");

    // No crest up here. The logo is a vertical lockup with the church's name
    // set into it; at 30px it reads as a smudge. It belongs on the title
    // slide and the take-home header, which is what brand.md says.
    var left = o.back
      ? '<a class="iconbtn" href="' + esc(o.back) + '" aria-label="Back">' +
          icon(ICONS.back, { color: "#FFFFFF", size: 20, weight: 2.5 }) + '</a>'
      : "";

    topbar.innerHTML = left +
      '<span class="title">' + esc(o.title || "Good Hope Kids") + '</span>' +
      (o.who ? '<span class="who">' + esc(o.who) + '</span>' : "");

    drawTabs(o.tab);
  }

  function drawTabs(current) {
    var items = isLeader()
      ? [{ id: "sunday", href: "#/", label: "Sunday", glyph: ICONS.calendar },
         { id: "lessons", href: "#/lessons", label: "Lessons", glyph: ICONS.book },
         { id: "feed", href: "#/feed", label: "Feed", glyph: ICONS.photos }]
      : [{ id: "home", href: "#/", label: "This week", glyph: ICONS.home },
         { id: "feed", href: "#/feed", label: "Feed", glyph: ICONS.photos },
         { id: "lessons", href: "#/lessons", label: "Lessons", glyph: ICONS.book }];

    tabs.innerHTML = items.map(function (item) {
      var on = item.id === current;
      return '<a href="' + item.href + '" class="' + (on ? "on" : "") + '"' +
        (on ? ' aria-current="page"' : '') + '>' +
        icon(item.glyph, { color: on ? "#174276" : "#8C97A5" }) +
        '<span>' + item.label + '</span></a>';
    }).join("");
  }

  function show(html) {
    view.innerHTML = html;
    view.scrollTop = 0;
    window.scrollTo(0, 0);
  }

  function loading() { show('<p class="spin">Loading…</p>'); }

  function empty(title, line) {
    show('<div class="empty"><h2>' + esc(title) + '</h2><p>' + esc(line) + '</p></div>');
  }

  /* ------------------------------------------------------------- pieces -- */

  function verseCard(verse) {
    if (!verse) return "";
    // The slide map writes the verse as one string: text, then "(Reference)".
    var match = String(verse).match(/^(.*?)\s*\(([^)]+)\)\s*$/);
    var text = match ? match[1] : verse;
    var ref = match ? match[2] : "";
    return '<div class="card card--tint card__pad">' +
      '<div class="eyebrow eyebrow--navy">MEMORY VERSE</div>' +
      '<p class="verse">' + esc(text) + '</p>' +
      (ref ? '<p class="verse__ref">' + esc(ref) + '</p>' : "") +
      '</div>';
  }

  function talkCard(lesson) {
    var talk = lesson.faith_builders && lesson.faith_builders.talk_about_it;
    if (!talk) return "";
    return '<div class="card card--gold card__pad">' +
      '<div style="display:flex;align-items:center;gap:8px">' +
        icon(ICONS.chat, { color: "#C7962F", size: 19 }) +
        '<span class="eyebrow eyebrow--navy">TALK ABOUT IT AT HOME</span>' +
      '</div>' +
      '<p class="body">' + esc(talk) + '</p>' +
      '</div>';
  }

  function coverFor(entry) {
    return entry.cover ? "/kids/art/" + entry.slug + "/" + entry.cover : null;
  }

  /* -------------------------------------------------------------- views -- */

  function parentHome() {
    var entry = latestLesson();
    setChrome({ title: "Good Hope Kids", who: "PARENTS", tab: "home" });
    if (!entry) {
      return empty("Nothing here yet",
        "This week’s lesson will show up here right after it is built.");
    }

    lesson(entry.slug).then(function (data) {
      var cover = coverFor(entry);
      show('<div class="stack">' +
        '<div>' +
          '<div class="eyebrow">THIS SUNDAY</div>' +
          '<p class="sub">' + esc(longDate(entry.date)) + ' · ' + esc(className(entry["class"])) + '</p>' +
        '</div>' +

        '<a class="card" href="#/lesson/' + esc(entry.slug) + '">' +
          (cover ? '<img class="cover" src="' + esc(cover) + '" alt="">' : "") +
          '<div class="card__pad">' +
            '<h2 style="font-size:23px;line-height:1.22">' + esc(entry.title) + '</h2>' +
            (entry.big_idea ? '<p class="lede">' + esc(entry.big_idea) + '</p>' : "") +
            '<span class="rowlink">Open the lesson' +
              icon(ICONS.next, { color: "#C7962F", size: 17, weight: 2.6 }) + '</span>' +
          '</div>' +
        '</a>' +

        verseCard(entry.memory_verse) +
        talkCard(data) +
        feedTeaser() +
      '</div>');
    }).catch(failed);
  }

  function feedTeaser() {
    if (!state.feed.length) return "";
    var post = state.feed[0];
    var photo = post.photos && post.photos.length
      ? "/kids/photos/" + post.id + "/" + post.photos[0] : null;
    return '<div style="display:flex;align-items:center;margin-top:4px">' +
        '<h2 style="flex:1 1 auto;font-size:19px">From Sunday</h2>' +
        '<a href="#/feed" style="font-size:14px;font-weight:700">See all</a>' +
      '</div>' +
      '<a class="card" href="#/feed">' +
        (photo ? '<img class="cover" src="' + esc(photo) + '" alt="">' : "") +
        '<div class="card__pad"><p class="post__text">' + esc(post.text) + '</p></div>' +
      '</a>';
  }

  function leaderHome() {
    var entry = latestLesson();
    setChrome({ title: "Good Hope Kids", who: "TEACHERS", tab: "sunday" });

    var live = {};
    state.index.forEach(function (item) { live[item["class"] || "4-8"] = true; });

    var rows = CLASSES.map(function (klass) {
      var ready = live[klass.key] && entry && (entry["class"] || "4-8") === klass.key;
      if (ready) {
        return '<div class="row">' +
          '<span class="tick">' + icon(ICONS.check, { color: "#FFFFFF", size: 15, weight: 3 }) + '</span>' +
          '<span class="row__name">' + esc(klass.name) + '</span>' +
          '<span class="row__state" style="color:#5C7A44">Ready</span>' +
        '</div>';
      }
      return '<div class="row row--off">' +
        '<span class="tick tick--empty"></span>' +
        '<span class="row__name">' + esc(klass.name) + '</span>' +
        '<span class="row__state">' + (live[klass.key] ? "Nothing yet" : "No class yet") + '</span>' +
      '</div>';
    }).join("");

    if (!entry) {
      show('<div class="stack">' +
        '<div><div class="eyebrow">THIS SUNDAY</div><h1 style="font-size:26px;margin-top:4px">Nothing built yet</h1></div>' +
        '<div class="card rows">' + rows + '</div>' +
        '<p class="note">A lesson shows up here as soon as it is published from the pipeline.</p>' +
      '</div>');
      return;
    }

    lesson(entry.slug).then(function (data) {
      var cover = coverFor(entry);
      show('<div class="stack">' +
        '<div>' +
          '<div class="eyebrow">THIS SUNDAY</div>' +
          '<h1 style="font-size:26px;margin-top:4px">' + esc(longDate(entry.date)) + '</h1>' +
        '</div>' +

        '<div class="card rows">' + rows + '</div>' +

        '<div class="card">' +
          (cover ? '<img class="cover cover--short" src="' + esc(cover) + '" alt="">' : "") +
          '<div class="card__pad stack" style="gap:14px">' +
            '<div>' +
              '<h2 style="font-size:21px;line-height:1.25">' + esc(entry.title) + '</h2>' +
              '<p class="sub">' + entry.slides + ' slides · written by ' + esc(entry.author || "") + '</p>' +
            '</div>' +
            '<a class="btn btn--primary btn--big" href="#/present/' + esc(entry.slug) + '">' +
              '<svg width="21" height="21" viewBox="0 0 24 24" fill="#C7962F" aria-hidden="true"><path d="M8 5.2v13.6L19 12Z"></path></svg>' +
              'Present</a>' +
            '<div class="btnrow">' +
              '<a class="btn btn--row" href="#/lesson/' + esc(entry.slug) + '">' +
                icon(ICONS.guide, { color: "#174276", size: 18 }) + 'Lesson</a>' +
              '<a class="btn btn--row" href="#/print/' + esc(entry.slug) + '">' +
                icon(ICONS.printer, { color: "#174276", size: 18 }) + 'Print</a>' +
            '</div>' +
          '</div>' +
        '</div>' +

        beforeClass(data) +
      '</div>');
    }).catch(failed);
  }

  /* The Lesson Snapshot straight out of Juliet's guide: her materials list and
     her notes, not a checklist this app invented. */
  function beforeClass(data) {
    var intro = (data.guide && data.guide.intro) || [];
    if (!intro.length) return "";
    var section = intro[0];
    var lines = (section.text || []).map(function (line) {
      return '<div class="check"><span class="check__box"></span><span>' + rich(line) + '</span></div>';
    }).join("");
    return '<div class="card card--tint card__pad">' +
      '<div class="eyebrow eyebrow--navy">' + esc(String(section.heading || "Before class").toUpperCase()) + '</div>' +
      '<div class="checks">' + lines + '</div>' +
    '</div>';
  }

  /* Juliet writes **bold** in her lesson. Escape first, then allow that one
     thing — nothing else from the lesson is ever treated as markup. */
  function rich(text) {
    return esc(text).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  }

  function lessonView(slug) {
    setChrome({ title: "Lesson", back: isLeader() ? "#/" : "#/", tab: "lessons" });
    loading();
    lesson(slug).then(function (data) {
      var cover = data.cover ? "/kids/art/" + data.slug + "/" + data.cover : null;
      var promises = colourList(data);

      var learned = (data.faith_builders && data.faith_builders.learned) || [];

      show('<div class="stack">' +
        (cover ? '<img class="cover" src="' + esc(cover) + '" alt="" style="border-radius:18px">' : "") +
        '<div>' +
          '<div class="eyebrow">' + esc(longDate(data.date).toUpperCase()) + ' · ' + esc(className(data["class"]).toUpperCase()) + '</div>' +
          '<h1 style="font-size:27px;line-height:1.2;margin-top:8px">' + esc(data.title) + '</h1>' +
        '</div>' +

        (learned.length
          ? '<div class="card card__pad">' +
              '<div class="eyebrow eyebrow--navy">WHAT WE LEARNED</div>' +
              learned.map(function (line, i) {
                return '<p class="' + (i === 0 ? "body" : "note") + '">' + esc(line) + '</p>';
              }).join("") +
            '</div>'
          : "") +

        verseCard(data.memory_verse) +
        promises +
        talkCard(data) +
        (isLeader()
          ? '<a class="btn btn--primary" href="#/print/' + esc(data.slug) + '">' +
              icon(ICONS.printer, { color: "#C7962F", size: 20 }) + 'Print for Sunday</a>'
          : printablesForParents(data)) +
      '</div>');
    }).catch(failed);
  }

  /* A lesson built on the rainbow colors gets its color list on the parent
     page, read off the slides that carry a color rather than off the color
     table: the slides hold the sentence and the reference the child heard, in
     the order the room saw them. A lesson with no colored slides shows
     nothing here, which is the right answer for most lessons. */
  function colourList(data) {
    var byKey = {};
    (data.colors || []).forEach(function (c) { byKey[c.key] = c; });
    var rows = (data.slides || []).filter(function (s) {
      return s.color && byKey[s.color] && s.text;
    });
    if (!rows.length) return "";

    var WORDS = ["", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN",
                 "EIGHT", "NINE", "TEN"];
    var many = (data.colors || []).length;
    var heading = (WORDS[many] || many) + " PROMISES";
    return '<div class="card card__pad">' +
      '<div class="eyebrow eyebrow--navy">THE ' + esc(heading) + '</div>' +
      '<p class="note" style="margin-top:9px">One for every color on the rainbow they made.</p>' +
      '<div class="promises">' + rows.map(function (s) {
        var text = Array.isArray(s.text) ? s.text.join(" ") : s.text;
        return '<div class="promise">' +
          '<span class="promise__dot" style="background:#' + esc(byKey[s.color].hex) + '"></span>' +
          '<span style="flex:1 1 auto;min-width:0">' +
            '<span class="promise__text">' + esc(text) + '</span>' +
            (s.scripture ? '<span class="promise__ref">' + esc(s.scripture.ref) + '</span>' : "") +
          '</span>' +
        '</div>';
      }).join("") + '</div>' +
    '</div>';
  }

  /* Parents get the take-home slip, and nothing meant for the teacher. */
  function printablesForParents(data) {
    var slip = (data.printables || []).filter(function (p) { return p.file === "faith-builders.pdf"; })[0];
    if (!slip) return "";
    return '<a class="btn btn--primary" href="/kids/files/' + esc(data.slug) + '/' + esc(slip.file) + '" target="_blank" rel="noopener">' +
      icon(ICONS.printer, { color: "#C7962F", size: 20 }) + 'Print another Faith Builders slip</a>';
  }

  function printView(slug) {
    setChrome({ title: "Print for Sunday", back: "#/", tab: "sunday" });
    loading();
    lesson(slug).then(function (data) {
      var files = data.printables || [];
      if (!files.length) {
        return empty("Nothing to print yet",
          "The PDFs for this lesson have not been built. They show up here once they are.");
      }
      show('<div class="stack">' +
        '<p class="note" style="margin:0">Everything this lesson needs on paper. Each one opens the PDF.</p>' +
        files.map(function (file) {
          return '<a class="card filerow" href="/kids/files/' + esc(data.slug) + '/' + esc(file.file) + '" target="_blank" rel="noopener">' +
            '<span class="filerow__icon">' + icon(ICONS.doc, { color: "#174276", size: 21, weight: 1.9 }) + '</span>' +
            '<span style="flex:1 1 auto;min-width:0">' +
              '<span class="filerow__name">' + esc(file.label) + '</span>' +
              '<span class="filerow__detail">' + esc(file.detail) + '</span>' +
            '</span>' +
            icon(ICONS.next, { color: "#C7962F", size: 19, weight: 2.4 }) +
          '</a>';
        }).join("") +
        '<div class="card card--tint card__pad">' +
          '<p style="margin:0;font-size:13.5px;line-height:1.55">Faith Builders prints four to a page and stays light on ink. Cut down the middle twice.</p>' +
        '</div>' +
      '</div>');
    }).catch(failed);
  }

  function lessonsView() {
    setChrome({ title: "Lessons", tab: "lessons" });
    if (!state.index.length) {
      return empty("No lessons yet", "Lessons appear here as they are built.");
    }
    show('<div class="stack">' + state.index.map(function (entry) {
      var cover = coverFor(entry);
      return '<a class="card" href="#/lesson/' + esc(entry.slug) + '">' +
        (cover ? '<img class="cover cover--short" src="' + esc(cover) + '" alt="">' : "") +
        '<div class="card__pad">' +
          '<div class="eyebrow">' + esc(shortDate(entry.date).toUpperCase()) + ' · ' + esc(className(entry["class"]).toUpperCase()) + '</div>' +
          '<h2 style="font-size:19px;line-height:1.28;margin-top:8px">' + esc(entry.title) + '</h2>' +
          (entry.big_idea ? '<p class="note">' + esc(entry.big_idea) + '</p>' : "") +
        '</div>' +
      '</a>';
    }).join("") + '</div>');
  }

  function feedView() {
    setChrome({ title: "Feed", who: isLeader() ? "TEACHERS" : "PARENTS", tab: "feed" });
    if (!state.feed.length) {
      return empty("Nothing posted yet",
        "Photos and updates from Sunday will show up here.");
    }
    show('<div class="stack">' + state.feed.map(function (post) {
      if (post.announcement) {
        return '<div class="card card--navy card__pad">' +
          '<span class="pill pill--gold">ANNOUNCEMENT</span>' +
          '<p class="body" style="color:#FFFFFF">' + esc(post.text) + '</p>' +
          '<p style="margin:12px 0 0;font-size:12.5px;color:#B9CBDF">' +
            esc(post.by) + ' · ' + esc(shortDate(post.date)) + '</p>' +
        '</div>';
      }
      var photos = post.photos || [];
      var grid = photos.length
        ? '<div class="post__photos' + (photos.length > 1 ? " post__photos--2" : "") + '">' +
            photos.map(function (file) {
              return '<img src="/kids/photos/' + esc(post.id) + '/' + esc(file) + '" alt="" loading="lazy">';
            }).join("") +
          '</div>'
        : "";
      var tag = post.lesson && lessonTitle(post.lesson)
        ? '<span class="pill" style="margin-top:13px">' + esc(lessonTitle(post.lesson)) + '</span>' : "";
      return '<div class="card">' +
        '<div class="post__head">' +
          '<span class="post__avatar">' + esc(initials(post.by)) + '</span>' +
          '<span style="flex:1 1 auto;min-width:0">' +
            '<span class="post__by">' + esc(post.by) + '</span>' +
            '<span class="post__when">' + esc(longDate(post.date)) + '</span>' +
          '</span>' +
        '</div>' +
        grid +
        '<div class="post__body"><p class="post__text">' + esc(post.text) + '</p>' + tag + '</div>' +
      '</div>';
    }).join("") + '</div>');
  }

  function lessonTitle(slug) {
    for (var i = 0; i < state.index.length; i++) {
      if (state.index[i].slug === slug) return state.index[i].title;
    }
    return null;
  }

  /* -------------------------------------------------------- presenting -- */

  /* The stage is a fixed 1440x810 and gets scaled, never reflowed, so the TV
     shows what the deck would have shown. */
  function fitStage(wrap, boxW, boxH) {
    var stage = wrap.querySelector(".stage");
    if (!stage) return;
    var scale = Math.min(boxW / KidsSlides.WIDTH, boxH / KidsSlides.HEIGHT);
    stage.style.transform = "scale(" + scale + ")";
    wrap.style.width = Math.round(KidsSlides.WIDTH * scale) + "px";
    wrap.style.height = Math.round(KidsSlides.HEIGHT * scale) + "px";
  }

  function stageHTML(data, slide) {
    return '<div class="stage-wrap"><div class="stage">' +
      KidsSlides.html(slide, data) + '</div></div>';
  }

  function presentView(slug, n) {
    loading();
    lesson(slug).then(function (data) {
      var index = Math.max(0, Math.min(n | 0, data.slides.length - 1));
      state.present = { slug: slug, n: index };
      setChrome({ bare: true });
      drawPresent(data, index);
    }).catch(failed);
  }

  function drawPresent(data, index) {
    var slide = data.slides[index];
    var next = data.slides[index + 1];
    var phone = window.innerWidth < 760;

    if (phone) {
      // A phone is a cue card, not a screen: the teacher's own lines big, the
      // slide small. This is what the printed Teacher Guide does on paper.
      view.innerHTML = '<div class="cue">' +
        '<div class="cue__head">' +
          '<span class="cue__dot"></span>' +
          '<span class="cue__where">Slide ' + (index + 1) + ' of ' + data.slides.length + '</span>' +
          '<button class="cue__exit" type="button" data-act="exit">Exit</button>' +
        '</div>' +
        '<div class="cue__peek">' +
          '<div class="cue__thumb">' + stageHTML(data, slide) + '</div>' +
          '<div style="flex:1 1 auto;min-width:0">' +
            '<div class="cue__label">ON THE SCREEN</div>' +
            '<div class="cue__title">' + esc(onScreenSummary(slide)) + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="cue__say">' +
          '<div class="eyebrow">SAY</div>' +
          '<p>' + esc(slide.say || "") + '</p>' +
        '</div>' +
        '<div class="cue__spacer"></div>' +
        (next ? '<div class="cue__next"><div class="eyebrow">NEXT UP</div>' +
          '<p>' + esc(onScreenSummary(next)) + '</p></div>' : "") +
        '<div class="cue__pad">' +
          '<button class="present__btn" type="button" data-act="prev" aria-label="Previous slide"' +
            (index === 0 ? " disabled" : "") + '>' +
            icon(ICONS.back, { color: "#C6D4E6", size: 28, weight: 2.6 }) + '</button>' +
          '<button class="present__btn present__btn--go" type="button" data-act="next"' +
            (next ? "" : " disabled") + '>Next slide' +
            icon(ICONS.next, { color: "#2E2205", size: 24, weight: 2.8 }) + '</button>' +
        '</div>' +
      '</div>';

      var thumb = view.querySelector(".cue__thumb");
      fitStage(thumb.querySelector(".stage-wrap"), 118, 66);
    } else {
      view.innerHTML = '<div class="present" id="present">' +
        '<div class="present__screen">' + stageHTML(data, slide) + '</div>' +
        '<div class="present__bar">' +
          '<button class="present__btn" type="button" data-act="exit" aria-label="Stop presenting">' +
            icon(ICONS.out, { color: "#C6D4E6", size: 22 }) + '</button>' +
          '<span class="present__count">' + (index + 1) + ' / ' + data.slides.length + '</span>' +
          '<span class="present__say">' + esc(slide.say || "") + '</span>' +
          '<button class="present__btn" type="button" data-act="prev" aria-label="Previous slide"' +
            (index === 0 ? " disabled" : "") + '>' +
            icon(ICONS.back, { color: "#C6D4E6", size: 26, weight: 2.6 }) + '</button>' +
          '<button class="present__btn present__btn--go" type="button" data-act="next" aria-label="Next slide"' +
            (next ? "" : " disabled") + '>' +
            icon(ICONS.next, { color: "#2E2205", size: 26, weight: 2.8 }) + '</button>' +
        '</div>' +
      '</div>';

      var screen = view.querySelector(".present__screen");
      fitStage(view.querySelector(".stage-wrap"), screen.clientWidth, screen.clientHeight);
    }

    view.focus();
  }

  /* One line describing what the room is looking at, for the teacher's phone
     and for "next up". Always the lesson's own words. */
  function onScreenSummary(slide) {
    if (slide.title) return slide.title;
    if (slide.text) return Array.isArray(slide.text) ? slide.text.join(" ") : slide.text;
    if (slide.scripture) return slide.scripture.text + " — " + slide.scripture.ref;
    return "";
  }

  function move(step) {
    if (!state.present) return;
    var data = state.lessons[state.present.slug];
    if (!data) return;
    var next = state.present.n + step;
    if (next < 0 || next >= data.slides.length) return;
    state.present.n = next;
    drawPresent(data, next);
  }

  function stopPresenting() {
    var slug = state.present && state.present.slug;
    state.present = null;
    window.location.hash = slug ? "#/lesson/" + slug : "#/";
  }

  document.addEventListener("click", function (event) {
    var button = event.target.closest("[data-act]");
    if (!button) return;
    var act = button.getAttribute("data-act");
    if (act === "next") move(1);
    else if (act === "prev") move(-1);
    else if (act === "exit") stopPresenting();
    else if (act === "signout") signOut();
  });

  document.addEventListener("keydown", function (event) {
    if (!state.present) return;
    if (event.key === "ArrowRight" || event.key === " " || event.key === "PageDown") {
      event.preventDefault(); move(1);
    } else if (event.key === "ArrowLeft" || event.key === "PageUp") {
      event.preventDefault(); move(-1);
    } else if (event.key === "Escape") {
      stopPresenting();
    } else if (event.key === "b" || event.key === "B") {
      var stage = document.getElementById("present");
      if (stage) stage.classList.toggle("is-black");
    }
  });

  window.addEventListener("resize", function () {
    if (!state.present) return;
    var data = state.lessons[state.present.slug];
    if (data) drawPresent(data, state.present.n);
  });

  function signOut() {
    fetch("/kids/__signout", { method: "POST", credentials: "same-origin" })
      .then(function () { window.location.href = "/kids/"; });
  }

  /* --------------------------------------------------------------- data -- */

  function lesson(slug) {
    if (state.lessons[slug]) return Promise.resolve(state.lessons[slug]);
    return getJSON("/kids/data/lessons/" + encodeURIComponent(slug) + ".json")
      .then(function (data) { state.lessons[slug] = data; return data; });
  }

  function failed(error) {
    if (error && error.message === "signed out") return;
    empty("That did not load", "Check the connection and try again.");
  }

  /* ------------------------------------------------------------- router -- */

  function route() {
    var hash = window.location.hash.replace(/^#\/?/, "");
    var parts = hash.split("/").filter(Boolean);
    var where = parts[0] || "";

    if (where !== "present") state.present = null;

    if (where === "feed") return feedView();
    if (where === "lessons") return lessonsView();
    if (where === "lesson" && parts[1]) return lessonView(decodeURIComponent(parts[1]));
    if (where === "print" && parts[1]) return printView(decodeURIComponent(parts[1]));
    if (where === "present" && parts[1]) return presentView(decodeURIComponent(parts[1]), parts[2] || 0);
    return isLeader() ? leaderHome() : parentHome();
  }

  window.addEventListener("hashchange", route);

  /* ---------------------------------------------------------------- go -- */

  loading();
  Promise.all([
    getJSON("/kids/__me"),
    getJSON("/kids/data/lessons.json").catch(function () { return { lessons: [] }; }),
    getJSON("/kids/data/feed.json").catch(function () { return { posts: [] }; })
  ]).then(function (results) {
    state.me = results[0];
    state.index = results[1].lessons || [];
    state.feed = (results[2].posts || []).slice().sort(function (a, b) {
      if (a.announcement !== b.announcement) return a.announcement ? -1 : 1;
      return a.date < b.date ? 1 : -1;
    });
    route();
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/kids/sw.js").catch(function () { /* fine without it */ });
    }
  }).catch(function () {
    setChrome({ title: "Good Hope Kids" });
    empty("Could not start", "Reload the page. If it keeps happening, tell Dorian.");
  });
})();
