document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('members-grid');
    const statClan = document.getElementById('stat-clanova');
    const statS = document.getElementById('stat-avg-s');
    const statR = document.getElementById('stat-avg-r');
    const statB = document.getElementById('stat-avg-b');
  
    const btnAZ = document.getElementById('sort-az');
    const btnS  = document.getElementById('sort-s');
  
    let members = [];
  
    init().catch(console.error);
  
    async function init() {
      
      const data = await fetch('./clanovi.json').then(r => r.json());
      members = data.clanovi;
      
      const total = data.stats.aktivnih_clanova;
      statClan.textContent = total;
  
      statS.textContent = avgLabel(members.map(m => m.fide_standard));
      statR.textContent = avgLabel(members.map(m => m.fide_rapid));
      statB.textContent = avgLabel(members.map(m => m.fide_blitz));
  
      
      renderGrid(sortAZ([...members]));
  
      
      btnAZ.addEventListener('click', () => {
        setPressed(btnAZ, true);
        setPressed(btnS, false);
        renderGrid(sortAZ([...members]));
      });
      btnS.addEventListener('click', () => {
        setPressed(btnAZ, false); 
        setPressed(btnS, true);
        renderGrid(sortByStandard([...members]));
      });
    }
  
    function setPressed(btn, val) { 
        btn.setAttribute('aria-pressed', val); 
    }
  
    function avgLabel(vals) {
      const avg = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
      return avg;
    }
  
    function sortAZ(arr) {
      return arr.sort((a, b) => {
        const ap = a.ime.localeCompare(b.ime, 'sr');
        if (ap !== 0) return ap;
        else return a.prezime.localeCompare(b.prezime, 'sr');
      });
    }
  
    function sortByStandard(arr) {
      return arr.sort((a, b) => b.fide_standard - a.fide_standard);
    }
  
    function fotoPath(member) {
      let src = member.foto;
      return `./${src}`;
    }
  
    function fideBadge(titula) {
      if (!titula) return '';
      return `<span class="cl-badge">${titula}</span>`;
    }
  
    function fideLine(m) {
      const f = v => isNaN(v) ? '' : v;
      return `S ${f(m.fide_standard)} · R ${f(m.fide_rapid)} · B ${f(m.fide_blitz)}`;
    }
  
    function fideLink(m) {
      if (!m.fide_id) return `<span class="cl-link-disabled"><i class="fa-regular fa-id-card"></i> Nema FIDE ID</span>`;
      const href = `https://ratings.fide.com/profile/${m.fide_id}`;
      return `<a class="cl-link" href="${href}" target="_blank">
        <i class="fa-solid fa-chess"></i> FIDE profil
      </a>`;
    }
  
    function renderGrid(arr) {
      grid.innerHTML = '';
      for (const m of arr) {
        const card = document.createElement('article');
        card.className = 'cl-member';
        card.innerHTML = `
          <div class="cl-member-top">
            <img class="cl-member-avatar" src="${fotoPath(m)}">
            <div>
              <h3 class="cl-member-name">
                ${m.ime} ${m.prezime}
                ${fideBadge(m.fide_titula)}
              </h3>
              <p class="cl-ratings">${fideLine(m)}</p>
            </div>
          </div>
          <div class="cl-actions">
            ${fideLink(m)}
          </div>
        `;
        grid.appendChild(card);
      }
    }
  });
  