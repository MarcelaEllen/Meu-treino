// Estado do app, salvar/carregar, fotos (IndexedDB), backup e desfazer
function ld(d){d=d||new Date();var p=function(n){return('0'+n).slice(-2)};return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())}
var TODAY=ld(),DT=null,EDK=null,HPG='h',TPG='t',EXS,HF='',SG=false,ANP='ex',EVS='e',WCF=false,MALL=false,PALL=false,ED=false,F=null,M={},AC,T={end:0,iv:null,fin:false};
function U(){return Math.random().toString(36).slice(2,8)}
function P(s){return s.split(';').map(function(x){var a=x.split(',');return{kg:a[0],reps:a[1],rpe:a[2]||''}})}
function R(n,k,r){return Array(n).fill(k+','+r).join(';')}
function X(n,tag,s){return{id:U(),n:n,tag:tag,tg:P(s)[0].reps,s:P(s)}}
function def(){return{tab:'hoje',wk:'ia',day:{},dn:{},sd:{},cc:{},meas:[],plan:{1:'ia',2:'sa',4:'ia',5:'sa'},start:'',pg:'med',theme:'auto',acc:'',sl:{},dt:{},md:{},nt:{},ph:[],wl:true,ev:'',evm:'c',evf:'',wkd:'',wa:{},ws:{m:35,kg:'',calor:false,cups:[200,300,500]},
h:[['mov','Treinei ou caminhei'],['pas','7 a 10 mil passos'],['agua','Bebi água ao longo do dia'],['sono','Dormi 7 a 9 horas'],['prot','Proteína em todas as refeições'],['fib','Fibras (feijão, aveia, fruta, legumes)'],['sem','Sem álcool e sem açúcar líquido'],['jo','Sem dor no treino']].map(function(x){return{id:x[0],t:x[1]}}),
w:[
{id:'ia',n:'Inferiores',d:'',e:[X('Agachamento','',R(3,0,10)),X('Leg press','',R(3,0,12)),X('Stiff','',R(3,0,10)),X('Hip thrust','',R(3,0,10)),X('Mesa flexora','',R(3,0,12)),X('Panturrilha','',R(3,0,15))]},
{id:'sa',n:'Superiores',d:'',e:[X('Supino','',R(3,0,10)),X('Remada','',R(3,0,10)),X('Desenvolvimento de ombro','',R(3,0,10)),X('Puxada','',R(3,0,12)),X('Rosca direta','',R(3,0,12)),X('Tríceps pulley','',R(3,0,12))]}],
mf:[['peso','Peso (kg)'],['cin','Cintura (cm)'],['qua','Quadril (cm)'],['cox','Coxa (cm)'],['bra','Braço (cm)']].map(function(x){return{id:x[0],l:x[1]}}),
cd:['Em jejum','Ao acordar','Depois de ir ao banheiro','Depois de comer','Depois do treino','Fim do dia','Inchada'].map(function(t){return{id:U(),t:t}}),
su:[['Creatina monohidratada','Força e músculo','3 a 5 g por dia, todo dia.',1],['Proteína em pó','Se faltar proteína','Só pra completar a meta da nutri.',1],['Ômega-3','Saúde do coração','A dose depende de cada pessoa.',1],['Magnésio','Sono e recuperação','Opcional.',1],['Vitamina D','Só se o exame indicar','Faça o exame antes de tomar.',1]].map(function(x){return{id:U(),n:x[0],tag:x[1],txt:x[2],warn:!!x[3]}}),
co:['Marcar avaliação com nutricionista','Fazer exames de rotina (colesterol, glicemia, vitaminas)','Conversar com médico antes de começar, se tiver alguma condição','Avaliar dores ou postura com fisio, se houver','Repetir exames em 3 meses'].map(function(t){return{id:U(),t:t}})}}
var S=def();
try{var r=localStorage.getItem('plano2');if(r){var o=JSON.parse(r);for(var k in o)S[k]=o[k]}}catch(e){}
var phk='',LSPH=null;try{var rp=localStorage.getItem('plano2_ph');if(rp){LSPH=JSON.parse(rp);S.ph=LSPH}}catch(e){}
function warnSave(m){if(!document.body)return;var e=document.getElementById('sverr');if(!e){e=document.createElement('div');e.id='sverr';e.style.cssText='position:fixed;top:0;left:0;right:0;z-index:99;background:#b3261e;color:#fff;padding:10px 14px;font-size:14px;text-align:center';document.body.appendChild(e)}e.textContent=m||'Não consegui salvar neste navegador. Faça um backup em Mais → Backup agora.'}
function save(){var ok=true,c={};for(var k in S)if(k!='ph')c[k]=S[k];try{localStorage.setItem('plano2',JSON.stringify(c))}catch(e){ok=false}
var kk=(S.ph||[]).map(function(p){return p.id}).join();if(kk!==phk){if(PHFB){try{localStorage.setItem('plano2_ph',JSON.stringify(S.ph||[]));phk=kk}catch(e){ok=false}}else if(IDB){phk=kk;phSync()}}
if(window.ntSync)ntSync();if(!ok)warnSave();else{var el=document.getElementById('sverr');if(el)el.remove()}return ok}
try{localStorage.setItem('t_','1');localStorage.removeItem('t_')}catch(e){setTimeout(function(){warnSave('Este navegador não guarda dados (aba anônima ou bloqueio). Seus registros vão se perder ao fechar.')},300)}
try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persist()}catch(e){}
// ===== Fotos no IndexedDB =====
var IDB=null,PHS={},PHFB=false;
function phSync(){if(!IDB)return;var cur={},id;(S.ph||[]).forEach(function(p){cur[p.id]=p});try{var tx=IDB.transaction('ph','readwrite'),st=tx.objectStore('ph');for(id in cur)if(!PHS[id])st.put(cur[id]);for(id in PHS)if(!cur[id])st.delete(id);
tx.oncomplete=function(){PHS={};for(var i2 in cur)PHS[i2]=1;if(LSPH){try{localStorage.removeItem('plano2_ph')}catch(e){}LSPH=null}};tx.onabort=tx.onerror=function(){warnSave('Não consegui salvar as fotos. O aparelho pode estar sem espaço: apague algumas fotos antigas.')}}catch(e){}}
(function(){if(!window.indexedDB){PHFB=true;return}try{var rq=indexedDB.open('meu-treino',2);rq.onupgradeneeded=function(){var d=rq.result;if(!d.objectStoreNames.contains('ph'))d.createObjectStore('ph',{keyPath:'id'});if(!d.objectStoreNames.contains('cfg'))d.createObjectStore('cfg',{keyPath:'id'})};rq.onerror=function(){PHFB=true};
rq.onsuccess=function(){IDB=rq.result;try{var g=IDB.transaction('ph','readonly').objectStore('ph').getAll();g.onsuccess=function(){var db=g.result||[],m={};db.forEach(function(p){m[p.id]=1;PHS[p.id]=1});var ex=(S.ph||[]).filter(function(p){return !m[p.id]});S.ph=db.concat(ex);phk=S.ph.map(function(p){return p.id}).join();if(ex.length||LSPH)phSync();render();if(window.ntSync)ntSync()}}catch(e){IDB=null;PHFB=true}}}catch(e){PHFB=true}})();
// ===== Desfazer =====
var UND=null;
function undo(m,fn){UND=fn;toast(m,'und')}
// ===== Backup em arquivo =====
var BKJ=null;
function ddiff(a,b){return Math.round((new Date(b+'T12:00:00')-new Date(a+'T12:00:00'))/864e5)}
function bkAge(){return S.lbk?ddiff(S.lbk,TODAY):null}
function bkTxt(){var a=bkAge();return a==null?'Você ainda não fez nenhum backup.':'Último backup '+(a<=0?'hoje':a==1?'ontem':'há '+a+' dias')+'.'}
function bkCard(){var a=bkAge();if(ddiff(startD(),TODAY)<7)return'';if(a!=null&&a<14)return'';if(S.bks&&ddiff(S.bks,TODAY)<7)return'';
return'<div class="warnbox"><b>'+(a==null?'Você ainda não fez backup.':'Seu último backup foi há '+a+' dias.')+'</b> Se o celular quebrar ou o navegador limpar os dados, você perde tudo.<div class="row" style="margin-top:8px"><button class="btn sm" data-a="bkf">Fazer backup</button><button class="lnk" style="color:inherit" data-a="bks">Agora não</button></div></div>'}
function bkFile(){var cp=Object.assign({},S);cp.lbk=TODAY;var js=JSON.stringify(cp),f;try{f=new File([js],'meu-treino-backup-'+TODAY+'.json',{type:'application/json'})}catch(e){f=null}
var ok=function(){S.lbk=TODAY;S.bks='';save();toast('Backup salvo');render()};if(!f){modal('Backup',[],null,null,'Este navegador não consegue criar o arquivo. Use "Copiar como texto".');return}
if(canShareFile(f)){navigator.share({files:[f],title:'Backup Meu treino'}).then(ok).catch(function(){})}else{dlFile(f);ok()}}
function bkRead(t){var j;try{j=JSON.parse(t);if(!j||!j.w)throw 0}catch(e){modal('Backup inválido',[],null,null,'Esse arquivo não parece um backup deste app. Nada foi alterado.');return}BKJ=j;
$('#modal').innerHTML='<div class="mb"><h2 style="margin-top:0">Restaurar backup?</h2><p>Isso substitui todos os dados atuais pelos do backup'+(j.lbk?' de '+dm(j.lbk)+'/'+j.lbk.slice(0,4):'')+'.</p>'+(Array.isArray(j.ph)?'<p class="mut">'+j.ph.length+' foto'+(j.ph.length==1?'':'s')+' no backup.</p>':'<p class="mut">Esse backup não tem fotos. As fotos atuais ficam.</p>')+'<div class="row" style="margin-top:14px"><button class="btn g" data-a="mx">Cancelar</button><button class="btn sp" data-a="bkok">Restaurar</button></div></div>';$('#modal').style.display='flex'}
function bkApply(){var j=BKJ;BKJ=null;if(!j)return;var ph0=S.ph;S=Object.assign(def(),j);S.ph=Array.isArray(j.ph)?j.ph:(ph0||[]);F=null;save();toast('Backup restaurado')}
