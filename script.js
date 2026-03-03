// ---------------- SOUND (Web Audio) ----------------
let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

function beep(freq = 800, duration = 0.08) {
  const ctx = getAudioCtx();

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "square";        // digital feel
  osc.frequency.value = freq;

  // smooth volume envelope
  const t = ctx.currentTime;
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.18, t + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(t);
  osc.stop(t + duration);
}

// ---------------- DIGIT SEGMENTS ----------------
const segments = {
  a: document.querySelector(".a"),
  b: document.querySelector(".b"),
  c: document.querySelector(".c"),
  d: document.querySelector(".d"),
  e: document.querySelector(".e"),
  f: document.querySelector(".f"),
  g: document.querySelector(".g"),
};

function clearDigit() {
  for (let key in segments) {
    segments[key].classList.remove("on");
  }
}

const map = {
  0: ["a", "b", "c", "d", "e", "f"],
  1: ["b", "c"],
  2: ["a", "b", "g", "e", "d"],
  3: ["a", "b", "g", "c", "d"],
  4: ["f", "g", "b", "c"],
  5: ["a", "f", "g", "c", "d"],
  6: ["a", "f", "e", "d", "c", "g"],
  7: ["a", "b", "c"],
  8: ["a", "b", "c", "d", "e", "f", "g"],
  9: ["a", "b", "c", "d", "f", "g"],
};

function showNumber(num) {
  clearDigit();
  map[num].forEach((seg) => segments[seg].classList.add("on"));
}

// ---------------- PULSE ANIMATION ----------------
const digitEl = document.getElementById("digit");

function pulse() {
  digitEl.classList.remove("pulse"); // restart animation
  void digitEl.offsetWidth;          // force reflow
  digitEl.classList.add("pulse");
}

// ---------------- COUNTER BUTTONS ----------------
let count = 0;
showNumber(count);

const incBtn = document.getElementById("inc");
const decBtn = document.getElementById("dec");
const resetBtn = document.getElementById("reset");

incBtn.addEventListener("click", () => {
  getAudioCtx().resume();   // helps in browsers that block audio until user gesture
  count = (count + 1) % 10;
  showNumber(count);
  beep(900);                // higher for +
  pulse();
});

decBtn.addEventListener("click", () => {
  getAudioCtx().resume();
  count = (count - 1 + 10) % 10;
  showNumber(count);
  beep(650);                // lower for -
  pulse();
});

resetBtn.addEventListener("click", () => {
  getAudioCtx().resume();
  count = 0;
  showNumber(count);
  beep(750);
  pulse();
});