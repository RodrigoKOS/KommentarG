// KommentarG widget - layout igual ao print
// Uso no site do cliente:
// <div id="kommentarg"></div>
// <script src="https://SEU-PROJETO.vercel.app/widget.js" data-api="https://SEU-PROJETO.vercel.app/api/reviews" data-limit="3"></script>
(function () {
  var s = document.currentScript;
  var api = (s && s.getAttribute('data-api')) || '/api/reviews';
  var limit = parseInt((s && s.getAttribute('data-limit')) || '3', 10);
  var box = document.getElementById('kommentarg');
  if (!box) return;

  var css = '.kg-card{background:#f1f3f4;border-radius:12px;padding:16px 18px;font-family:Arial,Helvetica,sans-serif;color:#202124;margin:12px 0}.kg-head{display:flex;gap:10px;align-items:center}.kg-avatar{width:42px;height:42px;border-radius:50%;object-fit:cover;background:#dadce0;display:flex;align-items:center;justify-content:center;font-weight:bold;color:#5f6368;flex-shrink:0}.kg-name{font-weight:bold;font-size:15px;display:flex;align-items:center;gap:5px}.kg-sub{display:flex;align-items:center;gap:5px;color:#5f6368;font-size:13px;margin-top:2px}.kg-stars{color:#FBBC04;font-size:20px;letter-spacing:2px;margin:8px 0 6px}.kg-text{font-size:15px;line-height:1.45;margin:0}.kg-more{color:#1a73e8;cursor:pointer;font-size:15px;background:none;border:none;padding:0}';
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  function esc(x) { return String(x || '').replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  box.innerHTML = 'Carregando avaliações...';

  fetch(api).then(function (r) { return r.json(); }).then(function (d) {
    var list = (d.reviews || []).slice(0, limit);
    box.innerHTML = list.map(function (r) {
      var full = esc(r.text || '');
      var short = full.length > 140 ? full.slice(0, 140) + '...' : full;
      var needMore = full.length > 140;
      var stars = '★'.repeat(r.stars || 0) + '☆'.repeat(5 - (r.stars || 0));
      var av = r.authorPhoto
        ? '<img class="kg-avatar" src="' + esc(r.authorPhoto) + '" alt="" />'
        : '<div class="kg-avatar">' + esc((r.author || 'A').trim().charAt(0).toUpperCase()) + '</div>';
      return '<div class="kg-card"><div class="kg-head">' + av +
        '<div><div class="kg-name">' + esc(r.author || 'Anônimo') + '</div>' +
        '<div class="kg-sub"><span style="font-weight:bold;background:#fff;border-radius:50%;width:18px;height:18px;display:inline-flex;align-items:center;justify-content:center;color:#4285F4">G</span><span>' + esc(r.relativeTime || r.date || '') + '</span></div></div>' +
        '</div><div class="kg-stars">' + stars + '</div>' +
        '<p class="kg-text"><span class="short">' + short + '</span><span class="full" style="display:none">' + full + '</span>' +
        (needMore ? ' <button class="kg-more">Read more</button>' : '') + '</p></div>';
    }).join('');

    box.querySelectorAll('.kg-card').forEach(function (c) {
      var btn = c.querySelector('.kg-more');
      if (!btn) return;
      btn.addEventListener('click', function () {
        var sh = c.querySelector('.short');
        var fu = c.querySelector('.full');
        var open = fu.style.display !== 'none';
        fu.style.display = open ? 'none' : 'inline';
        sh.style.display = open ? 'inline' : 'none';
        btn.textContent = open ? 'Read more' : 'Show less';
      });
    });
  }).catch(function () { box.innerHTML = 'Não foi possível carregar avaliações.'; });
})();
