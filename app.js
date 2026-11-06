(() => {
  'use strict';
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  scrollTo(0, 0);

  const T = window.TOUR, S = T.stops;
  const $ = s => document.querySelector(s);
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const smooth = t => t * t * (3 - 2 * t);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const phone = matchMedia('(max-width: 760px)');
  const MON = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  const md = d => `${+d.slice(5, 7)}/${d.slice(8)}`;
  const pretty = d => `${MON[+d.slice(5, 7) - 1]} ${+d.slice(8)}`;
  const link = (url, s) => `${url}${url.includes('?') ? '&' : '?'}utm_source=wtfgoin-site&utm_medium=tour-map&utm_campaign=${s.code}`;
  const showTime = s => new Date(`${s.date}T${to24(s.doors)}:00${s.tz}`);
  function to24(t) { const [, h, m, ap] = t.match(/(\d+):(\d+)\s*(AM|PM)/i); return `${String((+h % 12) + (/pm/i.test(ap) ? 12 : 0)).padStart(2, '0')}:${m}`; }
  const statusText = { 'on-sale': 'On sale', low: 'Low tickets', 'sold-out': 'Sold out' };

  const flip = (f, b = f, alt = '') => `<div class="flip"><div class="spin"><div class="fi"><img class="fr" src="img/merch/${f}.webp?v=9" alt="${alt}" loading="lazy"><img class="bk" src="img/merch/${b}.webp?v=9" alt="" loading="lazy"></div></div></div>`;
  const KEY = { '404': 'atl', '313': 'det', '713': 'hou' };
  const cityTee = s => flip(KEY[s.code] + '-f', KEY[s.code] + '-b', `${s.city} ${s.code} tee`);
  const tee = (big, small, color = '#0c0c0c') => `<svg viewBox="0 0 200 190" aria-hidden="true"><path d="M64 26 40 34 8 68l24 24 16-12v100h104V80l16 12 24-24-32-34-24-8c-8 14-22 20-36 20s-28-6-36-20Z" fill="${color}" stroke="rgba(255,255,255,.14)"/><path d="M64 26c8 14 22 20 36 20s28-6 36-20" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="3"/><text x="100" y="122" text-anchor="middle" font-family="Anton,Impact,sans-serif" font-size="${big.length > 4 ? 30 : 50}" fill="#f1eee6">${big}</text><text x="100" y="144" text-anchor="middle" font-family="Anton,Impact,sans-serif" font-size="13" letter-spacing="2" fill="#f1eee6">${small}</text></svg>`;

  // ---------- hero: right column ----------
  const colR = $('#colR');
  colR.innerHTML = S.map((s, i) => `<span class="slot"><button class="code-btn" data-go="${i}" aria-label="${s.code}, ${s.city}, ${pretty(s.date)}: jump to this stop"><img class="code" src="img/c-${s.code}.webp" alt=""></button></span><img class="rule" src="img/rule.webp" alt=""><img class="when" src="img/d-${s.code}.webp" alt="">${i < S.length - 1 ? '<img class="rule" src="img/rule.webp" alt="">' : ''}`).join('');
  const codes = [...colR.querySelectorAll('.code')], whens = [...colR.querySelectorAll('.when')], rulesR = [...colR.querySelectorAll('.rule')];

  // intro: stamp the words, roll the area codes
  const words = [...document.querySelectorAll('.w')];
  function intro() {
    if (reduce) { words.forEach(w => w.classList.add('in')); codes.forEach(c => c.parentElement.classList.add('w', 'in')); whens.forEach(w => w.classList.add('in')); return; }
    words.forEach((w, i) => setTimeout(() => w.classList.add('in'), 250 + i * 220));
    codes.forEach((c, i) => {
      const b = c.parentElement; b.classList.add('w');
      setTimeout(() => { b.classList.add('in'); setTimeout(() => whens[i].classList.add('in'), 250); }, 500 + i * 220);
    });
  }

  // ---------- map ----------
  const proj = d3.geoAlbersUsa().scale(1300).translate([487.5, 305]);
  const pt = lonlat => proj(lonlat) || [487, 300];
  const P = S.map(s => pt([s.lon, s.lat]));
  const plane = $('#plane'), pinsEl = $('#pins');
  pinsEl.innerHTML = S.map((s, i) => `<div class="pin" style="left:${P[i][0]}px;top:${P[i][1]}px"><i class="dot"></i><div class="lab"><b><img src="img/c-${s.code}.webp" alt="" style="height:100%;width:auto"></b><span>${s.city} · ${md(s.date)}</span></div></div>`).join('');
  let hlGroups = [];
  // labels live in a flat layer above the 3D map (moved out of the pins) so the lettering is drawn at screen pixels and stays crisp
  const labLayer = document.createElement('div'); labLayer.className = 'pinlabs'; document.querySelector('.stage').appendChild(labLayer);
  const pins = [...pinsEl.children], labs = pins.map(p => labLayer.appendChild(p.querySelector('.lab'))), labB = labs.map(l => l.querySelector('b'));
  const dots = pins.map(p => p.querySelector('.dot'));

  d3.json('https://cdn.jsdelivr.net/npm/us-atlas@3.0.1/states-albers-10m.json').then(us => {
    const path = d3.geoPath();
    const nd = path(topojson.feature(us, us.objects.nation));
    // thickness: stacked copies below the map read as a slab once it tilts
    const slab = d3.select('#slab');
    const LITE = document.documentElement.classList.contains('lite');
    for (let k = 14; k >= 1; k -= LITE ? 3.5 : 1) slab.append('path').attr('d', nd).attr('transform', `translate(0,${k})`).style('opacity', .5 + (14 - k) / 28);
    d3.select('#nation').append('path').attr('class', 'fill').attr('d', nd);
    d3.select('#nation').append('path').attr('class', 'edge').attr('d', nd);
    // each stop's state, lit when the camera arrives
    const states = topojson.feature(us, us.objects.states).features;
    hlGroups = S.map(s => {
      const f = states.find(f => f.id === s.fips);
      const g = d3.select('#hl').append('g');
      if (f) { const d = path(f); g.append('path').attr('class', 'st').attr('d', d); g.append('path').attr('class', 'st-edge').attr('d', d); }
      return g.node();
    });
    d3.select('#states').append('path').attr('d', path(topojson.mesh(us, us.objects.states, (a, b) => a !== b)));
  }).catch(() => {});

  // route: ATL → DET → HOU, curved like a marker stroke
  const curve = (a, b, bend) => { const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1]; return `Q${mx - dy * bend},${my + dx * bend} ${b[0]},${b[1]}`; };
  const routeD = `M${P[0][0]},${P[0][1]} ${curve(P[0], P[1], .22)} ${curve(P[1], P[2], .28)}`;
  const NS = 'http://www.w3.org/2000/svg';
  const routeG = $('#route');
  routeG.innerHTML = `<defs><mask id="reveal" maskUnits="userSpaceOnUse" x="0" y="0" width="975" height="610"><path id="revealPath" d="${routeD}" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round"/></mask></defs><path class="base" d="${routeD}"/><path class="ink" d="${routeD}" mask="url(#reveal)"/><circle class="head" r="5"/>`;
  const revealPath = $('#revealPath'), head = routeG.querySelector('.head');
  const L = revealPath.getTotalLength();
  // length at Detroit
  const seg1 = (() => { const tmp = document.createElementNS(NS, 'path'); tmp.setAttribute('d', `M${P[0][0]},${P[0][1]} ${curve(P[0], P[1], .22)}`); routeG.append(tmp); const l = tmp.getTotalLength(); tmp.remove(); return l; })();
  revealPath.style.strokeDasharray = `${L} ${L}`;

  // ---------- fan requests ----------
  let reqs = T.requests.map(([city, n]) => ({ city, n, you: false }));
  const heat = d3.select('#heatmap');
  function drawHeat() {
    const known = reqs.filter(r => CITIES[r.city]);
    const sel = heat.selectAll('circle').data(known, d => d.city);
    sel.enter().append('circle').attr('fill', 'url(#heat)').attr('cx', d => pt(CITIES[d.city])[0]).attr('cy', d => pt(CITIES[d.city])[1]).attr('r', 0)
      .merge(sel).attr('r', d => 10 + Math.sqrt(d.n) * 1.1);
  }
  function drawReqs(bump) {
    reqs.sort((a, b) => b.n - a.n);
    $('#reqList').innerHTML = reqs.slice(0, 5).map(r => `<li class="${r.you ? 'you' : ''} ${r.city === bump ? 'bump' : ''}"><span>${r.city}</span><b>${r.n >= 1000 ? (r.n / 1000).toFixed(2).replace(/0$/, '') + 'K' : r.n}</b></li>`).join('');
    drawHeat();
  }
  $('#cityList').innerHTML = Object.keys(CITIES).sort().map(c => `<option value="${c}">`).join('');
  $('#askForm').addEventListener('submit', e => {
    e.preventDefault();
    const raw = $('#askCity').value.trim().replace(/\s+/g, ' '), msg = $('#askMsg');
    if (raw.length < 2) { msg.textContent = 'Type a city first.'; return; }
    const name = Object.keys(CITIES).find(c => c.toLowerCase() === raw.toLowerCase()) || raw.replace(/\b\w/g, c => c.toUpperCase());
    const onTour = S.find(s => s.city.toLowerCase() === name.toLowerCase());
    if (onTour) { msg.textContent = `${onTour.code} already got a date: ${pretty(onTour.date)} at ${onTour.venue}.`; return; }
    let r = reqs.find(x => x.city.toLowerCase() === name.toLowerCase());
    if (r) { if (r.you) { msg.textContent = `You already voted for ${r.city}.`; return; } r.n++; r.you = true; }
    else { r = { city: name, n: 1, you: true }; reqs.push(r); }
    msg.textContent = CITIES[r.city] ? `Counted. ${r.city} is lit up on the map.` : `Counted. ${r.city} is on the list.`;
    $('#askCity').value = '';
    drawReqs(r.city);
    if (CITIES[r.city]) spark(pt(CITIES[r.city]));
  });
  function spark([x, y]) {
    const c = document.createElementNS(NS, 'circle');
    c.setAttribute('cx', x); c.setAttribute('cy', y); c.setAttribute('r', 4); c.setAttribute('fill', 'none'); c.setAttribute('stroke', '#c9ced4'); c.setAttribute('stroke-width', 3);
    $('#heatmap').append(c);
    c.animate([{ r: 4, opacity: 1 }, { r: 60, opacity: 0 }], { duration: 1100, easing: 'ease-out', iterations: 2 }).onfinish = () => c.remove();
  }
  drawReqs();

  // ---------- stop card (map) and city cards (below) ----------
  const countHTML = i => `<div class="count" data-i="${i}">${['Days', 'Hrs', 'Mins', 'Secs'].map(u => `<div><b>--</b><span>${u}</span></div>`).join('')}</div>`;
  const card = $('#card');
  let cardI = -1;
  function fillCard(i) {
    const s = S[i];
    card.innerHTML = `<div class="card-top"><div><div class="card-code">${s.code}</div><div class="card-place">${s.city}, ${s.state}<small>${s.venue} · ${pretty(s.date)}</small></div></div><span class="tag ${s.status}">${statusText[s.status]}</span></div>
      ${countHTML(i)}
      <div class="times"><span>Doors ${s.doors}</span><span>Show ${s.show}</span><span>${s.ages}</span></div>
      <div class="card-row"><div class="card-btns"><a class="btn" href="${link(s.tickets, s)}" target="_blank" rel="noopener">${s.status === 'sold-out' ? 'Join waitlist' : 'Get tickets'} →</a><button class="share" data-share="${i}">Share “I’m pulling up”</button></div>
      <a class="drop" href="#shop">${cityTee(s)}${s.city} only</a></div>`;
    tick();
    if (window.gsap && !reduce) gsap.from(card.children, { y: 18, opacity: 0, duration: .55, stagger: .06, ease: 'power3.out' });
  }
  $('#stops').innerHTML = S.map((s, i) => `<article class="stop" data-code="${s.code}">
      <div class="card-top"><div><div class="card-code">${s.code}</div><div class="card-place">${s.city}, ${s.state}<small>${s.venue} · ${pretty(s.date)}</small></div></div><span class="tag ${s.status}">${statusText[s.status]}</span></div>
      <div class="times"><span>Doors ${s.doors}</span><span>Show ${s.show}</span><span>${s.ages}</span></div>
      ${countHTML(i)}
      <a class="btn" href="${link(s.tickets, s)}" target="_blank" rel="noopener">${s.status === 'sold-out' ? 'Join waitlist' : 'Get tickets'}</a>
      <div class="drop-row"><div class="drop">${cityTee(s)}</div><p><b>City exclusive ${s.tee}</b>${s.city} only<br>Pick up at the show</p></div>
    </article>`).join('');
  $('#shelf').innerHTML = [
    [flip('hero-f', 'hero-b', 'WTF Goin Tour tee'), 'Hero Tour Tee', '$40'],
    ...S.map(s => [cityTee(s), `${s.city} City Tee (${s.code}) · ${s.city} only`, '$35']),
    [flip('hood-f', 'hood-b', 'Tour route hoodie'), 'Tour Route Hoodie', '$75'],
    [flip('cap', 'cap', 'Belly Gang snapback'), 'Tour Snapback', '$35'],
    [flip('beanie', 'beanie', 'Belly Gang beanie'), 'Tour Beanie', '$30']
  ].map(([img, n, p]) => `<a class="item" href="${T.shop}" target="_blank" rel="noopener">${img}<b>${n}</b><span>${p}</span></a>`).join('');
  $('#shopAll').href = T.shop; $('#streamBtn').href = T.stream;

  function tick() {
    const now = Date.now();
    document.querySelectorAll('.count').forEach(el => {
      const ms = showTime(S[el.dataset.i]) - now, b = el.querySelectorAll('b');
      if (ms <= 0) { el.innerHTML = `<div style="grid-column:1/-1"><b>${ms > -6 * 3600e3 ? 'Tonight' : 'Done'}</b><span>${ms > -6 * 3600e3 ? 'Doors are open' : 'Thank you'}</span></div>`; return; }
      const v = [ms / 864e5, ms / 36e5 % 24, ms / 6e4 % 60, ms / 1e3 % 60].map(x => String(Math.floor(x)).padStart(2, '0'));
      b.forEach((x, k) => x.textContent = v[k]);
    });
  }
  setInterval(tick, 1000); tick();

  document.addEventListener('click', async e => {
    const sh = e.target.closest('[data-share]'); if (!sh) return;
    const s = S[sh.dataset.share], text = `I'm pulling up. WTF Goin Tour · ${s.code} · ${s.city} ${md(s.date)} @ ${s.venue}`;
    try { if (navigator.share) await navigator.share({ text, url: location.href }); else { await navigator.clipboard.writeText(`${text} ${location.href}`); sh.textContent = 'Copied ✓'; } } catch {}
  });

  // ---------- rail + jumping ----------
  const STOP_AT = [.355, .54, .72], OVER = .93;
  $('#rail').innerHTML = S.map((s, i) => `<button data-go="${i}"><span>${s.code}</span><small>${s.city}</small></button>`).join('') + `<button data-go="next"><span>???</span><small>Next city</small></button>`;
  const railBtns = [...document.querySelectorAll('#rail button')];
  const tour = $('#top');
  // the poster tears open almost as soon as you scroll: the first 2% of scroll waits, the tear takes the next 12%,
  // then the rest of the story plays at its old pace. warp() turns raw scroll into story progress; unwarp() goes back.
  const WN = [0, .02, .14, 1], WO = [0, .11, .25, 1];
  const pw = (a, b, x) => { let i = 0; while (i < a.length - 2 && x > a[i + 1]) i++; return b[i] + (b[i + 1] - b[i]) * clamp((x - a[i]) / (a[i + 1] - a[i])); };
  const warp = x => pw(WN, WO, x), unwarp = x => pw(WO, WN, x);
  const yFor = p => tour.offsetTop + unwarp(p) * .86 * (tour.offsetHeight - innerHeight);
  const go = y => window.lenis ? window.lenis.scrollTo(y, { duration: 1.6 }) : scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-go]'); if (!b) return;
    const p = b.dataset.go === 'next' ? OVER : STOP_AT[+b.dataset.go];
    go(yFor(p));
  });
  document.querySelectorAll('a[href="#next"]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); go(yFor(OVER)); }));

  // ---------- camera ----------
  const OV = [487, 300];
  // [progress, focus (index or 'ov'), tilt, zoom]
  // [progress, focus, tilt, zoom, screen anchor x (desktop), screen anchor y (phone)] — the anchor eases with the camera instead of snapping
  const KEYS = [[0, 'ov', 0, 1, .5, .45], [.11, 'ov', 0, 1, .5, .45], [.25, 'ov', 48, 1.04, .5, .45], [.33, 0, 54, 2.4, .4, .3], [.40, 0, 54, 2.5, .4, .3], [.50, 1, 54, 2.4, .4, .3], [.58, 1, 54, 2.5, .4, .3], [.68, 2, 54, 2.4, .4, .3], [.76, 2, 54, 2.5, .4, .3], [.89, 'ov', 36, .86, .33, .24], [1, 'ov', 36, .86, .33, .24]];
  const focusPt = f => f === 'ov' ? OV : P[f];
  function camAt(p) {
    let k = 0; while (k < KEYS.length - 2 && p > KEYS[k + 1][0]) k++;
    const a = KEYS[k], b = KEYS[k + 1], t = ease(clamp((p - a[0]) / (b[0] - a[0])));
    const fa = focusPt(a[1]), fb = focusPt(b[1]);
    let z = lerp(a[3], b[3], t);
    if (typeof a[1] === 'number' && typeof b[1] === 'number' && a[1] !== b[1]) z -= Math.sin(Math.PI * t) * .9; // pull back mid-flight
    return { x: lerp(fa[0], fb[0], t), y: lerp(fa[1], fb[1], t), tilt: lerp(a[2], b[2], t), z, ax: lerp(a[4], b[4], t), ay: lerp(a[5], b[5], t) };
  }

  // ---------- layout measurements ----------
  let W = innerWidth, H = innerHeight, homes = [];
  function measure() {
    W = innerWidth; H = innerHeight;
    
    last = -1;
  }

  // ---------- render loop ----------
  const colL = $('#colL'), belly = $('#belly'), wall = document.querySelector('.wall'), mapwrap = document.querySelector('.mapwrap'), stage = document.querySelector('.stage'), ask = $('#next'), cue = $('#cue');
  let cur = 0, last = -1, mx = 0, my = 0, pmx = 0, pmy = 0;
  addEventListener('pointermove', e => { mx = e.clientX / W - .5; my = e.clientY / H - .5; }, { passive: true });
  const STORY = .86;
  const target = () => warp(clamp((scrollY - tour.offsetTop) / (tour.offsetHeight - innerHeight) / STORY));

  function frame() {
    const tgt = target();
    cur = reduce || window.lenis ? tgt : cur + (tgt - cur) * .14;
    if (Math.abs(tgt - cur) < 1e-4) cur = tgt;
    pmx += (mx - pmx) * .06; pmy += (my - pmy) * .06;
    const moving = Math.abs(cur - last) > 1e-5 || Math.abs(mx - pmx) > 1e-3 || Math.abs(my - pmy) > 1e-3;
    if (moving) render(cur);
    last = cur;
    requestAnimationFrame(frame);
  }

  function render(p) {
    const mob = phone.matches;
    const tear = ease(clamp((p - .11) / .14));
    const par = (1 - tear) * (reduce ? 0 : 1);

    // hero layers
    colL.style.transform = `translate(${-tear * 130 + pmx * -14 * par}%, ${pmy * -8 * par}px)`;
    colL.style.opacity = 1 - tear;
    colR.style.borderColor = `rgba(241,238,230,${.22 * (1 - tear)})`;
    colR.style.transform = `translate(${pmx * -14 * par}px, ${pmy * -8 * par}px)`;
    rulesR.forEach(r => r.style.opacity = 1 - clamp(tear * 2.5));
    whens.forEach(w => w.style.opacity = w.classList.contains('in') ? 1 - clamp(tear * 2.5) : '');
    belly.style.transform = `translateX(-50%) translate(${pmx * 22 * par}px, ${-tear * 14}svh) scale(${1 - tear * .55})`;
    belly.style.opacity = 1 - clamp(tear * 1.25);
    wall.style.transform = `rotateX(${tear * 58}deg) scale(${1 + tear * .25})`;
    wall.style.opacity = 1 - tear;
    stage.style.setProperty("--url", 1 - clamp(tear * 2));
    plane.style.setProperty('--mo', clamp(tear * 1.4)); // fade the map's contents, not the 3D container (opacity there flattens the 3D and makes it jump at 100%)
    cue.style.opacity = p < .04 ? 1 : 0;

    // camera
    const c = camAt(p);
    const fit = Math.min(W * (mob ? 1.02 : .82) / 975, (H - 60) * .95 / 610);
    const s = fit * c.z * (mob ? 1.15 : 1);
    const stopI = p > .29 && p < .45 ? 0 : p >= .45 && p < .63 ? 1 : p >= .63 && p < .82 ? 2 : -1;
    const atOver = p > .86;
    const ax = mob ? W / 2 : W * c.ax;
    const ay = mob ? 60 + (H - 60) * c.ay : 60 + (H - 60) * .5;
    plane.style.setProperty('--tilt', c.tilt + 'deg');
    plane.style.transform = `translate(${ax}px,${ay}px) rotateX(${c.tilt}deg) scale(${s}) translate(${-c.x}px,${-c.y}px)`;
    const want = mob ? 30 * clamp(c.z / 2.4, .45, 1) : 70 * clamp(c.z / 1.6, .7, 1); // labels shrink as the camera pulls back so they never pile up
    plane.style.setProperty('--ls', (want / (44 * s)).toFixed(3));
    mapwrap.style.perspectiveOrigin = `${ax}px ${ay}px`;

    // route draw
    const r = p < .40 ? 0 : p < .50 ? seg1 * smooth((p - .40) / .10) : p < .58 ? seg1 : p < .68 ? lerp(seg1, L, smooth((p - .58) / .10)) : L;
    revealPath.style.strokeDashoffset = L - r;
    const hp = revealPath.getPointAtLength(Math.max(r, .01));
    head.setAttribute('cx', hp.x); head.setAttribute('cy', hp.y);
    head.style.opacity = r > 0 && r < L - 1 ? 1 : 0;
    $('#heatmap').style.opacity = .35 + clamp((p - .8) / .08) * .65;

    // area codes fly into the pins
    const flying = tear > 0 && tear < 1;
    codes.forEach((el, i) => {
      if (tear <= 0) { el.style.transform = ''; el.style.opacity = ''; homes[i] = el.getBoundingClientRect(); return; }
      if (!homes[i]) return;
      const h = homes[i], tgtR = labB[i].getBoundingClientRect();
      const tx = tgtR.left + tgtR.width / 2 - (h.left + h.width / 2), ty = tgtR.top + tgtR.height / 2 - (h.top + h.height / 2);
      const sc = tgtR.height / h.height || .2;
      el.style.transform = `translate(${tx * tear}px, ${ty * tear}px) scale(${lerp(1, sc, tear)})`;
      el.style.opacity = tear >= .98 ? 0 : 1;
    });
    hlGroups.forEach((g, i) => g.classList.toggle('on', i === stopI));
    pins.forEach((pn, i) => { pn.classList.toggle('on', i === stopI); pn.classList.toggle('dim', stopI >= 0 && i !== stopI); });
    const lk = mob ? clamp(c.z / 2.4, .45, 1) : clamp(c.z / 1.6, .7, 1), lo = clamp((tear - .9) / .1);
    labs.forEach((l, i) => {
      const r = dots[i].getBoundingClientRect();
      l.style.transform = `translate(${Math.round(r.left + r.width / 2)}px,${Math.round(r.top + r.height / 2 - 16)}px) translate(-50%,-100%) scale(${lk.toFixed(3)})`;
      l.style.opacity = lo * (stopI >= 0 && i !== stopI ? .55 : 1);
    });
    colR.style.pointerEvents = flying || tear >= 1 ? 'none' : '';

    // interface
    stage.classList.toggle('show-map', tear >= .95);
    railBtns.forEach((b, i) => b.classList.toggle('on', i === stopI || (i === 3 && atOver)));
    if (stopI >= 0) { if (cardI !== stopI) { cardI = stopI; fillCard(stopI); } card.classList.add('on'); }
    else card.classList.remove('on');
    ask.classList.toggle('on', atOver);
    card.inert = stopI < 0; ask.inert = !atOver;
  }

  addEventListener('resize', measure);
  phone.addEventListener('change', measure);
  document.fonts.ready.then(measure);
  measure();
  intro();
  render(0);
  requestAnimationFrame(frame);
})();
