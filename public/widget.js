// KommentarG widget v2 - estilo Elfsight/ACF
// Atributos data-*:
//  data-api="https://.../api/reviews" (obrigatório no site do cliente)
//  data-place="ChIJ..." (RG da empresa - se vazio usa o padrão da Vercel)
//  data-layout="carousel" (padrão) | "grid"
//  data-limit="5" (máx de avaliações, padrão 10)
//  data-min-stars="0" (0-5, esconde notas menores)
//  data-sort="default" | "highest" | "lowest" | "recent"
//  data-theme="auto" | "light" | "dark"
//  data-bg, data-text, data-muted, data-stars, data-link, data-font, data-radius
//  data-show-photos="1", data-show-date="1", data-show-arrows="1", data-show-dots="1"
//  data-show-header="0" (1 mostra nome+nota da empresa em cima)
//  data-title="Avaliações" (título do cabeçalho)
//  data-autoplay="0" (segundos, 0 desliga)
(function () {
  var s = document.currentScript;
  function attr(n, d) { var v = s && s.getAttribute(n); return v === null || v === undefined || v === '' ? d : v; }
  var api = attr('data-api', '/api/reviews');
  var place = attr('data-place', '');
  if (place && api.indexOf('place=') === -1) {
    api += (api.indexOf('?') === -1 ? '?' : '&') + 'place=' + encodeURIComponent(place);
  }
  var layout = attr('data-layout', 'carousel');
  var limit = parseInt(attr('data-limit', '10'), 10) || 10;
  var minStars = parseInt(attr('data-min-stars', '4'), 10);
  if (isNaN(minStars)) minStars = 4;
  var sort = attr('data-sort', 'recent');
  var theme = attr('data-theme', 'auto');
  var showPhotos = attr('data-show-photos', '1') !== '0';
  var showDate = attr('data-show-date', '1') !== '0';
  var showArrows = attr('data-show-arrows', '1') !== '0';
  var showDots = attr('data-show-dots', '1') !== '0';
  var showHeader = attr('data-show-header', '0') === '1';
  var title = attr('data-title', 'Avaliações');
  var autoplay = parseInt(attr('data-autoplay', '0'), 10) || 0;

  var box = document.getElementById('kommentarg');
  if (!box) return;

  var css = '.kg-wrap{position:relative;font-family:var(--kg-font,inherit);color:var(--kg-text,inherit);color-scheme:light dark}' +
    '.kg-header{text-align:center;margin-bottom:12px}.kg-header h2{margin:0;font-size:22px}.kg-header p{margin:4px 0 0;opacity:.75;font-size:14px}' +
    '.kg-viewport{overflow:hidden}' +
    '.kg-track{display:flex;gap:16px;transition:transform .35s ease}' +
    '.kg-track.grid{display:grid;gap:16px;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));transform:none!important}' +
    '.kg-card{background:var(--kg-card-bg,rgba(127,127,127,.12));color:var(--kg-text,inherit);border:1px solid rgba(127,127,127,.22);border-radius:var(--kg-radius,12px);padding:16px 18px;flex:0 0 100%;box-sizing:border-box}' +
    '.kg-track.grid .kg-card{flex:none}' +
    '.kg-head{display:flex;gap:10px;align-items:center}' +
    '.kg-avatar{width:42px;height:42px;border-radius:50%;object-fit:cover;background:#dadce0;display:flex;align-items:center;justify-content:center;font-weight:bold;color:#fff;flex-shrink:0;font-size:20px}' +
    '.kg-name{font-weight:bold;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:200px}' +
    '.kg-sub{display:flex;align-items:center;gap:5px;font-size:13px;margin-top:2px;color:var(--kg-muted,inherit);opacity:.78}' +
    '.kg-stars{color:var(--kg-stars,#FBBC04);font-size:20px;letter-spacing:2px;margin:8px 0 6px}' +
    '.kg-text{font-size:15px;line-height:1.45;margin:0;min-height:66px}' +
    '.kg-more{color:var(--kg-link,#1a73e8);cursor:pointer;font-size:15px;background:none;border:none;padding:0;font:inherit}' +
    '.kg-arrow{position:absolute;top:40%;width:36px;height:36px;border-radius:50%;border:1px solid rgba(127,127,127,.3);background:var(--kg-arrow-bg,#fff);color:var(--kg-arrow-text,#202124);box-shadow:0 2px 8px rgba(0,0,0,.2);cursor:pointer;font-size:22px;z-index:2}' +
    '.kg-prev{left:-12px}.kg-next{right:-12px}.kg-arrow:disabled{opacity:.3}' +
    '.kg-dots{display:flex;gap:6px;justify-content:center;margin-top:14px}' +
    '.kg-dot{width:6px;height:6px;border-radius:50%;background:currentColor;opacity:.25;border:none;padding:0;cursor:pointer}' +
    '.kg-dot.on{opacity:1;width:7px;height:7px}' +
    '@media(min-width:640px){.kg-track:not(.grid) .kg-card{flex-basis:calc(50% - 8px)}}' +
    '@media(min-width:1024px){.kg-track:not(.grid) .kg-card{flex-basis:calc(33.333% - 11px)}}' +
    '@media(prefers-reduced-motion:reduce){.kg-track{transition:none}}';
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  function applyTheme() {
    var map = { 'data-bg': '--kg-card-bg', 'data-text': '--kg-text', 'data-muted': '--kg-muted', 'data-stars': '--kg-stars', 'data-link': '--kg-link', 'data-font': '--kg-font', 'data-radius': '--kg-radius' };
    Object.keys(map).forEach(function (a) { var v = s && s.getAttribute(a); if (v) box.style.setProperty(map[a], v); });
    if (theme === 'light') {
      if (!box.style.getPropertyValue('--kg-card-bg')) box.style.setProperty('--kg-card-bg', '#f1f3f4');
      if (!box.style.getPropertyValue('--kg-text')) box.style.setProperty('--kg-text', '#202124');
      if (!box.style.getPropertyValue('--kg-muted')) box.style.setProperty('--kg-muted', '#5f6368');
    } else if (theme === 'dark') {
      if (!box.style.getPropertyValue('--kg-card-bg')) box.style.setProperty('--kg-card-bg', '#2d2e30');
      if (!box.style.getPropertyValue('--kg-text')) box.style.setProperty('--kg-text', '#e8eaed');
      if (!box.style.getPropertyValue('--kg-muted')) box.style.setProperty('--kg-muted', '#9aa0a6');
      if (!box.style.getPropertyValue('--kg-arrow-bg')) box.style.setProperty('--kg-arrow-bg', '#303134');
      if (!box.style.getPropertyValue('--kg-arrow-text')) box.style.setProperty('--kg-arrow-text', '#fff');
    }
  }
  applyTheme();

  function esc(x) { return String(x || '').replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function bgFor(name) {
    var colors = ['#0F9D58', '#1976D2', '#7B1FA2', '#00838F', '#3E2723'];
    var h = 0; var str = String(name || 'A');
    for (var i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 997;
    return colors[h % colors.length];
  }

  var isGrid = layout === 'grid';
  box.innerHTML = '<div class="kg-wrap">' +
    (showHeader ? '<div class="kg-header"><h2></h2><p></p></div>' : '') +
    (isGrid ? '' : (showArrows ? '<button class="kg-arrow kg-prev">‹</button>' : '')) +
    '<div class="kg-viewport"><div class="kg-track' + (isGrid ? ' grid' : '') + '"></div></div>' +
    (isGrid ? '' : (showArrows ? '<button class="kg-arrow kg-next">›</button>' : '')) +
    ((isGrid || !showDots) ? '' : '<div class="kg-dots"></div>') + '</div>';

  var wrap = box.querySelector('.kg-wrap');
  var track = box.querySelector('.kg-track');
  var dotsBox = box.querySelector('.kg-dots');
  var prev = box.querySelector('.kg-prev');
  var next = box.querySelector('.kg-next');
  var page = 0, total = 0, timer = null;

  function perView() {
    if (isGrid) return 9999;
    var w = wrap.clientWidth || window.innerWidth;
    return w < 640 ? 1 : w < 1024 ? 2 : 3;
  }
  function maxPage() { return Math.max(0, Math.ceil(total / perView()) - 1); }
  function update() {
    if (isGrid) return;
    track.style.transform = 'translateX(-' + (page * 100) + '%)';
    if (dotsBox) {
      dotsBox.innerHTML = '';
      for (var i = 0; i <= maxPage(); i++) {
        (function (i) {
          var b = document.createElement('button');
          b.className = 'kg-dot' + (i === page ? ' on' : '');
          b.setAttribute('aria-label', 'Ir para ' + (i + 1));
          b.addEventListener('click', function () { page = i; update(); restart(); });
          dotsBox.appendChild(b);
        })(i);
      }
    }
    if (prev) prev.disabled = page === 0;
    if (next) next.disabled = page === maxPage();
  }
  function restart() {
    if (timer) { clearInterval(timer); timer = null; }
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (autoplay > 0 && !isGrid && maxPage() > 0) {
      timer = setInterval(function () { page = page >= maxPage() ? 0 : page + 1; update(); }, autoplay * 1000);
    }
  }

  if (prev) prev.addEventListener('click', function () { if (page > 0) { page--; update(); restart(); } });
  if (next) next.addEventListener('click', function () { if (page < maxPage()) { page++; update(); restart(); } });
  window.addEventListener('resize', function () { page = Math.min(page, maxPage()); update(); });
  wrap.addEventListener('mouseenter', function () { if (timer) clearInterval(timer); });
  wrap.addEventListener('mouseleave', restart);

  fetch(api).then(function (r) { return r.json(); }).then(function (d) {
    var list = (d.reviews || []).filter(function (r) { return (r.stars || 0) >= minStars; });
    if (sort === 'highest') list.sort(function (a, b) { return (b.stars || 0) - (a.stars || 0); });
    else if (sort === 'lowest') list.sort(function (a, b) { return (a.stars || 0) - (b.stars || 0); });
    else if (sort === 'recent') list.sort(function (a, b) { return String(b.date || '') < String(a.date || '') ? -1 : 1; });
    list = list.slice(0, limit);
    total = list.length;

    if (showHeader) {
      var h = box.querySelector('.kg-header h2');
      var p = box.querySelector('.kg-header p');
      if (h) h.textContent = title + ' (' + (d.rating || '-') + '★)';
      if (p) p.textContent = (d.business || '') + ' · ' + (d.total || total) + ' avaliações no Google';
    }

    track.innerHTML = list.map(function (r) {
      var full = esc(r.text || '');
      var short = full.length > 120 ? full.slice(0, 120) + '...' : full;
      var needMore = full.length > 120;
      var stars = '★'.repeat(r.stars || 0) + '☆'.repeat(5 - (r.stars || 0));
      var av = (!showPhotos) ? '' : (r.authorPhoto
        ? '<img class="kg-avatar" src="' + esc(r.authorPhoto) + '" alt="" />'
        : '<div class="kg-avatar" style="background:' + bgFor(r.author) + '">' + esc((r.author || 'A').trim().charAt(0).toUpperCase()) + '</div>');
      var dt = showDate ? '<div class="kg-sub"><span>G</span><span>' + esc(r.relativeTime || r.date || '') + '</span></div>' : '';
      return '<div class="kg-card"><div class="kg-head">' + av +
        '<div style="min-width:0"><div class="kg-name">' + esc(r.author || 'Anônimo') + '</div>' + dt + '</div>' +
        '</div><div class="kg-stars">' + stars + '</div>' +
        '<p class="kg-text"><span class="short">' + short + '</span><span class="full" style="display:none">' + full + '</span>' +
        (needMore ? ' <button class="kg-more">Read more</button>' : '') + '</p></div>';
    }).join('') || '<p>Sem avaliações com esse filtro.</p>';

    track.querySelectorAll('.kg-card').forEach(function (c) {
      var btn = c.querySelector('.kg-more');
      if (!btn) return;
      btn.addEventListener('click', function (ev) {
        ev.stopPropagation();
        var sh = c.querySelector('.short');
        var fu = c.querySelector('.full');
        var open = fu.style.display !== 'none';
        fu.style.display = open ? 'none' : 'inline';
        sh.style.display = open ? 'inline' : 'none';
        btn.textContent = open ? 'Read more' : 'Show less';
      });
    });
    page = 0; update(); restart();
  }).catch(function () { track.innerHTML = 'Não foi possível carregar avaliações.'; });
})();
