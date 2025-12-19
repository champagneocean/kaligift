const tapsToOpen = 5;

let taps = 0;
let opened = false;

const page = document.getElementById("page");
const giftBtn = document.getElementById("giftBtn");
const tapMsg = document.getElementById("tapMsg");
const barFill = document.getElementById("barFill");
const count = document.getElementById("count");
const cracks = Array.from(document.querySelectorAll(".crack"));

const preOpen = document.getElementById("preOpen");
const openSection = document.getElementById("open");
const resetBtn = document.getElementById("resetBtn");

// Mensajes por toque:
// 1 y 2 “normales”
// 3 y 4 distintos (como pediste)
// 5 abre
const tapMessages = {
  0: "toque la pantalla pa ver pues ✨",
  1: "mmm mas duro 🙂",
  2: "otra otra 👀 tan tan tan",
  3: "yo no se quien le dio permiso a los hombres de dar regalos, toque otra vez 🙂",
  4: "uy yo creo que ya lo va a dañar tara tara raaaan"
};

function playPop(){
  try{
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();
    const t0 = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(260, t0);
    osc.frequency.exponentialRampToValueAtTime(90, t0 + 0.10);

    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(0.34, t0 + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.18);

    // noise burst
    const bufferSize = ctx.sampleRate * 0.12;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for(let i=0;i<bufferSize;i++){ data[i] = (Math.random()*2-1) * (1 - i/bufferSize); }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.0001, t0);
    noiseGain.gain.exponentialRampToValueAtTime(0.20, t0 + 0.01);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.12);

    osc.connect(gain).connect(ctx.destination);
    noise.connect(noiseGain).connect(ctx.destination);

    osc.start(t0);
    noise.start(t0);
    osc.stop(t0 + 0.20);
    noise.stop(t0 + 0.13);

    setTimeout(()=>ctx.close(), 450);
  }catch(e){}
}

function updateCracks(){
  // Solo aparecen desde el toque 3 y 4 (con thresholds en el SVG)
  cracks.forEach((p)=>{
    const th = Number(p.dataset.th); // 2,3,4...
    const on = taps >= th && !opened;
    p.classList.toggle("on", on);

    // Intensidad (grosor) según toque: 1..5
    const w = 1.6 + (Math.min(taps, tapsToOpen) * 0.25);
    p.style.strokeWidth = w + "px";
    p.style.opacity = on ? Math.min(0.95, 0.35 + taps*0.12) : 0;
  });
}

function updateUI(){
  const pct = Math.min(100, Math.round((taps / tapsToOpen) * 100));
  barFill.style.width = pct + "%";
  count.textContent = `${Math.min(taps, tapsToOpen)}/${tapsToOpen}`;

  tapMsg.textContent = tapMessages[taps] || tapMessages[0];
  updateCracks();
}

function openGift(){
    opened = true;
  
    // abre la tapa + sonido
    page.classList.add("opened");
    page.classList.add("opening");
    playPop();
    if (navigator.vibrate) navigator.vibrate([18, 28, 14]);
  
    // muestra la boleta después de la animación del regalo
    setTimeout(() => {
        preOpen.style.display = "none";
        openSection.style.display = "block";
  
      // Forzar reflow para que el transition se aplique (evita "corte")
      void openSection.offsetHeight;
  
      // ya no necesitamos el estado opening
      page.classList.remove("opening");
    }, 800);
  }

function tap(){
  if (opened) return;

  taps++;

  giftBtn.classList.remove("shake");
  void giftBtn.offsetWidth; // reset animation
  giftBtn.classList.add("shake");

  if (navigator.vibrate) navigator.vibrate(8);

  if (taps >= tapsToOpen) {
    updateUI();
    openGift();
    return;
  }

  updateUI();
}

giftBtn.addEventListener("click", tap);
giftBtn.addEventListener("keydown", (e)=>{
  if(e.key === "Enter" || e.key === " "){
    e.preventDefault();
    tap();
  }
});

resetBtn.addEventListener("click", ()=>{
  opened = false;
  taps = 0;
  page.classList.remove("opened");
  cracks.forEach(c=>c.classList.remove("on"));
  openSection.hidden = true;
  preOpen.hidden = false;
  updateUI();
});



updateUI();
