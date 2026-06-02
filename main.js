/* InGames landing — interactions */
(function(){
  'use strict';

  /* nav shrink on scroll */
  const nav=document.querySelector('.nav');
  const onScroll=()=>{ if(nav) nav.classList.toggle('scrolled', window.scrollY>20); };
  window.addEventListener('scroll',onScroll,{passive:true}); onScroll();

  /* scroll reveal — rect-based (IntersectionObserver is unreliable in some embeds) */
  const reveals=[...document.querySelectorAll('.reveal')];
  function checkReveal(){
    const vh=window.innerHeight;
    for(let i=reveals.length-1;i>=0;i--){
      const el=reveals[i];
      const top=el.getBoundingClientRect().top;
      if(top < vh-60){ el.classList.add('in'); reveals.splice(i,1); }
    }
  }
  window.addEventListener('scroll',checkReveal,{passive:true});
  window.addEventListener('resize',checkReveal);
  checkReveal();
  setTimeout(checkReveal,80);

  /* stat counters */
  function runCounter(el){
    const target=parseFloat(el.dataset.count);
    const pre=el.dataset.pre||''; const suf=el.dataset.suf||'';
    const dur=1400; const start=performance.now();
    function step(t){
      const p=Math.min((t-start)/dur,1);
      const eased=1-Math.pow(1-p,3);
      const val=Math.round(target*eased);
      el.textContent=pre+val+suf;
      if(p<1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  const counters=[...document.querySelectorAll('[data-count]')];
  function checkCounters(){
    const vh=window.innerHeight;
    for(let i=counters.length-1;i>=0;i--){
      const el=counters[i];
      const top=el.getBoundingClientRect().top;
      if(top < vh-40){ runCounter(el); counters.splice(i,1); }
    }
  }
  window.addEventListener('scroll',checkCounters,{passive:true});
  checkCounters();
  setTimeout(checkCounters,120);

  /* parallax — scroll + pointer on hero scene */
  const orbits=[...document.querySelectorAll('.orbit')];
  const phone=document.querySelector('.phone');
  let mx=0,my=0,sy=0,tmx=0,tmy=0;
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  window.addEventListener('scroll',()=>{ sy=window.scrollY; },{passive:true});
  const scene=document.querySelector('.scene');
  if(scene && !reduce){
    scene.addEventListener('pointermove',(e)=>{
      const r=scene.getBoundingClientRect();
      tmx=((e.clientX-r.left)/r.width-.5)*2;
      tmy=((e.clientY-r.top)/r.height-.5)*2;
    });
    scene.addEventListener('pointerleave',()=>{ tmx=0;tmy=0; });
  }

  // assign a random phase/speed to each orbit for idle drift
  orbits.forEach((o,i)=>{ o._ph=i*1.3; o._sp=.5+ (i%3)*.18; o._amp=6+ (i%4)*3; });

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
      const py=my*d*18 + (sy*-0.04*d) + fy + driftY;
      o.style.transform=`translate3d(${px}px,${py}px,0)`;
    });
    if(phone && !reduce){
      const rx=6 - my*4, ry=-18 + mx*6;
      phone.style.transform=`translate(-50%,-50%) rotateY(${ry}deg) rotateX(${rx}deg) rotateZ(-3deg)`;
    }
    requestAnimationFrame(raf);
  }
  if(!reduce) requestAnimationFrame(raf);
  else orbits.forEach(o=>{ o.style.transform='none'; });

  /* gentle idle float via keyframes assigned per-orbit */
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
