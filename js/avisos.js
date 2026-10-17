// Notificações
// ===== Notificações =====
// Descanso e cronômetro: agendados no service worker (até ~5 min), que só avisa se o app não estiver na tela.
// Dias sem treinar, backup e medidas: verificados pelo service worker via "periodic background sync"
// (Chrome/Android com o app instalado). Onde isso não existe, esses avisos ficam só dentro do app.
var NT={rAt:0,eAt:0,ps:'',ft:{},sy:0};
function ntSup(){return'Notification' in window&&'serviceWorker' in navigator}
function ntOn(){return ntSup()&&Notification.permission==='granted'}
function ntCfg(){var d={rest:true,idle:true,bk:true,med:true},o=S.ntf||{};for(var k in o)d[k]=o[k];return d}
function ntIOS(){return/iphone|ipad|ipod/i.test(navigator.userAgent)}
function ntStandalone(){return!!(navigator.standalone||(window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches))}
function ntSW(m){try{if(navigator.serviceWorker&&navigator.serviceWorker.controller){navigator.serviceWorker.controller.postMessage(m);return true}}catch(e){}return false}
function ntShow(title,body,tag,tab){if(!ntOn())return;navigator.serviceWorker.ready.then(function(r){return r.showNotification(title,{body:body,tag:tag,renotify:true,icon:'icon-192.png',badge:'icon-192.png',vibrate:[300,150,300],data:{tab:tab||''}})}).catch(function(){})}

// Agenda (ou cancela, com at=0) um aviso com hora marcada.
function ntAt(tag,at,title,body){if(NT.ft[tag]){clearTimeout(NT.ft[tag]);NT.ft[tag]=0}
if(!at){ntSW({t:'cancelar',tag:tag});return}
var viaSW=at-Date.now()<=280000&&ntSW({t:'agendar',tag:tag,at:at,title:title,body:body,tab:'treino'});
if(!viaSW)NT.ft[tag]=setTimeout(function(){NT.ft[tag]=0;if(document.hidden)ntShow(title,body,tag,'treino')},Math.max(0,at-Date.now()))}
function ntRest(){if(pushAtivo()){if(NT.rAt){NT.rAt=0;ntAt('descanso',0)}pushTimers();return}var at=(ntOn()&&ntCfg().rest&&T.end)?T.end:0;if(at===NT.rAt)return;NT.rAt=at;var w=cw();ntAt('descanso',at,'Descanso acabou','Hora da próxima série'+(w?' de '+w.n:'')+'.')}
function ntEx(){if(pushAtivo()){if(NT.eAt){NT.eAt=0;ntAt('tempo',0)}pushTimers();return}var at=(ntOn()&&ntCfg().rest&&EX.end)?EX.end:0;if(at===NT.eAt)return;NT.eAt=at;var x=fx(EX.eid);ntAt('tempo',at,'Tempo da série acabou',(x?x.n+': ':'')+'série concluída.')}

// Copia pro IndexedDB o mínimo que o service worker precisa pra decidir os lembretes.
function ntSync(){clearTimeout(NT.sy);NT.sy=setTimeout(function(){if(!IDB)return;try{var pl={};for(var i=0;i<7;i++){var w=S.w.filter(function(x){return x.id==(S.plan||{})[i]})[0];pl[i]=w?w.n:''}
var c={id:'cfg',on:ntOn(),f:ntCfg(),lt:lastTrain()||'',lb:S.lb!==false,ld:S.ld||2,lbk:S.lbk||'',st:startD(),lm:S.meas.map(function(m){return m.d}).sort().pop()||'',pl:pl,push:pushAtivo()};
IDB.transaction('cfg','readwrite').objectStore('cfg').put(c)}catch(e){}
if(pushAtivo()){var pc=JSON.stringify(pushCfg());if(pc!==NT.pcs){NT.pcs=pc;pushPost('/cfg',{endpoint:NT.sub,cfg:JSON.parse(pc)})}}},1500)}

function ntPeriodic(){if(!ntOn())return;navigator.serviceWorker.ready.then(function(r){var set=function(v){if(NT.ps!==v){NT.ps=v;if(S.tab=='mais')render()}};if(!r.periodicSync){set('no');return}
var go=function(){r.periodicSync.register('lembretes',{minInterval:12*36e5}).then(function(){set('ok')}).catch(function(){set('no')})};
try{navigator.permissions.query({name:'periodic-background-sync'}).then(function(p){if(p.state==='granted')go();else set('no')}).catch(go)}catch(e){go()}}).catch(function(){})}

function ntAsk(){if(!ntSup())return;var fim=function(p){if(p==='granted'){ntPeriodic();pushSub();ntSync();ntShow('Notificações ligadas','É assim que os avisos do Meu treino vão aparecer.','teste','mais')}render()};
try{var pr=Notification.requestPermission(fim);if(pr&&pr.then)pr.then(fim)}catch(e){}}
function ntTest(){if(pushAtivo()){pushPost('/agendar',{endpoint:NT.sub,tag:'teste',at:Date.now()+10000,title:'Teste do servidor',body:'Chegou! As notificações com o app fechado funcionam.',tab:'mais'});toast('Teste enviado. Bloqueie a tela: chega em uns 10 segundos.');render();return}ntShow('Teste do Meu treino','Se você está vendo isso, as notificações funcionam.','teste','mais')}

function ntCard(){var h='<div class="card"><b>Notificações</b>';
if(!ntSup())return h+'<p class="mut" style="margin-top:6px">'+(ntIOS()&&!ntStandalone()?'No iPhone, as notificações só funcionam com o app adicionado à Tela de Início (iOS 16.4 ou mais novo). Abra pelo ícone e volte aqui.':'Este navegador não suporta notificações.')+'</p></div>';
var p=Notification.permission;
if(p==='denied')return h+'<p class="mut" style="margin-top:6px">As notificações estão bloqueadas pra este site. Libere nas configurações do navegador (permissões do site) e volte aqui.</p></div>';
if(p!=='granted')return h+'<p class="mut" style="margin-top:6px">Avisos de fim do descanso, dias sem treinar, backup e medidas.</p><button class="btn sm" data-a="ntp" style="margin-top:8px">Ativar notificações</button></div>';
var f=ntCfg(),O=[['rest','Fim do descanso e do cronômetro','Quando o app está aberto em segundo plano.'],['idle','Dias sem treinar','Usa o número de dias do "Aviso de treino parado".'],['bk','Lembrete de backup','Depois de 14 dias sem backup.'],['med','Lembrete de medidas','Depois de 14 dias sem medir.']];
h+=O.map(function(o){var on=!!f[o[0]];return'<div class="row i"><button class="chk'+(on?' on':'')+'" data-a="ntx:'+o[0]+'" aria-pressed="'+on+'"><span class="box">'+(on?ico('check',16):'')+'</span><span class="shx"><span style="font-weight:500">'+o[1]+'</span><span class="mut" style="font-size:13px">'+o[2]+'</span></span></button></div>'}).join('');
if(pushCfgOk()){h+='<p class="mut" style="font-size:13px;margin-top:8px">'+(NT.pu==='ok'?'<b style="color:var(--ok)">Conectado ao servidor.</b> Os avisos chegam mesmo com o app fechado ou a tela bloqueada.':NT.pu==='no'?'<b style="color:var(--warn)">Não consegui conectar ao servidor de notificações.</b> Confira a internet e abra o app de novo. Enquanto isso, valem os avisos locais.':'Conectando ao servidor de notificações…')+'</p>';
if(NT.pu==='ok')return h+'<div class="row" style="margin:10px 0 4px"><label for="nth" class="sp">Horário dos lembretes diários</label><select id="nth" data-f="nth" style="width:auto">'+[7,8,9,10,11,12,13,14,15,16,17,18,19,20,21].map(function(x){return'<option value="'+x+'"'+((S.nth||18)==x?' selected':'')+'>'+x+'h</option>'}).join('')+'</select></div><button class="lnk" data-a="ntt">Enviar notificação de teste</button></div>'}
h+='<p class="mut" style="font-size:13px;margin-top:8px">'+(NT.ps==='ok'?'Os lembretes de treino, backup e medidas chegam mesmo com o app fechado. Quem escolhe a hora é o celular, mais ou menos uma vez por dia, entre 8h e 21h.':ntIOS()?'No iPhone, os lembretes de treino, backup e medidas não chegam com o app fechado: eles aparecem dentro do app. O aviso do descanso só chega se o app estiver aberto em segundo plano; com a tela bloqueada, o som do descanso continua sendo o aviso mais confiável.':'Este navegador não deixa mandar lembretes com o app fechado, então os de treino, backup e medidas aparecem só dentro do app. No Chrome do Android, com o app instalado, funciona.')+'</p><button class="lnk" data-a="ntt">Enviar notificação de teste</button></div>';
return h}

// ===== Notificações pelo servidor (push) =====
// Com PUSH_URL e VAPID_PUBLIC preenchidos em js/config.js, os avisos vêm do servidor
// e chegam com o app fechado ou a tela bloqueada (inclusive no iPhone com o app na Tela de Início).
NT.sub='';NT.pu='';NT.pcs='';NT.pr=0;NT.pe=0;
function pushCfgOk(){return!!(window.PUSH_URL&&window.VAPID_PUBLIC)}
function pushAtivo(){return pushCfgOk()&&!!NT.sub&&ntOn()}
function pushPost(p,b){try{fetch(PUSH_URL.replace(/\/+$/,'')+p,{method:'POST',headers:{'content-type':'text/plain'},body:JSON.stringify(b),keepalive:true}).catch(function(){})}catch(e){}}
function b64bin(s){s=s.replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';var r=atob(s),u=new Uint8Array(r.length);for(var i=0;i<r.length;i++)u[i]=r.charCodeAt(i);return u}
function mesmaChave(a,b){if(!a||!b)return false;a=new Uint8Array(a);if(a.length!=b.length)return false;for(var i=0;i<a.length;i++)if(a[i]!=b[i])return false;return true}
function pushCfg(){var pl={};for(var i=0;i<7;i++){var w=S.w.filter(function(x){return x.id==(S.plan||{})[i]})[0];pl[i]=w?w.n:''}
var tz='America/Sao_Paulo';try{tz=Intl.DateTimeFormat().resolvedOptions().timeZone||tz}catch(e){}
return{on:true,f:ntCfg(),lt:lastTrain()||'',lb:S.lb!==false,ld:S.ld||2,lbk:S.lbk||'',st:startD(),lm:S.meas.map(function(m){return m.d}).sort().pop()||'',pl:pl,tz:tz,hora:S.nth||18}}
function pushSub(){if(!pushCfgOk()||!ntOn())return;var set=function(v){if(NT.pu!==v){NT.pu=v;if(S.tab=='mais')render()}};
navigator.serviceWorker.ready.then(function(r){if(!r.pushManager){set('no');return}var key=b64bin(VAPID_PUBLIC);
return r.pushManager.getSubscription().then(function(s){if(s&&!mesmaChave(s.options&&s.options.applicationServerKey,key))return s.unsubscribe().then(function(){return null});return s})
.then(function(s){return s||r.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:key})})
.then(function(s){NT.sub=s.endpoint;var c=pushCfg();NT.pcs=JSON.stringify(c);pushPost('/assinar',{sub:s.toJSON(),cfg:c});set('ok');ntSync()})}).catch(function(){set('no')})}
// Descanso/cronômetro: só pede ao servidor quando o app sai da tela; cancela quando volta.
function pushTimers(){if(!pushAtivo())return;var now=Date.now(),hid=document.hidden,f=ntCfg().rest;
var r=hid&&f&&T.end>now+3000?T.end:0;if(r!==NT.pr){NT.pr=r;var w=cw();pushPost('/agendar',{endpoint:NT.sub,tag:'descanso',at:r,title:'Descanso acabou',body:'Hora da próxima série'+(w?' de '+w.n:'')+'.',tab:'treino'})}
var x=hid&&f&&EX.end>now+3000?EX.end:0;if(x!==NT.pe){NT.pe=x;var xx=fx(EX.eid);pushPost('/agendar',{endpoint:NT.sub,tag:'tempo',at:x,title:'Tempo da série acabou',body:(xx?xx.n+': ':'')+'série concluída.',tab:'treino'})}}
document.addEventListener('visibilitychange',pushTimers);window.addEventListener('pagehide',pushTimers);
