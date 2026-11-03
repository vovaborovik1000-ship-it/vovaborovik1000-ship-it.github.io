/* Портфолио — логика. Контент берётся из content.js (window.SITE). */
(function () {
  'use strict';
  var S = window.SITE || {};
  var owner = S.owner || {};
  var C = S.contacts || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- имя и подписи ---------- */
  if (owner.name) $$('[data-owner-name]').forEach(function (el) { el.textContent = owner.name; });
  if (owner.role) $$('[data-owner-role]').forEach(function (el) { el.textContent = owner.role; });
  $('#year').textContent = new Date().getFullYear();

  /* ---------- превью сайта ---------- */
  var ctaWords = { 'Лендинг': 'Оставить заявку', 'Интернет-магазин': 'В каталог', 'Сайт с онлайн-записью': 'Записаться' };
  function still(w) {
    if (w.image) {
      return '<img class="shot" src="' + esc(w.image) + '" alt="Сайт ' + esc(w.title) + '" width="1600" height="1000" loading="lazy">';
    }
    var c = w.colors || ['#141416', '#ffffff', '#d4f458'];
    var brand = String(w.title).replace(/^[^«]*«|»$/g, '') || w.title;
    return '<div class="still" data-ui style="--s-bg:' + esc(c[0]) + ';--s-ink:' + esc(c[1]) + ';--s-accent:' + esc(c[2]) + '" role="img" aria-label="Первый экран сайта ' + esc(w.title) + '">' +
      '<div class="still__nav"><b>' + esc(brand) + '</b><span>Услуги</span><span>О нас</span><span>Контакты</span></div>' +
      '<div class="still__h">' + esc(w.tagline || w.title) + '</div>' +
      '<div class="still__row"><span class="still__btn">' + esc(ctaWords[w.kind] || 'Связаться') + '</span><span>' + esc(w.kind) + '</span></div>' +
      '</div>';
  }

  /* ---------- работы ---------- */
  var works = S.works || [];
  var grid = $('#workGrid');
  var arrowSvg = '<span class="btn__arrow" aria-hidden="true">→</span>';
  grid.innerHTML = works.map(function (w) {
    var url = w.url ? esc(w.url) : '';
    var media = url
      ? '<a class="wcard__media" href="' + url + '" target="_blank" rel="noopener" tabindex="-1" aria-hidden="true">' + still(w) + '</a>'
      : '<div class="wcard__media">' + still(w) + '</div>';
    var tags = (w.tags || []).map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('');
    var badge = w.badge ? '<span class="wcard__badge">' + esc(w.badge) + '</span>' : '';
    return '<li class="wcard rv"><div class="wcard__mwrap">' + media + badge + '</div>' +
      '<div class="wcard__body">' +
      '<p class="wcard__meta">' + [w.kind, w.year].filter(Boolean).map(esc).join(' · ') + '</p>' +
      '<h3 class="wcard__title">' + esc(w.title) + '</h3>' +
      (w.desc ? '<p class="wcard__desc">' + esc(w.desc) + '</p>' : '') +
      (tags ? '<ul class="wcard__tags">' + tags + '</ul>' : '') +
      (url ? '<a class="btn btn--ink wcard__btn" href="' + url + '" target="_blank" rel="noopener">Открыть сайт ' + arrowSvg + '</a>' : '') +
      '</div></li>';
  }).join('');

  // Пока работ нет — заглушка
  if (!works.length) {
    $('.work__lead').textContent = 'Портфолио обновляется: новые работы появятся здесь совсем скоро.';
    grid.innerHTML = '<li class="wcard rv"><div class="wcard__media">' +
      still({ title: 'Ваш бизнес', kind: 'Ваш проект', tagline: 'Здесь может быть ваш сайт', colors: ['#e1ebdc', '#141416', '#d4f458'] }) +
      '</div><div class="wcard__body"><h3 class="wcard__title">Здесь может быть ваш сайт</h3>' +
      '<a class="btn btn--accent wcard__btn" href="#contact">Обсудить проект ' + arrowSvg + '</a></div></li>';
  }

  /* ---------- кейсы ---------- */
  var byTitle = {};
  works.forEach(function (w) { byTitle[w.work || w.title] = w; });
  $('#caseList').innerHTML = (S.cases || []).map(function (c) {
    var w = byTitle[c.work] || { title: c.work, kind: '', colors: null };
    var meta = [c.client, w.kind, c.duration ? 'срок ' + c.duration : ''].filter(Boolean).map(esc).join(' · ');
    return '<article class="case">' +
      '<div class="case__text">' +
      '<h3 class="case__title rv">' + esc(w.title) + '</h3>' +
      '<p class="case__meta rv">' + meta + '</p>' +
      '<p class="rv"><b>Задача.</b> ' + esc(c.task) + '</p>' +
      '<p class="rv"><b>Решение.</b> ' + esc(c.solution) + '</p>' +
      '<p class="case__result rv"><b>Результат.</b> ' + esc(c.result) + '</p>' +
      (w.url ? '<a class="case__link" href="' + esc(w.url) + '" target="_blank" rel="noopener">Открыть сайт</a>' : '') +
      '</div>' +
      '<div class="case__media rv">' + still(w) + '</div>' +
      '</article>';
  }).join('');

  // Пока кейсов нет — раздела нет: появится сам, как только в content.js будет первый кейс
  function dropSection(id) {
    var sec = document.getElementById(id);
    if (sec) sec.remove();
    $$('a[href="#' + id + '"]').forEach(function (a) { a.remove(); });
  }
  if (!(S.cases || []).length) dropSection('cases');

  /* ---------- отзывы ---------- */
  var PENDING_KEY = 'portfolio-pending-reviews';
  function readPending() { try { return JSON.parse(localStorage.getItem(PENDING_KEY) || '[]'); } catch (e) { return []; } }
  function savePending(list) { try { localStorage.setItem(PENDING_KEY, JSON.stringify(list.slice(-5))); } catch (e) {} }
  function stars(n) { n = Math.max(1, Math.min(5, +n || 5)); return n + ' из 5'; }

  function spreadLines(text) {
    var words = String(text).trim().split(/\s+/);
    var per = window.innerWidth < 640 ? 2 : Math.ceil(words.length / Math.min(3, Math.ceil(words.length / 3)));
    var lines = [];
    for (var i = 0; i < words.length; i += per) lines.push(words.slice(i, i + per));
    return lines.map(function (l, i) {
      var solo = l.length === 1 ? (i % 2 ? ' style="justify-content:flex-end"' : '') : '';
      return '<div class="spread__line"' + solo + '>' + l.map(function (w) { return '<span>' + esc(w) + '</span>'; }).join('') + '</div>';
    }).join('');
  }
  function renderSpread() {
    var reviews = S.reviews || [];
    var f = reviews[0];
    var el = $('#spread');
    if (f && f.quote) {
      el.innerHTML = '<blockquote>' + spreadLines('«' + f.quote + '»') + '</blockquote>' +
        '<p class="spread__by"><span>' + esc(f.name) + '</span><span>' + esc(f.role || '') + '</span><span>' + esc(f.company || '') + '</span></p>';
    } else if (f) {
      el.innerHTML = '<blockquote>' + spreadLines('«' + String(f.text).split(/\s+/).slice(0, 8).join(' ') + (String(f.text).split(/\s+/).length > 8 ? '…' : '') + '»') + '</blockquote>' +
        '<p class="spread__by"><span>' + esc(f.name) + '</span><span>' + esc(f.role || '') + '</span><span>' + esc(f.company || '') + '</span></p>';
    } else {
      el.innerHTML = '<p>' + spreadLines('Здесь будет ваш отзыв') + '</p>' +
        '<p class="spread__by"><span>Вы</span><span>мой клиент</span><span>ваша компания</span></p>';
    }
  }
  function renderReviews() {
    var reviews = S.reviews || [];
    var pending = readPending();
    var html = reviews.map(function (r) {
      return '<figure class="review"><blockquote class="review__text">' + esc(r.text) + '</blockquote>' +
        '<figcaption class="review__by"><span class="review__stars">Оценка ' + stars(r.rating) + '</span> · ' +
        esc(r.name) + (r.company ? ', ' + esc(r.company) : '') + '</figcaption></figure>';
    }).concat(pending.map(function (r) {
      return '<figure class="review review--pending"><blockquote class="review__text">' + esc(r.text) + '</blockquote>' +
        '<figcaption class="review__by">' + esc(r.name) + (r.company ? ', ' + esc(r.company) : '') + ' · на проверке, видите только вы</figcaption></figure>';
    })).join('');
    $('#reviewList').innerHTML = html || '<p class="reviews__empty">Я собираю первые отзывы. Если мы работали вместе — буду благодарен за пару честных слов.</p>';
  }
  // Пока отзывов нет — раздела нет: появится сам с первым отзывом в content.js
  var hasReviews = (S.reviews || []).length > 0;
  if (!hasReviews) dropSection('reviews');
  else { renderSpread(); renderReviews(); }

  var form = $('#reviewForm');
  var rStatus = $('#reviewStatus');
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = form.name.value.trim();
    var text = form.text.value.trim();
    form.name.setAttribute('aria-invalid', name ? 'false' : 'true');
    form.text.setAttribute('aria-invalid', text.length >= 10 ? 'false' : 'true');
    if (!name) { rStatus.textContent = 'Напишите, пожалуйста, ваше имя.'; form.name.focus(); return; }
    if (text.length < 10) { rStatus.textContent = 'Отзыв слишком короткий — хотя бы пара предложений.'; form.text.focus(); return; }
    var data = { name: name, company: form.company.value.trim(), rating: form.rating.value, text: text, date: new Date().toISOString() };

    function done(msg) {
      var p = readPending(); p.push(data); savePending(p);
      renderReviews();
      form.reset();
      rStatus.textContent = msg;
    }
    var btn = form.querySelector('button[type="submit"]');
    if (S.reviewEndpoint) {
      btn.disabled = true; rStatus.textContent = 'Отправляю…';
      fetch(S.reviewEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(data) })
        .then(function (r) { if (!r.ok) throw new Error(r.status); done('Спасибо! Отзыв отправлен и появится после проверки.'); })
        .catch(function () { rStatus.textContent = 'Не получилось отправить. Попробуйте ещё раз чуть позже.'; })
        .then(function () { btn.disabled = false; });
    } else if (C.email) {
      var body = 'Имя: ' + data.name + '\nКомпания: ' + data.company + '\nОценка: ' + data.rating + '/5\n\n' + data.text;
      window.location.href = 'mailto:' + C.email + '?subject=' + encodeURIComponent('Отзыв с сайта') + '&body=' + encodeURIComponent(body);
      done('Спасибо! Открылось письмо — отправьте его, и отзыв появится после проверки.');
    } else {
      done('Спасибо! Отзыв сохранён и появится после проверки.');
    }
  });

  /* ---------- контакты ---------- */
  var tg = C.telegram ? String(C.telegram).replace(/^@/, '') : '';
  var wa = C.whatsapp ? String(C.whatsapp).replace(/\D/g, '') : '';
  function tile(k, v, href, ext) {
    if (!v) return '';
    return '<li class="rv"><a class="ctile" href="' + esc(href) + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + '>' +
      '<span class="ctile__k">' + k + '</span><span class="ctile__v">' + esc(v).replace('@', '@<wbr>') + '</span>' +
      '<span class="ctile__go" aria-hidden="true">→</span></a></li>';
  }
  $('#contactTiles').innerHTML =
    tile('Telegram', tg && '@' + tg, 'https://t.me/' + tg, true) +
    tile('WhatsApp', wa && (C.phone || '+' + wa), 'https://wa.me/' + wa, true) +
    tile('Почта', C.email, 'mailto:' + C.email) +
    tile('Телефон', C.phone, 'tel:' + String(C.phone || '').replace(/[^\d+]/g, '')) +
    '<li class="ctiles__note">' + esc(owner.city || 'Работаю онлайн') + ' · отвечаю в течение дня</li>';

  var links = [];
  if (tg) links.push('<a href="https://t.me/' + esc(tg) + '" target="_blank" rel="noopener">Telegram</a>');
  if (wa) links.push('<a href="https://wa.me/' + esc(wa) + '" target="_blank" rel="noopener">WhatsApp</a>');
  if (C.email) links.push('<a href="mailto:' + esc(C.email) + '">' + esc(C.email) + '</a>');
  if (C.vk) links.push('<a href="' + esc(C.vk) + '" target="_blank" rel="noopener">ВКонтакте</a>');
  if (C.instagram) links.push('<a href="' + esc(C.instagram) + '" target="_blank" rel="noopener">Instagram</a>');
  $('#footLinks').innerHTML = (links.length ? links : ['<span class="muted">Контакты скоро появятся</span>'])
    .concat(['<a href="#work">Работы</a>']
      .concat(document.getElementById('cases') ? ['<a href="#cases">Кейсы</a>'] : [])
      .concat(document.getElementById('reviews') ? ['<a href="#reviews">Отзывы</a>'] : []))
    .map(function (l) { return '<li>' + l + '</li>'; }).join('');

  /* ---------- конструктор заявки ---------- */
  var brief = $('#brief');
  var msgEl = $('#briefMsg');
  var bStatus = $('#briefStatus');
  function pressed(group) {
    return $$('[data-group="' + group + '"] button[aria-pressed="true"]').map(function (b) { return b.textContent; });
  }
  function buildMsg() {
    var type = pressed('type')[0] || 'сайт';
    var when = pressed('when')[0];
    var have = pressed('have');
    var t = 'Здравствуйте! Хочу заказать ' + (type === 'Редизайн' ? 'редизайн сайта' : type.toLowerCase()) + '.';
    if (when) t += ' Сроки: ' + when.toLowerCase() + '.';
    if (have.length) t += ' Уже есть: ' + have.join(', ').toLowerCase() + '.';
    return t;
  }
  brief.addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (!b) return;
    var group = b.parentNode;
    if (group.hasAttribute('data-multi')) {
      b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
    } else {
      $$('button', group).forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
    }
    msgEl.textContent = buildMsg();
    msgEl.classList.remove('flash'); void msgEl.offsetWidth; msgEl.classList.add('flash');
    bStatus.textContent = '';
  });
  function copy(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    var ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta); return Promise.resolve();
  }
  $('#briefCopy').addEventListener('click', function () {
    copy(msgEl.textContent).then(function () { bStatus.textContent = 'Скопировано. Вставьте в любой мессенджер.'; });
  });
  $('#briefSend').addEventListener('click', function () {
    var text = msgEl.textContent;
    if (wa) { window.open('https://wa.me/' + wa + '?text=' + encodeURIComponent(text), '_blank', 'noopener'); return; }
    if (tg) { copy(text).then(function () { bStatus.textContent = 'Сообщение скопировано — вставьте его в чат.'; window.open('https://t.me/' + tg, '_blank', 'noopener'); }); return; }
    if (C.email) { window.location.href = 'mailto:' + C.email + '?subject=' + encodeURIComponent('Заявка с сайта') + '&body=' + encodeURIComponent(text); return; }
    copy(text).then(function () { bStatus.textContent = 'Сообщение скопировано. Контакты появятся здесь совсем скоро.'; });
  });

  /* ---------- меню на телефоне ---------- */
  var bar = $('#bar');
  var menuBtn = $('#menuBtn');
  menuBtn.addEventListener('click', function () {
    var open = bar.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuBtn.textContent = open ? 'Закрыть' : 'Меню';
  });
  $$('#nav a').forEach(function (a) {
    a.addEventListener('click', function () { bar.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.textContent = 'Меню'; });
  });

  /* ---------- прокрутка: шапка, полоска прогресса, наезд на фото ---------- */
  var progress = $('#progress');
  var bandImg = $('.band__img');
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, window.scrollY / max) : 0).toFixed(4) + ')';
      bar.classList.toggle('scrolled', window.scrollY > 24);
      if (bandImg && !reduced) {
        var r = bandImg.getBoundingClientRect();
        var p = Math.min(1, Math.max(0, 1 - (r.top + r.height) / (window.innerHeight + r.height)));
        bandImg.style.transform = 'scale(' + (1.14 - p * 0.14).toFixed(4) + ') translateY(' + ((p - .5) * -4).toFixed(2) + '%)';
      }
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { onScroll(); });
  onScroll();

  /* ---------- появление частей секций ---------- */
  var rv = $$('.rv');
  $$('section').forEach(function (sec) {
    $$('.rv', sec).forEach(function (el, i) { el.style.setProperty('--d', Math.min(i, 6) * 80 + 'ms'); });
  });
  if ('IntersectionObserver' in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    rv.forEach(function (el) { io.observe(el); });
  } else {
    rv.forEach(function (el) { el.classList.add('in'); });
  }
})();
