/**
 * Floating Cartoon Doodle Background Engine
 * Hand-drawn cartoon doodles floating gently in the background:
 * Rockets, Robots, UFOs, Retro Gameboys, Code Tags, Coffee Mugs, Planets, AI Sparkles, and more.
 */

(function () {
  const canvas = document.getElementById('floating-doodles-bg');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Check reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let width = 0;
  let height = 0;
  let dpr = 1;
  let lastScrollY = window.scrollY || window.pageYOffset || 0;
  let scrollDelta = 0;

  // Dynamic Theme Colors for Doodles
  let activeDoodleColor = '#0f766e';
  let activeDoodleAlpha = 0.22;

  function updateDoodleColors() {
    try {
      const style = getComputedStyle(document.documentElement);
      const col = style.getPropertyValue('--doodle-color').trim();
      const alpha = parseFloat(style.getPropertyValue('--doodle-alpha'));
      if (col) activeDoodleColor = col;
      if (!isNaN(alpha)) activeDoodleAlpha = alpha;
    } catch (e) {
      // Fallback
    }
  }

  window.addEventListener('portfolio:themechange', function (e) {
    if (e.detail) {
      if (e.detail.doodleColor) activeDoodleColor = e.detail.doodleColor;
      if (typeof e.detail.doodleAlpha === 'number') activeDoodleAlpha = e.detail.doodleAlpha;
    } else {
      updateDoodleColors();
    }
  });

  updateDoodleColors();

  // Track window size and retina scaling
  let lastWidth = window.innerWidth;
  let lastHeight = window.innerHeight;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.right = '0';
    canvas.style.bottom = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '0';
    canvas.style.display = 'block';
  }

  // Doodle drawing functions (all clean outlines, zero black fills)
  const drawFunctions = {
    // 1. Cute Cartoon Rocket
    rocket: function (ctx) {
      // Fuselage
      ctx.beginPath();
      ctx.moveTo(0, -28);
      ctx.bezierCurveTo(14, -18, 16, 12, 12, 22);
      ctx.lineTo(-12, 22);
      ctx.bezierCurveTo(-16, 12, -14, -18, 0, -28);
      ctx.stroke();

      // Porthole Window
      ctx.beginPath();
      ctx.arc(0, -4, 6, 0, Math.PI * 2);
      ctx.stroke();

      // Left Fin
      ctx.beginPath();
      ctx.moveTo(-11, 10);
      ctx.quadraticCurveTo(-24, 14, -22, 26);
      ctx.quadraticCurveTo(-15, 24, -11, 22);
      ctx.stroke();

      // Right Fin
      ctx.beginPath();
      ctx.moveTo(11, 10);
      ctx.quadraticCurveTo(24, 14, 22, 26);
      ctx.quadraticCurveTo(15, 24, 11, 22);
      ctx.stroke();

      // Flame exhaust
      ctx.beginPath();
      ctx.moveTo(-7, 23);
      ctx.quadraticCurveTo(-10, 32, 0, 36);
      ctx.quadraticCurveTo(10, 32, 7, 23);
      ctx.stroke();
    },

    // 2. Cute Cartoon Robot Head
    robot: function (ctx) {
      // Head rounded rect
      ctx.beginPath();
      roundRectPath(ctx, -20, -16, 40, 34, 8);
      ctx.stroke();

      // Antenna
      ctx.beginPath();
      ctx.moveTo(0, -16);
      ctx.lineTo(0, -26);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, -28, 3.5, 0, Math.PI * 2);
      ctx.stroke();

      // Eyes (circles)
      ctx.beginPath();
      ctx.arc(-8, -3, 3.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(8, -3, 3.5, 0, Math.PI * 2);
      ctx.stroke();

      // Smile
      ctx.beginPath();
      ctx.arc(0, 4, 7, 0.2, Math.PI - 0.2);
      ctx.stroke();

      // Ear bolts
      ctx.beginPath();
      ctx.rect(-24, -6, 4, 10);
      ctx.rect(20, -6, 4, 10);
      ctx.stroke();
    },

    // 3. Cute Cartoon UFO / Flying Saucer
    ufo: function (ctx) {
      // Saucer rim
      ctx.beginPath();
      ctx.ellipse(0, 4, 26, 9, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Glass cockpit dome
      ctx.beginPath();
      ctx.arc(0, 0, 14, Math.PI, 0);
      ctx.stroke();

      // Little Alien eyes inside dome
      ctx.beginPath();
      ctx.arc(-4, -4, 2.5, 0, Math.PI * 2);
      ctx.arc(4, -4, 2.5, 0, Math.PI * 2);
      ctx.stroke();

      // Under-lights
      ctx.beginPath();
      ctx.arc(-14, 6, 2, 0, Math.PI * 2);
      ctx.arc(0, 8, 2, 0, Math.PI * 2);
      ctx.arc(14, 6, 2, 0, Math.PI * 2);
      ctx.stroke();

      // Beam ticks
      ctx.beginPath();
      ctx.moveTo(-10, 16);
      ctx.lineTo(-14, 25);
      ctx.moveTo(0, 16);
      ctx.lineTo(0, 26);
      ctx.moveTo(10, 16);
      ctx.lineTo(14, 25);
      ctx.stroke();
    },

    // 4. Retro Gameboy / Handheld Console
    gameboy: function (ctx) {
      // Body
      ctx.beginPath();
      roundRectPath(ctx, -15, -24, 30, 48, 6);
      ctx.stroke();

      // Screen
      ctx.beginPath();
      roundRectPath(ctx, -10, -18, 20, 16, 3);
      ctx.stroke();

      // D-Pad +
      ctx.beginPath();
      ctx.moveTo(-7, 7);
      ctx.lineTo(-3, 7);
      ctx.lineTo(-3, 3);
      ctx.lineTo(1, 3);
      ctx.lineTo(1, 7);
      ctx.lineTo(5, 7);
      ctx.lineTo(5, 11);
      ctx.lineTo(1, 11);
      ctx.lineTo(1, 15);
      ctx.lineTo(-3, 15);
      ctx.lineTo(-3, 11);
      ctx.lineTo(-7, 11);
      ctx.closePath();
      ctx.stroke();

      // A/B buttons
      ctx.beginPath();
      ctx.arc(7, 6, 2.5, 0, Math.PI * 2);
      ctx.arc(10, 11, 2.5, 0, Math.PI * 2);
      ctx.stroke();
    },

    // 5. Code Brackets < / >
    codeTag: function (ctx) {
      // <
      ctx.beginPath();
      ctx.moveTo(-12, -14);
      ctx.lineTo(-24, 0);
      ctx.lineTo(-12, 14);
      ctx.stroke();

      // Slash /
      ctx.beginPath();
      ctx.moveTo(-4, 18);
      ctx.lineTo(4, -18);
      ctx.stroke();

      // >
      ctx.beginPath();
      ctx.moveTo(12, -14);
      ctx.lineTo(24, 0);
      ctx.lineTo(12, 14);
      ctx.stroke();
    },

    // 6. Cartoon Coffee Mug
    coffee: function (ctx) {
      // Cup
      ctx.beginPath();
      roundRectPath(ctx, -14, -8, 28, 26, 5);
      ctx.stroke();

      // Handle
      ctx.beginPath();
      ctx.arc(14, 5, 8, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();

      // Steam curls
      ctx.beginPath();
      ctx.moveTo(-6, -12);
      ctx.quadraticCurveTo(-10, -18, -6, -24);
      ctx.moveTo(0, -12);
      ctx.quadraticCurveTo(4, -18, 0, -25);
      ctx.moveTo(6, -12);
      ctx.quadraticCurveTo(2, -18, 6, -24);
      ctx.stroke();
    },

    // 7. Cartoon Lightbulb
    lightbulb: function (ctx) {
      // Glass Bulb
      ctx.beginPath();
      ctx.arc(0, -8, 14, 0.6, Math.PI - 0.6, true);
      ctx.quadraticCurveTo(-7, 10, -7, 15);
      ctx.lineTo(7, 15);
      ctx.quadraticCurveTo(7, 10, 11.5, 0);
      ctx.stroke();

      // Screw base
      ctx.beginPath();
      ctx.moveTo(-6, 17);
      ctx.lineTo(6, 17);
      ctx.moveTo(-4, 21);
      ctx.lineTo(4, 21);
      ctx.stroke();

      // Filament
      ctx.beginPath();
      ctx.moveTo(-4, 6);
      ctx.lineTo(-4, -4);
      ctx.quadraticCurveTo(0, -9, 4, -4);
      ctx.lineTo(4, 6);
      ctx.stroke();

      // Radiating idea sparks
      ctx.beginPath();
      ctx.moveTo(0, -26);
      ctx.lineTo(0, -32);
      ctx.moveTo(-18, -20);
      ctx.lineTo(-24, -24);
      ctx.moveTo(18, -20);
      ctx.lineTo(24, -24);
      ctx.stroke();
    },

    // 8. Saturn Planet with Ring
    planet: function (ctx) {
      // Sphere
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.stroke();

      // Tilted Ring
      ctx.beginPath();
      ctx.ellipse(0, 0, 28, 9, -0.4, 0, Math.PI * 2);
      ctx.stroke();

      // Tiny moon
      ctx.beginPath();
      ctx.arc(28, -14, 2.5, 0, Math.PI * 2);
      ctx.stroke();
    },

    // 9. Cute Cartoon Cloud
    cloud: function (ctx) {
      ctx.beginPath();
      ctx.moveTo(-18, 6);
      ctx.bezierCurveTo(-26, 6, -26, -6, -16, -6);
      ctx.bezierCurveTo(-14, -18, 4, -18, 8, -6);
      ctx.bezierCurveTo(18, -6, 24, 0, 20, 8);
      ctx.bezierCurveTo(18, 14, -10, 14, -18, 6);
      ctx.stroke();

      // Little rain sprinkles
      ctx.beginPath();
      ctx.moveTo(-10, 18);
      ctx.lineTo(-12, 24);
      ctx.moveTo(2, 18);
      ctx.lineTo(0, 24);
      ctx.moveTo(12, 18);
      ctx.lineTo(10, 24);
      ctx.stroke();
    },

    // 10. Cartoon Laptop / Terminal
    laptop: function (ctx) {
      // Screen
      ctx.beginPath();
      roundRectPath(ctx, -18, -18, 36, 24, 4);
      ctx.stroke();

      // Prompt >_
      ctx.beginPath();
      ctx.moveTo(-12, -9);
      ctx.lineTo(-7, -5);
      ctx.lineTo(-12, -1);
      ctx.moveTo(-4, -1);
      ctx.lineTo(3, -1);
      ctx.stroke();

      // Keyboard base
      ctx.beginPath();
      ctx.moveTo(-24, 8);
      ctx.lineTo(24, 8);
      ctx.lineTo(20, 14);
      ctx.lineTo(-20, 14);
      ctx.closePath();
      ctx.stroke();
    },

    // 11. AI Neural Sparkle / Diamond Star
    aiSparkle: function (ctx) {
      // Big 4-point curved star
      ctx.beginPath();
      ctx.moveTo(0, -22);
      ctx.quadraticCurveTo(0, 0, 22, 0);
      ctx.quadraticCurveTo(0, 0, 0, 22);
      ctx.quadraticCurveTo(0, 0, -22, 0);
      ctx.quadraticCurveTo(0, 0, 0, -22);
      ctx.closePath();
      ctx.stroke();

      // Companion mini star
      ctx.beginPath();
      ctx.arc(18, -16, 2.5, 0, Math.PI * 2);
      ctx.arc(-16, 16, 2, 0, Math.PI * 2);
      ctx.stroke();
    },

    // 12. Microchip / CPU
    microchip: function (ctx) {
      // Chip Body
      ctx.beginPath();
      roundRectPath(ctx, -14, -14, 28, 28, 4);
      ctx.stroke();

      // Center Core
      ctx.beginPath();
      roundRectPath(ctx, -7, -7, 14, 14, 2);
      ctx.stroke();

      // Pins on 4 sides
      ctx.beginPath();
      // Top pins
      ctx.moveTo(-8, -14); ctx.lineTo(-8, -20);
      ctx.moveTo(0, -14); ctx.lineTo(0, -20);
      ctx.moveTo(8, -14); ctx.lineTo(8, -20);
      // Bottom pins
      ctx.moveTo(-8, 14); ctx.lineTo(-8, 20);
      ctx.moveTo(0, 14); ctx.lineTo(0, 20);
      ctx.moveTo(8, 14); ctx.lineTo(8, 20);
      // Left pins
      ctx.moveTo(-14, -8); ctx.lineTo(-20, -8);
      ctx.moveTo(-14, 0); ctx.lineTo(-20, 0);
      ctx.moveTo(-14, 8); ctx.lineTo(-20, 8);
      // Right pins
      ctx.moveTo(14, -8); ctx.lineTo(20, -8);
      ctx.moveTo(14, 0); ctx.lineTo(20, 0);
      ctx.moveTo(14, 8); ctx.lineTo(20, 8);
      ctx.stroke();
    },

    // 13. Curly Braces { ; }
    curlyBraces: function (ctx) {
      // Left brace {
      ctx.beginPath();
      ctx.moveTo(-10, -18);
      ctx.quadraticCurveTo(-16, -18, -16, -8);
      ctx.quadraticCurveTo(-16, 0, -22, 0);
      ctx.quadraticCurveTo(-16, 0, -16, 8);
      ctx.quadraticCurveTo(-16, 18, -10, 18);
      ctx.stroke();

      // Semicolon ;
      ctx.beginPath();
      ctx.arc(2, -4, 2.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(2, 6, 2.5, 0, Math.PI * 2);
      ctx.moveTo(2, 8);
      ctx.quadraticCurveTo(0, 14, -3, 16);
      ctx.stroke();

      // Right brace }
      ctx.beginPath();
      ctx.moveTo(14, -18);
      ctx.quadraticCurveTo(20, -18, 20, -8);
      ctx.quadraticCurveTo(20, 0, 26, 0);
      ctx.quadraticCurveTo(20, 0, 20, 8);
      ctx.quadraticCurveTo(20, 18, 14, 18);
      ctx.stroke();
    },

    // 14. Retro Floppy Diskette
    floppy: function (ctx) {
      // Disk outline with corner notch
      ctx.beginPath();
      ctx.moveTo(-16, -18);
      ctx.lineTo(12, -18);
      ctx.lineTo(16, -14);
      ctx.lineTo(16, 18);
      ctx.lineTo(-16, 18);
      ctx.closePath();
      ctx.stroke();

      // Metal shutter slider
      ctx.beginPath();
      roundRectPath(ctx, -10, -18, 18, 12, 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.rect(-6, -15, 4, 7);
      ctx.stroke();

      // Label box
      ctx.beginPath();
      roundRectPath(ctx, -11, -2, 22, 16, 2);
      ctx.stroke();
    },

    // 15. Mechanical Gear
    gear: function (ctx) {
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.stroke();

      // 6 teeth
      for (let i = 0; i < 6; i++) {
        const rad = (i * Math.PI) / 3;
        ctx.save();
        ctx.rotate(rad);
        ctx.beginPath();
        roundRectPath(ctx, -3.5, -18, 7, 7, 2);
        ctx.stroke();
        ctx.restore();
      }
    },

    // 16. Git Branch Nodes
    gitBranch: function (ctx) {
      // Main trunk line
      ctx.beginPath();
      ctx.moveTo(-10, -20);
      ctx.lineTo(-10, 20);
      ctx.stroke();

      // Branch curve
      ctx.beginPath();
      ctx.moveTo(-10, 6);
      ctx.bezierCurveTo(2, 6, 12, -4, 12, -16);
      ctx.stroke();

      // 3 Commit nodes
      ctx.beginPath();
      ctx.arc(-10, -14, 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(-10, 14, 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(12, -16, 4, 0, Math.PI * 2);
      ctx.stroke();
    },

    // 17. Cartoon Terminal / Console Window
    terminal: function (ctx) {
      // Window frame
      ctx.beginPath();
      roundRectPath(ctx, -18, -16, 36, 32, 4);
      ctx.stroke();

      // Title bar divider
      ctx.beginPath();
      ctx.moveTo(-18, -7);
      ctx.lineTo(18, -7);
      ctx.stroke();

      // 3 Title bar window dots
      ctx.beginPath();
      ctx.arc(-12, -11.5, 1.8, 0, Math.PI * 2);
      ctx.arc(-7, -11.5, 1.8, 0, Math.PI * 2);
      ctx.arc(-2, -11.5, 1.8, 0, Math.PI * 2);
      ctx.stroke();

      // Command prompt >_
      ctx.beginPath();
      ctx.moveTo(-12, 0);
      ctx.lineTo(-7, 4);
      ctx.lineTo(-12, 8);
      ctx.moveTo(-4, 8);
      ctx.lineTo(4, 8);
      ctx.stroke();
    },

    // 18. Quantum Atom / React Architecture
    atom: function (ctx) {
      // Center nucleus
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.stroke();

      // 3 orbital rings
      for (let i = 0; i < 3; i++) {
        ctx.save();
        ctx.rotate((i * Math.PI) / 3);
        ctx.beginPath();
        ctx.ellipse(0, 0, 24, 8, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    },

    // 19. Stacked Database Cylinder
    database: function (ctx) {
      // Top disc
      ctx.beginPath();
      ctx.ellipse(0, -14, 16, 6, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Middle tier curve & walls
      ctx.beginPath();
      ctx.moveTo(-16, -14);
      ctx.lineTo(-16, 0);
      ctx.ellipse(0, 0, 16, 6, 0, Math.PI, 0, true);
      ctx.lineTo(16, -14);
      ctx.stroke();

      // Bottom tier curve & walls
      ctx.beginPath();
      ctx.moveTo(-16, 0);
      ctx.lineTo(-16, 14);
      ctx.ellipse(0, 14, 16, 6, 0, Math.PI, 0, true);
      ctx.lineTo(16, 0);
      ctx.stroke();

      // Activity LED indicators
      ctx.beginPath();
      ctx.arc(6, -2, 1.5, 0, Math.PI * 2);
      ctx.arc(6, 12, 1.5, 0, Math.PI * 2);
      ctx.stroke();
    },

    // 20. Orbiting Space Satellite
    satellite: function (ctx) {
      // Central body
      ctx.beginPath();
      roundRectPath(ctx, -8, -8, 16, 16, 3);
      ctx.stroke();

      // Left solar panel wing
      ctx.beginPath();
      ctx.moveTo(-8, 0);
      ctx.lineTo(-13, 0);
      roundRectPath(ctx, -25, -9, 12, 18, 2);
      ctx.moveTo(-19, -9);
      ctx.lineTo(-19, 9);
      ctx.stroke();

      // Right solar panel wing
      ctx.beginPath();
      ctx.moveTo(8, 0);
      ctx.lineTo(13, 0);
      roundRectPath(ctx, 13, -9, 12, 18, 2);
      ctx.moveTo(19, -9);
      ctx.lineTo(19, 9);
      ctx.stroke();

      // Dish antenna
      ctx.beginPath();
      ctx.moveTo(0, -8);
      ctx.lineTo(0, -14);
      ctx.arc(0, -17, 6, 0.2, Math.PI - 0.2, true);
      ctx.moveTo(0, -17);
      ctx.lineTo(0, -22);
      ctx.stroke();
    },

    // 21. Friendly Debugging Bug / Beetle
    codeBug: function (ctx) {
      // Bug oval body
      ctx.beginPath();
      ctx.ellipse(0, 2, 12, 14, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Head
      ctx.beginPath();
      ctx.arc(0, -11, 7, Math.PI, 0);
      ctx.stroke();

      // Eyes
      ctx.beginPath();
      ctx.arc(-3, -12, 1.5, 0, Math.PI * 2);
      ctx.arc(3, -12, 1.5, 0, Math.PI * 2);
      ctx.stroke();

      // Center shell seam
      ctx.beginPath();
      ctx.moveTo(0, -4);
      ctx.lineTo(0, 16);
      ctx.stroke();

      // Antenna
      ctx.beginPath();
      ctx.moveTo(-4, -17);
      ctx.quadraticCurveTo(-9, -23, -11, -22);
      ctx.moveTo(4, -17);
      ctx.quadraticCurveTo(9, -23, 11, -22);
      ctx.stroke();

      // 6 curved legs
      ctx.beginPath();
      // Left legs
      ctx.moveTo(-11, -4); ctx.lineTo(-19, -8);
      ctx.moveTo(-12, 3);  ctx.lineTo(-21, 3);
      ctx.moveTo(-11, 10); ctx.lineTo(-19, 14);
      // Right legs
      ctx.moveTo(11, -4);  ctx.lineTo(19, -8);
      ctx.moveTo(12, 3);   ctx.lineTo(21, 3);
      ctx.moveTo(11, 10);  ctx.lineTo(19, 14);
      ctx.stroke();
    }
  };

  // Helper for rounded rectangles in canvas
  function roundRectPath(ctx, x, y, width, height, radius) {
    radius = Math.min(radius, width / 2, height / 2);
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  const typesList = Object.keys(drawFunctions);

  // Initialize scattered floating doodle instances with responsive dispersion
  let doodles = [];

  function initDoodles() {
    doodles = [];
    const area = width * height;
    
    // Balanced target density:
    // Mobile (~375x800): 14 doodles
    // Tablet (~768x1024): 20 doodles
    // Laptop / Desktop (~1440x900): 26 doodles
    // Ultra-wide / 4K (~2560x1440): up to 32 doodles
    const targetCount = Math.max(14, Math.min(32, Math.round(area / 62000)));

    const aspect = width / height;
    const cols = Math.max(3, Math.round(Math.sqrt(targetCount * aspect)));
    const rows = Math.max(3, Math.ceil(targetCount / cols));
    const cellW = width / cols;
    const cellH = height / rows;

    // Shuffle types to ensure maximum visual variety across the canvas
    const shuffledTypes = [...typesList].sort(() => Math.random() - 0.5);
    let typeIdx = 0;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (doodles.length >= targetCount) break;

        const type = shuffledTypes[typeIdx % shuffledTypes.length];
        typeIdx++;

        // Anchor coordinate in center of this cell
        const baseX = (c + 0.5) * cellW;
        const baseY = (r + 0.5) * cellH;

        // Controlled random offset from cell center (up to 40% of cell size)
        const initOffsetX = (Math.random() - 0.5) * (cellW * 0.4);
        const initOffsetY = (Math.random() - 0.5) * (cellH * 0.4);

        doodles.push({
          type: type,
          baseX: baseX + initOffsetX,
          baseY: baseY + initOffsetY,
          // Floating offset & mutual repulsion variables
          floatX: 0,
          floatY: 0,
          repelX: 0,
          repelY: 0,
          // Organic drift frequencies and amplitudes
          freqX: 0.0006 + Math.random() * 0.0006,
          freqY: 0.0005 + Math.random() * 0.0006,
          ampX: 16 + Math.random() * 20,
          ampY: 14 + Math.random() * 18,
          phaseX: Math.random() * Math.PI * 2,
          phaseY: Math.random() * Math.PI * 2,
          // Slow aesthetic rotation
          angle: (Math.random() - 0.5) * 0.4,
          vAngle: (Math.random() - 0.5) * 0.002,
          scale: 0.82 + Math.random() * 0.28,
          // Individual subtle parallax rate so they move in depth
          parallaxRate: 0.025 + Math.random() * 0.035
        });
      }
    }
  }

  // Handle scroll parallax smoothly (clamped to >= 0 so mobile pull-down/rubber-banding NEVER jerks doodles)
  let currentScrollY = Math.max(0, window.scrollY || window.pageYOffset || 0);
  window.addEventListener('scroll', () => {
    currentScrollY = Math.max(0, window.scrollY || window.pageYOffset || 0);
  }, { passive: true });

  // Main animation render loop
  let animationId = null;

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.scale(dpr, dpr);

    // Dynamic Monochromatic Brand Styling matching active theme stage
    ctx.strokeStyle = activeDoodleColor;
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = activeDoodleAlpha;

    const time = Date.now();

    // 1. Calculate soft mutual repulsion to guarantee doodles NEVER huddle or cluster
    const minDist = Math.min(145, Math.min(width, height) / 3.8);
    const minDistSq = minDist * minDist;

    for (let i = 0; i < doodles.length; i++) {
      const d1 = doodles[i];
      // Organic multi-harmonic floating
      d1.floatX = Math.sin(time * d1.freqX + d1.phaseX) * d1.ampX;
      d1.floatY = Math.cos(time * d1.freqY + d1.phaseY) * d1.ampY;
      d1.angle += d1.vAngle;

      for (let j = i + 1; j < doodles.length; j++) {
        const d2 = doodles[j];
        const x1 = d1.baseX + d1.floatX + d1.repelX;
        const y1 = d1.baseY + d1.floatY + d1.repelY;
        const x2 = d2.baseX + d2.floatX + d2.repelX;
        const y2 = d2.baseY + d2.floatY + d2.repelY;

        const dx = x1 - x2;
        const dy = y1 - y2;
        const distSq = dx * dx + dy * dy;

        if (distSq < minDistSq && distSq > 0.001) {
          const dist = Math.sqrt(distSq);
          const force = ((minDist - dist) / minDist) * 0.45;
          const nx = (dx / dist) * force;
          const ny = (dy / dist) * force;
          d1.repelX += nx;
          d1.repelY += ny;
          d2.repelX -= nx;
          d2.repelY -= ny;
        }
      }

      // Smoothly decay repulsion toward equilibrium
      d1.repelX *= 0.94;
      d1.repelY *= 0.94;
    }

    // 2. Render each doodle at its uniformly dispersed position + wrapped parallax
    const wrapHeight = height + 160;

    for (let i = 0; i < doodles.length; i++) {
      const d = doodles[i];

      if (!prefersReducedMotion) {
        // Individual parallax offset based on scroll position (always safe >= 0)
        const safeScrollY = Math.max(0, currentScrollY);
        const parallaxY = -(safeScrollY * d.parallaxRate);

        // Compute position wrapped cleanly around viewport so each doodle cycles smoothly and independently
        const posX = d.baseX + d.floatX + d.repelX;
        let posY = (d.baseY + d.floatY + d.repelY + parallaxY) % wrapHeight;
        if (posY < -80) posY += wrapHeight;

        ctx.save();
        ctx.translate(posX, posY);
        ctx.rotate(d.angle);
        ctx.scale(d.scale, d.scale);

        if (drawFunctions[d.type]) {
          drawFunctions[d.type](ctx);
        }

        ctx.restore();
      } else {
        // Reduced motion
        ctx.save();
        ctx.translate(d.baseX, d.baseY);
        ctx.rotate(d.angle);
        ctx.scale(d.scale, d.scale);

        if (drawFunctions[d.type]) {
          drawFunctions[d.type](ctx);
        }

        ctx.restore();
      }
    }

    ctx.restore();

    animationId = requestAnimationFrame(animate);
  }

  // Mobile-safe resize listener:
  // Mobile browsers fire 'resize' whenever address bar shrinks/expands or pull-to-refresh occurs.
  // We ONLY re-initialize doodles when WIDTH changes significantly (e.g. orientation flip).
  // Pulling down or minor toolbar height shifts NEVER re-randomize or disturb existing doodles!
  let resizeDebounceTimer = null;
  window.addEventListener('resize', () => {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;

    resize();

    if (Math.abs(newWidth - lastWidth) > 50) {
      lastWidth = newWidth;
      lastHeight = newHeight;
      clearTimeout(resizeDebounceTimer);
      resizeDebounceTimer = setTimeout(() => {
        initDoodles();
      }, 200);
    } else {
      // Just keep height updated without interrupting floating doodles
      lastHeight = newHeight;
    }
  }, { passive: true });

  // Start engine
  resize();
  initDoodles();
  animate();
})();
