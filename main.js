/* InGames landing — interactions */
(function(){
  'use strict';

  /* nav background firms up once the page is scrolled (readability over content) */
  const nav=document.querySelector('.nav');
  const onScroll=()=>{ if(nav) nav.classList.toggle('scrolled', window.scrollY>20); };
  window.addEventListener('scroll',onScroll,{passive:true}); onScroll();

  /* hero scene — pointer parallax + idle drift (no scroll-driven motion) */
  const orbits=[...document.querySelectorAll('.orbit')];
  const phone=document.querySelector('.phone');
  const scene=document.querySelector('.scene');
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let mx=0,my=0,tmx=0,tmy=0;

  if(scene && !reduce){
    scene.addEventListener('pointermove',(e)=>{
      const r=scene.getBoundingClientRect();
      tmx=((e.clientX-r.left)/r.width-.5)*2;
      tmy=((e.clientY-r.top)/r.height-.5)*2;
    });
    const rest=()=>{ tmx=0; tmy=0; };
    scene.addEventListener('pointerleave',rest);
    scene.addEventListener('pointercancel',rest);
    scene.addEventListener('pointerup',(e)=>{ if(e.pointerType!=='mouse') rest(); });
  }

  orbits.forEach((o,i)=>{ o._ph=i*1.3; o._sp=.5+(i%3)*.18; o._amp=6+(i%4)*3; });

  let running=false;
  function raf(now){
    const t=(now||0)/1000;
    mx+=(tmx-mx)*.07; my+=(tmy-my)*.07;
    orbits.forEach(o=>{
      const d=parseFloat(o.dataset.depth||'1');
      const fx=parseFloat(o.dataset.fx||'0');
      const fy=parseFloat(o.dataset.fy||'0');
      const driftY=Math.sin(t*o._sp+o._ph)*o._amp;
      const driftX=Math.cos(t*o._sp*.8+o._ph)*o._amp*.5;
      const px=mx*d*18 + fx + driftX;
      const py=my*d*18 + fy + driftY;
      o.style.transform=`translate3d(${px}px,${py}px,0)`;
    });
    if(phone){
      const rx=6 - my*4, ry=-18 + mx*6;
      phone.style.transform=`translate(-50%,-50%) rotateY(${ry}deg) rotateX(${rx}deg) rotateZ(-3deg)`;
    }
    if(running) requestAnimationFrame(raf);
  }
  function start(){ if(!running && !reduce){ running=true; requestAnimationFrame(raf); } }
  function stop(){ running=false; }

  if(reduce){
    orbits.forEach(o=>{ o.style.transform='none'; });
  }else{
    start();
    /* save battery on phones: pause the loop while the tab is hidden */
    document.addEventListener('visibilitychange',()=>{ document.hidden ? stop() : start(); });
  }
})();

/* ── Mobile menu (hamburger drawer) ── */
(function(){
  'use strict';
  const burger=document.getElementById('navBurger');
  const menu=document.getElementById('mMenu');
  const overlay=document.getElementById('mOverlay');
  const closeBtn=document.getElementById('mClose');
  if(!burger||!menu||!overlay) return;

  function open(){
    burger.classList.add('open');
    burger.setAttribute('aria-expanded','true');
    menu.classList.add('open');
    menu.setAttribute('aria-hidden','false');
    overlay.classList.add('open');
    document.body.classList.add('menu-open');
  }
  function close(){
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded','false');
    menu.classList.remove('open');
    menu.setAttribute('aria-hidden','true');
    overlay.classList.remove('open');
    document.body.classList.remove('menu-open');
  }
  function toggle(){ menu.classList.contains('open') ? close() : open(); }

  burger.addEventListener('click',toggle);
  overlay.addEventListener('click',close);
  if(closeBtn) closeBtn.addEventListener('click',close);
  menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));
  document.addEventListener('keydown',e=>{ if(e.key==='Escape') close(); });
  /* auto-close if resized up to desktop */
  window.addEventListener('resize',()=>{ if(window.innerWidth>980) close(); });
})();
