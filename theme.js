// Dark/Light mode bersama untuk semua halaman dashboard.
// Dimuat di <head> (sinkron) supaya tema terpasang sebelum halaman tampil, tanpa kedipan putih.
(function(){
  const KEY="dashboardTheme";
  const root=document.documentElement;
  const mq=window.matchMedia?window.matchMedia("(prefers-color-scheme: dark)"):null;

  function saved(){try{return localStorage.getItem(KEY)}catch(e){return null}}
  function initial(){const s=saved();if(s==="dark"||s==="light")return s;return mq&&mq.matches?"dark":"light"}
  function isDark(){return root.getAttribute("data-theme")==="dark"}

  // Warna "Critical" (#111) tidak terlihat di latar gelap; untuk canvas/Chart.js dipetakan ke abu terang.
  const DARK_MAP={"#111":"#cfd6df","#111111":"#cfd6df","#212121":"#b8c2ce"};
  function c(color){return isDark()&&DARK_MAP[String(color).toLowerCase()]||color}
  function grid(){return isDark()?"#2a3a4f":"#e7edf4"}

  function syncChartDefaults(){
    if(!window.Chart||!Chart.defaults)return;
    Chart.defaults.color=isDark()?"#9fb0c4":"#666";
    Chart.defaults.borderColor=isDark()?"#2a3a4f":"rgba(0,0,0,0.1)";
  }

  function updateToggle(){
    document.querySelectorAll(".theme-toggle button").forEach(b=>{
      const on=b.dataset.themeValue===root.getAttribute("data-theme");
      b.classList.toggle("active",on);b.setAttribute("aria-pressed",on);
    });
  }

  function apply(theme,persist){
    root.setAttribute("data-theme",theme);
    if(persist){try{localStorage.setItem(KEY,theme)}catch(e){}}
    syncChartDefaults();updateToggle();
    window.dispatchEvent(new CustomEvent("themechange",{detail:{theme}}));
  }

  root.setAttribute("data-theme",initial());

  function mountToggle(){
    const sidebar=document.querySelector(".sidebar");
    if(!sidebar||sidebar.querySelector(".theme-toggle"))return;
    const box=document.createElement("div");
    box.className="theme-toggle";box.setAttribute("role","group");box.setAttribute("aria-label","Mode tampilan");
    box.innerHTML='<button type="button" data-theme-value="light" title="Mode Terang">☀ Light</button>'+
                  '<button type="button" data-theme-value="dark" title="Mode Gelap">☾ Dark</button>';
    box.addEventListener("click",e=>{const b=e.target.closest("button");if(b&&b.dataset.themeValue!==root.getAttribute("data-theme"))apply(b.dataset.themeValue,true)});
    sidebar.appendChild(box);
    syncChartDefaults();updateToggle();
  }

  // Ikuti tema OS selama user belum memilih manual.
  if(mq&&mq.addEventListener)mq.addEventListener("change",e=>{if(!saved())apply(e.matches?"dark":"light",false)});

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mountToggle);else mountToggle();

  window.Theme={isDark,c,grid,apply};
})();
