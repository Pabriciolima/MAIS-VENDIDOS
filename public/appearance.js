// System fonts are resolved by CSS; no proprietary font files are distributed.
(()=>{
 let mode='dark';try{mode=localStorage.getItem('monaco-appearance')||'dark'}catch{}
 const apply=()=>{document.documentElement.dataset.appearance=mode;const button=document.getElementById('appearance'),label=document.getElementById('appearanceLabel');if(button){const next=mode==='dark'?'claro':'escuro';button.setAttribute('aria-label','Ativar modo '+next);button.title='Ativar modo '+next;label.textContent='Modo '+next}document.querySelector('meta[name="theme-color"]')?.setAttribute('content',mode==='dark'?'#101114':'#f5f5f7')};
 apply();document.addEventListener('DOMContentLoaded',()=>{apply();document.getElementById('appearance').onclick=()=>{mode=mode==='dark'?'light':'dark';try{localStorage.setItem('monaco-appearance',mode)}catch{}apply()};document.querySelectorAll('[data-import]').forEach(button=>button.onclick=()=>document.getElementById('file').click())});
})();
