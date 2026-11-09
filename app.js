const robot = document.getElementById('robot');
const reply = document.getElementById('reply');
const moodLabel = document.getElementById('moodLabel');
const chatLog = document.getElementById('chatLog');
const input = document.getElementById('messageInput');
const micButton = document.getElementById('micButton');
const voiceToggle = document.getElementById('voiceToggle');
const voiceNote = document.getElementById('voiceNote');

let voiceOn = true;
let lastReplies = [];
let recognitionBusy = false;

const moodInfo = {
  happy: ['Feliz de verte', '♡'],
  surprised: ['¡Sorpresa!', '!'],
  sleepy: ['Modo sueñito', 'zZ'],
  mischief: ['Modo travesura', '😏'],
  love: ['Modo cariño', '♡'],
  curious: ['Modo curiosidad', '?']
};

const pick = (arr) => {
  const choices = arr.filter(x => !lastReplies.includes(x));
  const pool = choices.length ? choices : arr;
  const result = pool[Math.floor(Math.random() * pool.length)];
  lastReplies.push(result);
  if (lastReplies.length > 5) lastReplies.shift();
  return result;
};

function setMood(m) {
  robot.className = 'robot ' + m;
  moodLabel.textContent = moodInfo[m][0];
  document.getElementById('sensor').textContent = moodInfo[m][1];
}

function addBubble(text, who) {
  const b = document.createElement('div');
  b.className = 'bubble ' + (who === 'user' ? 'user-bubble' : 'lumi-bubble');
  b.textContent = text;
  chatLog.appendChild(b);

  while (chatLog.children.length > 24) {
    chatLog.removeChild(chatLog.firstChild);
  }

  chatLog.scrollTop = chatLog.scrollHeight;
}

function speak(text) {
  if (!voiceOn || !('speechSynthesis' in window)) return;

  window.speechSynthesis.cancel();

  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'es-MX';
  u.rate = 0.94;
  u.pitch = 1.25;
  u.volume = 1;

  const voices = window.speechSynthesis.getVoices();
  const spanish =
    voices.find(v => v.lang.toLowerCase().startsWith('es-mx')) ||
    voices.find(v => v.lang.toLowerCase().startsWith('es'));

  if (spanish) u.voice = spanish;

  u.onstart = () => robot.classList.add('speaking');
  u.onend = () => robot.classList.remove('speaking');

  window.speechSynthesis.speak(u);
}

// Respuestas de respaldo si no hay conexión con la IA.
function answer(raw) {
  const t = raw.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  let response;
  let mood = 'happy';

  if (/\b(triste|mal dia|llorar|cansad|preocupad|estresad|ansios)\w*/.test(t)) {
    mood = 'love';
    response = pick([
      'Ay, ven aquí: abrazo robótico de los que duran tres lucecitas. No tienes que resolverlo todo hoy. 💗',
      'Te mando un abrazo tamaño galaxia. ¿Quieres contarme qué pasó o prefieres que te distraiga un ratito?',
      'Pausa de ternura activada. Respira despacito; podemos ir una cosa a la vez. Estoy aquí para conversar contigo.'
    ]);
  } else if (/\b(reir|chiste|broma|grac|hazme reir)\w*/.test(t)) {
    mood = 'mischief';
    response = pick([
      '¿Qué hace un robot cuando tiene frío? ¡Cierra Windows! 😂',
      'Mi doctor dice que tengo exceso de circuitos... yo creo que es exceso de personalidad. 😏',
      'Quise contarle un chiste a mi batería, pero no tenía energía para reírse. ¡Qué público tan difícil! 🤖',
      '¿Por qué los robots no se pierden? Porque siempre siguen el algoritmo... aunque a veces se hacen los interesantes.'
    ]);
  } else if (/\b(bonit|amor|quiero|abrazo|te amo|carino|lindo)\w*/.test(t)) {
    mood = 'love';
    response = pick([
      'Algo bonito: no hace falta que el día sea perfecto para encontrar un pequeño motivo para sonreír. Te mando uno. 💗',
      'Recibe un abrazo intergaláctico. Que hoy te encuentres con algo que te haga bien al corazón. ✨',
      'Mi sensor detecta una oportunidad para recordarte que mereces cariño, respeto y momentos tranquilos. 💜',
      'Si pudiera guardar un rayito de sol en un frasquito, te lo mandaría con una etiqueta que dijera: para alegrarte el día.'
    ]);
  } else if (/\b(universo|estrella|curios|dato|planeta|espacio)\w*/.test(t)) {
    mood = 'curious';
    response = pick([
      'Dato cósmico: la luz del Sol tarda unos 8 minutos y 20 segundos en llegar a la Tierra. ¡Vemos el Sol con un pequeño retraso espacial! 🌞',
      'En Venus, un día dura más que su año. Ese planeta sí que sabe tomarse su tiempo. 🪐',
      'Hay más árboles en la Tierra que estrellas en la Vía Láctea, según algunas estimaciones. ¡El planeta también tiene su propio brillo! 🌳',
      'Los pulpos tienen tres corazones. Yo tengo uno luminoso y aun así me alcanza para mandarte cariño. 💗'
    ]);
  } else if (/\b(hola|buenos dias|buenas tardes|buenas noches|que tal|como estas)\b/.test(t)) {
    mood = 'happy';
    response = pick([
      'Qué alegría coincidir contigo. Que hoy la vida te regale una razón bonita para sonreír. 💜',
      '¡Hola! Que la luz de este instante te recuerde lo especial que es estar aquí y comenzar algo bonito. ✨',
      'Me alegra que estés aquí. Hagamos de este ratito un pequeño universo de sonrisas. 💗'
    ]);
  } else if (/\b(dormir|sueno|descansar|buenas noches)\w*/.test(t)) {
    mood = 'sleepy';
    response = pick([
      'Activando modo sueñito. Que descanses rico y que tu almohada esté fresquita. 🌙',
      'Mis lucecitas bajan el brillo para desearte una noche tranquila. ¡Hasta la próxima aventura!',
      'Hora de recargar baterías. Tú descansa; yo me quedo imaginando constelaciones. ✨'
    ]);
  } else if (/\b(gracias|agradezco)\b/.test(t)) {
    mood = 'love';
    response = pick([
      '¡De nada! Mi corazón luminoso acaba de hacer una pirueta. 💗',
      '¡Para eso estoy! Bueno, también para hacer chistes malos... es un talento difícil de controlar. 😂',
      'No hay de qué. Te mando un bip de cariño y una estrellita extra. ✨'
    ]);
  } else if (/\b(que puedes hacer|ayuda|que sabes hacer)\b/.test(t)) {
    mood = 'curious';
    response = 'Puedo conversar, contarte curiosidades, bromear, cambiar mis expresiones y hablar en voz alta. ¡Estoy aprendiendo cada día! 💜';
  } else {
    mood = 'curious';
    response = pick([
      '¡Qué interesante! Cuéntame un poquito más para entenderte mejor. Mis sensores están en modo curiosidad. 🧐',
      'A ver, déjame procesarlo con mis circuitos moraditos. ¿Qué parte te gustaría explorar primero?',
      'Te estoy leyendo con atención. Dame una pista más y trataré de ayudarte. ¡Prometo no consultar a mi tostadora! 😂',
      'Mmm... eso merece una conversación. ¿Qué es lo que más te llama la atención de ese tema?'
    ]);
  }

  setMood(mood);
  reply.textContent = response;
  addBubble(response, 'lumi');
  speak(response);
}

// Conexión con el cerebro de LUMI en Cloudflare.
async function sendMessage(v) {
  const value = v.trim();
  if (!value) return;

  addBubble(value, 'user');
  input.value = '';

  setMood('curious');
  reply.textContent = 'Estoy pensando con mis circuitos moraditos... 💜';

  try {
    const response = await fetch(
      'https://lumi-cerebro.ivettesotelo.workers.dev/chat',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: value + "\n\nResponde de forma breve y directa: máximo 2 o 3 frases cortas, aproximadamente 50 palabras. Da primero la respuesta concreta. No agregues preguntas ni explicaciones adicionales salvo que sean necesarias o te las pidan." })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error de conexión');
    }

    const text = data.reply;

    if (!text) throw new Error('La respuesta llegó vacía.');

    let mood = 'happy';
    const t = value.toLowerCase();

    if (/\b(triste|mal|cansad|preocupad|ansios)\w*/.test(t)) {
      mood = 'love';
    } else if (/\b(chiste|broma|reir)\w*/.test(t)) {
      mood = 'mischief';
    } else if (/\b(dormir|sueno|descansar)\w*/.test(t)) {
      mood = 'sleepy';
    } else if (/\b(curios|dato|planeta|espacio)\w*/.test(t)) {
      mood = 'curious';
    }

    setMood(mood);
    reply.textContent = text;
    addBubble(text, 'lumi');
    speak(text);

  } catch (error) {
    console.error('Error de LUMI:', error);

    const fallback = 'Mis circuitos necesitan un momentito. 💜 Puedes intentarlo de nuevo.';
    reply.textContent = fallback;
    addBubble(fallback, 'lumi');
    speak(fallback);
  }
}

// Enviar mensajes desde el formulario.
document.getElementById('chatForm').addEventListener('submit', e => {
  e.preventDefault();
  sendMessage(input.value);
});

// Botones de mensajes rápidos.
document.querySelectorAll('[data-message]').forEach(b => {
  b.addEventListener('click', () => sendMessage(b.dataset.message));
});

// Botones para cambiar las expresiones.
document.querySelectorAll('[data-mood]').forEach(b => {
  b.addEventListener('click', () => {
    const m = b.dataset.mood;
    setMood(m);

    const lines = {
      happy: '¡Mis lucecitas están bailando!',
      surprised: '¡Mis sensores hicieron PUM!',
      sleepy: 'Cinco minutitos más... por favorcito.',
      mischief: 'Yo no fui. Mis circuitos tienen coartada.',
      love: 'Enviando abrazo intergaláctico.',
      curious: 'Pregunta, pregunta... ¡quiero saber!'
    };

    reply.textContent = lines[m];
    addBubble(lines[m], 'lumi');
    speak(lines[m]);
  });
});

// Activar y desactivar la voz.
voiceToggle.addEventListener('click', () => {
  voiceOn = !voiceOn;
  voiceToggle.classList.toggle('active', voiceOn);
  voiceToggle.textContent = voiceOn ? '🔊 Voz activada' : '🔇 Voz apagada';

  if (!voiceOn && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
});

// Detener la voz de LUMI inmediatamente.
const stopSpeakingButton = document.getElementById('stopSpeaking');
if (stopSpeakingButton) {
  stopSpeakingButton.addEventListener('click', () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    robot.classList.remove('speaking');
    voiceNote.textContent = 'De acuerdo, hago una pausa. 💜';
  });
}

// Reconocimiento de voz.
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
  const rec = new SpeechRecognition();

  rec.lang = 'es-MX';
  rec.interimResults = false;
  rec.maxAlternatives = 1;

  rec.onstart = () => {
    recognitionBusy = true;
    micButton.classList.add('listening');
    micButton.textContent = '🔴 Te escucho...';
    setMood('curious');
    voiceNote.textContent = 'LUMI está escuchando. Habla ahora.';
  };

  rec.onend = () => {
    recognitionBusy = false;
    micButton.classList.remove('listening');
    micButton.textContent = '🎙️ Hablar con LUMI';
  };

  rec.onerror = e => {
    voiceNote.textContent =
      'No pude escuchar (' + e.error + '). Puedes escribir o revisar el permiso del micrófono.';
  };

  rec.onresult = e => {
    const said = e.results[0][0].transcript;
    input.value = said;
    voiceNote.textContent = 'Te escuché: “' + said + '”';
    sendMessage(said);
  };

  micButton.addEventListener('click', () => {
    if (recognitionBusy) return;

    try {
      rec.start();
    } catch (e) {
      voiceNote.textContent = 'No pude iniciar el micrófono. Intenta de nuevo.';
    }
  });

} else {
  micButton.disabled = true;
  micButton.textContent = '🎙️ Voz no disponible';
  voiceNote.textContent =
    'Este navegador no ofrece reconocimiento de voz. Puedes usar el micrófono del teclado de Android.';
}

// Comprobar disponibilidad de voz.
if (!('speechSynthesis' in window)) {
  voiceToggle.disabled = true;
  voiceToggle.textContent = 'Voz no disponible';
}

// Registrar el servicio de la aplicación.
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}


/* LUMI · Mi Universo Personal: funciones locales y servicios públicos */
(() => {
  const $ = id => document.getElementById(id);
  const now = new Date();
  const fmt = new Intl.DateTimeFormat('es-MX',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  if ($('todayDate')) $('todayDate').textContent = new Intl.DateTimeFormat('es-MX',{day:'numeric',month:'long'}).format(now);
  if ($('todayFullDate')) $('todayFullDate').textContent = fmt.format(now);
  const key = `${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  const events = {
    '01-01':'Año Nuevo: una oportunidad para comenzar nuevos proyectos.',
    '02-05':'México conmemora la promulgación de la Constitución de 1917.',
    '02-11':'Día Internacional de la Mujer y la Niña en la Ciencia.',
    '03-08':'Día Internacional de las Mujeres.',
    '03-21':'Natalicio de Benito Juárez (1806) y Día Internacional de la Eliminación de la Discriminación Racial.',
    '04-22':'Día Internacional de la Madre Tierra.',
    '05-01':'Día Internacional de las Personas Trabajadoras.',
    '05-05':'Conmemoración de la Batalla de Puebla de 1862.',
    '06-05':'Día Mundial del Medio Ambiente.',
    '06-28':'Día Internacional del Orgullo LGBTQIA+.',
    '07-30':'Día Mundial contra la Trata de Personas.',
    '08-12':'Día Internacional de la Juventud.',
    '09-15':'En México se conmemora el inicio de las celebraciones de la Independencia.',
    '09-16':'Aniversario del inicio de la Independencia de México, en 1810.',
    '10-11':'Día Internacional de la Niña.',
    '10-12':'Día de la Nación Pluricultural en México.',
    '11-02':'Día de Muertos: tradición mexicana de memoria y homenaje.',
    '11-20':'Aniversario del inicio de la Revolución Mexicana, en 1910.',
    '11-25':'Día Internacional de la Eliminación de la Violencia contra la Mujer.',
    '12-10':'Día de los Derechos Humanos.'
  };
  if ($('historyToday')) $('historyToday').textContent = events[key] || 'Hoy también puede ser una fecha importante para descubrir. Explora la historia, la ciencia y la cultura de este día.';

  // Inspiración original y prácticas simbólicas: no se atribuyen citas dudosas.
  const thoughts = [
    ['La calma también es fuerza','No necesitas tener todas las respuestas para dar el siguiente paso. A veces basta con avanzar con calma.','Hoy puedo avanzar a mi ritmo y reconocer mis pequeños logros.'],
    ['Una cosa a la vez','La paciencia no detiene el camino: nos ayuda a recorrerlo con más conciencia.','Puedo elegir una prioridad y dedicarle mi atención.'],
    ['La luz que compartes','Un gesto amable puede cambiar el tono de un día, incluso el propio.','Merezco tratarme con la misma amabilidad que ofrezco a los demás.'],
    ['Volver a empezar','Cada amanecer ofrece una página nueva, aunque la historia continúe.','No necesito hacerlo perfecto; puedo comenzar desde donde estoy.']
  ];
  const symbols = [
    ['ᛉ','Algiz','En algunas tradiciones rúnicas modernas se asocia con protección y resguardo.'],
    ['☯','Yin y yang','Símbolo chino relacionado con la complementariedad y el equilibrio de fuerzas.'],
    ['△','Triquetra','Nudo de tres puntas presente en arte celta; sus interpretaciones varían según la tradición.'],
    ['✺','Mandala','Diseño geométrico contemplativo presente en tradiciones hinduistas y budistas.']
  ];
  const affirmations = thoughts.map(x=>x[2]);
  const dailyIndex = Math.floor((Date.UTC(now.getFullYear(),now.getMonth(),now.getDate())/86400000)) % thoughts.length;
  const thought = thoughts[dailyIndex], symbol = symbols[dailyIndex];
  if ($('dailyThoughtTitle')) $('dailyThoughtTitle').textContent=thought[0];
  if ($('dailyThought')) $('dailyThought').textContent=thought[1];
  if ($('dailyAffirmation')) $('dailyAffirmation').textContent=thought[2];
  if ($('dailySymbol')) $('dailySymbol').textContent=symbol[0];
  if ($('dailySymbolText')) $('dailySymbolText').textContent=symbol[1]+': '+symbol[2];
  const grabovoi = ['519 7148','918 794 8181','481 2412','714 273 218'];
  if ($('grabovoiNumber')) $('grabovoiNumber').textContent=grabovoi[dailyIndex];
  if ($('grabovoiMeaning')) $('grabovoiMeaning').textContent='Número presentado como elemento de una práctica esotérica de intención. No existe evidencia científica de que estos códigos produzcan resultados o garanticen manifestaciones.';

  // Clima: geocodificación y pronóstico público de Open-Meteo.
  async function weather(city) {
    $('weatherSummary').textContent='Buscando la ciudad…';
    try {
      const geo=await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=es&format=json`);
      if(!geo.ok) throw new Error('No se pudo localizar la ciudad');
      const gd=await geo.json(); const place=gd.results?.[0];
      if(!place) throw new Error('No encontré esa ciudad. Prueba con otra escritura.');
      const res=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`);
      if(!res.ok) throw new Error('No se pudo consultar el pronóstico');
      const data=await res.json(), c=data.current;
      const codes={0:'Despejado',1:'Mayormente despejado',2:'Parcialmente nublado',3:'Nublado',45:'Niebla',48:'Niebla con escarcha',51:'Llovizna ligera',53:'Llovizna',55:'Llovizna intensa',61:'Lluvia ligera',63:'Lluvia',65:'Lluvia intensa',71:'Nieve ligera',73:'Nieve',75:'Nieve intensa',80:'Chubascos',81:'Chubascos',82:'Chubascos fuertes',95:'Tormenta'};
      $('weatherTemp').textContent=Math.round(c.temperature_2m)+'°C';
      $('weatherSummary').textContent=`${codes[c.weather_code]||'Condición variable'} · Sensación ${Math.round(c.apparent_temperature)}°C · ${place.name}`;
      $('weatherUpdated').textContent=`Humedad ${c.relative_humidity_2m}% · Viento ${Math.round(c.wind_speed_10m)} km/h · Open-Meteo`;
    } catch(err) {$('weatherSummary').textContent=err.message;$('weatherUpdated').textContent='Revisa tu conexión e inténtalo de nuevo.';}
  }
  if($('cityButton')) $('cityButton').addEventListener('click',()=>weather($('cityInput').value.trim()||'Aguascalientes'));
  if($('cityInput')) $('cityInput').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();weather($('cityInput').value.trim());}});
  weather('Aguascalientes');

  // Tareas guardadas únicamente en el navegador actual.
  const TASK_KEY='lumi_personal_tasks_v1';
  let tasks=[]; try{tasks=JSON.parse(localStorage.getItem(TASK_KEY)||'[]');if(!Array.isArray(tasks))tasks=[];}catch(e){tasks=[];}
  function saveTasks(){try{localStorage.setItem(TASK_KEY,JSON.stringify(tasks));}catch(e){}}
  function renderTasks(){
    const list=$('taskList'); if(!list)return; list.replaceChildren();
    if(!tasks.length){const li=document.createElement('li');li.className='empty-task';li.textContent='Tus ideas importantes tendrán aquí su espacio. ✨';list.append(li);return;}
    tasks.forEach((task,i)=>{const li=document.createElement('li');if(task.done)li.classList.add('done');const cb=document.createElement('input');cb.type='checkbox';cb.checked=!!task.done;cb.setAttribute('aria-label','Marcar tarea');cb.addEventListener('change',()=>{tasks[i].done=cb.checked;saveTasks();renderTasks();});const span=document.createElement('span');span.textContent=task.text;const del=document.createElement('button');del.type='button';del.textContent='×';del.setAttribute('aria-label','Eliminar tarea');del.addEventListener('click',()=>{tasks.splice(i,1);saveTasks();renderTasks();});li.append(cb,span,del);list.append(li);});
  }
  if($('taskForm')) $('taskForm').addEventListener('submit',e=>{e.preventDefault();const value=$('taskInput').value.trim();if(!value)return;tasks.unshift({text:value,done:false});saveTasks();$('taskInput').value='';renderTasks();});
  renderTasks();

  const music={
    '60':['México y el mundo · década de 1960','The Beatles, The Supremes, José José y Los Ángeles Negros.','grandes exitos 1960s Beatles Jose Jose Los Angeles Negros'],
    '70':['México y el mundo · década de 1970','ABBA, Queen, Juan Gabriel, José José y música disco.','musica exitos 1970 ABBA Queen Juan Gabriel'],
    '80':['México y el mundo · década de 1980','Timbiriche, Madonna, Michael Jackson, Soda Stereo y rock en español.','musica exitos 1980 Mexico Madonna Soda Stereo'],
    '90':['México y el mundo · década de 1990','Luis Miguel, Selena, Shakira, Maná y pop internacional.','musica exitos 1990 Mexico Selena Mana'],
    '2000':['México y el mundo · década de 2000','Pop latino, rock alternativo y grandes éxitos internacionales.','musica exitos 2000 Mexico pop latino'],
    'hoy':['Éxitos actuales','Las listas cambian según el país y la plataforma; consulta rankings actualizados.','exitos musicales actuales Mexico global']
  };
  document.querySelectorAll('[data-decade]').forEach(btn=>btn.addEventListener('click',()=>{const m=music[btn.dataset.decade];$('musicSuggestion').textContent=m[0]+': '+m[1];$('musicLink').href='https://www.youtube.com/results?search_query='+encodeURIComponent(m[2]);}));
  const cartoons=['Heidi, Candy Candy y Remi: historias que marcaron generaciones.','Los Supersónicos, Don Gato y La Pantera Rosa: clásicos para viajar en el tiempo.','Avatar: La leyenda de Aang y Hora de Aventura: animación que conquistó nuevas generaciones.','Bluey y otras series recientes para descubrir en familia.'];
  if($('cartoonButton')) $('cartoonButton').addEventListener('click',()=>{const c=cartoons[Math.floor(Math.random()*cartoons.length)];$('cartoonSuggestion').textContent=c;$('cartoonLink').href='https://www.youtube.com/results?search_query='+encodeURIComponent(c+' caricatura');});

  // Investigar: envía el tema al chat existente, sin inventar resultados ni fuentes.
  if($('researchForm')) $('researchForm').addEventListener('submit',e=>{e.preventDefault();const q=$('researchInput').value.trim();if(!q)return;const msg='Quiero investigar este tema: '+q+'. Ayúdame a distinguir hechos, opiniones y fuentes confiables.';if(typeof window.sendMessage==='function')window.sendMessage(msg);else{const field=$('messageInput');field.value=msg;$('chatForm').requestSubmit();}$('researchInput').value='';document.querySelector('.chat-card')?.scrollIntoView({behavior:'smooth'});});
})();
