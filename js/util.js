// Funções de apoio: datas, formatação, ícones, tema, avisos (toast), modal e edição
function $(s){return document.querySelector(s)}
function esc(t){return String(t==null?'':t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;')}
function fmt(n){return(Math.round(n*10)/10).toString().replace('.',',')}
function dm(d){return d.slice(8)+'/'+d.slice(5,7)}
function cw(){return S.w.filter(function(x){return x.id==S.wk})[0]||S.w[0]}
function tot(w){return w.e.reduce(function(n,x){return n+x.s.filter(nw).length},0)}
function cnt(d,wid){var o=((S.dn[d]||{})[wid])||{},w=S.w.filter(function(z){return z.id==wid})[0];if(!w)return Object.keys(o).length;var n=0;w.e.forEach(function(x){x.s.forEach(function(s,i){if(!s.wu&&o[x.id+':'+i])n++})});return n}
function isd(wid,eid,i){return !!(((S.dn[TODAY]||{})[wid]||{})[eid+':'+i])}
function fx(id){for(var i=0;i<S.w.length;i++){for(var j=0;j<S.w[i].e.length;j++){if(S.w[i].e[j].id==id)return S.w[i].e[j]}}}
var K={hb:{a:'h',f:[['t','Hábito']],n:'t'},su:{a:'su',f:[['n','Nome'],['ty','Tipo','sel',['Suplemento','Remédio','Vitamina','Outro']],['fr','Frequência','sel',['Diária','Dias alternados','Semanal','Só quando precisar']],['dose','Dose (opcional), ex: 5 g ou 1 comprimido'],['tag','Pra que serve (opcional)'],['txt','Observações (horário, com comida...)','area'],['warn','Perguntar à médica ou nutri antes','check']],n:'n'},co:{a:'co',f:[['t','Item']],n:'t'},mf:{a:'mf',f:[['l','Nome da medida, ex: Panturrilha (cm)']],n:'l'},cd:{a:'cd',f:[['t','Condição, ex: Depois do café']],n:'t'},wk:{a:'w',f:[['n','Nome do treino'],['d','Observação']],n:'n'},ex:{f:[['n','Nome do exercício'],['mg','Grupo muscular','sel',['Automático (pelo nome)','Peito','Costas','Ombros','Bíceps','Tríceps','Quadríceps','Posterior de coxa','Glúteos','Panturrilha','Abdômen','Outro']],['tg','Meta por série (repetições ou segundos)'],['ty','Tipo','sel',['Repetições','Tempo (segundos)']],['tag','Etiqueta','tag'],['rest','Descanso em segundos (vazio = automático pela etiqueta; etiqueta própria usa 2 min)'],['uni','Unilateral (esquerda e direita separadas)','check'],['note','Nota (opcional), ex: banco na posição 4','area']],n:'n'},me:{a:'meas',f:[],n:'d'}};
function arr(k){return k=='ex'?(cw()?cw().e:[]):S[K[k].a]}
function hd(t){return'<div class="row"><h1 class="sp">'+t+'</h1><button class="btn g sm" data-a="ed">'+(ED?'Concluir':''+ico('pen')+' Editar')+'</button></div>'}
function ctl(k,id){return ED?'<button class="ib" data-a="e:'+k+':'+id+'" aria-label="editar">'+ico('pen')+'</button><button class="ib" data-a="x:'+k+':'+id+'" aria-label="excluir">'+ico('trash')+'</button>':''}
function addb(k,t){return ED?'<button class="btn sm eb" data-a="n:'+k+'">+ '+t+'</button>':''}
function chk(on,t,act,k,id){return'<div class="row i"><button class="chk'+(on?' on':'')+'" data-a="'+act+'"><span class="box">'+(on?ico('check',16):'')+'</span><span class="t">'+esc(t)+'</span></button>'+(k?ctl(k,id):'')+'</div>'}
function utabs(a,c,l){return'<div class="ut">'+l.map(function(x){return'<button class="'+(x[0]==c?'on':'')+'" data-a="'+a+':'+x[0]+'">'+x[1]+'</button>'}).join('')+'</div>'}
function tagPill(t){if(!t)return'';var k=String(t).toLowerCase().trim(),st=k=='t1'?'background:var(--acc);color:#fff':k=='fortalecimento'?'background:color-mix(in srgb,var(--ok) 18%,transparent);color:var(--ok)':k=='t3'?'background:none;border:1px solid var(--line)':'';return'<span class="pill'+(k=='joelho'?' w':'')+'" style="'+st+'">'+esc(t)+'</span>'}
var TAGS=['T1','T2','T3','Fortalecimento','Joelho'],FM={on:false,i:0,last:''},EXD={};
function rtd(){var r=S.rt||{};return{t1:r.t1||180,t2:r.t2||150,t3:r.t3||120,f:r.f||60}}
function restTag(t){var k=String(t||'').toLowerCase().trim(),r=rtd();return k=='t1'?r.t1:k=='t2'?r.t2:k=='t3'?r.t3:k=='fortalecimento'?r.f:120}
function mmss(n){return Math.floor(n/60)+':'+('0'+n%60).slice(-2)}
function isU(x){return !!x&&!!x.uni}
function nw(s){return !s.wu}
function ordr(x){var a=x.s.map(function(s,i){return i});return a.filter(function(i){return x.s[i].wu}).concat(a.filter(function(i){return !x.s[i].wu}))}
function lastWork(x){return x.s.filter(nw).pop()}
var INFO={ex:['Meta e etiquetas','Meta: quantas repetições você quer fazer em cada série. O app usa a meta pra sugerir se na próxima vez você sobe, mantém ou baixa a carga. Etiquetas: definem o descanso padrão. T1 = 3 min, T2 = 2 min 30, T3 = 2 min, Fortalecimento = 1 min. Você muda o descanso de cada exercício em Editar.'],reps:['Repetições','Quantas vezes você levantou o peso na série. Se o exercício for por tempo (prancha, por exemplo), mude o Tipo pra Tempo em Editar e anote os segundos: 60 = 1 minuto.'],ag:['Meta de água','A meta é o seu peso vezes os ml por kg escolhidos, mais 500 ml em dia de treino e mais 500 ml em dia quente. Pra mudar, toque em Ajustar cálculo da meta.']},TM=null,TT=0;
function toast(m,u){TM=[m,u]}
function showToast(){if(!TM)return;var e=document.getElementById('toast');if(!e){e=document.createElement('div');e.id='toast';e.setAttribute('role','status');e.setAttribute('aria-live','polite');document.body.appendChild(e);swipeToast(e)}
var vis=e.style.display=='flex'&&e.style.opacity!='0';var lng=!!TM[1];e.innerHTML='<span class="sp">'+esc(TM[0])+'</span>'+(TM[1]?'<button class="lnk" style="color:inherit;text-decoration:underline" data-a="'+TM[1]+'">Desfazer</button>':'')+'<i class="grab" aria-hidden="true"></i>';TM=null;
if(!vis){e.style.transition='none';e.style.transform='translateY(-150%)';e.style.opacity='0';e.style.display='flex';e.offsetHeight;e.style.transition='';e.style.transform='translateY(0)';e.style.opacity='1'}clearTimeout(TT);TT=setTimeout(hideToast,lng?6000:4000)}
function hideToast(){var e=document.getElementById('toast');clearTimeout(TT);if(!e||e.style.display=='none')return;e.style.transition='';e.style.transform='translateY(-150%)';e.style.opacity='0';setTimeout(function(){if(e.style.opacity=='0')e.style.display='none'},280)}
function swipeToast(e){var y0=null,dy=0;
e.addEventListener('pointerdown',function(ev){if(ev.target.closest('button'))return;y0=ev.clientY;dy=0;e.style.transition='none';clearTimeout(TT);try{e.setPointerCapture(ev.pointerId)}catch(_){}});
e.addEventListener('pointermove',function(ev){if(y0==null)return;var d=ev.clientY-y0;dy=d<0?d:d*.2;e.style.transform='translateY('+dy+'px)';e.style.opacity=String(Math.max(.15,1+Math.min(0,dy)/110))});
function end(){if(y0==null)return;y0=null;e.style.transition='';if(dy<-24)hideToast();else{e.style.transform='translateY(0)';e.style.opacity='1';TT=setTimeout(hideToast,3000)}}
e.addEventListener('pointerup',end);e.addEventListener('pointercancel',end)}
function isT(x){return!!x&&String(x.ty||'').indexOf('Tempo')==0}
function fr(x,q){var kg=parseFloat(q.kg)||0,u=isU(x);if(isT(x))return(kg?fmt(kg)+'kg · ':'')+(u?'E '+q.reps+' s · D '+(q.rr||'–')+' s':q.reps+' s');return(q.kg||0)+'kg × '+(u?'E'+q.reps+' · D'+(q.rr||'–'):q.reps)}
function chips(a,c,l){return'<div class="tabs" style="margin:6px 0">'+l.map(function(x){return'<button class="'+(x[0]==c?'on':'')+'" data-a="'+a+':'+x[0]+'">'+x[1]+'</button>'}).join('')+'</div>'}
function fl(ml){return(Math.round(ml/10)/100).toString().replace('.',',')}
var MN=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],CAL=null,PLE=false,RES=false;
function cal(){if(!CAL){var n=new Date();CAL={y:n.getFullYear(),m:n.getMonth(),sel:TODAY}}return CAL}
function startD(){var ks=Object.keys(S.day).concat(Object.keys(S.dn),Object.keys(S.sd),Object.keys(S.wa),S.meas.map(function(m){return m.d})),m=S.start||TODAY;ks.forEach(function(k){if(/^\d{4}-\d\d-\d\d$/.test(k)&&k<m)m=k});return m}
function dowOf(d){return new Date(d+'T12:00:00').getDay()}
function wsum(d){return(S.wa[d]||[]).reduce(function(n,x){return n+x.ml},0)}
function waterGoal(d){var kg=parseFloat(String(S.ws.kg).replace(',','.'));if(!kg){var ps=S.meas.filter(function(m){return m.v.peso}).sort(function(a,b){return a.d<b.d?1:-1}),pm=ps.filter(function(m){return m.d<=d})[0]||ps[0];kg=pm?pm.v.peso:0}if(!kg)return 0;var tr=!!(S.day[d]||{}).mov;S.w.forEach(function(w){if(cnt(d,w.id))tr=true});return Math.round((kg*S.ws.m+(tr?500:0)+(d==TODAY&&S.ws.calor?500:0))/50)*50}
function dayStat(d){var done=0,tot=0,dd=S.day[d]||{};S.h.forEach(function(x){if(x.c&&d<x.c)return;tot++;if(dd[x.id])done++});var g=waterGoal(d);if(g){tot++;if(wsum(d)>=g)done++}var pw=(S.plan||{})[dowOf(d)],wk=S.w.filter(function(w){return w.id==pw})[0],did=!!dd.mov;S.w.forEach(function(w){if(cnt(d,w.id))did=true});return{pct:tot?done/tot:0,wk:wk,did:did}}
function ab(n){return n.split(/\s+/).map(function(w){return w[0]}).join('').toUpperCase().slice(0,3)}
var SLP=[['a','Menos de 5h',4],['b','5 a 6h',5.5],['c','7 a 8h',7.5],['d','9h ou mais',9.5]],MOOD=[['otimo','😄','Animado(a)'],['bem','🙂','Bem'],['normal','😐','Normal'],['cansado','😴','Cansado(a)'],['ansioso','😟','Ansioso(a)'],['triste','😞','Desanimado(a)']];
function slKey(v){if(!v)return'';if(/^[a-d]$/.test(v))return v;var n=parseFloat(String(v).replace(',','.'));if(!n)return'';return n<5?'a':n<7?'b':n<9?'c':'d'}
var DN=['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
var IP={today:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18M9 15l2 2 4-4"/>',dumb:'<path d="M6 6v12M18 6v12M3 9v6M21 9v6M6 12h12"/>',drop:'<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',trend:'<path d="M3 17l6-6 4 4 8-8M15 7h6v6"/>',more:'<circle cx="5" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="19" cy="12" r="1.5" fill="currentColor"/>',pen:'<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',trash:'<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v6M14 11v6"/>',moon:'<path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z"/>',sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',pill:'<path d="M10.5 20.5a4.95 4.95 0 0 1-7-7l10-10a4.95 4.95 0 0 1 7 7z"/><path d="M8.5 8.5l7 7"/>',clip:'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4h6v3H9zM9 12h6M9 16h4"/>',chev:'<path d="M9 6l6 6-6 6"/>',clock:'<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M9 2h6"/>',bulb:'<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z"/>',trophy:'<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',check:'<path d="M5 12.5l4.5 4.5L19 7"/>',x:'<path d="M6 6l12 12M18 6L6 18"/>',redo:'<path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5"/>',share:'<path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7M16 6l-4-4-4 4M12 2v13"/>'};
function ico(n,s){s=s||18;return'<svg width="'+s+'" height="'+s+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="vertical-align:-3px;flex:none">'+IP[n]+'</svg>'}
function mix(a,b,t){var p=function(h,i){return parseInt(h.substr(1+2*i,2),16)},o='#';for(var i=0;i<3;i++){o+=('0'+Math.round(p(a,i)*(1-t)+p(b,i)*t).toString(16)).slice(-2)}return o}
function isDark(){var t=S.theme||'auto';return t=='dark'||(t!='light'&&!!window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches)}
function applyTheme(){var r=document.documentElement;if(!r||!r.style)return;var t=S.theme||'auto';if(t=='auto')r.removeAttribute('data-theme');else r.setAttribute('data-theme',t);
if(!S.acc){r.style.removeProperty('--acc');r.style.removeProperty('--acc2');return}var dk=isDark();r.style.setProperty('--acc',dk?mix(S.acc,'#ffffff',.38):S.acc);r.style.setProperty('--acc2',dk?mix(S.acc,'#14131D',.78):mix(S.acc,'#ffffff',.88))}
var WL=null;
function wake(){try{if(S.wl===false||!navigator.wakeLock||document.hidden)return;if(S.tab=='treino'&&!WL){navigator.wakeLock.request('screen').then(function(l){WL=l;l.addEventListener('release',function(){WL=null})}).catch(function(){})}else if(S.tab!='treino'&&WL){WL.release();WL=null}}catch(e){}}
function modal(t,f,ok,del,msg){M={f:f,ok:ok,del:del};var h='<div class="mb"><h2 style="margin-top:0">'+t+'</h2>'+(msg?'<p>'+esc(msg)+'</p>':'');
f.forEach(function(x){var id='mf_'+x[0];h+='<div style="margin:10px 0"><label for="'+id+'">'+x[1]+'</label>'+(x[2]=='area'?'<textarea id="'+id+'" rows="4">'+esc(x[3])+'</textarea>':x[2]=='sel'?'<select id="'+id+'">'+x[4].map(function(o){return'<option'+(o==x[3]?' selected':'')+'>'+o+'</option>'}).join('')+'</select>':x[2]=='tag'?tagSel(x[3]):x[2]=='check'?'<br><input type="checkbox" id="'+id+'"'+(x[3]?' checked':'')+'> Sim':'<input type="text" id="'+id+'"'+(x[0]=='tg'||x[0]=='rest'?' inputmode="numeric"':'')+' value="'+esc(x[3])+'">')+'</div>'});
h+='<div class="row" style="margin-top:14px"><button class="btn g" data-a="mx">'+(ok||del?'Cancelar':'Fechar')+'</button>'+(del?'<button class="btn" style="background:var(--warn)" data-a="mdel">Excluir</button>':'')+(ok?'<button class="btn sp" data-a="mok">Salvar</button>':'')+'</div></div>';
$('#modal').innerHTML=h;$('#modal').style.display='flex'}
function mclose(){$('#modal').style.display='none';M={}}
function openEdit(k,id){var c=K[k],a=arr(k),it=id?a.filter(function(x){return x.id==id})[0]:null;
modal((it?'Editar ':'Novo ')+'item',c.f.map(function(f){return[f[0],f[1],f[2],it?it[f[0]]:(f[2]=='check'?false:''),f[3]]}),function(o){
if(it){Object.assign(it,o)}else{o.id=U();if(k=='hb')o.c=TODAY;if(k=='ex')o.s=P(o.ty&&o.ty.indexOf('Tempo')==0?'0,30;0,30;0,30':'0,10;0,10;0,10');if(k=='wk'){o.e=[];S.wk=o.id}a.push(o)}},it?function(){openDel(k,id)}:null)}
function openDel(k,id){var a=arr(k),it=a.filter(function(x){return x.id==id})[0];if(!it)return;
modal('Excluir?',[],null,function(){var i=a.indexOf(it);a.splice(i,1);if(k=='wk')S.wk=S.w[0]?S.w[0].id:'';if(k=='me'&&F&&F.id==id)F=null},'Tem certeza que quer excluir "'+(k=='me'?dm(it.d):(it[K[k].n]||''))+'"? Não dá pra desfazer.')}
