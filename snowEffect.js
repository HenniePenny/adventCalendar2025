// Respect reduced motion — if enabled, do nothing.
const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
if (mediaQuery && mediaQuery.matches) {
  console.log("Reduced motion enabled; Snow animation disabled.");
} else {
  // ✅ Run on ALL viewports (mobile included)
  initSnowCanvas();
}

function initSnowCanvas() {
  const canvas = document.getElementById("snowCanvas");
  if (!canvas) {
    console.warn("snowCanvas not found in DOM.");
    return;
  }

  const ctx = canvas.getContext("2d");

  // ---- HiDPI/retina scaling for crisp flakes ----
  const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
  function resize() {
    // Set the CSS size (already handled by your CSS) and the internal pixel buffer
    const cssW = window.innerWidth;
    const cssH = window.innerHeight;
    canvas.width = cssW * dpr;
    canvas.height = cssH * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // scale drawing to CSS pixels
  }
  resize();

  // ---- Mobile-friendly flake count ----
  const cssWidth = () => window.innerWidth;
  const maxFlakes =
    cssWidth() < 360 ? 20 :
    cssWidth() < 600 ? 28 :
    cssWidth() < 900 ? 40 : 56; // scale up on larger screens

  const snowflakeColor = "rgba(255, 255, 255, 0.9)";
  const flakes = [];

  function createFlake(width, height) {
    const size = Math.random() * 3 + 2;         // 2–5px
    const speed = Math.random() * 0.8 + 0.4;    // 0.4–1.2 px/frame
    const drift = (Math.random() - 0.5) * 0.6;  // -0.3 to 0.3
    return {
      x: Math.random() * width,
      y: Math.random() * -height, // start above viewport
      size, speed, drift
    };
  }

  function repopulate() {
    flakes.length = 0;
    for (let i = 0; i < maxFlakes; i++) {
      flakes.push(createFlake(window.innerWidth, window.innerHeight));
    }
  }
  repopulate();

  // Optional: pause when tab is hidden to save battery
  let running = true;
  document.addEventListener("visibilitychange", () => {
    running = !document.hidden;
    if (running) requestAnimationFrame(animate);
  });

  function animate() {
    if (!running) return;

    const w = window.innerWidth;
    const h = window.innerHeight;

    // clear in CSS pixel space thanks to setTransform above
    ctx.clearRect(0, 0, w, h);

    for (let i = 0; i < flakes.length; i++) {
      const f = flakes[i];
      f.y += f.speed;
      f.x += f.drift;

      // wrap horizontally a bit to keep flakes on screen
      if (f.x < -10) f.x = w + 10;
      if (f.x > w + 10) f.x = -10;

      if (f.y > h) {
        // recycle to the top
        flakes[i] = createFlake(w, h);
        flakes[i].y = -5;
      }

      ctx.beginPath();
      ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
      ctx.fillStyle = snowflakeColor;
      ctx.fill();
    }

    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);

  // Keep canvas correct on resize / orientation change
  window.addEventListener("resize", () => {
    resize();
    repopulate();
  });
}