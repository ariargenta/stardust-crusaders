/* ---------- Constants & helpers ---------- */
const T_SUN = 5777; // K
const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
const lerp = (a,b,t) => a + (b - a)*t;

/* Map slider 0..100 to log range [1e-4, 1e6] */
function sliderToLum(v01) {
    const logMin = Math.log10(1e-4), logMax = Math.log10(1e6);
    const x = lerp(logMin, logMax, v01);

    return Math.pow(10, x);
}

/* Spectral class by temperature (rough, educational) */
function spectralClass(T) {
    if (T >= 30000) return "O";
    if (T >= 10000) return "B";
    if (T >= 7500) return "A";
    if (T >= 6000) return "F";
    if (T >= 5200) return "G";
    if (T >= 3700) return "K";

    return "M";
}

/* Radius from L,T in solar units */
function radiusRsun(L, T) {
    return Math.sqrt(L)*Math.pow(T_SUN/T, 2);
}

/* MS mass estimate (L≈M^3.5) */
function massMsun(L, alpha = 3.5) {
    return Math.pow(L, 1/alpha);
}

/* HR normalized position (u rightwards cool, v upwards bright) */
function hrUV(T, L) {
    const Tmin = 2500, Tmax = 40000, Lmin = 1e-4, Lmax = 1e6;
    const u = (Math.log10(Tmax) - Math.log10(T))/(Math.log10(Tmax) - Math.log10(Tmin));
    const v = (Math.log10(L) - Math.log10(Lmin))/(Math.log10(Lmax) - Math.log10(Lmin));

    return {u: clamp(u,0,1), v: clamp(v,0,1)};
}

/* ---------- DOM ---------- */
const tempEl = document.getElementById('temp');
const lumEl  = document.getElementById('lum');
const stageEl= document.getElementById('stage');
const massKV = document.getElementById('massKV');
const radiusKV = document.getElementById('radiusKV');
const classKV = document.getElementById('classKV');
const scaleBadge = document.getElementById('scaleBadge');
const starfield = document.getElementById('starfield');
const hrCanvas = document.getElementById('hrCanvas');
const ctx = hrCanvas.getContext('2d');

/* ---------- Render HR mini-plot ---------- */
function drawHR(T, L) {
    const w = hrCanvas.width, h = hrCanvas.height;

    ctx.clearRect(0,0,w,h);

    // grid
    ctx.strokeStyle = "#eee";
    ctx.lineWidth = 1;

    for (let i = 1; i < 4; i++) { // vertical
        const x = i*w/4;

        ctx.beginPath();
        ctx.moveTo(x,0);
        ctx.lineTo(x,h);
        ctx.stroke();
    }

    for (let i = 1; i < 4; i++) { // horizontal
        const y = i*h/4;

        ctx.beginPath();
        ctx.moveTo(0,y);
        ctx.lineTo(w,y);
        ctx.stroke();
    }

    // axes labels (minimal)
    ctx.fillStyle = "#666";
    ctx.font = "12px system-ui";
    ctx.fillText("Temp → (cooler)", w - 120, h - 8);
    ctx.save();
    ctx.translate(10,16);
    ctx.rotate(-Math.PI/2);
    ctx.fillText("Lum ↑", 0,0);
    ctx.restore();

    // position
    const {u,v} = hrUV(T,L);
    const x = u*w;
    const y = (1 - v)*h;

    ctx.fillStyle="#111";
    ctx.beginPath();
    ctx.arc(x,y,5,0,Math.PI*2);
    ctx.fill();
}

/* ---------- Update everything ---------- */
function update() {
    const T = parseFloat(tempEl.value);
    const L = sliderToLum((parseFloat(lumEl.value))/100);

    const R = radiusRsun(L, T); // in R_sun
    const M = massMsun(L);

    // Update telemetry
    massKV.textContent = M.toFixed(2);
    radiusKV.textContent = R.toFixed(2);
    classKV.textContent = spectralClass(T);

    // Scale badge (1 px ≡ X R_sun), with X = R / r_px
    const rpx = parseFloat(getComputedStyle(document.documentElement)
        .getPropertyValue('--main-star-rpx'))
        || 260;

    const X = R/rpx;

    scaleBadge.textContent = `1 px ≡ ${X.toPrecision(3)} R☉`;

    // Procedural metric scaling: proportional to R (normalized)
    // Clamp so rings don't disappear or get too dense
    const metricScale = 0.6 + Math.min(3.0, Math.max(0.3, R/5));

    document.documentElement.style.setProperty('--metric-scale', metricScale.toString());

    // HR mini-plot
    drawHR(T, L);
}

/* ---------- Wire events ---------- */
[tempEl, lumEl, stageEl].forEach(el => el.addEventListener('input', update));

document.getElementById('resetBtn').addEventListener('click', () => {
    tempEl.value = 5777;
    lumEl.value = 50; // ≈ 1 Lsun mid
    stageEl.value = "Main Sequence";

    update();
});

document.addEventListener('DOMContentLoaded', () => {
    const NS = "http://www.w3.org/2000/svg";
    const g = document.getElementById('rings');

    g.innerHTML = '';

    for(let r = 50; r <= 1000; r += 50) {
        const c = document.createElementNS(NS, 'circle');

        c.setAttribute('cx', '0');
        c.setAttribute('cy', '0');
        c.setAttribute('r', String(r));
        g.appendChild(c);
    }
});

document.getElementById('snapBtn').addEventListener('click', () => {
    // Placeholder: you can wire your real catalog matcher here
    document.getElementById('nearestName').textContent = "Sirius A (demo)";
});

update(); // First paint