const envelopeWrap=document.getElementById('envelopeWrap');
const envelopeScreen=document.getElementById('envelopeScreen');
const mainSite=document.getElementById('mainSite');
let opened=false;
function openInvite(){
  if(opened)return;
  opened=true;
  startWeddingMusic();
  envelopeWrap.classList.add('open');
  envelopeScreen.classList.add('opening-wash');
  // A single soft dissolve takes the opening screen directly to the invitation.
  setTimeout(()=>{
    mainSite.classList.remove('hidden');
    requestAnimationFrame(()=>mainSite.classList.add('site-visible'));
    window.scrollTo({top:0,behavior:'instant'});
    envelopeScreen.classList.add('exit');
    setTimeout(()=>{envelopeScreen.style.display='none';},1050);
    initReveals();
    initScratch();
  },650);
}
envelopeWrap.addEventListener('click',openInvite);
envelopeWrap.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openInvite();}});

const weddingDate=new Date('2026-12-31T10:45:00+05:30').getTime();
function updateCountdown(){let diff=Math.max(0,weddingDate-Date.now());const d=Math.floor(diff/86400000);const h=Math.floor(diff%86400000/3600000);const m=Math.floor(diff%3600000/60000);const s=Math.floor(diff%60000/1000);document.getElementById('days').textContent=String(d).padStart(3,'0');document.getElementById('hours').textContent=String(h).padStart(2,'0');document.getElementById('minutes').textContent=String(m).padStart(2,'0');document.getElementById('seconds').textContent=String(s).padStart(2,'0');}
updateCountdown();setInterval(updateCountdown,1000);

let revealObserver;
function initReveals(){if(!('IntersectionObserver'in window)){document.querySelectorAll('.reveal').forEach(e=>e.classList.add('visible'));return;}revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');revealObserver.unobserve(entry.target);}}),{threshold:.12});document.querySelectorAll('.reveal').forEach(e=>revealObserver.observe(e));}
document.querySelectorAll('.gallery-item img').forEach(img=>{img.addEventListener('load',()=>img.parentElement.classList.add('has-image'));img.addEventListener('error',()=>{});if(img.complete&&img.naturalWidth>0)img.parentElement.classList.add('has-image');});

function initScratch(){
  const canvas=document.getElementById('scratchCanvas');
  const frame=document.getElementById('scratchFrame');
  if(!canvas||!frame||canvas.dataset.ready)return;
  canvas.dataset.ready='1';
  const ctx=canvas.getContext('2d');
  function paint(){
    const r=frame.getBoundingClientRect(),ratio=window.devicePixelRatio||1;
    canvas.width=r.width*ratio;canvas.height=r.height*ratio;
    ctx.setTransform(ratio,0,0,ratio,0,0);
    const g=ctx.createLinearGradient(0,0,r.width,r.height);
    g.addColorStop(0,'#d9bd8d');g.addColorStop(.48,'#f4e4c5');g.addColorStop(1,'#c49c65');
    ctx.fillStyle=g;ctx.fillRect(0,0,r.width,r.height);
    ctx.strokeStyle='#f9edda';ctx.lineWidth=1;ctx.strokeRect(9,9,r.width-18,r.height-18);
    ctx.fillStyle='#79523e';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='400 21px \"Cormorant Garamond\", serif';
    ctx.fillText('SWIPE TO REVEAL',r.width/2,r.height/2);
  }
  paint();
  let down=false,last=null,distance=0,revealed=false;
  function point(e){const r=canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top};}
  function erase(e){
    if(!down||revealed)return;
    const p=point(e);
    if(last){
      distance+=Math.hypot(p.x-last.x,p.y-last.y);
      ctx.globalCompositeOperation='destination-out';ctx.lineWidth=38;ctx.lineCap='round';
      ctx.beginPath();ctx.moveTo(last.x,last.y);ctx.lineTo(p.x,p.y);ctx.stroke();
    }
    last=p;
    if(distance>Math.min(115,frame.clientWidth*.28)){
      revealed=true;down=false;
      canvas.style.transition='opacity .42s ease, transform .55s ease';
      canvas.style.opacity='0';canvas.style.transform='scale(1.02)';
      setTimeout(()=>{
        canvas.remove();
        frame.classList.add('revealed');
        const section=frame.closest('section');
        const petals=section&&section.querySelector('#rosePetals');
        if(petals){section.classList.add('petals-active');}
      },430);
    }
  }
  canvas.addEventListener('pointerdown',e=>{if(revealed)return;down=true;last=point(e);distance=0;canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener('pointermove',erase);
  canvas.addEventListener('pointerup',()=>{down=false;last=null;});
  canvas.addEventListener('pointercancel',()=>{down=false;last=null;});
}

const audio=document.getElementById('weddingAudio'),musicToggle=document.getElementById('musicToggle');
let fadeFrame=0;
function setMusicButtonState(playing){
  if(!musicToggle)return;
  musicToggle.classList.toggle('playing',playing);
  musicToggle.setAttribute('aria-label',playing?'Pause wedding music':'Play wedding music');
}
function startWeddingMusic(){
  if(!audio)return;
  if(!audio.paused)return;
  cancelAnimationFrame(fadeFrame);
  audio.volume=0;
  // Call play immediately inside the invitation tap handler so mobile browsers
  // recognise it as a user-initiated playback request.
  const playRequest=audio.play();
  if(playRequest&&typeof playRequest.then==='function'){
    playRequest.then(()=>{
      setMusicButtonState(true);
      const start=performance.now(),duration=3200;
      const fade=now=>{
        if(audio.paused)return;
        const progress=Math.min(1,(now-start)/duration);
        audio.volume=Math.min(1,progress);
        if(progress<1)fadeFrame=requestAnimationFrame(fade);
      };
      fadeFrame=requestAnimationFrame(fade);
    }).catch(()=>{
      setMusicButtonState(false);
    });
  }else{
    setMusicButtonState(true);
  }
}
musicToggle.addEventListener('click',()=>{
  if(audio.paused){
    startWeddingMusic();
  }else{
    cancelAnimationFrame(fadeFrame);
    audio.pause();
    setMusicButtonState(false);
  }
});
audio.addEventListener('play',()=>setMusicButtonState(true));
audio.addEventListener('pause',()=>setMusicButtonState(false));

// Tap any photograph for a full-screen view; Escape, the close button or backdrop closes it.
const gallery=document.getElementById('gallery');
if(gallery){
  const lightbox=document.createElement('div');
  lightbox.className='gallery-lightbox';
  lightbox.setAttribute('role','dialog');lightbox.setAttribute('aria-modal','true');lightbox.setAttribute('aria-label','Enlarged wedding photograph');
  lightbox.innerHTML='<button class="gallery-lightbox-close" type="button" aria-label="Close photograph">×</button><img alt="Enlarged wedding photograph">';
  document.body.appendChild(lightbox);
  const lightboxImage=lightbox.querySelector('img'),closeButton=lightbox.querySelector('button');
  const closeLightbox=()=>{lightbox.classList.remove('active');document.body.classList.remove('lightbox-open');lightboxImage.removeAttribute('src');};
  gallery.querySelectorAll('.gallery-item').forEach(item=>{
    const img=item.querySelector('img');
    item.setAttribute('tabindex','0');item.setAttribute('role','button');item.setAttribute('aria-label','Enlarge photograph');
    const open=()=>{if(!img||!img.src)return;lightboxImage.src=img.src;lightboxImage.alt=img.alt;lightbox.classList.add('active');document.body.classList.add('lightbox-open');};
    item.addEventListener('click',open);
    item.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}});
    item.addEventListener('contextmenu',e=>e.preventDefault());
  });
  closeButton.addEventListener('click',closeLightbox);
  lightbox.addEventListener('click',e=>{if(e.target===lightbox)closeLightbox();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&lightbox.classList.contains('active'))closeLightbox();});
}
const petalLayer=document.getElementById('rosePetals');
if(petalLayer){
  for(let i=0;i<18;i++){
    const p=document.createElement('span');
    p.className='rose-petal';
    p.style.left=(Math.random()*100)+'%';
    p.style.animationDelay=(-Math.random()*28)+'s';
    p.style.animationDuration=(19+Math.random()*17)+'s';
    p.style.setProperty('--drift-a',(Math.random()*110-55)+'px');
    p.style.setProperty('--drift-b',(Math.random()*190-95)+'px');
    p.style.setProperty('--spin',(Math.random()*620-310)+'deg');
    p.style.setProperty('--petal-scale',(0.65+Math.random()*.65).toFixed(2));
    petalLayer.appendChild(p);
  }
}
const style=document.createElement('style');style.textContent='.music-control{position:fixed;z-index:30;right:18px;bottom:18px;top:auto}.music-control button{border:1px solid #c9aa7c;background:#4f1a2b;color:#f7ebdc;padding:10px 13px;display:flex;align-items:center;gap:10px;font-size:7px;letter-spacing:.16em;cursor:pointer}.music-bars{height:13px;display:flex;gap:2px;align-items:center}.music-bars i{display:block;width:2px;height:5px;background:#e7c999}.music-control .playing .music-bars i{animation:musicbar .6s infinite alternate}.music-bars i:nth-child(2){animation-delay:.2s}.music-bars i:nth-child(3){animation-delay:.4s}.music-bars i:nth-child(4){animation-delay:.1s}@keyframes musicbar{to{height:13px}}';document.head.appendChild(style);
