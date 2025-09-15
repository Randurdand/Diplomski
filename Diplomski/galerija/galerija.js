const IMAGES_PER_PAGE = 3;
const STATE = {
  album: null,
  page: 1,
  totalPages: 1,
  pageItems: [],  
  pageStartIndex: 0
};

const els = {
  opis: document.getElementById('album-opis'),
  grid: document.getElementById('album-grid'),
  prevTop: document.getElementById('btn-prev'),
  nextTop: document.getElementById('btn-next'),
  prevBottom: document.getElementById('btn-prev-bottom'),
  nextBottom: document.getElementById('btn-next-bottom'),
  indTop: document.getElementById('page-indicator'),
  indBottom: document.getElementById('page-indicator-bottom'),
  lb: document.getElementById('lightbox'),
  lbImg: document.getElementById('lightbox-image'),
  lbCap: document.getElementById('lightbox-caption'),
  lbClose: document.getElementById('lightbox-close'),
  lbPrev: document.getElementById('lightbox-prev'),
  lbNext: document.getElementById('lightbox-next')
};

init().catch(console.error);

async function init() {
  const data = await fetch('./albums.json').then(r => r.json());
  const album = data.albums[0];
  STATE.album = album;
  STATE.totalPages = Math.ceil(album.slike.length / IMAGES_PER_PAGE);

  els.opis.textContent = album.opis || '';

  hookNav();
  renderPage(1);
}

function hookNav() {
  els.prevTop.addEventListener('click', () => changePage(STATE.page - 1));
  els.nextTop.addEventListener('click', () => changePage(STATE.page + 1));
  els.prevBottom.addEventListener('click', () => changePage(STATE.page - 1));
  els.nextBottom.addEventListener('click', () => changePage(STATE.page + 1));

  // Lightbox kontrole
  els.lbClose.addEventListener('click', closeLightbox);
  els.lbPrev.addEventListener('click', () => moveLightbox(-1));
  els.lbNext.addEventListener('click', () => moveLightbox(1));
  // els.lb.addEventListener('click', (e) => {
  //   if (e.target === els.lb) closeLightbox();
  // });
  document.addEventListener('keydown', (e) => {
    if (els.lb.hasAttribute('hidden')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') moveLightbox(-1);
    if (e.key === 'ArrowRight') moveLightbox(1);
  });
}

function changePage(p) {
  if (p < 1 || p > STATE.totalPages) return;
  renderPage(p);
}

async function renderPage(p) {
  STATE.page = p;
  const start = (p - 1) * IMAGES_PER_PAGE;
  const end = start + IMAGES_PER_PAGE;
  STATE.pageStartIndex = start;
  const items = STATE.album.slike.slice(start, end);
  STATE.pageItems = items;

  // očisti grid
  els.grid.innerHTML = '';

  for (const filename of items) {
    const imgSrc = `./slike/${filename}`;
    const base = filename.replace(/\.[^.]+$/, '');
    const txtUrl = `./deskripcije/${base}.txt`;

    const fig = document.createElement('figure');
    const img = document.createElement('img');
    img.src = imgSrc;
    img.alt = base;

    const cap = document.createElement('figcaption');
    const captionText = await fetchCaptionFirstLine(txtUrl);
    cap.textContent = captionText;

    img.addEventListener('click', () => openLightbox(filename));

    fig.appendChild(img);
    fig.appendChild(cap);
    els.grid.appendChild(fig);
  }

  updateIndicators();
}

function updateIndicators() {
  const label = `Strana ${STATE.page}/${STATE.totalPages}`;
  els.indTop.textContent = label;
  els.indBottom.textContent = label;

  const atFirst = STATE.page === 1;
  const atLast = STATE.page === STATE.totalPages;
  [els.prevTop, els.prevBottom].forEach(b => b.disabled = atFirst);
  [els.nextTop, els.nextBottom].forEach(b => b.disabled = atLast);
}

async function fetchCaptionFirstLine(txtUrl) {
  try {
    const txt = await fetch(txtUrl).then(r => r.text());
    const byLine = txt.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    if (byLine.length > 0) return byLine[0];
    return '';
  } catch {
    return '';
  }
}

async function openLightbox(filename) {
  const base = filename.replace(/\.[^.]+$/, '');
  const txtUrl = `./deskripcije/${base}.txt`;
  els.lbImg.src = `./slike/${filename}`;
  els.lbImg.alt = base;

  try {
    const txt = await fetch(txtUrl).then(r => r.text());
    els.lbCap.textContent = txt.trim();
  } catch {
    els.lbCap.textContent = '';
  }

  els.lb.removeAttribute('hidden');
  els.lb.dataset.idx = String(STATE.pageItems.indexOf(filename));
}

function closeLightbox() {
  els.lb.setAttribute('hidden', '');
  els.lbImg.src = '';
  els.lbCap.textContent = '';
}

function moveLightbox(delta) {
  let idx = Number(els.lb.dataset.idx || 0);
  idx += delta;


  if (idx < 0 || idx >= STATE.pageItems.length) return;

  els.lb.dataset.idx = String(idx);
  const filename = STATE.pageItems[idx];
  openLightbox(filename);
}