// Navegação, cliques e inicialização (sempre o último a carregar)
var TABS=[['hoje','today','Hoje',hoje],['treino','dumb','Treino',treino],['agua','drop','Água',agua],['prog','trend','Progresso',prog],['mais','more','Mais',mais]],ROUTES=TABS.concat([['sup','','',supl],['con','','',cons],['aj','','',ajuda]]);
function render(){var nt=ld();if(nt!=TODAY)CAL=null;TODAY=nt;applyTheme();if(S.tab=='med'||S.tab=='evo'){S.pg=S.tab;S.tab='prog'}
var sub=S.tab=='sup'||S.tab=='con'||S.tab=='aj',t=ROUTES.filter(function(x){return x[0]==S.tab})[0]||TABS[0],act=sub?'mais':t[0];
$('#app').innerHTML=(sub?'<button class="btn g sm" data-a="t:mais" style="margin-bottom:6px">‹ Mais</button>':'')+t[3]();
$('#nav').innerHTML=TABS.map(function(x){return'<button class="'+(x[0]==act?'on':'')+'" data-a="t:'+x[0]+'"><b>'+ico(x[1],22)+'</b>'+x[2]+'</button>'}).join('');wake();moveEb();drawFoco();showToast()}
document.addEventListener('input',function(e){var f=e.target.dataset.f;if(!f)return;var p=f.split(':'),v=e.target.value;
if(p[0]=='nt'){S.nt=S.nt||{};S.nt[TODAY]=S.nt[TODAY]||{};S.nt[TODAY][p[1]]=v}else if(p[0]=='pl')S.plan[p[1]]=v;else if(p[0]=='evx')S.ev=v;else if(p[0]=='evf')S.evf=v;else if(p[0]=='nth')S.nth=parseInt(v)||18;else if(p[0]=='wkg')S.ws.kg=v;else if(p[0]=='fd')F.d=v;else if(p[0]=='mv')F.v[p[1]]=v;else{var x=fx(p[1]),fl={k:'kg',r:'reps',d:'rr',e:'rpe'}[p[0]];if(x&&x.s[p[2]])x.s[p[2]][fl]=v;var DD=S.dn[TODAY];if(DD)for(var wi in DD){var qq=DD[wi][p[1]+':'+p[2]];if(qq&&typeof qq=='object')qq[fl]=v}}save()});
document.addEventListener('click',function(e){var b=e.target.closest('[data-a]');if(!b)return;var a=b.dataset.a.split(':'),y=a[0],sc=window.scrollY,w=cw();
if(y=='t'){S.tab=a[1];ED=false;EDK=null;sc=0;if(a[1]=='treino'&&S.wkd!=TODAY){S.wkd=TODAY;var pp=(S.plan||{})[new Date().getDay()];if(pp&&S.w.some(function(z){return z.id==pp}))S.wk=pp}}
else if(y=='ed'){ED=!ED}
else if(y=='ty'){var xt=fx(a[1]);if(xt){xt.ty=isT(xt)?'Repetições':'Tempo (segundos)';toast(isT(xt)?'Agora por tempo (segundos)':'Agora por repetições')}}
else if(y=='h'){var d=S.day[TODAY]=S.day[TODAY]||{};d[a[1]]=!d[a[1]]}
else if(y=='w'){S.wk=a[1];EXS=null}
else if(y=='s'){var D=S.dn[TODAY]=S.dn[TODAY]||{},W=D[a[1]]=D[a[1]]||{},kk=a[2]+':'+a[3];if(W[kk]){delete W[kk];stopRest();toast('Série desmarcada')}else{var sx=fx(a[2]),ss=sx?sx.s[a[3]]:null;W[kk]=ss?{kg:ss.kg,reps:ss.reps,rr:ss.rr||'',rpe:ss.rpe}:true;try{navigator.vibrate&&navigator.vibrate(35)}catch(e){}startRest(ss&&ss.wu?60:(sx&&(parseInt(sx.rest)||restTag(sx.tag))||120));toast('Série marcada. Descanso iniciado.','s:'+a[1]+':'+a[2]+':'+a[3])}}
else if(y=='as'){var x=fx(a[1]),l=lastWork(x)||{kg:'0',reps:'10',rpe:''};x.s.push({kg:l.kg,reps:l.reps,rr:l.rr||'',rpe:''})}
else if(y=='rsx'){var x2=fx(a[1]),ws=[];x2.s.forEach(function(z,ii){if(!z.wu)ws.push(ii)});if(ws.length>1)delSet(x2,ws[ws.length-1])}
else if(y=='aw'){var xa=fx(a[1]);if(xa)xa.s.push({kg:'0',reps:isT(xa)?'30':'10',rr:'',rpe:'',wu:true})}
else if(y=='rw'){var xr=fx(a[1]),wi2=-1;if(xr)xr.s.forEach(function(z,ii){if(z.wu)wi2=ii});if(wi2>-1)delSet(xr,wi2)}
else if(y=='nx'){var nxx=fx(a[1]);if(nxx){modal('Nota do exercício',[['note','Nota (ex: banco na posição 4, pegada fechada)','area',nxx.note||'']],function(o){nxx.note=o.note},null);M.opt=true}return}
else if(y=='rt'){S.rt=S.rt||{};S.rt[a[1]]=Math.max(15,Math.min(600,rtd()[a[1]]+parseInt(a[2])))}
else if(y=='rtr'){S.rt={}}
else if(y=='lbl'){S.lb=a[1]=='1'}
else if(y=='ldd'){S.ld=Math.max(2,Math.min(14,(S.ld||2)+parseInt(a[1])))}
else if(y=='fmo'){FM.on=true;FM.i=0;for(var fi=0;fi<w.e.length;fi++){if(w.e[fi].s.some(function(z,jj){return !isd(w.id,w.e[fi].id,jj)})){FM.i=fi;break}}}
else if(y=='fmc'){FM.on=false}
else if(y=='fmn'){FM.i+=parseInt(a[1])}
else if(y=='rs'){var rv=S.dn[TODAY]&&S.dn[TODAY][w.id],rwi=w.id;if(rv&&Object.keys(rv).length){delete S.dn[TODAY][w.id];undo('Séries de hoje desmarcadas',function(){(S.dn[TODAY]=S.dn[TODAY]||{})[rwi]=rv})}}
else if(y=='und'){var uf=UND;UND=null;if(uf){uf();toast('Desfeito')}}
else if(y=='bkf'){bkFile();return}
else if(y=='bks'){S.bks=TODAY}
else if(y=='ntp'){ntAsk();return}
else if(y=='ntx'){var nf=ntCfg();nf[a[1]]=!nf[a[1]];S.ntf=nf;NT.rAt=-1;NT.eAt=-1}
else if(y=='ntt'){ntTest();return}
else if(y=='bkok'){mclose();bkApply()}
else if(y=='shr'){shareOpen();return}
else if(y=='shx'){SH.s[a[1]]=!SH.s[a[1]];SH.e='';shareDraw();return}
else if(y=='shp'){SH.p=parseInt(a[1]);shareDraw();return}
else if(y=='shg'){shareGen();return}
else if(y=='shb'){SH.f=null;shareDraw();return}
else if(y=='shd'){dlFile(SH.f);return}
else if(y=='shs'){try{navigator.share({files:[SH.f],title:'Meu resumo'}).catch(function(){})}catch(e){dlFile(SH.f)}return}
else if(y=='p'){var d2=S.sd[TODAY]=S.sd[TODAY]||{};d2[a[1]]=!d2[a[1]]}
else if(y=='c'){S.cc[a[1]]=!S.cc[a[1]]}
else if(y=='cdt'){var c=S.cd.filter(function(z){return z.id==a[1]})[0],i=F.c.indexOf(c.t);if(i>-1)F.c.splice(i,1);else F.c.push(c.t)}
else if(y=='mfs'){var v={};S.mf.forEach(function(f){var n=parseFloat(String(F.v[f.id]||'').replace(',','.'));if(n)v[f.id]=n});if(!Object.keys(v).length)return;
var en={id:F.id||U(),d:F.d||TODAY,v:v,c:F.c.slice()};if(F.id){S.meas=S.meas.map(function(m){return m.id==F.id?en:m})}else S.meas.push(en);F=null}
else if(y=='mfc'){F=null}
else if(y=='em'){var m=S.meas.filter(function(z){return z.id==a[1]})[0];F={id:m.id,d:m.d,v:{},c:(m.c||[]).slice()};for(var kx in m.v)F.v[kx]=String(m.v[kx]).replace('.',',');sc=0}
else if(y=='sl'){S.sl=S.sl||{};S.sl[a[1]]=slKey(S.sl[a[1]])==a[2]?'':a[2]}
else if(y=='md'){S.md=S.md||{};S.md[TODAY]=S.md[TODAY]==a[1]?'':a[1]}
else if(y=='pv'){var pp0=(S.ph||[]).filter(function(z){return z.id==a[1]})[0];if(pp0)modal('Foto de '+dm(pp0.d)+'<img src="'+pp0.src+'" alt="" style="width:100%;border-radius:10px;margin-top:10px;display:block">',[],null,function(){modal('Excluir foto?',[],null,function(){S.ph=S.ph.filter(function(z){return z.id!=a[1]})},'Tem certeza? Não dá pra desfazer.')});return}
else if(y=='wl'){S.wl=a[1]=='1';if(!S.wl&&WL){try{WL.release()}catch(e){}WL=null}}
else if(y=='th'){S.theme=isDark()?'light':'dark'}
else if(y=='tm'){S.theme=a[1]}
else if(y=='ac'){S.acc=a[1]}
else if(y=='pg'){S.pg=a[1]}
else if(y=='pe'){PLE=!PLE}
else if(y=='rv'){RES=!RES}
else if(y=='cm'){var C=cal();C.m+=parseInt(a[1]);if(C.m<0){C.m=11;C.y--}if(C.m>11){C.m=0;C.y++}}
else if(y=='cs'){cal().sel=a[1];DT=null;EDK=null}
else if(y=='hx'){var dx=S.day[a[1]]=S.day[a[1]]||{};dx[a[2]]=!dx[a[2]]}
else if(y=='gt'){S.wk=a[1];S.tab='treino';ED=false;sc=0}
else if(y=='evm'){S.evm=a[1]}
else if(y=='rp'){modal('Repetir último treino?',[],function(){repeatLast(w)},null,'Os kg, reps e @ deste treino serão trocados pelos da última vez que você fez cada exercício.');return}
else if(y=='wa'){var al=S.wa[TODAY]=S.wa[TODAY]||[];al.push({ml:parseInt(a[1]),t:new Date().toTimeString().slice(0,5)});toast('Água registrada: +'+a[1]+' ml','wu')}
else if(y=='wu'){if(S.wa[TODAY])S.wa[TODAY].pop();toast('Último registro desfeito')}
else if(y=='wz'){var wv0=S.wa[TODAY]||[];if(wv0.length){S.wa[TODAY]=[];undo('Água de hoje zerada',function(){S.wa[TODAY]=wv0})}}
else if(y=='wm'){S.ws.m=parseInt(a[1])}
else if(y=='wc'){S.ws.calor=!S.ws.calor}
else if(y=='cx'){S.ws.cups.splice(parseInt(a[1]),1)}
else if(y=='cn'){modal('Novo copo',[['v','Tamanho em ml, ex: 250','text','']],function(o){var n=parseInt(o.v);if(n>0)S.ws.cups.push(n)});return}
else if(y=='bk'){S.lbk=TODAY;S.bks='';save();var cp=Object.assign({},S);delete cp.ph;var js=JSON.stringify(cp);try{navigator.clipboard.writeText(js).catch(function(){})}catch(e){}modal('Backup',[['b','Tentei copiar automaticamente. Se não funcionou, toque no texto, selecione tudo e copie. Guarde em um lugar seguro (notas ou WhatsApp pra você mesma).','area',js]],null,null);var te=$('#mf_b');if(te)te.select();return}
else if(y=='br'){modal('Restaurar backup',[['b','Cole aqui o texto do backup','area','']],function(o){try{var j=JSON.parse(o.b);if(!j||!j.w)throw 0;var ph0=S.ph;S=Object.assign(def(),j);S.ph=ph0||[];F=null;save();render()}catch(e){modal('Backup inválido',[],null,null,'O texto não parece um backup deste app. Nada foi alterado.')}},null,'Atenção: isso substitui todos os dados atuais pelos do backup.');return}
else if(y=='hd'){var hd2=a[1],hw=a[2],hv=S.dn[hd2]&&S.dn[hd2][hw];if(hv){delete S.dn[hd2][hw];undo('Treino de '+dm(hd2)+' excluído do histórico',function(){(S.dn[hd2]=S.dn[hd2]||{})[hw]=hv})}}
else if(y=='e'){openEdit(a[1],a[2]);return}
else if(y=='n'){openEdit(a[1],null);return}
else if(y=='x'){openDel(a[1],a[2]);return}
else if(y=='dt'){DT=DT==a[1]?null:a[1]}
else if(y=='edk'){EDK=EDK==a[1]?null:a[1]}
else if(y=='hp'){HPG=a[1];sc=0}
else if(y=='tp'){TPG=a[1];sc=0}
else if(y=='xo'){var oo=Object.assign({},opens(w));if(oo[a[1]])delete oo[a[1]];else oo[a[1]]=1;EXS=oo}
else if(y=='xa'){EXS={};w.e.forEach(function(x){EXS[x.id]=1})}
else if(y=='xc'){EXS={}}
else if(y=='hf'){HF=a[1]}
else if(y=='sg'){SG=!SG}
else if(y=='rl'){S.rl=a[1]=='1'}
else if(y=='inf'){var iv=a[1]=='ex'?exInfo():INFO[a[1]];if(iv)modal(iv[0],[],null,null,iv[1]);return}
else if(y=='ob'){S.ob=1}
else if(y=='ob0'){S.ob=0}
else if(y=='mt'){var mx2=fx(a[1]);if(mx2){modal(isT(mx2)?'Meta de tempo':'Meta de repetições',[['tg',isT(mx2)?'Meta por série (segundos)':'Meta por série (repetições)','',mx2.tg||'']],function(o){mx2.tg=o.tg},null,'Com a meta definida, o app sugere a carga do próximo treino: sobe se você bater a meta com folga (@9 ou menos), mantém se foi no limite e sugere baixar se ficou bem abaixo.')}return}
else if(y=='rpe'){modal('O que é o @ (RPE)?',[],null,null,'O @ é o RPE, o esforço percebido de 1 a 10: o quão perto da falha a série ficou. 10 = no limite, nenhuma rep sobrando. 9,5 = quase falha, talvez 1 sobrando. 9 = 1 rep sobrando. 8 = 2 sobrando. 7 = 3 sobrando. Abaixo de 6 = leve. O app usa isso na sugestão de carga: se você bate a meta de reps com @9 ou menos, ele sugere subir; se foi @9,5 ou mais, sugere manter.');return}
else if(y=='su1'){var sux=S.su.filter(function(z){return z.id==a[1]})[0];if(sux){sux.fr='Diária';sux.ty=sux.ty||'Suplemento'}}
else if(y=='an'){ANP=a[1];sc=0}
else if(y=='evs'){EVS=a[1]}
else if(y=='wcf'){WCF=!WCF}
else if(y=='mh'){MALL=!MALL}
else if(y=='pa'){PALL=!PALL}
else if(y=='mok'){var o={},first=true;M.f.forEach(function(f,ix){var el=$('#mf_'+f[0]);o[f[0]]=f[2]=='check'?el.checked:(f[2]=='tag'&&el.value=='__o')?$('#mf_tag_o').value.trim():el.value.trim();if(ix==0&&!o[f[0]])first=false});if(!first&&!M.opt)return;var okf=M.ok;mclose();okf(o)}
else if(y=='mdel'){var dl=M.del;mclose();dl()}
else if(y=='mx'){mclose();return}
else if(y=='r30'){T.end=Math.max(T.end,Date.now())+30000;T.fin=false;if(S.rl)audioRest((T.end-Date.now())/1000);tick();return}
else if(y=='rsk'){stopRest();return}
else if(y=='tx'){startEx(a[1],parseInt(a[2]),parseInt(a[3])||0);return}
else if(y=='xst'){stopEx();return}
else if(y=='x10'){if(EX.end){EX.end+=10000}tickEx();return}
save();render();window.scrollTo(0,sc)});
document.addEventListener('change',function(e){if(e.target.id=='mf_tag'){var oo=$('#mf_tag_o');if(oo){oo.style.display=e.target.value=='__o'?'block':'none';if(e.target.value=='__o')oo.focus()}return}if(e.target.id=='bkin'){var bf=e.target.files&&e.target.files[0];e.target.value='';if(bf){var rd=new FileReader();rd.onload=function(){bkRead(String(rd.result))};rd.readAsText(bf)}return}if(e.target.id=='phf'){var f0=e.target.files&&e.target.files[0];if(f0)addPhoto(f0);e.target.value='';return}var ff=(e.target.dataset.f||'').split(':')[0];if(['wkg','pl','evx','evf'].indexOf(ff)>-1){save();render()}});
document.addEventListener('visibilitychange',function(){if(!document.hidden)render()});
try{window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change',function(){applyTheme()})}catch(e){}
if(!S.start){S.start=startD();save()}
S.tab='hoje';var h0=(location.hash||'').slice(1);if(['hoje','treino','agua','prog','mais'].indexOf(h0)>-1){S.tab=h0;try{history.replaceState(null,'',location.pathname+location.search)}catch(e){}}
render();
try{navigator.serviceWorker.addEventListener('message',function(e){var d=e.data||{};if(d.t=='abrir'&&d.tab){S.tab=d.tab;ED=false;render();window.scrollTo(0,0)}})}catch(e){}
if(ntOn()){ntPeriodic();pushSub()}
try{if('serviceWorker' in navigator&&location.protocol=='https:')navigator.serviceWorker.register('sw.js',{updateViaCache:'none'}).catch(function(){})}catch(e){}
window.addEventListener('offline',function(){toast('Sem internet. O app continua funcionando normalmente.');showToast()});
window.addEventListener('online',function(){toast('Internet de volta.');showToast()});
