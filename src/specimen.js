/* ============================================================
   Sloosh V4 specimen: page behaviour.
   Uses only the public SlooshInk API (src/vendor/sloosh-ink.js). Each block is wrapped in safe(), so one
   failing demo never stops the rest. Heavy demos start when their section scrolls into view.
   ============================================================ */
(function () {
  'use strict';
  var S = window.SlooshInk;
  var $ = function (id) { return document.getElementById(id); };
  var RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ROOT = document.documentElement;

  function safe(name, fn) { try { return fn(); } catch (e) { if (window.console) console.error('[ds4] ' + name, e); } }
  function onView(el, fn, margin) {
    if (!el) return;
    if (!('IntersectionObserver' in window)) { safe('view', fn); return; }
    var io = new IntersectionObserver(function (es) {
      if (es.some(function (e) { return e.isIntersecting; })) { io.disconnect(); safe('view', fn); }
    }, { rootMargin: margin || '0px 0px -12% 0px' });
    io.observe(el);
  }
  function demoBtn(label, parent, onClick) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'sl-demo-btn'; b.textContent = label;
    b.addEventListener('click', onClick); parent.appendChild(b); return b;
  }
  function wipe(host) { host.querySelectorAll(':scope > svg.sl-ink-layer .ink-deco').forEach(function (n) { n.remove(); }); }
  // run fn every ms, but only while el is on screen
  function loopWhileVisible(el, fn, ms) {
    var t = 0, on = function () { if (!t) t = setInterval(fn, ms); }, off = function () { clearInterval(t); t = 0; };
    if (!('IntersectionObserver' in window)) { on(); return; }
    new IntersectionObserver(function (es) { es[0].isIntersecting ? on() : off(); }).observe(el);
  }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, RM ? 0 : ms); }); }
  function cssVar(name) { return getComputedStyle(ROOT).getPropertyValue(name).trim(); }

  /* ── theme switch (L11 lights on, then flip) ── */
  var coverLogo = null;
  function setTheme(t) {
    var go = function () {
      if (t === 'light') ROOT.setAttribute('data-theme', 'light'); else ROOT.setAttribute('data-theme', 'dark');
      $('th-dark').setAttribute('aria-pressed', t !== 'light'); $('th-light').setAttribute('aria-pressed', t === 'light');
      try { localStorage.setItem('ds4-theme', t); } catch (e) {}
      safe('swatches', paintSwatches);
    };
    if (coverLogo && !RM) { coverLogo.lightsOn(); setTimeout(go, 200); } else go();
  }
  $('th-dark').addEventListener('click', function () { setTheme('dark'); });
  $('th-light').addEventListener('click', function () { setTheme('light'); });
  safe('theme-init', function () {
    var saved = null; try { saved = localStorage.getItem('ds4-theme'); } catch (e) {}
    var cur = ROOT.getAttribute('data-theme');
    var t = saved || (cur === 'light' ? 'light' : 'dark');
    ROOT.setAttribute('data-theme', t);
    $('th-dark').setAttribute('aria-pressed', t !== 'light'); $('th-light').setAttribute('aria-pressed', t === 'light');
  });

  /* ── index bar: mark the section in view ── */
  safe('index', function () {
    var links = [].slice.call(document.querySelectorAll('.ds-index a'));
    var map = {}; links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove('on'); });
        var a = map[e.target.id];
        if (a) a.classList.add('on');   // highlight only; nothing on this page ever scrolls for you
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) { if ($(id)) io.observe($(id)); });
  });

  /* ── swatches, read live from the tokens ── */
  var SW = [
    ['§', 'shadcn colour system', 'Figma primitives and Color System, shadcn/ui names'],
    ['Neutral', 'primitives', [['neutral-0',''],['neutral-50',''],['neutral-100',''],['neutral-150',''],['neutral-200',''],['neutral-300',''],['neutral-400',''],['neutral-500',''],['neutral-600',''],['neutral-700',''],['neutral-800',''],['neutral-900',''],['neutral-950','']], 'ramp'],
    ['Creative gen accent', 'the Sloosh yellow: brand-accent is 500', [['creative-gen-accent-50',''],['creative-gen-accent-100',''],['creative-gen-accent-200',''],['creative-gen-accent-300',''],['creative-gen-accent-400',''],['creative-gen-accent-500',''],['creative-gen-accent-600',''],['creative-gen-accent-700',''],['creative-gen-accent-800','']], 'ramp'],
    ['Yellow', 'a separate ramp: 400 is brand-accent-text, 500 is #FECE00 (not the brand yellow)', [['yellow-50',''],['yellow-100',''],['yellow-200',''],['yellow-300',''],['yellow-400',''],['yellow-500',''],['yellow-600',''],['yellow-700',''],['yellow-800',''],['yellow-900',''],['yellow-950','']], 'ramp'],
    ['Red', '', [['red-50',''],['red-100',''],['red-200',''],['red-300',''],['red-400',''],['red-500',''],['red-600',''],['red-700',''],['red-800',''],['red-900',''],['red-950','']], 'ramp'],
    ['Amber', '', [['amber-50',''],['amber-100',''],['amber-200',''],['amber-300',''],['amber-400',''],['amber-500',''],['amber-600',''],['amber-700',''],['amber-800',''],['amber-900',''],['amber-950','']], 'ramp'],
    ['Emerald', '', [['emerald-50',''],['emerald-100',''],['emerald-200',''],['emerald-300',''],['emerald-400',''],['emerald-500',''],['emerald-600',''],['emerald-700',''],['emerald-800',''],['emerald-900',''],['emerald-950','']], 'ramp'],
    ['Blue', '', [['blue-50',''],['blue-100',''],['blue-200',''],['blue-300',''],['blue-400',''],['blue-500',''],['blue-600',''],['blue-700',''],['blue-800',''],['blue-900',''],['blue-950','']], 'ramp'],
    ['Violet', '', [['violet-50',''],['violet-100',''],['violet-200',''],['violet-300',''],['violet-400',''],['violet-500',''],['violet-600',''],['violet-700',''],['violet-800',''],['violet-900',''],['violet-950','']], 'ramp'],
    ['Green and orange', 'green-600 is Figma (agents); orange-400 is not in Figma', [['green-600',''],['orange-400','audio ports','t',1]], 'ramp'],
    ['shadcn core', 'names exactly as shadcn/ui', [['background','page'],['foreground','text'],['card','cards, panels'],['card-foreground',''],['popover','menus'],['popover-foreground',''],['primary','inverse fill'],['primary-foreground',''],['secondary',''],['secondary-foreground',''],['muted','fields, chips, active tab'],['muted-foreground','muted text'],['accent','hover on muted'],['accent-foreground',''],['destructive','errors'],['destructive-foreground',''],['border','default border'],['input','field edge'],['ring','focus']]],
    ['Charts', '', [['chart-1',''],['chart-2',''],['chart-3',''],['chart-4',''],['chart-5','']]],
    ['Sidebar', '', [['sidebar',''],['sidebar-foreground',''],['sidebar-primary',''],['sidebar-primary-foreground',''],['sidebar-accent',''],['sidebar-accent-foreground',''],['sidebar-border',''],['sidebar-ring','']]],
    ['Text, surfaces and lines', 'extensions in the shadcn pattern', [['foreground-subtle','secondary text'],['disabled-foreground','disabled'],['surface-disabled',''],['disabled-border',''],['border-strong','hover, meters'],['border-light','Figma line/borderlight'],['text-shimmer-base','loading shimmer','f']]],
    ['Status', 'x, x-foreground, x-border', [['destructive-subtle',''],['destructive-subtle-foreground',''],['destructive-border',''],['success',''],['success-foreground',''],['success-border',''],['warning',''],['warning-foreground',''],['warning-border',''],['info',''],['info-foreground',''],['info-border',''],['violet',''],['violet-foreground',''],['violet-border',''],['status-yellow',''],['status-yellow-foreground',''],['status-yellow-border','']]],
    ['Agents', 'Figma Agents and status/agent; same in both themes', [['agent',''],['agents-amber',''],['agents-red',''],['agents-green',''],['agents-blue',''],['agents-yellow',''],['action-brand-foreground','Figma action/brandforeground']]],
    ['Brand accent', 'the app\'s [data-brand="sloosh"]', [['brand-accent','fills'],['brand-accent-foreground','text on yellow'],['brand-accent-edge','keycap lip'],['brand-accent-text','yellow text and lines'],['brand-accent-subtle','credit chip, tinted','f'],['brand-accent-ring',''],['brand-accent-chip','pill on a yellow button','f'],['brand-accent-glow','DS4 only: halo','f',1]]],
    ['Layers', 'the mobile prototype\'s ladder', [['layer-1','sheets','f'],['layer-2','','f'],['layer-3','','f'],['layer-4','','f'],['layer-scrim','sheet scrim','f'],['dialog-overlay','modal backdrop','f']]],
    ['Data types', 'DS4 only, built from primitives', [['data-text','','t',1],['data-text-foreground','','t',1],['data-image','','t',1],['data-image-foreground','','t',1],['data-video','','t',1],['data-video-foreground','','t',1],['data-audio','','t',1],['data-audio-foreground','','t',1],['data-any','','t',1],['data-any-foreground','','t',1]]],
    ['§', 'Ink colour system', 'kept separate from shadcn: ink-tokens.css'],
    ['Ink', 'the pencil layer', [
      ['ink-pen', 'lines, handwriting','f'], ['ink-pen-soft', 'asides','f'], ['ink-pen-faint', 'sketches, tracks','f'], ['ink-crayon', 'critter fill','f'], ['ink-crayon-line', 'hatch strokes','f'], ['ink-crayon-deep', 'Burb, Fin','f'],
      ['ink-sticky', 'pointer tag','f'], ['ink-note', 'paper note','f'], ['ink-note-fg', 'note text','f'], ['ink-eye', 'pupils, rims','f'], ['ink-eye-white', 'eye whites','f']]],
    ['Supporting inks', 'small and purposeful', [
      ['ink-mint', 'drawn checks','f'], ['ink-rose', 'hearts, tears','f'], ['ink-sky', 'drops, bubbles','f'], ['ink-blue', 'collaborator marks','f'], ['ink-ember', 'sparks, notice dot','f'], ['ink-blush', 'cheeks','f']]],
    ['Stickers', 'confetti on Stage', [['sticker-lavender','','f'],['sticker-mint','','f'],['sticker-blue','','f'],['sticker-ember','','f'],['sticker-violet','','f']]],
    ['Glow', 'Stage and the ember gradient', [['glow-950','','f'],['glow-900','','f'],['glow-800','','f'],['glow-700','','f'],['glow-400','','f'],['glow-300','','f'],['glow-ember','','f']]]
  ];
  function toHex(c) { var m = c.match(/rgba?\(([^)]+)\)/); if (!m) return c; var p = m[1].split(/[ ,\/]+/).filter(Boolean).map(Number);
    var h = '#' + p.slice(0, 3).map(function (v) { return ('0' + Math.round(v).toString(16)).slice(-2); }).join('').toUpperCase(); return p.length > 3 && p[3] < 1 ? h + ' · ' + Math.round(p[3] * 100) + '%' : h; }
  function paintSwatches() {
    var host = $('swatches'); if (!host) return;
    if (!host.firstChild) {
      SW.forEach(function (g) {
        if (g[0] === '§') { var hh = document.createElement('h3'); hh.className = 'ds-sw-sys'; hh.innerHTML = g[1] + ' <span>' + g[2] + '</span>'; host.appendChild(hh); return; }
        var sec = document.createElement('div'); sec.className = 'ds-sw-group';
        sec.innerHTML = '<h4>' + g[0] + ' <span>' + g[1] + '</span></h4>';
        var grid = document.createElement('div'); grid.className = 'ds-sw' + (g[3] === 'ramp' ? ' ramp' : '');
        g[2].forEach(function (t) {
          var d = document.createElement('div'), expr = t[2] === 'f' ? 'var(--' + t[0] + ')' : 'hsl(var(--' + t[0] + '))';
          if (t[3]) d.className = 'ext';
          d.innerHTML = '<div class="chip" style="background:' + expr + '"></div><b>' + t[0] + '</b><code></code>' + (t[1] ? '<small>' + t[1] + '</small>' : '');
          grid.appendChild(d);
        });
        sec.appendChild(grid); host.appendChild(sec);
      });
    }
    host.querySelectorAll('.ds-sw > div').forEach(function (d) { d.querySelector('code').textContent = toHex(getComputedStyle(d.querySelector('.chip')).backgroundColor); });
  }
  safe('swatches', paintSwatches);
  safe('budget', function () {
    var b = $('budget'); for (var i = 0; i < 100; i++) { var x = document.createElement('i'); if (i === 37 || i === 62) x.className = 'y'; b.appendChild(x); }
  });

  /* ── SF Pro scale from the tokens ── */
  safe('sans-scale', function () {
    var rows = [['micro', 'Image · Video'], ['caption', 'JPEG and PNG, up to 2GB'], ['label', 'Additional context'], ['body-sm', 'Your generated assets will appear here.'], ['body-md', 'Run Space'],
      ['body', 'Start on your own and bring your team in when the work grows.'], ['title', 'Popular this week'], ['title-md', 'Usage and billing'], ['h1', 'Create your custom space'], ['h-hero', 'Need this at scale?']];
    var host = $('sans-scale');
    rows.forEach(function (r) {
      var sz = cssVar('--sl-text-' + r[0]), lh = cssVar('--sl-leading-' + r[0]), wt = cssVar('--sl-weight-' + r[0]);
      var d = document.createElement('div');
      d.innerHTML = '<span class="lab"><b>' + r[0] + '</b>' + sz + ' / ' + lh + ' · ' + wt + '</span><span class="s" style="font:' + wt + ' ' + sz + '/' + lh + ' var(--ds-sans)">' + r[1] + '</span>';
      host.appendChild(d);
    });
  });


  /* ── Pricing v4 · settled: title letters, cards rising, the recommended-card carousel ── */
  var POP = cssVar('--spring-pop') || 'cubic-bezier(.34,1.56,.64,1)', CARD = cssVar('--spring-card') || 'cubic-bezier(.23,1,.32,1)';
  safe('title-letters', function () {
    var h = $('tt-h'), chars = [];
    h.setAttribute('aria-label', h.textContent);
    var words = h.textContent.split(' '); h.textContent = '';
    words.forEach(function (w, i) {
      var ws = document.createElement('span'); ws.className = 'tt-w'; ws.setAttribute('aria-hidden', 'true');
      w.split('').forEach(function (ch) { var c = document.createElement('span'); c.className = 'tt-c'; c.textContent = ch; ws.appendChild(c); chars.push(c); });
      h.appendChild(ws); if (i < words.length - 1) h.appendChild(document.createTextNode(' '));
    });
    var play = function () {
      if (RM) return;
      var step = Math.min(28, 520 / Math.max(1, chars.length - 1));
      chars.forEach(function (c, i) {
        c.animate([{ transform: 'translateX(-0.25em)' }, { transform: 'none' }], { duration: 770, delay: i * step, easing: POP, fill: 'backwards' });
        c.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 260, delay: i * step, easing: 'cubic-bezier(.23,1,.32,1)', fill: 'backwards' });
      });
    };
    $('tt-go').addEventListener('click', play); onView(h, play);
  });
  safe('cards-rise', function () {
    var cards = Array.prototype.slice.call($('rise').children);
    var play = function () { if (RM) return; cards.forEach(function (c, i) { c.animate([{ transform: 'translateY(48px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 700, delay: i * 110, easing: CARD, fill: 'backwards' }); }); };
    $('rise-go').addEventListener('click', play); onView($('rise'), play);
  });
  safe('fit-carousel', function () {
    var P = [['Creator', 'For solo creators', '$19', '$15', 'per month', '$48'], ['Pro', 'For growing teams', '$49', '$39', 'per seat<br>per month', '$120'], ['Max', 'For studios at scale', '$99', '$79', 'per seat<br>per month', '$240'], ['Enterprise', 'For teams of 11 or more', '', 'Custom', '', '']];
    var stage = $('fit'), track = $('fit-track');
    track.innerHTML = P.map(function (p, i) {
      return '<div class="ds-fc"><span class="t">Best fit</span><h6>' + p[0] + '</h6><p class="f">' + p[1] + '</p><div class="pr">' + (p[2] ? '<s>' + p[2] + '</s>' : '') + '<b>' + p[3] + '</b>' + (p[4] ? '<small>' + p[4] + '</small>' : '') + '</div><div class="cta">' + (i === 3 ? 'Talk to us' : 'Subscribe to ' + p[0]) + '</div>' + (p[5] ? '<p class="sv">You save <i class="ds-save">' + p[5] + '</i> per year</p>' : '') + '</div>';
    }).join('');
    var cs = Array.prototype.slice.call(track.children), pos = 0, target = 0, vel = 0, raf = 0, last = 0, BEND = 7;
    var paint = function () {
      var W = stage.clientWidth, D = W, H = W / 2, B = H * BEND / 13.3, R = (H * H + B * B) / (2 * B);
      cs.forEach(function (c, i) {
        var x = (i - pos) * D; c.style.visibility = Math.abs(x) > D * .999 ? 'hidden' : '';
        var ex = Math.min(Math.abs(x), H), arc = R - Math.sqrt(R * R - ex * ex), rot = (x < 0 ? -1 : 1) * Math.asin(ex / R);
        c.style.transform = 'translate(-50%,-50%) translate(' + x.toFixed(1) + 'px,' + arc.toFixed(1) + 'px) rotate(' + rot.toFixed(4) + 'rad)';
      });
    };
    var step = function (t) {
      var dt = Math.min(.032, (t - (last || t)) / 1000) || .016; last = t;
      vel += (120 * (target - pos) - 16 * vel) * dt; pos += vel * dt;
      if (Math.abs(target - pos) < .0005 && Math.abs(vel) < .001) { pos = target; vel = 0; raf = 0; last = 0; paint(); return; }
      paint(); raf = requestAnimationFrame(step);
    };
    var go = function (i) { target = i; if (RM) { pos = i; paint(); return; } if (!raf) raf = requestAnimationFrame(step); };
    paint(); addEventListener('resize', paint);
    var seq = [1, 2, 3, 1, 0], k = 0, timer = 0;
    onView(stage, function () { if (timer) return; timer = setInterval(function () { if (document.hidden) return; go(seq[k++ % seq.length]); }, 2600); });
  });

  if (!S) { if (window.console) console.warn('[ds4] SlooshInk did not load'); return; }

  S.ready(function () {
    safe('auto', function () { S.auto(document); });
    // Boil (the 6.5fps line jitter) repaints every inked drawing on the page at once. Keep it on only while the
    // Ink section, which demonstrates it, is on screen.
    safe('boil', function () {
      S.boil(false);
      if (RM || !('IntersectionObserver' in window)) return;
      new IntersectionObserver(function (es) { S.boil(es[0].isIntersecting); }).observe($('ink'));
    });
    // Sections out of view pause their CSS animations (see .ds-asleep).
    safe('sleep', function () {
      if (!('IntersectionObserver' in window)) return;
      var io = new IntersectionObserver(function (es) { es.forEach(function (e) { e.target.classList.toggle('ds-asleep', !e.isIntersecting); }); }, { rootMargin: '200px 0px' });
      document.querySelectorAll('.ds-cover, .ds-sec').forEach(function (s) { io.observe(s); });
    });

    /* ── cover ── */
    safe('cover', function () {
      var h = Math.max(96, Math.min(180, Math.round(window.innerWidth * .14)));
      coverLogo = S.logo({ height: h, mount: $('cover-logo'), sleep: false });
      (RM ? Promise.resolve() : coverLogo.drawOn()).then(function () { return S.write($('motto'), 'precise at rest. alive when something happens.', { per: 45 }); });
      // base vs ink: the ink side draws a ring on its keycap and writes a tag
      var inkLoop = function () {
        var host = $('layer-ink'); wipe(host);
        var r = S.ring($('ink-target'), { container: host, pad: 8 });
        S.write($('ink-tag'), 'try this one', { per: 38 });
        return r;
      };
      onView($('layer-ink'), function () { setTimeout(inkLoop, 600); });
      $('layer-ink').addEventListener('click', function (e) { if (!e.target.closest('button')) inkLoop(); });
      // the four places
      var nubWrap = document.createElement('span'); $('four-pointer').appendChild(nubWrap); S.nub({ size: 56, mount: nubWrap });
      var dk = document.createElement('span'); $('four-pointer').appendChild(dk); S.dock({ size: 28, mount: dk });
      ['cat', 'chick'].forEach(function (k, i) { var w = document.createElement('span'); $('four-flock').appendChild(w); S.critter(k, { size: k === 'chick' ? 70 : 84, mount: w, gaze: 'cursor', flip: i === 1 }); });
      onView($('four-moment'), function () {
        var host = $('four-moment'); var L = S.layer(host); var g = S.util.mk('g', { 'class': 'ink-deco' }, L);
        var w = host.clientWidth - 20;
        var d = S.rough('M6 70 C' + (w * .3) + ' 68 ' + (w * .6) + ' 72 ' + w + ' 70', { amp: .5 });
        S.util.mk('path', { d: d, 'class': 'ink-faint' }, g);
        var p = S.util.mk('path', { d: d, 'class': 'ink-yellow' }, g);
        var len = p.getTotalLength(); p.style.strokeDasharray = len + ' ' + len; p.style.strokeDashoffset = len;
        var pw = document.createElement('span'); pw.style.cssText = 'position:absolute;left:0;top:0;pointer-events:none;transition:transform 300ms linear'; host.appendChild(pw);   // pencil doodle retired; the yellow line draws on its own
        var v = 0, set = function (x) { p.style.transition = 'stroke-dashoffset 300ms linear'; p.style.strokeDashoffset = len * (1 - x); var pt = p.getPointAtLength(len * x); pw.style.transform = 'translate(' + (pt.x - 5) + 'px,' + (pt.y - 23) + 'px)'; };
        set(0); if (!RM) loopWhileVisible(host, function () { v = v >= 1 ? 0 : v + .05; set(v); }, 320); else set(.6);
      });
    });

    /* ── digits ── */
    safe('digits', function () {
      ['dg-d', 'dg-s'].forEach(function (id) {
        var col = $(id), sp = col.querySelectorAll('span'), a = sp[0].getBoundingClientRect().width, b = sp[1].getBoundingClientRect().width;
        var left = Math.min(sp[0].offsetLeft, sp[1].offsetLeft);
        [sp[0], sp[1]].forEach(function (s) { var i = document.createElement('i'); i.style.left = s.offsetLeft + 'px'; col.appendChild(i); });
        $(id + '-note').textContent += ' · ' + Math.round(a) + 'px vs ' + Math.round(b) + 'px';
      });
    });

    /* ── grounds: critters peek when the stack arrives ── */
    onView(document.querySelector('.ds-grounds'), function () {
      document.querySelectorAll('.ds-grounds [data-critter]').forEach(function (n, i) { if (n._critter) setTimeout(function () { n._critter.play('peek'); }, i * 180); });
    });

    /* ── keycap anatomy: arrows from the labels ── */
    onView($('anat'), function () {
      var host = $('anat-stage'), btn = $('anat-btn');
      var b = S.util.rel(btn, host), f = S.util.rel($('lb-face'), host), l = S.util.rel($('lb-lip'), host);
      S.arrow(host, { x: f.x + f.w * .6, y: f.y + f.h + 4 }, { x: b.x + b.w * .28, y: b.y + 8 }, { cls: 'ink-soft', curl: .35 });
      setTimeout(function () { S.arrow(host, { x: l.x + 8, y: l.y - 4 }, { x: b.x + b.w * .7, y: b.y + b.h - 2 }, { cls: 'ink-soft', curl: -.35 }); }, 500);
    });

    /* ── controls ── */
    safe('tabs', function () {
      S.tabs($('tabs-m')); S.tabs($('tabs-a')); S.tabs($('tabs-b'));
      onView($('tabs-b'), function () {
        var t = $('tab-new'); setTimeout(function () {
          // no drawn underline (removed, Oct 2026): the hand "new" sits above the tab's top-right corner
          var host = t.closest('[data-ink-root]'), r = S.util.rel(t, host);
          var n = document.createElement('span'); n.className = 'sl-hand-sm sl-ink-text'; n.style.cssText = 'position:absolute;left:' + (r.x + r.w - 10) + 'px;top:' + (r.y - 16) + 'px;transform:rotate(-6deg)';
          host.appendChild(n); S.write(n, 'new', { per: 60 });
        }, 500);
      });
    });
    safe('switch', function () {
      $('sw').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; $('sw').querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); });
    });
    function billToggle(root, onChange) {
      var pill = root.querySelector('.pill'), bs = root.querySelectorAll('button');
      var sync = function (instant) {
        var on = root.querySelector('button[aria-pressed="true"]'), r = on.getBoundingClientRect(), pr = root.getBoundingClientRect();
        if (instant) pill.style.transition = 'none';
        pill.style.width = r.width + 'px'; pill.style.transform = 'translateX(' + (r.left - pr.left) + 'px)';
        // selected text colour comes from CSS (standard tab: foreground on muted)
        if (instant) requestAnimationFrame(function () { pill.style.transition = ''; });
      };
      bs.forEach(function (b) { b.addEventListener('click', function () { bs.forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); sync(); if (onChange) onChange(b.textContent.indexOf('Yearly') === 0); }); });
      sync(true); window.addEventListener('resize', function () { sync(true); });
    }
    safe('bill', function () { billToggle($('bill')); });
    safe('stepper', function () {
      var n = 3, o = $('st-o'), up = function () { o.textContent = n + (n === 1 ? ' seat' : ' seats'); };
      $('st-m').onclick = function () { n = Math.max(1, n - 1); up(); }; $('st-p').onclick = function () { n = Math.min(10, n + 1); up(); };
    });
    safe('range', function () {
      var r = $('rg'), upd = function () { r.style.setProperty('--p', r.value + '%'); $('rg-v').textContent = r.value; $('rg-c').innerHTML = (Math.round(r.value * 2.01 * 100) / 100) + ' credits <span class="rate">· 2.01 per 2K image</span>'; };
      r.addEventListener('input', upd); upd();
    });

    /* ── the eleven ink primitives (underline removed) ── */
    safe('ink', function () {
      var CELLS = [
        ['pen', 'Pen stroke', 'Two passes: one full, one partial and offset.', function (c, a) { var L = S.layer(c), g = S.util.mk('g', { 'class': 'ink-deco' }, L), r = S.util.rel(a, c); S.draw(S.pen(g, 'M' + (r.x + 6) + ' ' + (r.y + 84) + 'C' + (r.x + 60) + ' ' + (r.y + 20) + ' ' + (r.x + 130) + ' ' + (r.y + 120) + ' ' + (r.x + r.w - 10) + ' ' + (r.y + 40), {}), { dur: 800 }); }],
        ['ring', 'Ring', 'Yellow, 2.2px, with a 4 to 6% lift gap. Attention and selection.', function (c, a) { a.innerHTML = '<span class="word" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%)">Generate</span>'; S.ring(a.firstChild, { container: c, pad: 10 }); }],
        ['brackets', 'Brackets', 'Four corner ticks, 6px outside. Hover on tiles and cards.', function (c, a) { a.innerHTML = '<div style="position:absolute;inset:14px 34px;border-radius:12px;background:hsl(var(--muted))"></div>'; S.brackets(a.firstChild, { container: c }); }],
        ['arrow', 'Curly arrow', 'From a note to its target. One optional loop.', function (c, a) { var r = S.util.rel(a, c); S.arrow(c, { x: r.x + 14, y: r.y + 100 }, { x: r.x + r.w - 18, y: r.y + 20 }, { cls: 'ink-pen', loop: true }); }],
        ['trail', 'Dotted trail', 'A dot every 10px. The pointer\'s flight, drag demos.', function (c, a) { var r = S.util.rel(a, c); S.trail(c, 'M' + (r.x + 8) + ' ' + (r.y + 104) + 'Q' + (r.x + r.w / 2) + ' ' + (r.y - 30) + ' ' + (r.x + r.w - 8) + ' ' + (r.y + 96), { cls: 'ink-dot-yellow' }); }],
        ['hatch', 'Crayon hatch', 'Fills at −44°, 3.9px gap. Ink marks only; critters now use a flat fill.', function (c, a) { var L = S.layer(c), r = S.util.rel(a, c), g = S.util.mk('g', { 'class': 'ink-deco' }, L); var cx = r.x + r.w / 2, cy = r.y + r.h / 2, rx = Math.min(r.w / 2 - 10, 80), ry = r.h / 2 - 10; S.util.mk('path', { d: S.rough(S.ellipseD(cx, cy, rx, ry), { amp: 1.6 }), fill: S.hatch('yellow', 1) }, g); S.draw(S.pen(g, S.ellipseD(cx, cy, rx, ry), { cls: 'ink-pen-bold' }), { dur: 600 }); }],
        ['scribble', 'Scribble', 'Six loops redrawn every 154ms. Thinking, verifying.', function (c, a) { var r = S.util.rel(a, c); S.scribble(c, r.x + r.w / 2 - 44, r.y + 40, 88, 40); }],
        ['burst', 'Burst', 'Seven marks fly 16 to 34px and fade. Critter pokes and celebrations only, never on a button.', function (c, a) { var r = S.util.rel(a, c); S.burst(c, r.x + r.w / 2, r.y + r.h / 2, { n: 9, kinds: ['star', 'drop', 'tick'] }); }],
        ['check', 'Check', 'Mint, 2.4px, three points, 360ms. Done, saved, sent.', function (c, a) { var r = S.util.rel(a, c); S.check(c, r.x + r.w / 2, r.y + r.h / 2, 44, { w: 3 }); }],
        ['sketch', 'Sketch box', 'Faint outline plus pen hatch. Loading skeletons.', function (c, a) { a.innerHTML = '<div data-sk style="position:absolute;inset:8px 24px;border-radius:12px"></div>'; S.sketch(a); }],
        ['boil', 'Boil', 'Lines re-jitter at 6.5fps while on screen. Ink marks only; critters no longer boil.', function (c, a) { var w = document.createElement('div'); w.style.cssText = 'position:absolute;inset:0;display:grid;place-items:center'; a.appendChild(w); var r = S.util.rel(a, c), L = S.layer(c); L.classList.add('ink-boil'); var pth = S.pen(L, S.rough('M' + (r.x + r.w / 2 - 50) + ' ' + (r.y + r.h / 2) + ' C' + (r.x + r.w / 2 - 20) + ' ' + (r.y + r.h / 2 - 26) + ' ' + (r.x + r.w / 2 + 20) + ' ' + (r.y + r.h / 2 + 26) + ' ' + (r.x + r.w / 2 + 50) + ' ' + (r.y + r.h / 2), { amp: .6 }), { cls: 'ink-pen-bold' }); S.draw(pth, { dur: 500 }); }]   // was a star doodle
      ];
      var host = $('ink-cells');
      CELLS.forEach(function (k, i) {
        var cell = document.createElement('div'); cell.className = 'ds-cell'; cell.setAttribute('data-ink-root', '');
        cell.innerHTML = '<span class="id">' + (i + 1) + '</span><div class="stage" id="ik-' + k[0] + '"></div><b>' + k[1] + '</b><span>' + k[2] + '</span>';
        host.appendChild(cell);
        var run = function () { var a = $('ik-' + k[0]); wipe(cell); a.innerHTML = ''; safe('ink-' + k[0], function () { k[3](cell, a); }); };
        cell.addEventListener('click', run); cell.style.cursor = 'pointer';
        onView(cell, function () { setTimeout(run, (i % 4) * 140); if (k[0] === 'burst' && !RM) loopWhileVisible(cell, run, 2600); });
      });
    });

    /* ── handwriting ── */
    var writeAll = function () {
      document.querySelectorAll('#hand-plate .w').forEach(function (n, i) { setTimeout(function () { S.write(n, n.getAttribute('data-w'), { per: +n.getAttribute('data-per') }); }, i * 450); });
    };
    onView($('hand-plate'), writeAll);
    $('hand-again').addEventListener('click', writeAll);

    /* ── doodles: retired (Oct 2026). Icons come from Hugeicons. ── */
    safe('hand-compare', function () {
      ['bird', 'cat', 'squirrel', 'dog'].forEach(function (k) {
        [['hand-low', 'low'], ['hand-full', 'full']].forEach(function (h) {
          var w = document.createElement('span'); $(h[0]).appendChild(w);
          S.critter(k, { size: 72, mount: w, gaze: 'none', hand: h[1], flip: k === 'cat' || k === 'dog' || k === 'squirrel' });
        });
      });
    });

    /* ── the flock ── */
    safe('flock', function () {
      var order = ['bird', 'chick', 'cat', 'dog', 'mouse', 'squirrel', 'fish'];
      var size = { bird: 108, chick: 92, cat: 100, dog: 100, mouse: 80, squirrel: 100, fish: 70 };
      var homes = { bird: 'Docs hero, Stage banners, plan success', chick: 'Desktop loaders, good-news toasts', cat: 'Assets empty, default avatar, plan cards', dog: 'Drop zones, uploads, imports', mouse: 'Hints, no-results, Creator and Pro cards', squirrel: 'Credits meter, top-ups, saves', fish: 'Phone loaders, very long waits' };
      var perch = $('perch'), cast = $('cast'), crits = [];
      order.forEach(function (k) {
        var w = document.createElement('span'); perch.appendChild(w);
        var c = S.critter(k, { size: size[k], mount: w, clickable: true, ground: k !== 'fish' }); w.style.opacity = '0'; crits.push([w, c]);
        var info = S.cast[k], d = document.createElement('div');
        d.innerHTML = '<b>' + info.name + '</b><i>' + info.species + (info.species !== k ? ' · key "' + k + '"' : '') + '</i><span>' + info.role + '</span><span style="color:hsl(var(--muted-foreground))">' + homes[k] + '</span><em>"' + info.words[0] + '"</em>';
        cast.appendChild(d);
      });
      var nw = document.createElement('span'); perch.appendChild(nw); S.nub({ size: 60, mount: nw }); nw.style.alignSelf = 'center';
      var nd = document.createElement('div'); nd.innerHTML = '<b>Nub</b><i>the pointer</i><span>Guide. Points, asks, acts.</span><span style="color:hsl(var(--muted-foreground))">Top-bar dock, everywhere</span><em>"try this one"</em>'; cast.appendChild(nd);
      onView(perch, function () { crits.forEach(function (p, i) { setTimeout(function () { p[0].style.opacity = '1'; p[1].play('dropin'); }, RM ? 0 : 120 + i * 110); }); });
    });

    safe('moods', function () {
      var moods = ['default', 'happy', 'sleepy', 'startled', 'dizzy', 'sad', 'love', 'think', 'wink', 'grumpy', 'listen', 'reading'];
      var moves = ['hop', 'bigjump', 'squish', 'tilt', 'nod', 'shake', 'wiggle', 'peek', 'duck', 'popin', 'popout', 'dropin', 'walk', 'celebrate'];
      var who = $('mm-who'), cur = 'cat', crit = null, mood = 'default';
      var build = function () { $('mm-crit').innerHTML = ''; crit = S.critter(cur, { size: 140, mount: $('mm-crit'), mood: mood }); };
      S.critters.forEach(function (k) {
        var b = document.createElement('button'); b.className = 'sl-tab'; b.textContent = S.cast[k].name; b.setAttribute('aria-selected', k === cur);
        b.onclick = function () { who.querySelectorAll('.sl-tab').forEach(function (x) { x.setAttribute('aria-selected', x === b); }); cur = k; build(); };
        who.appendChild(b);
      });
      moods.forEach(function (m) { demoBtn(m, $('mm-moods'), function () { mood = m; $('mm-now').textContent = m; crit.mood(m); }); });
      moves.forEach(function (m) { demoBtn(m, $('mm-moves'), function () { $('mm-now').textContent = m; if (m === 'walk') { crit.play('walk', { dx: 60 }).then(function () { return crit.play('walk', { dx: -60 }); }); } else crit.play(m).then(function () { if (m === 'popout' || m === 'duck') setTimeout(function () { crit.play('popin'); }, 500); }); }); });
      build();
    });

    safe('crew', function () {
      var play = { snail: 'crawl', bee: 'buzz', worm: 'wiggle', firefly: 'buzz' };
      var host = $('crew');
      ['snail', 'bee', 'worm', 'firefly'].forEach(function (k) {
        var c = document.createElement('div'); var a = document.createElement('div'); a.className = 'art'; c.appendChild(a);
        var cr = S.crew(k, { size: 88, mount: a, loop: true });
        var info = S.crewInfo[k]; c.insertAdjacentHTML('beforeend', '<b>' + info.name + ' · ' + k + '</b><span>' + info.role + '</span>');
        host.appendChild(c);
        onView(c, function () { cr.draw().then(function () { if (!RM) cr.play(play[k]); }); });
      });
    });

    /* ── the pointer ── */
    safe('pointer', function () {
      var app = $('ptr-app'), dock = $('ptr-dock')._dock, P = S.pointer(app, { dock: dock }), busy = false;
      var G = {
        'point + tag': function () { return P.point($('pt-t2'), 'try this one', { buttons: [{ label: 'Recreate', primary: true }, { label: 'Later', onClick: function () { P.tuck(); } }] }); },
        'circle': function () { return P.circle($('pt-gen'), { text: '25 credits' }); },
        'tap': function () { return P.tap($('pt-gen')); },
        'drag': function () { return P.drag($('pt-t3'), $('pt-prompt')); },
        'type': function () { $('pt-prompt').value = ''; return P.type($('pt-prompt'), 'a corgi astronaut, film grain, 35mm'); },
        'note': function () { return P.point($('pt-prompt'), null, { ring: false }).then(function () { return P.note({ title: 'sharpen this?', body: 'Add a lens and a light. I rewrite, you approve.', buttons: [{ label: 'Sharpen', primary: true }, { label: 'Keep mine' }] }); }); },
        'think': function () { P.think(true); return wait(2000).then(function () { P.think(false); }); },
        'celebrate': function () { return P.celebrate(); },
        'shrug': function () { return P.shrug('not sure. try Docs?'); },
        'tuck': function () { return P.tuck(); }
      };
      Object.keys(G).forEach(function (k) { demoBtn(k, $('ptr-ctrls'), function () { if (busy) return; busy = true; Promise.resolve(G[k]()).then(function () { busy = false; }, function () { busy = false; }); }); });
      onView(app, function () {
        busy = true;
        wait(500).then(function () { dock.notice(); return wait(700); })
          .then(function () { return P.point($('pt-t2'), 'try this one'); })
          .then(function () { return wait(1600); })
          .then(function () { return P.tuck(); })
          .then(function () { busy = false; }, function () { busy = false; });
      }, '0px 0px -30% 0px');
    });

    /* ── logo ── */
    safe('logo', function () {
      var L = S.logo({ height: Math.min(160, Math.max(90, Math.round($('logo-big').parentNode.clientWidth * .22))), mount: $('logo-big'), sleep: false }), now = $('logo-now'), thinking = false;
      var acts = [['L1 draw on', 'drawOn'], ['L2 blink', 'blink'], ['L3 sleepy', 'sleepy'], ['L3 wake', 'wake'], ['L4 swoosh', 'swoosh'], ['L5 startle', 'startle'], ['L6 happy', 'happy'], ['L7 think', 'think'], ['L8 wink', 'wink'], ['L9 hop', 'hop'], ['L10 press', 'press'], ['L11 lights on', 'lightsOn']];
      acts.forEach(function (a) {
        var b = demoBtn(a[0], $('logo-ctrls'), function () {
          now.textContent = a[0].slice(a[0].indexOf(' ') + 1);
          if (a[1] === 'think') { thinking = !thinking; L.think(thinking); b.setAttribute('aria-pressed', thinking); }
          else { if (thinking) { thinking = false; L.think(false); } L[a[1]](); }
        });
      });
      onView($('logo-big'), function () { if (!RM) L.drawOn().then(function () { return wait(600); }).then(function () { now.textContent = 'swoosh'; L.swoosh(); }); });
    });

    /* ── motion ── */
    safe('motion', function () {
      var D = [['instant', 'keycap press'], ['fast', 'hover, colour'], ['base', 'menus, tabs'], ['ring', 'ring or brackets'], ['slow', 'modals, toasts'], ['fly', 'pointer flight'], ['pop', 'critter pop-in'], ['lazy', 'critter entrances'], ['draw', 'a figure draws itself'], ['breathe', 'idle breath']];
      var host = $('durs'), max = 3400;
      D.forEach(function (d) {
        var v = cssVar('--sl-dur-' + d[0]); var ms = parseFloat(v) || 0;
        var row = document.createElement('div');
        row.innerHTML = '<span><b style="font-weight:510;color:hsl(var(--foreground))">' + d[0] + '</b><br>' + d[1] + '</span><i style="width:' + Math.max(1, Math.sqrt(ms / max) * 100) + '%"></i><em>' + Math.round(ms) + 'ms</em>';
        host.appendChild(row);
      });
      var E = [['out', 'default'], ['in-out', 'sheets, carousels'], ['hop', 'pops, hops, tags'], ['lip', 'keycap press'], ['draw', 'pen strokes'], ['squash', 'squash and stretch'], ['fly', 'the pointer\'s arc']];
      var eh = $('eases'), dots = [];
      E.forEach(function (e) {
        var row = document.createElement('div');
        row.innerHTML = '<span><b style="font-weight:510">' + e[0] + '</b><small>' + e[1] + '</small></span><div class="track"><span class="dot"></span></div>';
        eh.appendChild(row); dots.push([row.querySelector('.dot'), cssVar('--sl-ease-' + e[0])]);
      });
      var go = function () {
        dots.forEach(function (d) {
          var tr = d[0].parentNode.clientWidth - 28;
          d[0].animate([{ transform: 'translateX(0)' }, { transform: 'translateX(' + tr + 'px)' }], { duration: RM ? 0 : 1100, easing: d[1] || 'ease', fill: 'forwards' });
        });
      };
      $('ease-go').addEventListener('click', go);
      onView(eh, go);
    });

    /* ── components ── */
    safe('tiles', function () {
      onView($('tiles'), function () {
        var W = $('tiles'), sel = $('tile-sel');
        S.ring(sel, { container: W, shape: 'box', pad: 5 });
        var r = S.util.rel(sel, W), b = document.createElement('span');
        b.style.cssText = 'position:absolute;left:' + (r.x + r.w - 30) + 'px;top:' + (r.y + 8) + 'px;width:22px;height:22px;border-radius:50%;background:hsl(var(--brand-accent));z-index:2';
        W.appendChild(b);
        var ck = S.check(W, r.x + r.w - 19, r.y + 19, 12, { cls: 'ink-pen', w: 2.2 }); ck.el.querySelector('path').style.stroke = '#0A0A0A';
        // generating: pencil progress along the bottom
        var g = $('tile-gen'), L = S.layer(g), grp = S.util.mk('g', { 'class': 'ink-deco' }, L), w = g.clientWidth - 32, y = g.clientHeight - 18;
        var d = S.rough('M16 ' + y + 'C' + (16 + w * .3) + ' ' + (y - 2) + ' ' + (16 + w * .6) + ' ' + (y + 2) + ' ' + (16 + w) + ' ' + y, { amp: .5 });
        S.util.mk('path', { d: d, 'class': 'ink-faint' }, grp); var p = S.util.mk('path', { d: d, 'class': 'ink-yellow' }, grp);
        var len = p.getTotalLength(); p.style.strokeDasharray = len + ' ' + len; p.style.strokeDashoffset = len;
        var v = 0, tick = function () { v = v >= 1 ? 0 : v + .04; p.style.transition = 'stroke-dashoffset 300ms linear'; p.style.strokeDashoffset = len * (1 - v); $('gen-pct').textContent = 'drawing it… ' + Math.round(v * 100) + '%'; };
        tick(); if (!RM) loopWhileVisible(g, tick, 360);
        // loved: the heart doodle is retired; a Hugeicons heart goes here once the library is linked
      });
    });
    safe('toasts', function () {
      onView($('toasts-p'), function () {
        ['ts1', 'ts2', 'ts3'].forEach(function (id, i) { S.util.anim($(id), [{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }], { duration: RM ? 0 : 320, delay: i * 160, easing: 'cubic-bezier(.34,1.56,.64,1)', fill: 'backwards' }); });
        setTimeout(function () { var b = S.critter('chick', { size: 52, mount: $('ts-burb'), gaze: 'none' }); b.play('peek'); var r = S.util.rel($('ts-ck'), $('toasts-p')); S.check($('toasts-p'), r.x + 11, r.y + 11, 16); }, 500);
        setTimeout(function () { var s = S.critter('squirrel', { size: 44, mount: $('ts-stash'), gaze: 'none', flip: true }); s.play('peek'); }, 800);
      });
    });
    safe('credits', function () {
      var st = S.critter('squirrel', { size: 44, mount: $('cr-stash'), gaze: 'none' }), up = false;
      $('cr-top').addEventListener('click', function () {
        up = !up; var pct = up ? 62 : 31;
        $('cr-f').style.width = pct + '%'; $('cr-stash').style.left = pct + '%'; st.play('hop');
        $('cr-n').textContent = (up ? '4,960' : '2,480') + ' of 8,000 left';
        if (up) { var r = S.util.rel($('cr-m'), $('prog')); S.burst($('prog'), r.x + r.w * .62, r.y - 20, { n: 8, kinds: ['star', 'tick'] }); }
      });
    });
    var loaderRun = function () {
      $('ld-burb').innerHTML = '';
      S.write($('ld-w'), 'slooshing your workspace', { per: 60 });
      setTimeout(function () { var b = S.critter('chick', { size: 72, mount: $('ld-burb'), gaze: 'none' }); b.play('peek'); b.look(.7, -.5); }, 400);
    };
    onView($('loader'), loaderRun); $('ld-again').addEventListener('click', loaderRun);
    onView($('empty'), function () {
      setTimeout(function () { var e = $('empty'), a = S.util.rel($('em-sh'), e), b = S.util.rel($('em-up'), e); S.arrow(e, { x: a.x + a.w * .3, y: a.y + a.h + 2 }, { x: b.x + b.w + 8, y: b.y + b.h * .5 }, { cls: 'ink-soft', head: 9, curl: -.4 }); }, 500);
    });
    var skRun = function () { var g = $('sk'); g.querySelectorAll('.ink-deco').forEach(function (n) { n.remove(); }); var s = S.sketch(g); setTimeout(function () { s.ink({ stagger: 70 }); }, RM ? 0 : 1700); };
    safe('sketch-fill', function () { var ph = ['ph1', 'ph2', 'ph3', 'ph4']; $('sk').querySelectorAll('[data-sk]').forEach(function (n, i) { n.innerHTML = '<span class="ds-ph ' + ph[i % 4] + '"></span>'; }); });
    onView($('sk'), skRun); $('sk-again').addEventListener('click', skRun);
    onView($('drop'), function () {
      var o = $('drop'), L = S.layer(o), g = S.util.mk('g', { 'class': 'ink-deco' }, L);
      var path = S.util.mk('path', { d: S.rough(S.rectD(4, 4, o.clientWidth - 8, o.clientHeight - 8, 10), { amp: .8 }), 'class': 'ink-yellow sl-march' }, g); path.style.strokeDasharray = '7 7';
      var b = S.critter('dog', { size: 64, mount: $('drop-boof'), gaze: 'none' }); b.play('peek'); b.look(-.6, -.4);
    });
    var celRun = function () {
      var fl = $('cel-fl'); fl.innerHTML = ''; $('cel-w').textContent = '';
      ['bird', 'chick', 'cat', 'mouse', 'dog', 'squirrel'].forEach(function (k, i) {
        var w = document.createElement('span'); fl.appendChild(w);
        var c = S.critter(k, { size: k === 'mouse' ? 48 : 60, mount: w, gaze: 'none' }); w.style.opacity = '0';
        setTimeout(function () { w.style.opacity = '1'; c.play('popin').then(function () { if (i % 2) c.mood('happy'); }); }, RM ? 0 : i * 110);
      });
      setTimeout(function () { var c = $('celebrate'); S.burst(c, c.clientWidth / 2, 110, { n: 14, kinds: ['star', 'confetti', 'tick'], spread: 2 }); S.write($('cel-w'), 'you made a thing!', { per: 60 }); }, RM ? 0 : 750);
    };
    onView($('celebrate'), celRun); $('cel-again').addEventListener('click', celRun);

    /* ── pricing patterns ── */
    safe('pricing', function () {
      var FL = { creator: ['cat', 'bird'], pro: ['mouse', 'cat', 'bird', 'chick'], max: ['mouse', 'cat', 'bird', 'chick', 'dog'] };
      var made = [];
      document.querySelectorAll('#plans .ds-plan').forEach(function (card, pi) {
        var f = card.querySelector('.flock');
        FL[card.getAttribute('data-plan')].forEach(function (k, i) {
          var w = document.createElement('span'); f.appendChild(w);
          var c = S.critter(k, { size: k === 'dog' ? 54 : k === 'mouse' ? 38 : 48, mount: w, gaze: 'none', flip: i % 2 === 1 && k !== 'bird' });
          w.style.opacity = '0'; made.push([w, c, pi, i]);
        });
      });
      onView($('plans'), function () {
        made.forEach(function (m) { setTimeout(function () { m[0].style.opacity = '1'; m[1].play('dropin'); }, RM ? 0 : 200 + m[2] * 220 + m[3] * 60); });
        setTimeout(function () {
          S.write($('most-w'), 'most picked', { per: 46 });
          var svg = $('most-svg'); S.draw(S.pen(svg, 'M44 4 C 30 8, 14 18, 10 44', { cls: 'ink-soft' }), { dur: 500 });
          setTimeout(function () { S.draw(S.pen(svg, 'M3 34 L10 45 L19 37', { cls: 'ink-soft' }), { dur: 260 }); }, 420);
        }, RM ? 0 : 1400);
        // (shipped: no squiggle under the highlighted word)
      });
      billToggle($('bill2'), function (yearly) {
        document.querySelectorAll('#plans .amt').forEach(function (a) {
          a.textContent = '$' + a.getAttribute(yearly ? 'data-y' : 'data-m');
          var was = a.parentNode.querySelector('.was'); was.style.visibility = yearly ? 'visible' : 'hidden';
          if (!RM) a.animate([{ transform: 'translateY(-14px) scale(.96)', opacity: .2 }, { transform: 'none', opacity: 1 }], { duration: 420, easing: 'cubic-bezier(.34,1.56,.64,1)' });
        });
      });
      var items = ['GPT Image 2', 'Veo 3.1', 'FLUX.2 Max', 'Kling 3.0', 'Ideogram 4.5', 'Seedance 2.5', 'Gemini Omni Flash', 'FLUX.2 Pro'];   // from the prototype's model list
      var track = $('band'), html = '<span class="lead">Every top model, every plan</span>';
      items.forEach(function (m) { html += '<span>' + m + '<i></i></span>'; });
      track.innerHTML = html + html;
      onView($('cmp'), function () { $('cmp').querySelectorAll('.ds-chk').forEach(function (c, i) { c.style.setProperty('--i', i); setTimeout(function () { c.classList.add('on'); }, RM ? 0 : i * 120); }); });
    });
  });
})();
