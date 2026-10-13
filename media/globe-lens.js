/* LE-005 Optical lens: the component script, copied unchanged from logo-experiments/experiments/optical-lens/panorama-globe-lens.html */
/* Analytic 3D unit sphere, fixed camera, twelve rotating meridians.
   Every pixel is a ray/sphere hit. No video, sprites, textures or external dependencies. */
(()=>{'use strict';
const N=64,TAU=Math.PI*2,STEP=TAU/12;
const P={tiltX:.48620472,tiltZ:-.36019945,phase:.06383834,latitudeStep:.31252038,latitudeOffset:-.04956525,parallelWidth:.99872093,meridianWidth:1.57808448,cx:31.22100407,cy:31.25494631,radius:25.55363215,polarTaper:.58121918};
const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
const periodic=(a,s)=>Math.abs(((a+s/2)%s+s)%s-s/2);
class PanoramaGlobe3D extends HTMLElement{
 static get observedAttributes(){return ['color','paused','speed','lens','intensity'];}
 constructor(){super();this.angle=P.phase;this.velocity=0;this.drag=false;this.visible=true;this.resumeAt=0;this.raf=0;this.tick=this.tick.bind(this);this.frame=0;this.autoTime=0;this.lastPaint=-1;this.motion=matchMedia('(prefers-reduced-motion: reduce)');this._explicitPlay=false;this.lensX=32;this.lensY=30;this.targetX=32;this.targetY=30;this.hover=false;this.lensLast=0;this.effectClock=0;
 this.attachShadow({mode:'open'}).innerHTML=`<style>:host{display:block;aspect-ratio:1;position:relative;color:var(--globe-color,#fff)}canvas{width:100%;height:100%;display:block;image-rendering:pixelated;image-rendering:crisp-edges;cursor:grab;touch-action:pan-y;outline:none}canvas:active{cursor:grabbing}canvas:focus-visible{outline:1px solid currentColor;outline-offset:5px}</style><canvas width="128" height="128" tabindex="0" role="img" aria-label="3D pixel globe. Drag horizontally to rotate on its fixed axis. Arrow keys rotate, Space pauses, Home resets."></canvas>`;
 this.canvas=this.shadowRoot.querySelector('canvas');this.source=document.createElement('canvas');this.source.width=this.source.height=64;this.ctx=this.source.getContext('2d',{alpha:true});this.output=this.canvas.getContext('2d',{alpha:true});this.effectPixels=this.output.createImageData(128,128);this.pixels=this.ctx.createImageData(N,N);this.latitude=new Float64Array(N*N);this.longitude=new Float64Array(N*N);this.inside=new Uint8Array(N*N);this.latDistance=new Float64Array(N*N);this.lonGradient=new Float64Array(N*N);this.width=new Float64Array(N*N);this.setup();
 }
 setup(){const sx=Math.sin(P.tiltX),cx=Math.cos(P.tiltX),sz=Math.sin(P.tiltZ),cz=Math.cos(P.tiltZ);
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const i=y*N+x,X=(x-P.cx)/P.radius,Y=-(y-P.cy)/P.radius,rr=X*X+Y*Y,Z=Math.sqrt(Math.max(1e-9,1-rr));this.inside[i]=rr<1?1:0;
   // Inverse camera orientation gives the 3D intersection in sphere-local space.
   const a=X*cz+Y*sz,b=-X*sz+Y*cz,q=b*cx+Z*sx,r=-b*sx+Z*cx;
   this.latitude[i]=Math.asin(Math.max(-1,Math.min(1,q)));this.longitude[i]=Math.atan2(a,r);
  }
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const i=y*N+x,ym=Math.max(0,y-1)*N+x,yp=Math.min(N-1,y+1)*N+x,xm=y*N+Math.max(0,x-1),xp=y*N+Math.min(N-1,x+1);
   const dy=(this.latitude[yp]-this.latitude[ym])/(y===0||y===N-1?1:2),dx=(this.latitude[xp]-this.latitude[xm])/(x===0||x===N-1?1:2),lat=this.latitude[i];
   let dist=periodic(lat-P.latitudeOffset,P.latitudeStep)/Math.max(1e-5,Math.hypot(dx,dy));const nearest=Math.round((lat-P.latitudeOffset)/P.latitudeStep)*P.latitudeStep+P.latitudeOffset;if(Math.abs(nearest)>1.35)dist=100;this.latDistance[i]=dist;
   const ldy=wrap(this.longitude[yp]-this.longitude[ym])/2,ldx=wrap(this.longitude[xp]-this.longitude[xm])/2;this.lonGradient[i]=Math.max(1e-5,Math.hypot(ldx,ldy));this.width[i]=P.meridianWidth*Math.pow(Math.max(0,Math.cos(lat)),P.polarTaper);
  }
 }
 connectedCallback(){this.abort=new AbortController();const opts={signal:this.abort.signal};
 const track=e=>{const b=this.canvas.getBoundingClientRect();this.targetX=(e.clientX-b.left)/b.width*64;this.targetY=(e.clientY-b.top)/b.height*64;this.hover=true;if(this.motion.matches){this.lensX=this.targetX;this.lensY=this.targetY;this.drawLens();}this.wake();};
 this.canvas.addEventListener('pointerenter',track,opts);this.canvas.addEventListener('pointermove',track,opts);this.canvas.addEventListener('pointerleave',()=>{this.hover=false;this.targetX=32;this.targetY=30;this.wake();},opts);
 this.canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;this.drag=true;this.pointer=e.pointerId;this.x=e.clientX;this.lastMove=performance.now();this.velocity=0;this.canvas.setPointerCapture(e.pointerId);this.wake();},opts);
 this.canvas.addEventListener('pointermove',e=>{if(!this.drag||e.pointerId!==this.pointer)return;const now=performance.now(),dx=e.clientX-this.x,k=3.2/Math.max(160,this.clientWidth);this.angle+=dx*k;this.velocity=Math.max(-4,Math.min(4,dx*k/Math.max(.012,(now-this.lastMove)/1000)));this.x=e.clientX;this.lastMove=now;this.render();},opts);
 const release=e=>{if(e.pointerId!==this.pointer)return;this.drag=false;if(performance.now()-this.lastMove>100)this.velocity=0;this.resumeAt=performance.now()+1400;this.wake();};
 this.canvas.addEventListener('pointerup',release,opts);this.canvas.addEventListener('pointercancel',e=>{this.velocity=0;release(e);},opts);this.canvas.addEventListener('lostpointercapture',e=>{if(this.drag)release(e);},opts);
 this.canvas.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();this.angle+=(e.key==='ArrowRight'?1:-1)*Math.PI/90;this.velocity=0;this.resumeAt=performance.now()+1800;this.render();this.wake();}else if(e.code==='Space'){e.preventDefault();this.paused=!this.paused;}else if(e.key==='Home'){e.preventDefault();this.reset();}},opts);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)this.wake();},opts);this.motion.addEventListener('change',()=>this.wake(),opts);
 this.observer=new IntersectionObserver(entries=>{this.visible=entries[0].isIntersecting;if(this.visible)this.wake();});this.observer.observe(this);this.render();this.wake();
 }
 disconnectedCallback(){this.abort?.abort();this.observer?.disconnect();cancelAnimationFrame(this.raf);this.raf=0;}
 attributeChangedCallback(){if(this.ctx){this.lastPaint=-1;this.render();this.drawLens();this.wake();}}
 get paused(){return this.hasAttribute('paused');}set paused(v){this._explicitPlay=!v;this.toggleAttribute('paused',!!v);this.velocity=0;this.wake();}
 get speed(){const v=Number(this.getAttribute('speed')??1);return Number.isFinite(v)?Math.max(-5,Math.min(5,v)):1;}
 get canPlay(){return !this.paused&&(!this.motion.matches||this._explicitPlay)&&this.speed!==0;}
 reset(){this.angle=P.phase;this.velocity=0;this.autoTime=0;this.frame=0;this.resumeAt=0;this.render();this.wake();}
 render(){if(this.lastPaint===this.angle)return;this.lastPaint=this.angle;const c=this.getAttribute('color')||getComputedStyle(this).color||'#fff';this.ctx.fillStyle=c;this.ctx.fillRect(0,0,1,1);const rgb=this.ctx.getImageData(0,0,1,1).data;const data=this.pixels.data;
  for(let i=0;i<N*N;i++){const meridian=periodic(this.longitude[i]-this.angle,STEP)/this.lonGradient[i],ink=this.inside[i]&&(this.latDistance[i]<P.parallelWidth/2||meridian<this.width[i]/2),j=i*4;data[j]=rgb[0];data[j+1]=rgb[1];data[j+2]=rgb[2];data[j+3]=ink?255:0;}this.ctx.putImageData(this.pixels,0,0);this.drawLens();this.dataset.angle=this.angle.toFixed(5);
 }
 get lensMode(){return this.getAttribute('lens')||'prism';}
 get intensity(){const n=Number(this.getAttribute('intensity')??.7);return Number.isFinite(n)?Math.max(0,Math.min(1.5,n)):.7;}
 drawLens(){if(!this.effectPixels)return;const mode=this.lensMode,amount=mode==='off'?0:this.intensity;const src=this.pixels.data,out=this.effectPixels.data;
  const sample=(x,y)=>{const ix=Math.floor(x+.5),iy=Math.floor(y+.5);return ix>=0&&ix<64&&iy>=0&&iy<64?src[(iy*64+ix)*4+3]/255:0;};
  const color=this.getAttribute('color')||getComputedStyle(this).color||'#fff';this.ctx.fillStyle=color;this.ctx.fillRect(0,0,1,1);const rgb=this.ctx.getImageData(0,0,1,1).data;const dark=rgb[0]+rgb[1]+rgb[2]<300;
  const lx=this.lensX,ly=this.lensY,radius=18,clock=this.effectClock;
  for(let y=0;y<128;y++)for(let x=0;x<128;x++){const sx=(x+.5)/2-.5,sy=(y+.5)/2-.5,dx=sx-lx,dy=sy-ly,r=Math.hypot(dx,dy)/radius,inside=r<1,t=inside?1-r*r:0,fall=t*t,mag=1-amount*.38*fall;
   // Convex lens refraction plus a mild moving cylindrical wave.
   const wave=amount*.85*fall*Math.sin(dy*.44+dx*.12+clock*.75);
   const u=lx+dx*mag+wave,v=ly+dy*mag+amount*.38*fall*Math.sin(dx*.38-clock*.5);
   const separation=mode==='prism'?amount*(.32+1.25*r)*fall:0;
   const ax=dx/(radius||1),ay=dy/(radius||1);
   const red=sample(u+ax*separation,v+ay*separation),green=sample(u,v),blue=sample(u-ax*separation,v-ay*separation),alpha=Math.max(red,green,blue),j=(y*128+x)*4;
   if(mode==='prism'&&separation>0){out[j]=dark?255*(1-red):255*red;out[j+1]=dark?255*(1-green):255*green;out[j+2]=dark?255*(1-blue):255*blue;}
   else{out[j]=rgb[0];out[j+1]=rgb[1];out[j+2]=rgb[2];}out[j+3]=alpha?255:0;
  }this.output.putImageData(this.effectPixels,0,0);
 }
 wake(){if(this.isConnected&&!this.raf){this.lastTime=performance.now();this.raf=requestAnimationFrame(this.tick);}}
 tick(now){this.raf=0;if(!this.isConnected||document.hidden||!this.visible)return;const dt=Math.min(.05,(now-this.lastTime)/1000);this.lastTime=now;const ease=this.motion.matches?1:1-Math.exp(-12*dt);this.lensX+=(this.targetX-this.lensX)*ease;this.lensY+=(this.targetY-this.lensY)*ease;if(!this.motion.matches&&!this.paused)this.effectClock+=dt;
  if(!this.drag){if(Math.abs(this.velocity)>.005){this.angle+=this.velocity*dt;this.velocity*=Math.exp(-5*dt);}else if(this.canPlay&&now>this.resumeAt){this.autoTime+=dt*Math.abs(this.speed);while(this.autoTime>=.1){this.autoTime-=.1;this.angle-=(this.frame%5===4?2:4)*Math.PI/180*Math.sign(this.speed);this.frame++;}}}
  this.render();if(now-this.lensLast>32){this.drawLens();this.lensLast=now;}const settling=Math.abs(this.targetX-this.lensX)+Math.abs(this.targetY-this.lensY)>.01;if(this.drag||Math.abs(this.velocity)>.005||this.canPlay||settling||(!this.paused&&!this.motion.matches&&this.lensMode!=='off'))this.raf=requestAnimationFrame(this.tick);
 }
}
if(!customElements.get('panorama-globe-lens'))customElements.define('panorama-globe-lens',PanoramaGlobe3D);
})();
