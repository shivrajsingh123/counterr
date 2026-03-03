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

  osc.type = "square";
  osc.frequency.value = freq;

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
  for (let k in segments) segments[k].classList.remove("on");
}

const numberMap = {
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
  numberMap[num].forEach((seg) => segments[seg].classList.add("on"));
}

// ---------------- ANIMATIONS: Pulse + Scan + Flip ----------------
const digitEl = document.getElementById("digit");
const screenEl = document.querySelector(".screen");

function pulse() {
  digitEl.classList.remove("pulse");
  void digitEl.offsetWidth;
  digitEl.classList.add("pulse");
}

function scanFlip() {
  // scanline
  screenEl.classList.remove("scan");
  void screenEl.offsetWidth;
  screenEl.classList.add("scan");

  // flip tick
  digitEl.classList.remove("flip");
  void digitEl.offsetWidth;
  digitEl.classList.add("flip");
}

function feedback(freq) {
  // helpful for browsers that block audio until click
  getAudioCtx().resume();
  scanFlip();
  pulse();
  beep(freq);
}

// ---------------- GF MODE: N E H A (7-seg approximation) ----------------
// Note: true "N" is not really possible on 7-seg, so this is a stylized "n".
const letters = {
  N: ["c", "e", "g"],                 // stylized "n"
  E: ["a", "f", "g", "e", "d"],
  H: ["f", "g", "b", "c", "e"],       // H-ish
  A: ["a", "b", "c", "e", "f", "g"],
};

function showSegments(list) {
  clearDigit();
  list.forEach((seg) => segments[seg].classList.add("on"));
}

let gfOn = false;
let gfInterval = null;

function startGFMode() {
  const seq = ["N", "E", "H", "A"];
  let i = 0;

  showSegments(letters[seq[i]]);
  feedback(1050);

  gfInterval = setInterval(() => {
    i = (i + 1) % seq.length;
    showSegments(letters[seq[i]]);
    feedback(850);
  }, 450);
}

function stopGFMode() {
  gfOn = false;
  clearInterval(gfInterval);
  gfInterval = null;
}

// ---------------- COUNTER BUTTONS ----------------
let count = 0;
showNumber(count);

const incBtn = document.getElementById("inc");
const decBtn = document.getElementById("dec");
const resetBtn = document.getElementById("reset");
const gfBtn = document.getElementById("gf");

incBtn.addEventListener("click", () => {
  if (gfOn) stopGFMode();

  count = (count + 1) % 10;
  showNumber(count);
  feedback(900);
});

decBtn.addEventListener("click", () => {
  if (gfOn) stopGFMode();

  count = (count - 1 + 10) % 10;
  showNumber(count);
  feedback(650);
});

resetBtn.addEventListener("click", () => {
  if (gfOn) stopGFMode();

  count = 0;
  showNumber(count);
  feedback(750);
});

gfBtn.addEventListener("click", () => {
  getAudioCtx().resume();

  if (!gfOn) {
    gfOn = true;
    startGFMode();
  } else {
    stopGFMode();
    showNumber(count);
    feedback(750);
  }
});