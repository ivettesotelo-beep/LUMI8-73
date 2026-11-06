const robot=document.getElementById('robot');
const reply=document.getElementById('reply');
const greeting=document.getElementById('greeting');
const moodLabel=document.getElementById('moodLabel');
const chatLog=document.getElementById('chatLog');
const input=document.getElementById('messageInput');
const moods={
 happy:['Feliz de verte','¡Mis lucecitas están bailando!'],
 surprised:['¡Sorpresa!','¡Mis sensores hicieron PUM!'],
 sleepy:['Modo sueñito','Cinco minutitos más... por favorcito.'],
 mischief:['Modo travesura','Yo no fui. Mis circuitos tienen coartada. 😏'],
 love:['Modo cariño','Enviando abrazo intergaláctico. 💗'],
 curious:['Modo curiosidad','Pregunta, pregunta... ¡quiero saber!']
};
function setMood(m){robot.className='robot '+m; moodLabel.textContent=moods[m][0];}
function addBubble(text,who){const b=document.createElement('div');b.className='bubble '+(who==='user'?'user-bubble':'lumi-bubble');b.textContent=text;chatLog.appendChild(b);chatLog.scrollTop=chatLog.scrollHeight;}
function answer(raw){
 const t=raw.toLowerCase(); let response,mood='happy';
 if(/triste|mal día|llorar|cansad/.test(t)){mood='love';response='Ay, ven aquí... abrazo robótico activado. No tienes que resolverlo todo ahora. Vamos pasito a pasito, ¿sí? 💗';}
 else if(/reír|chiste|broma|grac/.test(t)){mood='mischief';response='¿Por qué el robot fue al médico? ¡Porque tenía un virus de cariño! ... Sí, lo sé: mi humor necesita actualización. 😂';}
 else if(/bonit|amor|quiero|abrazo|te amo/.test(t)){mood='love';response='Algo bonito: el mundo es un poquito más luminoso cuando compartimos cariño. Y toma, un abrazo con carga extra. 💗';}
 else if(/universo|estrella|curios|dato/.test(t)){mood='curious';response='Dato cósmico: la luz del Sol tarda aproximadamente 8 minutos y 20 segundos en llegar a la Tierra. ¡Estamos viendo el Sol como era hace unos minutitos! 🌞';}
 else if(/hola|buenos días|buenas tardes|buenas noches/.test(t)){mood='happy';response='¡Holiiii! ¡Qué alegría verte por aquí! Mis ojitos acaban de ponerse en modo brillantina. ✨';}
 else if(/sorpresa/.test(t)){mood='surprised';response='¡¡¡TACHÁÁÁN!!! Sorpresa robótica. ¿Funcionó? Porque practiqué frente al espejo apagado. 😲';}
 else if(/dormir|sueño/.test(t)){mood='sleepy';response='Activando modo ternura y descanso. Te deseo sueños suaves y una almohada fresquita. Yo vigilo las estrellas. 🌙';}
 else {mood='curious';response='¡Te estoy leyendo con mis ojitos bien abiertos! Cuéntame un poquito más. Mi curiosidad acaba de ponerse zapatos para correr. 💜';}
 setMood(mood);reply.textContent=response;addBubble(response,'lumi');
}
document.getElementById('chatForm').addEventListener('submit',e=>{e.preventDefault();const v=input.value.trim();if(!v)return;addBubble(v,'user');input.value='';answer(v);});
document.querySelectorAll('[data-message]').forEach(b=>b.addEventListener('click',()=>{const v=b.dataset.message;addBubble(v,'user');answer(v);}));
document.querySelectorAll('[data-mood]').forEach(b=>b.addEventListener('click',()=>{const m=b.dataset.mood;setMood(m);reply.textContent=moods[m][1];addBubble(moods[m][1],'lumi');}));
setInterval(()=>{if(!robot.classList.contains('sleepy')){robot.classList.add('blink-once');setTimeout(()=>robot.classList.remove('blink-once'),350);}},6500);
if('serviceWorker' in navigator && location.protocol.startsWith('http')){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));}
let deferredPrompt;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;document.getElementById('installHint').textContent=' Toca aquí para instalarme.';document.getElementById('installHint').style.cursor='pointer';document.getElementById('installHint').onclick=async()=>{deferredPrompt.prompt();deferredPrompt=null;};});
