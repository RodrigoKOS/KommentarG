// KommentarG widget carrossel responsivo - max 3 por vez, setas + bolinhas
// Uso:
// <div id="kommentarg"></div>
// <script src="https://SEU-PROJETO.vercel.app/widget.js" data-api="https://SEU-PROJETO.vercel.app/api/reviews"></script>
(function () {
  var s = document.currentScript;
  var api = (s && s.getAttribute('data-api')) || '/api/reviews';
  var box = document.getElementById('kommentarg');
  if (!box) return;

  var css = '.kg-wrap{position:relative;font-family:Arial,Helvetica,sans-serif;color:#202124}.kg-viewport{overflow:hidden}.kg-track{display:flex;gap:16px;transition:transform .35s ease}.kg-card{background:#f1f3f4;border-radius:12px;padding:16px 18px;flex:0 0 100%;box-sizing:border-box}.kg-head{display:flex;gap:10px;align-items:center}.kg-avatar{width:42px;height:42px;border-radius:50%;object-fit:cover;background:#dadce0;display:flex;align-items:center;justify-content:center;font-weight:bold;color:#fff;flex-shrink:0;font-size:20px}.kg-name{font-weight:bold;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:200px}.kg-sub{display:flex;align-items:center;gap:5px;color:#5f6368;font-size:13px;margin-top:2px}.kg-stars{color:#FBBC04;font-size:20px;letter-spacing:2px;margin:8px 0 6px}.kg-text{font-size:15px;line-height:1.45;margin:0;min-height:66px}.kg-more{color:#1a73e8;cursor:pointer;font-size:15px;background:none;border:none;padding:0}.kg-arrow{position:absolute;top:40%;width:36px;height:36px;border-radius:50%;border:none;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,.2);cursor:pointer;font-size:22px;z-index:2}.kg-prev{left:-12px}.kg-next{right:-12px}.kg-arrow:disabled{opacity:.3}.kg-dots{display:flex;gap:6px;justify-content:center;margin-top:14px}.kg-dot{width:6px;height:6px;border-radius:50%;background:#dadce0;border:none;padding:0;cursor:pointer}.kg-dot.on{background:#202124;width:7px;height:7px}@media(min-width:640px){.kg-card{flex-basis:calc(50% - 8px)}}@media(min-width:1024px){.kg-card{flex-basis:calc(33.333% - 11px)}}';
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  function esc(x) { return String(x || '').replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function bgFor(name) {
    var colors = ['#0F9D58', '#1976D2', '#7B1FA2', '#00838F', '#3E2723'];
    var h = 0; var str = String(name || 'A');
    for (var i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 997;
    return colors[h % colors.length];
  }

  box.innerHTML = '<div class="kg-wrap"><button class="kg-arrow kg-prev">‹</button><div class="kg-viewport"><div class="kg-track"></div></div><button class="kg-arrow kg-next">›</button><div class="kg-dots"></div></div>';

  var wrap = box.querySelector('.kg-wrap');
  var track = box.querySelector('.kg-track');
  var dotsBox = box.querySelector('.kg-dots');
  var prev = box.querySelector('.kg-prev');
  var next = box.querySelector('.kg-next');
  var page = 0, total = 0;

  function perView() {
    var w = wrap.clientWidth || window.innerWidth;
    return w < 640 ? 1 : w < 1024 ? 2 : 3;
  }
  function maxPage() { return Math.max(0, Math.ceil(total / perView()) - 1); }
  function update() {
    track.style.transform = 'translateX(-' + (page * 100) + '%)';
    dotsBox.innerHTML = '';
    for (var i = 0; i <= maxPage(); i++) {
      (function (i) {
        var b = document.createElement('button');
        b.className = 'kg-dot' + (i === page ? ' on' : '');
        b.addEventListener('click', function () { page = i; update(); });
        dotsBox.appendChild(b);
      })(i);
    }
    prev.disabled = page === 0;
    next.disabled = page === maxPage();
  }

  prev.addEventListener('click', function () { if (page > 0) { page--; update(); } });
  next.addEventListener('click', function () { if (page < maxPage()) { page++; update(); } });
  window.addEventListener('resize', function () { page = Math.min(page, maxPage()); update(); });

  fetch(api).then(function (r) { return r.json(); }).then(function (d) {
    total = (d.reviews || []).length;
    track.innerHTML = (d.reviews || []).map(function (r) {
      var full = esc(r.text || '');
      var short = full.length > 120 ? full.slice(0, 120) + '...' : full;
      var needMore = full.length > 120;
      var stars = '★'.repeat(r.stars || 0) + '☆'.repeat(5 - (r.stars || 0));
      var av = r.authorPhoto
        ? '<img class="kg-avatar" src="' + esc(r.authorPhoto) + '" alt="" />'
        : '<div class="kg-avatar" style="background:' + bgFor(r.author) + '">' + esc((r.author || 'A').trim().charAt(0).toUpperCase()) + '</div>';
      return '<div class="kg-card"><div class="kg-head">' + av +
        '<div style="min-width:0"><div class="kg-name">' + esc(r.author || 'Anônimo') + '</div>' +
        '<div class="kg-sub"><span>G</span><span>' + esc(r.relativeTime || r.date || '') + '</span></div></div>' +
        '</div><div class="kg-stars">' + stars + '</div>' +
        '<p class="kg-text"><span class="short">' + short + '</span><span class="full" style="display:none">' + full + '</span>' +
        (needMore ? ' <button class="kg-more">Read more</button>' : '') + '</p></div>';
    }).join('');

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
    page = 0; update();
  }).catch(function () { track.innerHTML = 'Não foi possível carregar avaliações.'; });
})();
