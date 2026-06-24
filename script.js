/* ===== THE WOLVES BARBER — script.js ===== */
const WA_NUMBER = '573227418794';
const WA_LINK = `https://wa.me/${WA_NUMBER}`;

const SERVICES = [
  { id:1,  name:"Corte Clásico",     desc:"Corte tradicional con acabado impecable, perfilado de nuca y orejas.",    price:25000, cat:"Cortes",    dur:30, img:"images/corte-clasico.jpg" },
  { id:2,  name:"Corte Moderno",     desc:"Estilo contemporáneo con textura y volumen definido.",                     price:28000, cat:"Cortes",    dur:35, img:"images/corte-moderno.jpg" },
  { id:3,  name:"Fade Bajo",         desc:"Degradado suave desde la nuca con transición gradual.",                    price:30000, cat:"Cortes",    dur:40, img:"images/fade-bajo.jpg" },
  { id:4,  name:"Fade Medio",        desc:"Degradado a media cabeza con contraste elegante.",                        price:30000, cat:"Cortes",    dur:40, img:"images/fade-medio.jpg" },
  { id:5,  name:"Fade Alto",         desc:"Degradado pronunciado desde la sien con efecto dramático.",                price:32000, cat:"Cortes",    dur:40, img:"images/fade-alto.jpg" },
  { id:6,  name:"Texturizado",       desc:"Técnica de tijera para cabello con movimiento y textura natural.",         price:35000, cat:"Cortes",    dur:45, img:"images/texturizado.jpg" },
  { id:7,  name:"Degradado Clásico", desc:"Degradado suave al estilo clásico de barbería.",                          price:28000, cat:"Cortes",    dur:35, img:"images/deg-clasico.jpg" },
  { id:8,  name:"Arreglo de Barba",  desc:"Perfilado y definición de barba con navaja y tijera.",                    price:15000, cat:"Barba",     dur:20, img:"images/arreglo-barba.jpg" },
  { id:9,  name:"Afeitado Clásico",  desc:"Afeitado completo con navaja, toalla caliente y productos premium.",       price:20000, cat:"Barba",     dur:30, img:"images/afeitado-clasico.jpg" },
  { id:10, name:"Diseño de Barba",   desc:"Diseño artístico de barba con líneas precisas y acabado de lujo.",        price:22000, cat:"Barba",     dur:30, img:"images/diseno-barba.jpg" },
  { id:11, name:"Combo Clásico",     desc:"Corte Clásico + Arreglo de Barba. El pack completo del caballero.",       price:35000, cat:"Combos",   dur:50, img:"images/combo-clasico.jpg" },
  { id:12, name:"Combo Premium",     desc:"Fade Alto + Diseño de Barba. Para el que no acepta mediocridad.",         price:45000, cat:"Combos",   dur:60, img:"images/combo-premium.jpg" },
  { id:13, name:"Corte Niño",        desc:"Corte especial para niños menores de 12 años.",                           price:20000, cat:"Especiales",dur:25, img:"images/corte-nino.jpg" },
  { id:14, name:"Tratamiento Capilar",desc:"Hidratación y nutrición profunda del cuero cabelludo.",                  price:18000, cat:"Especiales",dur:20, img:"images/tratamiento-capilar.jpg" },
];

const BARBERS = [
  { name:"Leonardo Márquez", spec:"Especialista en Fades y Degradados" },
  { name:"Albeiro Quiroga",  spec:"Master en Cortes Clásicos y Barba" },
  { name:"Johan Rivera",     spec:"Experto en Diseños y Texturizados" },
  { name:"Carlos Penagos",   spec:"Especialista en Cortes Modernos" },
];

const SEED_REVIEWS = [
  { id:1, name:"Carlos Mendoza", rating:5, comment:"El mejor corte que me han hecho en años. Leonardo es un artista con la tijera. Definitivamente mi barbería de confianza.", date:"2024-05-10" },
  { id:2, name:"Andrés Ruiz",    rating:5, comment:"Fui por el Combo Premium y quedé impresionado. Albeiro maneja la navaja con una precisión increíble. Volveré pronto.",    date:"2024-05-15" },
  { id:3, name:"Felipe Torres",  rating:4, comment:"Muy buen servicio, el ambiente es brutal. El Fade Alto que me hizo Johan quedó perfecto.",                              date:"2024-05-20" },
  { id:4, name:"Miguel Sánchez", rating:5, comment:"The Wolves Barber es otra liga. Desde que entras sabes que es un sitio diferente. El trato y el resultado son premium.", date:"2024-05-22" },
  { id:5, name:"David García",   rating:5, comment:"Llevé a mi hijo y quedamos los dos encantados. Carlos Penagos hizo un trabajo excelente. Ya somos clientes fijos.",      date:"2024-05-28" },
];

// ── HELPERS ────────────────────────────────────────
function formatCOP(n) {
  return '$' + new Intl.NumberFormat('es-CO').format(n);
}

function stars(rating, size) {
  return Array.from({length:5}, (_,i) =>
    `<span class="star ${i < rating ? 'filled':''}" style="font-size:${size||1}rem">★</span>`
  ).join('');
}

function showToast(msg, type) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = 'show ' + (type||'');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.className = '', 3000);
}

function getReviews() {
  try { return JSON.parse(localStorage.getItem('wolves_reviews') || 'null') || SEED_REVIEWS; }
  catch(e) { return SEED_REVIEWS; }
}

function saveReviews(r) {
  localStorage.setItem('wolves_reviews', JSON.stringify(r));
}

function getAppointments() {
  try { return JSON.parse(localStorage.getItem('wolves_appointments') || '[]'); }
  catch(e) { return []; }
}

function saveAppointments(a) {
  localStorage.setItem('wolves_appointments', JSON.stringify(a));
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

// ── AUTH HELPERS ────────────────────────────────────
function getUsers() {
  try { return JSON.parse(localStorage.getItem('wolves_users') || '[]'); }
  catch(e) { return []; }
}

function saveUsers(u) {
  localStorage.setItem('wolves_users', JSON.stringify(u));
}

function getCurrentUser() {
  try { return JSON.parse(sessionStorage.getItem('wolves_session') || 'null'); }
  catch(e) { return null; }
}

function requireAuth() {
  if (!getCurrentUser()) {
    window.location.href = 'auth.html';
  }
}

function logout() {
  sessionStorage.removeItem('wolves_session');
  window.location.href = 'auth.html';
}

// ── NAVBAR ─────────────────────────────────────────
function initNavbar() {
  const nav = document.querySelector('nav');
  if (!nav) return;

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  const ham = document.getElementById('hamburger');
  const mob = document.getElementById('mobile-menu');
  if (ham && mob) {
    ham.addEventListener('click', () => mob.classList.toggle('open'));
  }

  const page = location.pathname.split('/').pop().replace('.html','') || 'index';
  document.querySelectorAll('[data-page]').forEach(el => {
    if (el.dataset.page === page) el.classList.add('active');
  });

  const user = getCurrentUser();
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn && user) {
    logoutBtn.style.display = 'inline-flex';
    logoutBtn.addEventListener('click', logout);
  }
}

// ── REVEAL ANIMATIONS ──────────────────────────────
function initReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

// ── LOCAL CHATBOT ───────────────────────────────────
const BOT_KNOWLEDGE = {
  greetings: ['hola','buenos días','buenas tardes','buenas noches','hey','saludos','qué tal','buenas'],
  prices: ['precio','precios','costo','costos','cuánto','cuanto','vale','valor','tarifa','tarifas'],
  schedule: ['horario','horarios','hora','horas','abierto','abren','cierran','cuando','cuándo','atienden','atención'],
  services: ['servicio','servicios','corte','cortes','fade','barba','texturizado','degradado','afeitado','combo','niño','capilar'],
  barbers: ['barbero','barberos','quien','quién','trabaja','equipo','staff','leonardo','albeiro','johan','carlos'],
  booking: ['reservar','reserva','cita','agendar','agenda','turno','appointment'],
  location: ['dónde','donde','ubicación','ubicacion','dirección','direccion','bogotá','bogota','local'],
  contact: ['contactar','contacto','hablar','comunicar','dueño','dueño','administrador','admin','humano','persona','asesor','whatsapp','numero'],
  thanks: ['gracias','thank','genial','perfecto','excelente','ok','listo'],
  bye: ['adiós','adios','bye','hasta luego','chao','chau','nos vemos'],
};

function detectIntent(msg) {
  const m = msg.toLowerCase();
  for (const [intent, keywords] of Object.entries(BOT_KNOWLEDGE)) {
    if (keywords.some(k => m.includes(k))) return intent;
  }
  return 'unknown';
}

function getBotReply(msg) {
  const intent = detectIntent(msg);
  const waBtn = `<a href="${WA_LINK}" target="_blank">📲 Escribir al WhatsApp</a>`;

  switch(intent) {
    case 'greetings':
      return '¡Hola! Bienvenido a The Wolves Barber 🐺 ¿En qué te puedo ayudar? Puedo contarte sobre nuestros servicios, precios, horarios o barberos.';

    case 'prices':
      return `Nuestros precios son:\n\n✂️ <b>Cortes:</b> Clásico $25.000 | Moderno $28.000 | Fade Bajo/Medio $30.000 | Fade Alto $32.000 | Texturizado $35.000 | Degradado Clásico $28.000\n\n🪒 <b>Barba:</b> Arreglo $15.000 | Afeitado Clásico $20.000 | Diseño de Barba $22.000\n\n🎁 <b>Combos:</b> Combo Clásico $35.000 | Combo Premium $45.000\n\n⭐ <b>Especiales:</b> Corte Niño $20.000 | Tratamiento Capilar $18.000`;

    case 'schedule':
      return '🕒 Nuestro horario de atención es:\n\n📅 Lunes a Sábado: 9:00 am – 8:00 pm\n📅 Domingos: 10:00 am – 5:00 pm\n\nTe esperamos en The Wolves Barber.';

    case 'services':
      return '✂️ Ofrecemos 14 servicios premium:\n\n• Cortes: Clásico, Moderno, Fade Bajo, Fade Medio, Fade Alto, Texturizado, Degradado Clásico\n• Barba: Arreglo, Afeitado Clásico, Diseño de Barba\n• Combos: Clásico y Premium\n• Especiales: Corte Niño y Tratamiento Capilar\n\nPuedes ver todos en la página de Servicios.';

    case 'barbers':
      return '👨‍💈 Nuestro equipo de maestros barberos:\n\n🐺 Leonardo Márquez — Especialista en Fades y Degradados\n🌑 Albeiro Quiroga — Master en Cortes Clásicos y Barba\n⚔️ Johan Rivera — Experto en Diseños y Texturizados\n💈 Carlos Penagos — Especialista en Cortes Modernos';

    case 'booking':
      return '📅 Para reservar tu cita, ve a la sección de <b>Reservas</b> en el menú. Elige tu servicio, barbero, fecha y hora. ¡Es muy fácil y rápido! También puedes escribirnos directamente: ' + waBtn;

    case 'location':
      return '📍 Estamos ubicados en Bogotá, Colombia. Para la dirección exacta o más información, contáctanos directamente: ' + waBtn;

    case 'contact':
      return `¿Quieres hablar con nuestro equipo? ¡Escríbenos ahora mismo por WhatsApp y te atendemos de inmediato! 👇\n\n${waBtn}`;

    case 'thanks':
      return '¡Con gusto! 🐺 Si tienes más preguntas, aquí estoy. ¡Que disfrutes tu corte!';

    case 'bye':
      return '¡Hasta pronto! 🐺 Te esperamos en The Wolves Barber. ¡Cuídate!';

    default:
      return `No estoy seguro de entender tu pregunta. Puedo ayudarte con:\n\n• 💰 Precios de servicios\n• 🕒 Horarios de atención\n• ✂️ Servicios disponibles\n• 👨‍💈 Nuestros barberos\n• 📅 Cómo reservar\n\nO si prefieres hablar con alguien de nuestro equipo: ${waBtn}`;
  }
}

// ── CHAT WIDGET ────────────────────────────────────
function initChat() {
  const toggle = document.getElementById('chat-toggle');
  const panel  = document.getElementById('chat-panel');
  const closeBtn = document.getElementById('chat-close');
  const input  = document.getElementById('chat-input');
  const send   = document.getElementById('chat-send');
  const msgs   = document.getElementById('chat-messages');
  if (!toggle || !panel) return;

  toggle.addEventListener('click', () => panel.classList.toggle('open'));
  if (closeBtn) closeBtn.addEventListener('click', () => panel.classList.remove('open'));

  function appendMsg(html, role) {
    const div = document.createElement('div');
    div.className = 'chat-msg ' + role;
    div.innerHTML = html;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
    return div;
  }

  function sendMsg(text) {
    if (!text.trim()) return;
    appendMsg(text, 'user');
    if (input) input.value = '';

    setTimeout(() => {
      const reply = getBotReply(text);
      appendMsg(reply.replace(/\n/g, '<br>'), 'bot');
    }, 400);
  }

  if (send) send.addEventListener('click', () => sendMsg(input?.value || ''));
  if (input) input.addEventListener('keydown', e => { if(e.key==='Enter') sendMsg(input.value); });

  document.querySelectorAll('.chat-quick-btn').forEach(btn => {
    btn.addEventListener('click', () => sendMsg(btn.textContent));
  });
}

// ── INIT ALL ────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initReveal();
  initChat();
});
