(() => {
'use strict';
const entries=window.LOGO_EXPERIMENTS;
const $=s=>document.querySelector(s), grid=$('#grid'), dialog=$('#viewer');
let active=null, previousFocus=null, noticeTimer;
const cards=new Map();
function frame(url,title){const el=document.createElement('iframe');el.src=url;el.title=title;el.setAttribute('sandbox','allow-scripts');return el;}
function syncPreview(card){
 const box=card.querySelector('.preview'), item=cards.get(card);
 const visible=card.dataset.visible==='true'&&!card.hidden&&!dialog.open&&!document.hidden;
 if(visible&&!box.querySelector('iframe')){const el=frame(item.preview,item.title+' animated preview');el.tabIndex=-1;el.setAttribute('aria-hidden','true');box.prepend(el);}
 if(!visible)box.querySelector('iframe')?.remove();
}
const observer=new IntersectionObserver(items=>items.forEach(({target,isIntersecting})=>{target.dataset.visible=String(isIntersecting);syncPreview(target);}),{rootMargin:'60px'});
for(const item of [...entries].reverse()){
 const card=document.createElement('li');card.className='study';card.id=item.id;
 const preview=document.createElement('a');preview.className='preview';preview.href='#'+item.id;preview.setAttribute('aria-label',`Open ${item.id}: ${item.title}`);
 const id=document.createElement('span');id.className='id tc';id.textContent=item.id;
 const h=document.createElement('h2');const ha=document.createElement('a');ha.href='#'+item.id;ha.textContent=item.title;ha.title=item.description;h.append(ha);
 card.append(preview,id,h);grid.append(card);cards.set(card,item);observer.observe(card);
}
$('#count').textContent=String(entries.length).padStart(2,'0');
function close(){if(dialog.open)dialog.close();$('#stage').replaceChildren();active=null;document.body.classList.remove('viewing');cards.forEach((_,card)=>syncPreview(card));previousFocus?.focus({preventScroll:true});}
function route(){const item=entries.find(x=>x.id===location.hash.slice(1));if(!item){close();return;}if(active?.id===item.id)return;active=item;previousFocus=document.activeElement;$('#viewer-id').textContent=item.id;$('#viewer-title').textContent=item.title;$('#viewer-description').textContent=item.description;$('#open').href=item.entry;$('#download').href=item.download;$('#stage').replaceChildren(frame(item.entry,item.title+' interactive experiment'));if(!dialog.open)dialog.showModal();document.body.classList.add('viewing');cards.forEach((_,card)=>syncPreview(card));}
function dismiss(){history.replaceState(null,'',location.pathname+location.search);close();}
$('#close').onclick=dismiss;dialog.addEventListener('cancel',e=>{e.preventDefault();dismiss();});dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dismiss();}});
$('#copy').onclick=async()=>{if(!active)return;const reference=`Logo Experiments / ${active.id} — ${active.title}\n${new URL('#'+active.id,location.href).href}\nSource: logo-experiments/${active.source}\n${active.description}`;try{await navigator.clipboard.writeText(reference);$('#copy').textContent='Reference copied ✓';setTimeout(()=>$('#copy').textContent='Copy reference ↗',2000);}catch{window.prompt('Copy this experiment reference:',reference);}};
window.addEventListener('hashchange',route);document.addEventListener('visibilitychange',()=>cards.forEach((_,card)=>syncPreview(card)));route();
})();
