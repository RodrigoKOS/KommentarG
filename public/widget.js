// KommentarG widget bem simples para teste
// No site do cliente, ele cola:
// <div id="kommentarg"></div>
// <script src="https://SEU-PROJETO.vercel.app/widget.js" data-api="https://SEU-PROJETO.vercel.app/api/reviews"></script>
(function () {
  var api = document.currentScript.getAttribute('data-api') || '/api/reviews';
  var box = document.getElementById('kommentarg');
  if (!box) return;
  box.innerHTML = 'Carregando avaliações...';
  fetch(api).then(function (r) { return r.json(); }).then(function (d) {
    box.innerHTML = '<div style="font-family:Arial;border:1px solid #ddd;border-radius:12px;padding:16px">' +
      '<b>' + d.business + ' - ' + d.rating + ' ★</b><br/>' +
      d.reviews.map(function (r) { return '<p>★'.repeat(r.stars).slice(1) + ' ' + r.text + ' <small>(' + r.author + ')</small></p>'; }).join('') +
      '</div>';
  }).catch(function () { box.innerHTML = 'Não foi possível carregar avaliações.'; });
})();
