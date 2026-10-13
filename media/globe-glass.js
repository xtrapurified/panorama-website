/* <panorama-globe-glass> · LE-010 Glass emblem (Panorama Films, 2026-10-13)
   The Panorama globe and lettering, extruded from the traced vector outline, in white glass.
   finish="glass" (default) | "black" | "silver" | "red"; turn="0.7" turns it slowly (1 ≈ 22 s a revolution,
   pauses when hidden, off with reduced motion). Glass settings as tuned by Andrija in the chrome studio: White Glass, roughness 0.16, studio highlights 1.5,
   thickness 1.10, translucency 0.99, no auto-rotation, front view; magnetic tracking, inertia and wheel off;
   cursor-controlled reflections, hover magnification and "readable from both sides" on.

   <panorama-globe-glass backdrop="media/stills/reel.webp" backdrop-for="#heroMedia"></panorama-globe-glass>

   - The element is square; the emblem fills 80% of it, centred. Transparent background.
   - backdrop: an image the glass refracts. backdrop-for: the element that image covers on the page
     (object-fit: cover), so the glass shows the part of it that sits behind the emblem.
     Without a backdrop the glass refracts a soft white.
   - Drag turns it (no inertia: it stays where it is left). reset() eases it back to the front.
   - demo: turns gently on its own every few seconds (for previews nobody can hover).
   - Loads three.js from jsDelivr on first use. Draws only while something moves.
     Falls back to media/logo.png if WebGL is unavailable. */
(()=>{
const THREE_URL='https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
let threeP=null;const loadThree=()=>threeP||(threeP=import(THREE_URL));
const DATA={"globe":{"outline":[[-0.1656,2.0613],[-0.3558,2.0368],[-0.5276,2.0],[-0.7055,1.9448],[-0.908,1.8589],[-1.1166,1.7423],[-1.2883,1.6196],[-1.5399,1.3804],[-1.6687,1.2209],[-1.8037,1.0123],[-1.8957,0.8282],[-1.9509,0.6871],[-2.0123,0.4724],[-2.0429,0.3067],[-2.0613,0.1227],[-2.0613,-0.1166],[-2.0368,-0.3374],[-1.9939,-0.5337],[-1.9509,-0.6748],[-1.8712,-0.8712],[-1.7914,-1.0245],[-1.681,-1.1963],[-1.5644,-1.3436],[-1.4049,-1.5092],[-1.2761,-1.6196],[-1.092,-1.7485],[-0.8896,-1.8589],[-0.7301,-1.9264],[-0.5399,-1.9877],[-0.3006,-2.0368],[-0.1166,-2.0552],[0.1104,-2.0552],[0.2945,-2.0368],[0.4601,-2.0061],[0.6748,-1.9448],[0.8589,-1.8712],[1.0368,-1.7791],[1.1902,-1.681],[1.3742,-1.5337],[1.5276,-1.3804],[1.6258,-1.2638],[1.7546,-1.0798],[1.8712,-0.865],[1.9325,-0.7178],[2.0061,-0.4724],[2.0429,-0.2699],[2.0552,-0.1534],[2.0552,0.1595],[2.0307,0.362],[1.9755,0.5951],[1.9018,0.8037],[1.7975,1.0184],[1.7055,1.1656],[1.589,1.319],[1.319,1.589],[1.2025,1.681],[1.0123,1.8037],[0.8282,1.8957],[0.6319,1.9693],[0.4724,2.0123],[0.2638,2.0491],[0.0123,2.0675]],"holes":[[[0.0429,-1.4479],[0.0859,-1.4417],[0.2025,-1.4724],[0.3313,-1.546],[0.4233,-1.6319],[0.5215,-1.7669],[0.5706,-1.8712],[0.4969,-1.9018],[0.3067,-1.9387],[0.1656,-1.9571],[0.0491,-1.9571]],[[-0.0429,-1.4479],[-0.0491,-1.9571],[-0.1534,-1.9571],[-0.3374,-1.9325],[-0.5092,-1.8957],[-0.5583,-1.8712],[-0.5153,-1.7791],[-0.4601,-1.6933],[-0.4049,-1.6258],[-0.319,-1.546],[-0.1902,-1.4724],[-0.0736,-1.4417]],[[0.0429,-1.0798],[0.1104,-1.0736],[0.2699,-1.0982],[0.454,-1.1534],[0.589,-1.2147],[0.7669,-1.3252],[0.8773,-1.411],[1.092,-1.6258],[1.0552,-1.6564],[0.8834,-1.7546],[0.6626,-1.8466],[0.5521,-1.6564],[0.4847,-1.5706],[0.3926,-1.4847],[0.3313,-1.4417],[0.2147,-1.3865],[0.0429,-1.3497]],[[-0.0429,-1.0798],[-0.0429,-1.3497],[-0.2025,-1.3865],[-0.319,-1.4417],[-0.3804,-1.4847],[-0.4724,-1.5706],[-0.5399,-1.6564],[-0.6503,-1.8466],[-0.8098,-1.7853],[-0.9202,-1.7301],[-1.0798,-1.6319],[-1.0429,-1.5828],[-0.8344,-1.3865],[-0.6626,-1.2638],[-0.5644,-1.2086],[-0.4417,-1.1534],[-0.2577,-1.0982],[-0.0859,-1.0736]],[[0.0429,-0.7055],[0.2331,-0.7055],[0.5092,-0.7423],[0.7178,-0.7914],[0.8834,-0.8466],[1.1227,-0.9571],[1.2699,-1.0491],[1.4356,-1.184],[1.5031,-1.2638],[1.3067,-1.4663],[1.1656,-1.5767],[0.9325,-1.3436],[0.7791,-1.227],[0.6687,-1.1595],[0.546,-1.0982],[0.3313,-1.0245],[0.2086,-1.0],[0.0491,-0.9877]],[[-0.0429,-0.7055],[-0.0491,-0.9877],[-0.1963,-1.0],[-0.319,-1.0245],[-0.4724,-1.0736],[-0.6442,-1.1534],[-0.8834,-1.3129],[-0.9693,-1.3865],[-1.1534,-1.5767],[-1.2883,-1.4724],[-1.4908,-1.2638],[-1.4601,-1.2209],[-1.3681,-1.135],[-1.2577,-1.0491],[-1.1104,-0.9571],[-0.8712,-0.8466],[-0.681,-0.7853],[-0.4294,-0.7301],[-0.2086,-0.7055]],[[0.0429,-0.3374],[0.1902,-0.3313],[0.4908,-0.3436],[0.7607,-0.3681],[1.0491,-0.411],[1.2945,-0.4663],[1.5337,-0.5399],[1.7301,-0.6196],[1.8466,-0.681],[1.7791,-0.8405],[1.6933,-1.0],[1.6135,-1.1227],[1.5583,-1.184],[1.4294,-1.0613],[1.2515,-0.9325],[1.0736,-0.8344],[0.9141,-0.7669],[0.7485,-0.7117],[0.5092,-0.6564],[0.3497,-0.6319],[0.0491,-0.6135]],[[-0.0429,-0.3374],[-0.0491,-0.6135],[-0.2761,-0.6258],[-0.4969,-0.6564],[-0.6687,-0.6933],[-0.9018,-0.7669],[-1.0061,-0.8098],[-1.2393,-0.9325],[-1.4233,-1.0675],[-1.546,-1.1902],[-1.589,-1.1411],[-1.7239,-0.9264],[-1.8344,-0.681],[-1.7178,-0.6196],[-1.5031,-0.5337],[-1.2822,-0.4663],[-1.0368,-0.411],[-0.7975,-0.3742],[-0.546,-0.3497],[-0.1227,-0.3313]],[[-1.908,0.4601],[-1.8712,0.5767],[-1.8528,0.5951],[-1.7055,0.5215],[-1.4172,0.4172],[-1.184,0.3558],[-0.9202,0.3067],[-0.6012,0.2699],[-0.2945,0.2515],[0.2883,0.2515],[0.7362,0.2822],[1.135,0.3436],[1.362,0.3988],[1.5583,0.4601],[1.8712,0.5951],[1.9325,0.3988],[1.9755,0.1043],[1.9755,-0.0982],[1.9387,-0.3681],[1.8773,-0.589],[1.865,-0.5951],[1.7178,-0.5215],[1.411,-0.411],[1.1963,-0.3558],[0.9755,-0.3129],[0.4663,-0.2577],[-0.4479,-0.2577],[-0.8405,-0.2945],[-1.2147,-0.362],[-1.5337,-0.454],[-1.7362,-0.5337],[-1.8589,-0.5951],[-1.8957,-0.5031],[-1.9264,-0.3865],[-1.9632,-0.135],[-1.9632,0.1472],[-1.9448,0.2945]],[[1.8466,0.681],[1.7546,0.6319],[1.5644,0.5521],[1.3129,0.4724],[1.0429,0.411],[0.7485,0.3681],[0.546,0.3497],[0.0982,0.3313],[0.0429,0.3374],[0.0429,0.6074],[0.0552,0.6196],[0.2699,0.6258],[0.4724,0.6503],[0.7239,0.7055],[0.9448,0.7791],[1.1779,0.8896],[1.3067,0.9693],[1.4356,1.0675],[1.5583,1.1902],[1.6196,1.1166],[1.7301,0.9387]],[[-1.8344,0.681],[-1.7178,0.9387],[-1.6196,1.0982],[-1.546,1.1902],[-1.3926,1.0429],[-1.227,0.9264],[-1.0184,0.816],[-0.9141,0.773],[-0.6871,0.6994],[-0.4908,0.6564],[-0.2515,0.6258],[-0.0491,0.6196],[-0.0429,0.3436],[-0.0552,0.3313],[-0.6135,0.3558],[-1.0613,0.4172],[-1.3006,0.4724],[-1.5337,0.546],[-1.7423,0.6319]],[[1.5031,1.2638],[1.3865,1.1411],[1.2147,1.0123],[1.0123,0.9018],[0.865,0.8405],[0.6687,0.7791],[0.4294,0.7301],[0.1166,0.6994],[0.0552,0.6994],[0.0429,0.7117],[0.0491,0.9877],[0.2025,1.0],[0.3497,1.0307],[0.4663,1.0675],[0.6564,1.1534],[0.9018,1.319],[0.9877,1.3926],[1.1656,1.5767],[1.2147,1.546],[1.3497,1.4294]],[[-1.4908,1.2638],[-1.3497,1.4172],[-1.1534,1.5828],[-1.1104,1.5276],[-0.9264,1.3497],[-0.7914,1.2454],[-0.6319,1.1472],[-0.454,1.0675],[-0.3374,1.0307],[-0.1902,1.0],[-0.0491,0.9877],[-0.0429,0.7055],[-0.2086,0.7055],[-0.4908,0.7423],[-0.6564,0.7791],[-0.8834,0.8528],[-1.0859,0.9448],[-1.2393,1.0368],[-1.3742,1.1411]],[[1.092,1.6319],[1.0491,1.5767],[0.8896,1.4233],[0.7485,1.3129],[0.6319,1.2393],[0.4663,1.1595],[0.319,1.1104],[0.1595,1.0798],[0.0429,1.0798],[0.0429,1.3497],[0.0675,1.362],[0.1718,1.3742],[0.2454,1.3988],[0.319,1.4356],[0.3988,1.4908],[0.4785,1.5644],[0.5521,1.6564],[0.6626,1.8466],[0.8098,1.7914],[0.9693,1.7117]],[[-1.0798,1.6319],[-0.9325,1.7239],[-0.7975,1.7914],[-0.6503,1.8466],[-0.5215,1.6319],[-0.454,1.5521],[-0.3865,1.4908],[-0.2454,1.4049],[-0.135,1.3681],[-0.0552,1.362],[-0.0429,1.3497],[-0.0429,1.0798],[-0.1472,1.0798],[-0.3067,1.1104],[-0.454,1.1595],[-0.6196,1.2393],[-0.7178,1.3006],[-0.8773,1.4233],[-1.0245,1.5644]],[[0.0429,1.4479],[0.0491,1.9632],[0.319,1.9387],[0.4479,1.9141],[0.5706,1.8773],[0.5276,1.7791],[0.4724,1.6933],[0.411,1.6196],[0.3374,1.5521],[0.2147,1.4785],[0.1104,1.4479]],[[-0.5583,1.8712],[-0.5276,1.8896],[-0.3436,1.9325],[-0.0491,1.9632],[-0.0429,1.4479],[-0.1043,1.4479],[-0.2025,1.4785],[-0.3252,1.5521],[-0.3926,1.6135],[-0.4724,1.7117]]]},"letters":[{"outline":[[0.9018,0.1718],[0.9018,-0.1472],[1.0245,-0.1472],[1.0245,0.0],[1.0307,0.0061],[1.1472,-0.1472],[1.2147,-0.1472],[1.3313,0.0123],[1.3374,0.0061],[1.3374,-0.1472],[1.6135,-0.1472],[1.638,-0.092],[1.7914,-0.092],[1.816,-0.1472],[1.9571,-0.1472],[1.9571,-0.135],[1.9448,-0.1227],[1.7914,0.1718],[1.638,0.1718],[1.4663,-0.1472],[1.4601,-0.1411],[1.4601,0.1718],[1.3006,0.1718],[1.2331,0.0798],[1.1779,0.0184],[1.0552,0.1718]],"holes":[[[1.7117,0.0675],[1.7239,0.0613],[1.7239,0.0491],[1.7546,-0.0061],[1.7485,-0.0184],[1.681,-0.0184],[1.6748,-0.0123]]]},{"outline":[[-0.0368,0.1718],[-0.0368,-0.1472],[0.0859,-0.1472],[0.0859,-0.0736],[0.092,-0.0675],[0.1902,-0.0675],[0.2577,-0.1472],[0.5399,-0.1472],[0.5583,-0.1166],[0.5583,-0.1043],[0.5706,-0.092],[0.7178,-0.092],[0.7301,-0.1043],[0.7485,-0.1472],[0.8896,-0.1472],[0.7178,0.1718],[0.5706,0.1718],[0.411,-0.1288],[0.3926,-0.1472],[0.3252,-0.0613],[0.3681,-0.0245],[0.3926,0.0368],[0.3865,0.092],[0.3742,0.1166],[0.3374,0.1534],[0.2945,0.1718]],"holes":[[[0.6442,0.0736],[0.6871,-0.0123],[0.681,-0.0184],[0.6074,-0.0184],[0.6012,-0.0123]],[[0.0859,0.0736],[0.092,0.0798],[0.2393,0.0798],[0.2638,0.0613],[0.2638,0.0429],[0.2454,0.0245],[0.092,0.0245],[0.0859,0.0307]]]},{"outline":[[-0.9877,0.1718],[-0.9877,-0.1472],[-0.865,-0.1472],[-0.865,0.0307],[-0.8589,0.0368],[-0.6994,-0.1472],[-0.5521,-0.1472],[-0.5521,0.1718],[-0.681,0.1718],[-0.681,0.0245],[-0.6871,0.0184],[-0.816,0.1718]],"holes":[]},{"outline":[[-1.4908,-0.1472],[-1.3497,-0.1472],[-1.3313,-0.1166],[-1.3313,-0.1043],[-1.319,-0.092],[-1.1718,-0.092],[-1.1595,-0.1043],[-1.1411,-0.1472],[-1.0,-0.1472],[-1.1718,0.1718],[-1.319,0.1718]],"holes":[[[-1.2454,0.0736],[-1.2025,-0.0123],[-1.2086,-0.0184],[-1.2822,-0.0184],[-1.2883,-0.0123]]]},{"outline":[[-1.865,0.1718],[-1.865,-0.1472],[-1.7423,-0.1472],[-1.7423,-0.0736],[-1.7362,-0.0675],[-1.5215,-0.0675],[-1.5031,-0.0613],[-1.454,-0.0184],[-1.4356,0.0245],[-1.4417,0.0982],[-1.4601,0.1288],[-1.5092,0.1656],[-1.5337,0.1718]],"holes":[[[-1.7423,0.0736],[-1.7362,0.0798],[-1.589,0.0798],[-1.5767,0.0736],[-1.5583,0.0491],[-1.5767,0.0245],[-1.7362,0.0245],[-1.7423,0.0307]]]},{"outline":[[-0.4908,0.1104],[-0.5092,0.0675],[-0.5092,-0.0429],[-0.4908,-0.0859],[-0.454,-0.1227],[-0.4294,-0.135],[-0.362,-0.1534],[-0.2209,-0.1534],[-0.2147,-0.1472],[-0.1902,-0.1472],[-0.1227,-0.1166],[-0.0982,-0.092],[-0.0798,-0.0552],[-0.0736,-0.0307],[-0.0798,0.0798],[-0.1166,0.135],[-0.1718,0.1656],[-0.2209,0.1718],[-0.227,0.1779],[-0.362,0.1779],[-0.4417,0.1534]],"holes":[[[-0.3865,0.0307],[-0.3804,0.0429],[-0.3436,0.0736],[-0.2699,0.0798],[-0.2638,0.0736],[-0.227,0.0675],[-0.2086,0.0491],[-0.1963,0.0061],[-0.2025,0.0],[-0.2025,-0.0184],[-0.227,-0.0429],[-0.2393,-0.0491],[-0.2638,-0.0491],[-0.2699,-0.0552],[-0.319,-0.0552],[-0.3558,-0.0429],[-0.3804,-0.0184],[-0.3865,-0.0061]]]}]};
const FINISHES={
 glass:{color:'#ffffff',metalness:0,roughness:.16,env:1.5,transmission:.99,fill:0xdfe6ff},
 black:{color:'#08090d',metalness:.93,roughness:.085,env:2.4,transmission:0,fill:0xff2838},
 silver:{color:'#d9dbe0',metalness:1,roughness:.07,env:1.8,transmission:0,fill:0xdfe6ff},
 red:{color:'#9b0018',metalness:.82,roughness:.105,env:2.1,transmission:0,fill:0xff2838}};
const SET={depth:1.1,thickness:.9,ior:1.45};
const FILL=.8,RADIUS=2.07,FOV=26;

class PanoramaGlobeGlass extends HTMLElement{
 connectedCallback(){
  if(this._init)return;this._init=true;
  this.style.display=this.style.display||'block';this.style.aspectRatio='1';this.style.touchAction='pan-y';
  this.style.cursor='grab';
  this.canvas=document.createElement('canvas');
  Object.assign(this.canvas.style,{display:'block',width:'100%',height:'100%'});
  this.append(this.canvas);
  loadThree().then(T=>this._setup(T)).catch(()=>this._fallback());
 }
 disconnectedCallback(){this._stop=true}
 _fallback(){this.canvas.remove();const i=document.createElement('img');i.src=(this.getAttribute('fallback')||'media/logo.png');i.alt='';Object.assign(i.style,{width:'80%',margin:'10%',display:'block'});this.append(i)}
 _setup(T){
  let r;try{r=new T.WebGLRenderer({canvas:this.canvas,antialias:true,alpha:true,premultipliedAlpha:true})}catch(e){return this._fallback()}
  this.T=T;this.r=r;
  r.setPixelRatio(Math.min(devicePixelRatio||1,2));r.outputColorSpace=T.SRGBColorSpace;r.toneMapping=T.ACESFilmicToneMapping;r.toneMappingExposure=1.6;r.setClearColor(0,0);
  const scene=this.scene=new T.Scene();
  const cam=this.cam=new T.PerspectiveCamera(FOV,1,.1,100);
  cam.position.set(0,0,RADIUS/FILL/Math.tan(T.MathUtils.degToRad(FOV/2)));cam.lookAt(0,0,0);
  // neutral photographic softboxes, reflected by the glass only
  const studio=new T.Scene();studio.background=new T.Color(0x0a0a0c);
  const P=(x,y,z,w,h,ry,b)=>{const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color:new T.Color(1,1,1).multiplyScalar(b),side:T.DoubleSide,toneMapped:false}));m.position.set(x,y,z);m.rotation.y=ry;studio.add(m)};
  P(-3.4,1.2,2.5,1.7,6.4,.47,7);P(3.5,.7,2.7,1.15,5.6,-.48,6);P(0,4,2.1,5.6,.65,0,5);P(-1.1,-3.2,2.5,3.5,.75,0,3);P(0,1.5,-4.1,5.5,2.5,Math.PI,2.5);P(4.2,-.5,-2.1,1.1,5.5,-.5,5);P(-4,-1.2,-1.7,1.3,4,.55,4);
  const pm=new T.PMREMGenerator(r);scene.environment=pm.fromScene(studio,.025).texture;pm.dispose();
  this.key=new T.DirectionalLight(0xffe3e3,5.2);this.key.position.set(-3,4,6);scene.add(this.key);
  const F=FINISHES[this.getAttribute('finish')]||FINISHES.glass;
  this.turn=matchMedia('(prefers-reduced-motion: reduce)').matches?0:+(this.getAttribute('turn')||0);
  this.fill=new T.DirectionalLight(F.fill,2);this.fill.position.set(4,-2,5);scene.add(this.fill);
  const rim=new T.DirectionalLight(0xffffff,3.6);rim.position.set(2,3,-4);scene.add(rim);
  const mat=this.mat=new T.MeshPhysicalMaterial({color:new T.Color(F.color),metalness:F.metalness,roughness:F.roughness,envMapIntensity:F.env,
   clearcoat:1,clearcoatRoughness:F.transmission?.03:.055,specularIntensity:1,transmission:F.transmission,thickness:SET.thickness,ior:SET.ior,
   attenuationColor:new T.Color('#eef0f4'),attenuationDistance:2.2,side:T.DoubleSide});
  this.obj=new T.Group();scene.add(this.obj);this.emb=new T.Group();this.obj.add(this.emb);
  const thick=.34,round=(pts,n)=>{let a=pts.map(p=>[p[0],p[1]]);for(let k=0;k<n;k++){const o=[];for(let i=0;i<a.length;i++){const p=a[i],q=a[(i+1)%a.length];o.push([p[0]*.75+q[0]*.25,p[1]*.75+q[1]*.25],[p[0]*.25+q[0]*.75,p[1]*.25+q[1]*.75])}a=o}return a};
  const shape=(part,n)=>{const s=new T.Shape(),o=round(part.outline,n);s.moveTo(...o[0]);o.slice(1).forEach(p=>s.lineTo(...p));s.closePath();for(const h of part.holes){const pa=new T.Path(),hh=round(h,n);pa.moveTo(...hh[0]);hh.slice(1).forEach(p=>pa.lineTo(...p));pa.closePath();s.holes.push(pa)}return s};
  const smooth=g=>{const pos=g.getAttribute('position'),nr=new Float32Array(pos.count*3),b=new Map(),K=(x,y,z)=>`${Math.round(x*1e5)},${Math.round(y*1e5)},${Math.round(z*1e5)}`;for(let i=0;i<pos.count;i+=3){const a=[0,1,2].map(j=>[pos.getX(i+j),pos.getY(i+j),pos.getZ(i+j)]),u=[a[1][0]-a[0][0],a[1][1]-a[0][1],a[1][2]-a[0][2]],v=[a[2][0]-a[0][0],a[2][1]-a[0][1],a[2][2]-a[0][2]];let n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];const l=Math.hypot(...n)||1;n=n.map(c=>c/l);for(let j=0;j<3;j++){const k=K(...a[j]);let e=b.get(k);if(!e)b.set(k,e=[0,0,0,[]]);e[0]+=n[0];e[1]+=n[1];e[2]+=n[2];e[3].push(i+j)}}for(const e of b.values()){const l=Math.hypot(e[0],e[1],e[2])||1;for(const i of e[3]){nr[i*3]=e[0]/l;nr[i*3+1]=e[1]/l;nr[i*3+2]=e[2]/l}}g.setAttribute('normal',new T.BufferAttribute(nr,3));return g};
  const tablet=(part,bevel,n,crisp)=>{const g=new T.ExtrudeGeometry(shape(part,n),{depth:thick-2*bevel,steps:1,bevelEnabled:true,bevelThickness:bevel,bevelSize:bevel,bevelSegments:crisp?8:28,curveSegments:32});g.translate(0,0,-(thick-2*bevel)/2);return crisp?g:smooth(g)};
  this.emb.add(new T.Mesh(tablet(DATA.globe,.032,3),mat));
  for(const gl of DATA.letters)this.emb.add(new T.Mesh(tablet(gl,.008,0,true),mat));
  // backdrop: drawn only into the glass's refraction pass, never on screen
  const src=this.getAttribute('backdrop');
  if(src&&F.transmission){
   const bm=this.bgMat=new T.MeshBasicMaterial({toneMapped:false,color:new T.Color(1,1,1).multiplyScalar(+(this.getAttribute('backdrop-brightness')||.8))});
   const bp=this.bg=new T.Mesh(new T.PlaneGeometry(1,1),bm);bp.position.z=-3;bp.renderOrder=-1;
   bp.onBeforeRender=rr=>{const off=rr.getRenderTarget()!==null;bm.colorWrite=off;bm.depthWrite=off};
   const d=cam.position.z+3,h=2*d*Math.tan(T.MathUtils.degToRad(FOV/2));bp.scale.set(h,h,1);scene.add(bp);
   new T.TextureLoader().load(src,tex=>{tex.colorSpace=T.SRGBColorSpace;bm.map=tex;bm.needsUpdate=true;this._mapBg();this.kick()});
  }
  // state
  this.s={x:0,y:0,vx:0,vy:0,hover:0,hs:1,ex:0,ey:0,px:0,py:0,inside:false,drag:null,home:false,demoT:0};
  this._wire();
  new ResizeObserver(()=>this._size()).observe(this);this._size();
  addEventListener('scroll',()=>this.kick(),{passive:true});addEventListener('resize',()=>this.kick());
  if(this.hasAttribute('demo')&&!matchMedia('(prefers-reduced-motion: reduce)').matches)this._demo=setInterval(()=>{this.s.home=false;this._turnTo=(this.s.y>Math.PI?0:Math.PI*2);this.kick()},5200);
  this.kick();
 }
 _size(){const w=this.clientWidth||1;this.r.setSize(w,w,false);this.kick()}
 _mapBg(){
  const bm=this.bgMat;if(!bm||!bm.map)return;const im=bm.map.image,host=document.querySelector(this.getAttribute('backdrop-for')||'body');if(!host||!im)return;
  const hr=host.getBoundingClientRect(),er=this.getBoundingClientRect(),iw=im.naturalWidth||im.width,ih=im.naturalHeight||im.height;
  const s=Math.max(hr.width/iw,hr.height/ih),dw=iw*s,dh=ih*s,L=hr.left+(hr.width-dw)/2,Tp=hr.top+(hr.height-dh)/2;
  const u0=(er.left-L)/dw,u1=(er.right-L)/dw,vt=1-(er.top-Tp)/dh,vb=1-(er.bottom-Tp)/dh;
  bm.map.repeat.set(u1-u0,vt-vb);bm.map.offset.set(u0,vb);
 }
 _wire(){
  const s=this.s,loc=e=>{const b=this.getBoundingClientRect(),cx=b.left+b.width/2,cy=b.top+b.height/2;s.px=Math.max(-1,Math.min(1,(e.clientX-cx)/(b.width*1.2)));s.py=Math.max(-1,Math.min(1,-(e.clientY-cy)/(b.height*1.2)));s.near=Math.max(0,1-Math.hypot(s.px,s.py)*1.15)};
  this.addEventListener('pointerenter',e=>{s.inside=true;loc(e);this.kick()});
  this.addEventListener('pointerleave',()=>{s.inside=false;this.kick()});
  this.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button)return;this.setPointerCapture(e.pointerId);s.drag={x:e.clientX,y:e.clientY};this.style.cursor='grabbing';this._turnTo=null;this.kick()});
  this.addEventListener('pointermove',e=>{loc(e);if(s.drag){const dx=e.clientX-s.drag.x,dy=e.clientY-s.drag.y;s.drag={x:e.clientX,y:e.clientY};s.y+=dx*.012;s.x=Math.max(-1.38,Math.min(1.38,s.x+dy*.01))}this.kick()});
  const up=()=>{s.drag=null;this.style.cursor='grab'};this.addEventListener('pointerup',up);this.addEventListener('pointercancel',up);
 }
 reset(){this._turnTo=Math.round(this.s.y/(Math.PI*2))*Math.PI*2;this._xTo=0;this.kick()}
 kick(){if(this._raf||!this.r||this._stop)return;this._last=performance.now();this._raf=requestAnimationFrame(t=>this._frame(t))}
 _frame(t){
  this._raf=0;const T=this.T,s=this.s,dt=Math.max(0,Math.min(t-this._last||16,50));this._last=t;const k=1-Math.exp(-dt/160);
  let moving=false;const ease=(a,b,f)=>{const v=a+(b-a)*f;if(Math.abs(b-v)>1e-4)moving=true;return Math.abs(b-v)>1e-4?v:b};
  // slow continuous turn (attribute turn: 1 is about 22 s a revolution); pauses when hidden
  if(this.turn&&!s.drag&&this._turnTo==null){
   const shown=!document.hidden&&(!this.checkVisibility||this.checkVisibility({visibilityProperty:true,opacityProperty:true}));
   if(shown){s.y+=dt*.0004*this.turn*0.7;if(s.y>Math.PI*2)s.y-=Math.PI*2;moving=true}
   else{clearTimeout(this._wake);this._wake=setTimeout(()=>this.kick(),600)}
  }
  if(this._turnTo!=null&&!s.drag){s.y=ease(s.y,this._turnTo,1-Math.exp(-dt/420));if(s.y===this._turnTo){this._turnTo=null;s.y%=Math.PI*2}}
  if(this._xTo!=null&&!s.drag){s.x=ease(s.x,this._xTo,1-Math.exp(-dt/420));if(s.x===this._xTo)this._xTo=null}
  const hoverT=s.inside&&!s.drag?1+(s.near||0)*.095:1;s.hs=ease(s.hs,hoverT,k*.85);
  s.ex=ease(s.ex,s.inside?s.py*.36:0,k*.75);s.ey=ease(s.ey,s.inside?s.px*.6:0,k*.75);
  this.obj.rotation.set(s.x,s.y,0);this.obj.scale.set(s.hs,s.hs,s.hs*SET.depth);
  this.scene.environmentRotation.set(s.ex,s.ey,0);
  this.key.position.set(-3+s.ey*4,4+s.ex*3,6);this.fill.position.set(4-s.ey*3,-2-s.ex*2,5);
  // readable from both sides: mirror while the back faces the camera (the swap happens edge-on)
  const n=new T.Vector3(0,0,1).applyQuaternion(this.obj.quaternion);this.emb.scale.x=n.dot(this.cam.position)<0?-1:1;
  this._mapBg();
  this.r.render(this.scene,this.cam);
  if(moving||s.drag)this.kick();
 }
}
if(!customElements.get('panorama-globe-glass'))customElements.define('panorama-globe-glass',PanoramaGlobeGlass);
})();
