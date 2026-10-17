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
function ntRest(){var at=(ntOn()&&ntCfg().rest&&T.end)?T.end:0;if(at===NT.rAt)return;NT.rAt=at;var w=cw();ntAt('descanso',at,'Descanso acabou','Hora da próxima série'+(w?' de '+w.n:'')+'.')}
function ntEx(){var at=(ntOn()&&ntCfg().rest&&EX.end)?EX.end:0;if(at===NT.eAt)return;NT.eAt=at;var x=fx(EX.eid);ntAt('tempo',at,'Tempo da série acabou',(x?x.n+': ':'')+'série concluída.')}

// Copia pro IndexedDB o mínimo que o service worker precisa pra decidir os lembretes.
function ntSync(){clearTimeout(NT.sy);NT.sy=setTimeout(function(){if(!IDB)return;try{var pl={};for(var i=0;i<7;i++){var w=S.w.filter(function(x){return x.id==(S.plan||{})[i]})[0];pl[i]=w?w.n:''}
var c={id:'cfg',on:ntOn(),f:ntCfg(),lt:lastTrain()||'',lb:S.lb!==false,ld:S.ld||2,lbk:S.lbk||'',st:startD(),lm:S.meas.map(function(m){return m.d}).sort().pop()||'',pl:pl};
IDB.transaction('cfg','readwrite').objectStore('cfg').put(c)}catch(e){}},1500)}

function ntPeriodic(){if(!ntOn())return;navigator.serviceWorker.ready.then(function(r){var set=function(v){if(NT.ps!==v){NT.ps=v;if(S.tab=='mais')render()}};if(!r.periodicSync){set('no');return}
var go=function(){r.periodicSync.register('lembretes',{minInterval:12*36e5}).then(function(){set('ok')}).catch(function(){set('no')})};
try{navigator.permissions.query({name:'periodic-background-sync'}).then(function(p){if(p.state==='granted')go();else set('no')}).catch(go)}catch(e){go()}}).catch(function(){})}

function ntAsk(){if(!ntSup())return;var fim=function(p){if(p==='granted'){ntPeriodic();ntSync();ntShow('Notificações ligadas','É assim que os avisos do Meu treino vão aparecer.','teste','mais')}render()};
try{var pr=Notification.requestPermission(fim);if(pr&&pr.then)pr.then(fim)}catch(e){}}
function ntTest(){ntShow('Teste do Meu treino','Se você está vendo isso, as notificações funcionam.','teste','mais')}

function ntCard(){var h='<div class="card"><b>Notificações</b>';
if(!ntSup())return h+'<p class="mut" style="margin-top:6px">'+(ntIOS()&&!ntStandalone()?'No iPhone, as notificações só funcionam com o app adicionado à Tela de Início (iOS 16.4 ou mais novo). Abra pelo ícone e volte aqui.':'Este navegador não suporta notificações.')+'</p></div>';
var p=Notification.permission;
if(p==='denied')return h+'<p class="mut" style="margin-top:6px">As notificações estão bloqueadas pra este site. Libere nas configurações do navegador (permissões do site) e volte aqui.</p></div>';
if(p!=='granted')return h+'<p class="mut" style="margin-top:6px">Avisos de fim do descanso, dias sem treinar, backup e medidas.</p><button class="btn sm" data-a="ntp" style="margin-top:8px">Ativar notificações</button></div>';
var f=ntCfg(),O=[['rest','Fim do descanso e do cronômetro','Quando o app está aberto em segundo plano.'],['idle','Dias sem treinar','Usa o número de dias do "Aviso de treino parado".'],['bk','Lembrete de backup','Depois de 14 dias sem backup.'],['med','Lembrete de medidas','Depois de 14 dias sem medir.']];
h+=O.map(function(o){var on=!!f[o[0]];return'<div class="row i"><button class="chk'+(on?' on':'')+'" data-a="ntx:'+o[0]+'" aria-pressed="'+on+'"><span class="box">'+(on?ico('check',16):'')+'</span><span class="shx"><span style="font-weight:500">'+o[1]+'</span><span class="mut" style="font-size:13px">'+o[2]+'</span></span></button></div>'}).join('');
h+='<p class="mut" style="font-size:13px;margin-top:8px">'+(NT.ps==='ok'?'Os lembretes de treino, backup e medidas chegam mesmo com o app fechado. Quem escolhe a hora é o celular, mais ou menos uma vez por dia, entre 8h e 21h.':ntIOS()?'No iPhone, os lembretes de treino, backup e medidas não chegam com o app fechado: eles aparecem dentro do app. O aviso do descanso só chega se o app estiver aberto em segundo plano; com a tela bloqueada, o som do descanso continua sendo o aviso mais confiável.':'Este navegador não deixa mandar lembretes com o app fechado, então os de treino, backup e medidas aparecem só dentro do app. No Chrome do Android, com o app instalado, funciona.')+'</p><button class="lnk" data-a="ntt">Enviar notificação de teste</button></div>';
return h}
