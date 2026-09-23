/* ============================================================================
   slides.js — one lesson slide, drawn in the browser.

   THE POINT OF THIS FILE

   The deck builder in the Atlas repo (childrens-ministry/scripts/build_deck.py)
   lays every slide out on a 1440 x 810 point canvas at fixed coordinates. This
   file draws the same slides at the same coordinates on a 1440 x 810 pixel
   stage, which the page then scales to whatever screen it is on. The room sees
   the same layout whether the lesson is presented from here or opened from the
   .pptx in Drive.

   So: the numbers in here are not design decisions. They are copied from
   build_deck.py and they must stay in step with it. Change a layout there,
   change it here, and check both.

   Every string drawn comes from the lesson JSON, which comes from Juliet's
   slide map untouched. Nothing here writes lesson content.
   ========================================================================== */

(function (root) {
  "use strict";

  var W = 1440, H = 810;
  var M = 87;                       // 6% of width, the brand minimum margin

  var NAVY = "#174276", GOLD = "#C7962F", PAPER = "#F7F1E4";
  var TINT = "#DCE4EE", INK = "#2E3A4A", REF = "#52739A";
  var EMPTY = "#E6DCC8", FADED = "#D9CDB6";
  var TITLE_FONT = "Fredoka, sans-serif";
  var BODY_FONT = "Nunito, sans-serif";

  function esc(text) {
    return String(text == null ? "" : text)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /* ---------------------------------------------------------- primitives -- */

  function rect(x, y, w, h, color, radius) {
    return '<div style="position:absolute;left:' + x + 'px;top:' + y + 'px;width:' + w +
      'px;height:' + h + 'px;background:' + color +
      (radius ? ';border-radius:' + radius + 'px' : '') + '"></div>';
  }

  function circle(x, y, size, color) {
    return rect(x, y, size, size, color, size / 2);
  }

  function goldRule(x, y, w) {
    return rect(x, y, w || 200, 4, GOLD);
  }

  /* A text box. `anchor` is top | middle | bottom, matching the deck's
     vertical anchor. Contents are paragraphs built by para(). */
  function box(x, y, w, h, anchor, inner) {
    var justify = anchor === "middle" ? "center" : anchor === "bottom" ? "flex-end" : "flex-start";
    return '<div style="position:absolute;left:' + x + 'px;top:' + y + 'px;width:' + w +
      'px;height:' + h + 'px;display:flex;flex-direction:column;justify-content:' + justify +
      '">' + inner + '</div>';
  }

  function para(text, size, options) {
    var o = options || {};
    var style = "margin:0;font-family:" + (o.font || BODY_FONT) +
      ";font-size:" + size + "px" +
      ";line-height:" + (o.spacing || 1.0) +
      ";color:" + (o.color || NAVY) +
      ";font-weight:" + (o.bold ? 700 : 400) +
      (o.italic ? ";font-style:italic" : "") +
      ";text-align:" + (o.align || "left") +
      (o.before ? ";margin-top:" + o.before + "px" : "");
    return '<p style="' + style + '">' + esc(text) + '</p>';
  }

  /* Art, cropped to fill its box exactly as the deck crops it: never
     stretched, horizontal focus honoured. */
  function picture(basePath, image, x, y, w, h, corner) {
    var focus = (image.focus_x == null ? 0.5 : image.focus_x) * 100;
    return '<img src="' + esc(basePath + "/" + image.file) + '" alt="" style="position:absolute;left:' +
      x + 'px;top:' + y + 'px;width:' + w + 'px;height:' + h +
      'px;object-fit:cover;object-position:' + focus + '% 50%' +
      (corner ? ';border-radius:' + corner + 'px' : '') + '">';
  }

  function verseCard(x, y, w, h, scripture, size) {
    var pad = 34;
    return rect(x, y, w, h, TINT, 28) +
      box(x + pad, y + pad, w - 2 * pad, h - 2 * pad, "middle",
        para(scripture.text, size, { color: INK, italic: true, spacing: 1.05 }) +
        para(scripture.ref, 28, { color: REF, bold: true, before: 14 }));
  }

  /* The seven rainbow strips as a row; the first `filled` are coloured. */
  function segments(colors, filled, x, y, w, h) {
    var gap = 14;
    var seg = (w - gap * 6) / 7;
    var out = "";
    for (var i = 0; i < colors.length; i++) {
      out += rect(x + i * (seg + gap), y, seg, h,
        i < filled ? "#" + colors[i].hex : EMPTY, h / 2);
    }
    return out;
  }

  /* Concentric arcs, drawn as SVG rings rather than shipped as an image. */
  function rainbowArc(colors, x, y, w) {
    var h = w / 2;
    var outer = w / 2;
    var hole = outer * 0.36;
    var band = (outer - hole) / colors.length;
    var paths = "";
    for (var i = 0; i < colors.length; i++) {
      var r = outer - i * band - band / 2;
      paths += '<path d="M ' + (outer - r) + ' ' + outer + ' A ' + r + ' ' + r +
        ' 0 0 1 ' + (outer + r) + ' ' + outer + '" fill="none" stroke="#' +
        colors[i].hex + '" stroke-width="' + band + '"></path>';
    }
    return '<svg viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h +
      '" style="position:absolute;left:' + x + 'px;top:' + y + 'px" aria-hidden="true">' +
      paths + '</svg>';
  }

  /* ------------------------------------------------------------- layouts -- */

  var LAYOUTS = {};

  LAYOUTS.title = function (s, ctx) {
    var out = "";
    var colX, colW, titleY, titleH, anchor, ruleY;
    if (s.image) {
      var split = 640;
      out += picture(ctx.art, s.image, split, 0, W - split, H);
      colX = M; colW = split - M - 50;
      titleY = 440; titleH = 240; anchor = "top"; ruleY = 700;
    } else {
      colX = M + 200; colW = W - 2 * M - 400;
      titleY = 400; titleH = 190; anchor = "bottom"; ruleY = 615;
    }
    var logo = 420;
    out += '<img src="/kids/public/logo.png" alt="" style="position:absolute;left:' +
      (colX + (colW - logo) / 2) + 'px;top:40px;width:' + logo + 'px;height:' + logo +
      'px;object-fit:contain">';
    out += box(colX, titleY, colW, titleH, anchor,
      para(s.title, 66, { font: TITLE_FONT, bold: true, align: "center", spacing: 0.95 }));
    out += goldRule(colX + (colW - 200) / 2, ruleY);
    return out;
  };

  LAYOUTS.statement = function (s) {
    return box(M + 60, M, W - 2 * M - 120, H - 2 * M, "middle",
      para(s.text, 76, { bold: true, align: "center", spacing: 1.05 }));
  };

  LAYOUTS["image-statement"] = function (s, ctx) {
    var split = 660;
    var out = picture(ctx.art, s.image, split, 0, W - split, H);
    var colW = split - M - 50;
    var lines = Array.isArray(s.text) ? s.text : [s.text];

    function block(gapBefore) {
      var inner = "";
      for (var i = 0; i < lines.length; i++) {
        inner += para(lines[i], 54, { bold: true, before: i === 0 ? 0 : gapBefore, spacing: 1.02 });
      }
      return inner;
    }

    if (s.scripture) {
      out += box(M, M + 40, colW, 210, "bottom", block(24));
      out += verseCard(M, M + 280, colW, 280, s.scripture, 38);
    } else {
      out += box(M, M, colW, H - 2 * M, "middle", block(30));
    }
    return out;
  };

  LAYOUTS["fullbleed-statement"] = function (s, ctx) {
    return picture(ctx.art, s.image, 0, 0, W, H) +
      box(M, M - 30, W - 2 * M, 170, "middle",
        para(s.text, 68, { bold: true, align: "center", spacing: 1.0 }));
  };

  LAYOUTS.strips = function (s, ctx) {
    return box(M + 60, M, W - 2 * M - 120, 400, "middle",
      para(s.text, 72, { bold: true, align: "center", spacing: 1.05 })) +
      segments(ctx.colors, s.filled || 0, M + 40, 560, W - 2 * M - 80, 70);
  };

  /* Square art on the right; label, statement and verse card on the left.
     `promise` is this layout with the rainbow colour bar filling in below. */
  LAYOUTS.spot = function (s, ctx) {
    var colors = ctx.colors;
    var color = null;
    var bottom = H - M;
    var out = "";

    if (s.color) {
      var idx = -1;
      for (var i = 0; i < colors.length; i++) if (colors[i].key === s.color) idx = i;
      if (idx >= 0) {
        color = colors[idx];
        var barH = 34;
        out += segments(colors, idx + 1, M, H - M - barH, W - 2 * M, barH);
        bottom = H - M - barH - 30;
      }
    }

    var art = 480;
    var artX = W - M - art;
    if (s.image) out += picture(ctx.art, s.image, artX, M + (bottom - M - art) / 2, art, art, 28);

    var colW = artX - M - 56;
    var label = color ? color.label : s.label;
    var textY = M;

    if (label) {
      var labelX = M;
      if (color) {
        out += circle(M, M + 14, 52, "#" + color.hex);
        labelX = M + 74;
      }
      out += box(labelX, M - 4, colW - (labelX - M), 90, "middle",
        para(label, 60, { font: TITLE_FONT, bold: true }));
      out += goldRule(M, M + 96);
      textY = M + 122;
    }

    if (s.scripture) {
      out += box(M, textY, colW, 200, "top", para(s.text, 54, { bold: true, spacing: 1.0 }));
      out += verseCard(M, M + 330, colW, 250, s.scripture, 40);
    } else {
      out += box(M, textY, colW, bottom - textY, "middle",
        para(s.text, 60, { bold: true, spacing: 1.0 }));
    }
    return out;
  };

  LAYOUTS.promise = LAYOUTS.spot;

  LAYOUTS.rainbow = function (s, ctx) {
    var w = 920;
    return box(M, M - 20, W - 2 * M, 150, "middle",
      para(s.text, 76, { bold: true, align: "center" })) +
      rainbowArc(ctx.colors, (W - w) / 2, H - M - w / 2, w);
  };

  LAYOUTS["memory-verse"] = function (s) {
    var color = s.faded ? FADED : INK;
    return box(M + 40, M, W - 2 * M - 80, 440, "bottom",
      para(s.scripture.text, 100, { color: color, italic: true, align: "center", spacing: 1.0 })) +
      goldRule((W - 200) / 2, M + 480) +
      box(M, M + 510, W - 2 * M, 100, "top",
        para(s.scripture.ref, 48, { bold: true, align: "center" }));
  };

  LAYOUTS["promise-list"] = function (s, ctx) {
    var colors = ctx.colors;
    var out = box(M + 40, M - 10, W - 2 * M - 80, 180, "middle",
      para(s.text, 64, { bold: true, align: "center", spacing: 1.0 }));
    var rowH = 96, colW = 540, gap = 100;
    var left = (W - 2 * colW - gap) / 2;
    var groups = [
      { x: left, items: colors.slice(0, 4), y0: 300 },
      { x: left + colW + gap, items: colors.slice(4), y0: 300 + rowH / 2 }
    ];
    for (var g = 0; g < groups.length; g++) {
      for (var i = 0; i < groups[g].items.length; i++) {
        var c = groups[g].items[i];
        var y = groups[g].y0 + i * rowH;
        out += rect(groups[g].x, y + 16, 130, 62, "#" + c.hex, 31);
        out += box(groups[g].x + 160, y, colW - 160, rowH, "middle",
          para(c.short, 46, { bold: true }));
      }
    }
    return out;
  };

  /* ---------------------------------------------------------------- api -- */

  /* The inner HTML of one slide, drawn on the 1440 x 810 stage. An unknown
     layout draws its words plainly rather than drawing nothing: a teacher
     mid-lesson needs something on the screen. */
  function slideHTML(slide, lesson) {
    var ctx = {
      colors: lesson.colors || [],
      art: "/kids/art/" + lesson.slug
    };
    var draw = LAYOUTS[slide.layout];
    if (!draw) {
      var text = slide.text || slide.title || "";
      return LAYOUTS.statement({ text: Array.isArray(text) ? text.join(" ") : text });
    }
    return draw(slide, ctx);
  }

  root.KidsSlides = {
    WIDTH: W,
    HEIGHT: H,
    PAPER: PAPER,
    html: slideHTML
  };
})(window);
