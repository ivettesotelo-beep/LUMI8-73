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
        body: JSON.stringify({ message: value })
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
