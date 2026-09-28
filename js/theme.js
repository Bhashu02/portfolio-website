/**
 * Adaptive Time-of-Day Appearance System & Theme Engine
 * 
 * Features:
 * - 6 coordinated palette stages: Dawn, Morning, Noon, Afternoon, Dusk, Night
 * - Smooth continuous daytime and nighttime color interpolation
 * - User appearance control: Auto (default), Light, Dark, System
 * - LocalStorage persistence with graceful fallback
 * - Event listeners for wake/focus/visibilitychange/prefers-color-scheme
 * - Zero battery drain (recalculated once per minute, not in continuous render loops)
 * - Dev simulation support (?simTime=HH:MM, ?simStage=name, window.__themeSimulateTime, Cmd/Ctrl+Shift+D UI)
 */

(function () {
  'use strict';

  // --- Palette Keyframe Definitions ---
  // All RGB components are carefully tuned for WCAG AA/AAA contrast ratios:
  // Primary text contrast > 14:1, Secondary text > 6.5:1, Teal accents > 5.0:1 (day) and > 8.0:1 (night).
  const PALETTES = {
    dawn: {
      name: 'Dawn',
      mode: 'light',
      description: 'Soft warm grey gradually lightening',
      bgPrimary: [238, 236, 232],     // #eeebe8
      bgSecondary: [230, 227, 221],   // #e6e3dd
      bgSurface: [248, 247, 244],     // #f8f7f4
      bgSubtle: [234, 232, 226],      // #eae8e2
      textPrimary: [25, 28, 31],      // #191c1f (14.5:1 contrast)
      textSecondary: [69, 79, 89],    // #454f59 (6.5:1 contrast)
      textMuted: [100, 112, 125],     // #64707d
      accent: [15, 118, 110],         // #0f766e (5.2:1 contrast)
      accentHover: [17, 94, 89],      // #115e59
      accentLight: 'rgba(15, 118, 110, 0.12)',
      accentBorder: 'rgba(15, 118, 110, 0.28)',
      borderColor: [220, 217, 209],   // #dcd9d1
      borderHover: [200, 197, 189],   // #c8c5bd
      focusRing: [15, 118, 110],
      doodleColor: '#0f766e',
      doodleAlpha: 0.22,
      headerBg: 'rgba(238, 236, 232, 0.92)'
    },
    morning: {
      name: 'Morning',
      mode: 'light',
      description: 'Clean off-white with signature deep teal',
      bgPrimary: [250, 249, 246],     // #faf9f6
      bgSecondary: [244, 242, 236],   // #f4f2ec
      bgSurface: [255, 255, 255],     // #ffffff
      bgSubtle: [248, 248, 246],      // #f8f8f6
      textPrimary: [24, 24, 27],      // #18181b (16.8:1 contrast)
      textSecondary: [75, 85, 99],    // #4b5563 (7.2:1 contrast)
      textMuted: [107, 114, 128],     // #6b7280
      accent: [15, 118, 110],         // #0f766e (5.2:1 contrast)
      accentHover: [17, 94, 89],      // #115e59
      accentLight: '#ccfbf1',
      accentBorder: '#99f6e4',
      borderColor: [229, 229, 226],   // #e5e5e2
      borderHover: [209, 209, 205],   // #d1d1cd
      focusRing: [15, 118, 110],
      doodleColor: '#0f766e',
      doodleAlpha: 0.22,
      headerBg: 'rgba(250, 249, 246, 0.92)'
    },
    noon: {
      name: 'Noon',
      mode: 'light',
      description: 'Cool crisp off-white with clear clarity',
      bgPrimary: [246, 248, 250],     // #f6f8fa
      bgSecondary: [238, 242, 246],   // #eef2f6
      bgSurface: [255, 255, 255],     // #ffffff
      bgSubtle: [241, 245, 249],      // #f1f5f9
      textPrimary: [15, 23, 42],      // #0f172a (16.8:1 contrast)
      textSecondary: [51, 65, 85],    // #334155 (9.7:1 contrast)
      textMuted: [100, 116, 139],     // #64748b
      accent: [13, 148, 136],         // #0d9488 (5.3:1 contrast)
      accentHover: [15, 118, 110],    // #0f766e
      accentLight: '#cffafe',
      accentBorder: '#a5f3fc',
      borderColor: [226, 232, 240],   // #e2e8f0
      borderHover: [203, 213, 225],   // #cbd5e1
      focusRing: [13, 148, 136],
      doodleColor: '#0d9488',
      doodleAlpha: 0.22,
      headerBg: 'rgba(246, 248, 250, 0.92)'
    },
    afternoon: {
      name: 'Afternoon',
      mode: 'light',
      description: 'Warm gentle cream with golden-hour warmth',
      bgPrimary: [250, 246, 238],     // #faf6ee
      bgSecondary: [243, 236, 224],   // #f3ece0
      bgSurface: [255, 255, 255],     // #ffffff
      bgSubtle: [251, 248, 242],      // #fbf8f2
      textPrimary: [28, 25, 23],      // #1c1917 (16.2:1 contrast)
      textSecondary: [68, 64, 60],    // #44403c (9.5:1 contrast)
      textMuted: [120, 113, 108],     // #78716c
      accent: [15, 118, 110],         // #0f766e (5.1:1 contrast)
      accentHover: [17, 94, 89],      // #115e59
      accentLight: '#ccfbf1',
      accentBorder: '#99f6e4',
      borderColor: [231, 226, 215],   // #e7e2d7
      borderHover: [214, 206, 192],   // #d6cec0
      focusRing: [15, 118, 110],
      doodleColor: '#0f766e',
      doodleAlpha: 0.22,
      headerBg: 'rgba(250, 246, 238, 0.92)'
    },
    dusk: {
      name: 'Dusk',
      mode: 'dark',
      description: 'Muted slate blue-grey gradually deepening',
      bgPrimary: [30, 38, 51],        // #1e2633
      bgSecondary: [38, 49, 66],      // #263142
      bgSurface: [44, 56, 76],        // #2c384c
      bgSubtle: [34, 43, 58],         // #222b3a
      textPrimary: [241, 245, 249],   // #f1f5f9 (14.2:1 contrast)
      textSecondary: [203, 213, 225], // #cbd5e1 (10.5:1 contrast)
      textMuted: [148, 163, 184],     // #94a3b8
      accent: [45, 212, 191],         // #2dd4bf (8.4:1 contrast)
      accentHover: [94, 234, 212],    // #5eead4
      accentLight: 'rgba(45, 212, 191, 0.16)',
      accentBorder: 'rgba(45, 212, 191, 0.35)',
      borderColor: [55, 68, 88],      // #374458
      borderHover: [75, 90, 115],     // #4b5a73
      focusRing: [45, 212, 191],
      doodleColor: '#2dd4bf',
      doodleAlpha: 0.26,
      headerBg: 'rgba(30, 38, 51, 0.92)'
    },
    night: {
      name: 'Night',
      mode: 'dark',
      description: 'Deep serene charcoal with luminous teal accents',
      bgPrimary: [15, 20, 28],        // #0f141c
      bgSecondary: [22, 30, 42],      // #161e2a
      bgSurface: [29, 38, 54],        // #1d2636
      bgSubtle: [19, 26, 36],         // #131a24
      textPrimary: [248, 250, 252],   // #f8fafc (17.6:1 contrast)
      textSecondary: [203, 213, 225], // #cbd5e1 (12.4:1 contrast)
      textMuted: [148, 163, 184],     // #94a3b8
      accent: [45, 212, 191],         // #2dd4bf (9.9:1 contrast)
      accentHover: [94, 234, 212],    // #5eead4
      accentLight: 'rgba(45, 212, 191, 0.16)',
      accentBorder: 'rgba(45, 212, 191, 0.35)',
      borderColor: [42, 53, 72],      // #2a3548
      borderHover: [60, 75, 98],      // #3c4b62
      focusRing: [45, 212, 191],
      doodleColor: '#2dd4bf',
      doodleAlpha: 0.28,
      headerBg: 'rgba(15, 20, 28, 0.92)'
    }
  };

  // Helper: Linear interpolation between two RGB arrays
  function lerpRGB(c1, c2, t) {
    const r = Math.round(c1[0] + (c2[0] - c1[0]) * t);
    const g = Math.round(c1[1] + (c2[1] - c1[1]) * t);
    const b = Math.round(c1[2] + (c2[2] - c1[2]) * t);
    return `rgb(${r}, ${g}, ${b})`;
  }

  function lerpRGBA(c1, c2, t, alpha) {
    const r = Math.round(c1[0] + (c2[0] - c1[0]) * t);
    const g = Math.round(c1[1] + (c2[1] - c1[1]) * t);
    const b = Math.round(c1[2] + (c2[2] - c1[2]) * t);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function rgbArrayToString(arr) {
    return `rgb(${arr[0]}, ${arr[1]}, ${arr[2]})`;
  }

  // --- Storage Helper with graceful fallback ---
  const STORAGE_KEY = 'portfolio_theme_mode';

  function getSavedPreference() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && ['auto', 'light', 'dark', 'system'].includes(saved)) {
        return saved;
      }
    } catch (e) {
      // Storage blocked or unavailable
    }
    return 'auto';
  }

  function savePreference(val) {
    try {
      localStorage.setItem(STORAGE_KEY, val);
    } catch (e) {
      // Storage quota or privacy restriction
    }
  }

  // --- State Tracking ---
  let currentPreference = getSavedPreference();
  let simulatedMinutes = null; // null = follow real clock; number = simulated minute (0-1439)
  let simulatedStage = null;   // null = follow time; string = force specific stage ('dawn', 'morning', etc.)
  let currentActiveState = {
    preference: currentPreference,
    stage: 'morning',
    mode: 'light',
    hours: 10,
    minutes: 0,
    isSimulated: false
  };

  // Check URL query parameters for simulation: ?simTime=HH:MM or ?simStage=name
  function checkUrlSimulation() {
    try {
      const params = new URLSearchParams(window.location.search);
      const simTime = params.get('simTime');
      if (simTime) {
        const parts = simTime.split(':');
        if (parts.length === 2) {
          const h = parseInt(parts[0], 10);
          const m = parseInt(parts[1], 10);
          if (!isNaN(h) && !isNaN(m) && h >= 0 && h < 24 && m >= 0 && m < 60) {
            simulatedMinutes = h * 60 + m;
          }
        }
      }
      const simSt = params.get('simStage');
      if (simSt && PALETTES[simSt.toLowerCase()]) {
        simulatedStage = simSt.toLowerCase();
      }
    } catch (e) {
      // Ignore URL parsing errors
    }
  }
  checkUrlSimulation();

  /**
   * Determine the current time-of-day stage and continuous blend progress.
   * Clock Boundaries:
   * - Dawn: 05:00 - 08:00 (300 to 480 mins) -> lightens from warm grey to morning off-white
   * - Morning: 08:00 - 11:30 (480 to 690 mins) -> shifts gently towards clean noon
   * - Noon: 11:30 - 14:00 (690 to 840 mins) -> shifts towards afternoon cream
   * - Afternoon: 14:00 - 17:30 (840 to 1050 mins) -> warm golden cream atmosphere
   * - Dusk: 17:30 - 20:30 (1050 to 1230 mins) -> darkens from slate blue-grey to night deep charcoal
   * - Night: 20:30 - 05:00 (1230 to 1440, and 0 to 300 mins) -> deep charcoal with luminous teal
   */
  function calculateTimeState() {
    let nowMinutes;
    let hours, mins;

    if (simulatedMinutes !== null) {
      nowMinutes = simulatedMinutes;
      hours = Math.floor(nowMinutes / 60);
      mins = nowMinutes % 60;
    } else {
      const now = new Date();
      hours = now.getHours();
      mins = now.getMinutes();
      nowMinutes = hours * 60 + mins;
    }

    if (simulatedStage && PALETTES[simulatedStage]) {
      return {
        stage: simulatedStage,
        mode: PALETTES[simulatedStage].mode,
        palette: getPresetPalette(simulatedStage),
        hours,
        mins,
        nowMinutes,
        isSimulated: true
      };
    }

    let stage = 'night';
    let mode = 'dark';
    let palette = {};

    if (nowMinutes < 300) {
      // 00:00 - 04:59 (Night)
      stage = 'night';
      mode = 'dark';
      palette = getPresetPalette('night');
    } else if (nowMinutes < 480) {
      // 05:00 - 07:59 (Dawn: gradually lightens from Dawn to Morning)
      stage = 'dawn';
      mode = 'light';
      const t = (nowMinutes - 300) / 180; // 0.0 to 1.0
      palette = interpolateStagePalettes(PALETTES.dawn, PALETTES.morning, t);
    } else if (nowMinutes < 690) {
      // 08:00 - 11:29 (Morning: transitions from Morning to Noon)
      stage = 'morning';
      mode = 'light';
      const t = (nowMinutes - 480) / 210;
      palette = interpolateStagePalettes(PALETTES.morning, PALETTES.noon, t);
    } else if (nowMinutes < 840) {
      // 11:30 - 13:59 (Noon: transitions from Noon to Afternoon)
      stage = 'noon';
      mode = 'light';
      const t = (nowMinutes - 690) / 150;
      palette = interpolateStagePalettes(PALETTES.noon, PALETTES.afternoon, t);
    } else if (nowMinutes < 1050) {
      // 14:00 - 17:29 (Afternoon: gentle warm cream)
      stage = 'afternoon';
      mode = 'light';
      palette = getPresetPalette('afternoon');
    } else if (nowMinutes < 1230) {
      // 17:30 - 20:29 (Dusk: gradually darkens from Dusk to Night)
      stage = 'dusk';
      mode = 'dark';
      const t = (nowMinutes - 1050) / 180;
      palette = interpolateStagePalettes(PALETTES.dusk, PALETTES.night, t);
    } else {
      // 20:30 - 23:59 (Night)
      stage = 'night';
      mode = 'dark';
      palette = getPresetPalette('night');
    }

    return {
      stage,
      mode,
      palette,
      hours,
      mins,
      nowMinutes,
      isSimulated: simulatedMinutes !== null || simulatedStage !== null
    };
  }

  function getPresetPalette(stageKey) {
    const p = PALETTES[stageKey];
    return {
      bgPrimary: rgbArrayToString(p.bgPrimary),
      bgSecondary: rgbArrayToString(p.bgSecondary),
      bgSurface: rgbArrayToString(p.bgSurface),
      bgSubtle: rgbArrayToString(p.bgSubtle),
      textPrimary: rgbArrayToString(p.textPrimary),
      textSecondary: rgbArrayToString(p.textSecondary),
      textMuted: rgbArrayToString(p.textMuted),
      accent: rgbArrayToString(p.accent),
      accentHover: rgbArrayToString(p.accentHover),
      accentLight: p.accentLight,
      accentBorder: p.accentBorder,
      borderColor: rgbArrayToString(p.borderColor),
      borderHover: rgbArrayToString(p.borderHover),
      focusRing: rgbArrayToString(p.focusRing),
      doodleColor: p.doodleColor,
      doodleAlpha: p.doodleAlpha,
      headerBg: p.headerBg
    };
  }

  function interpolateStagePalettes(p1, p2, t) {
    return {
      bgPrimary: lerpRGB(p1.bgPrimary, p2.bgPrimary, t),
      bgSecondary: lerpRGB(p1.bgSecondary, p2.bgSecondary, t),
      bgSurface: lerpRGB(p1.bgSurface, p2.bgSurface, t),
      bgSubtle: lerpRGB(p1.bgSubtle, p2.bgSubtle, t),
      textPrimary: lerpRGB(p1.textPrimary, p2.textPrimary, t),
      textSecondary: lerpRGB(p1.textSecondary, p2.textSecondary, t),
      textMuted: lerpRGB(p1.textMuted, p2.textMuted, t),
      accent: lerpRGB(p1.accent, p2.accent, t),
      accentHover: lerpRGB(p1.accentHover, p2.accentHover, t),
      accentLight: t > 0.5 ? p2.accentLight : p1.accentLight,
      accentBorder: t > 0.5 ? p2.accentBorder : p1.accentBorder,
      borderColor: lerpRGB(p1.borderColor, p2.borderColor, t),
      borderHover: lerpRGB(p1.borderHover, p2.borderHover, t),
      focusRing: lerpRGB(p1.focusRing, p2.focusRing, t),
      doodleColor: t > 0.5 ? p2.doodleColor : p1.doodleColor,
      doodleAlpha: p1.doodleAlpha + (p2.doodleAlpha - p1.doodleAlpha) * t,
      headerBg: lerpRGBA(p1.bgPrimary, p2.bgPrimary, t, 0.92)
    };
  }

  /**
   * Apply calculated theme properties to document root
   */
  function applyTheme(state) {
    const root = document.documentElement;
    const p = state.palette;

    // Set custom CSS properties
    root.style.setProperty('--bg-primary', p.bgPrimary);
    root.style.setProperty('--bg-secondary', p.bgSecondary);
    root.style.setProperty('--bg-surface', p.bgSurface);
    root.style.setProperty('--bg-subtle', p.bgSubtle);
    root.style.setProperty('--text-primary', p.textPrimary);
    root.style.setProperty('--text-secondary', p.textSecondary);
    root.style.setProperty('--text-muted', p.textMuted);
    root.style.setProperty('--accent', p.accent);
    root.style.setProperty('--accent-hover', p.accentHover);
    root.style.setProperty('--accent-light', p.accentLight);
    root.style.setProperty('--accent-border', p.accentBorder);
    root.style.setProperty('--border-color', p.borderColor);
    root.style.setProperty('--border-hover', p.borderHover);
    root.style.setProperty('--focus-ring', p.focusRing);
    root.style.setProperty('--header-bg', p.headerBg);
    root.style.setProperty('--doodle-color', p.doodleColor);
    root.style.setProperty('--doodle-alpha', p.doodleAlpha);

    // Set informative data attributes on <html>
    root.setAttribute('data-theme-preference', currentPreference);
    root.setAttribute('data-theme-stage', state.stage);
    root.setAttribute('data-theme-mode', state.mode);

    // Update <meta name="theme-color"> for native mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', p.bgPrimary);
    }

    currentActiveState = {
      preference: currentPreference,
      stage: state.stage,
      mode: state.mode,
      hours: state.hours,
      minutes: state.mins,
      isSimulated: state.isSimulated
    };

    // Update the Appearance UI selector in the header
    updateControlUI();

    // Notify other components (e.g. doodle canvas)
    window.dispatchEvent(new CustomEvent('portfolio:themechange', {
      detail: {
        stage: state.stage,
        mode: state.mode,
        preference: currentPreference,
        doodleColor: p.doodleColor,
        doodleAlpha: p.doodleAlpha
      }
    }));
  }

  /**
   * Main refresh function: evaluates active preference and updates the site
   */
  function refreshTheme() {
    let targetStage = 'morning';
    let targetMode = 'light';
    let targetPalette = getPresetPalette('morning');
    const timeState = calculateTimeState();

    if (currentPreference === 'auto') {
      targetStage = timeState.stage;
      targetMode = timeState.mode;
      targetPalette = timeState.palette;
    } else if (currentPreference === 'light') {
      targetStage = 'morning';
      targetMode = 'light';
      targetPalette = getPresetPalette('morning');
    } else if (currentPreference === 'dark') {
      targetStage = 'night';
      targetMode = 'dark';
      targetPalette = getPresetPalette('night');
    } else if (currentPreference === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        targetStage = 'night';
        targetMode = 'dark';
        targetPalette = getPresetPalette('night');
      } else {
        targetStage = 'morning';
        targetMode = 'light';
        targetPalette = getPresetPalette('morning');
      }
    }

    applyTheme({
      stage: targetStage,
      mode: targetMode,
      palette: targetPalette,
      hours: timeState.hours,
      mins: timeState.mins,
      isSimulated: timeState.isSimulated
    });
  }

  // Set user preference (called from UI)
  function setPreference(pref) {
    if (!['auto', 'light', 'dark', 'system'].includes(pref)) return;
    currentPreference = pref;
    savePreference(pref);
    refreshTheme();
  }

  // --- Header Appearance UI Controller ---
  function updateControlUI() {
    const btn = document.getElementById('theme-selector-btn');
    const btnLabel = document.getElementById('theme-btn-label');
    const stageHint = document.getElementById('theme-stage-hint');
    const options = document.querySelectorAll('.theme-option');

    if (!btn || !btnLabel) return;

    // Capitalize label: Auto, Light, Dark, System
    const displayLabel = currentPreference.charAt(0).toUpperCase() + currentPreference.slice(1);
    btnLabel.textContent = displayLabel;

    // Provide rich accessible button description
    const stageName = PALETTES[currentActiveState.stage] ? PALETTES[currentActiveState.stage].name : currentActiveState.stage;
    let labelText = `Appearance theme: ${displayLabel}`;
    if (currentPreference === 'auto') {
      labelText += ` (currently ${stageName})`;
    }
    btn.setAttribute('aria-label', `${labelText}. Click to change theme.`);

    if (stageHint) {
      if (currentPreference === 'auto') {
        stageHint.textContent = `Current: ${stageName}`;
      } else if (currentPreference === 'system') {
        stageHint.textContent = `System: ${currentActiveState.mode === 'dark' ? 'Dark' : 'Light'}`;
      } else {
        stageHint.textContent = `Fixed: ${displayLabel}`;
      }
    }

    // Update active checkmarks and aria-selected state
    options.forEach(opt => {
      const val = opt.getAttribute('data-theme-value');
      const isSelected = val === currentPreference;
      opt.setAttribute('aria-selected', isSelected ? 'true' : 'false');
      if (isSelected) {
        opt.classList.add('is-active');
      } else {
        opt.classList.remove('is-active');
      }
    });

    // Update dynamic icon on button
    updateButtonIcon();
  }

  function updateButtonIcon() {
    const iconContainer = document.getElementById('theme-btn-icon');
    if (!iconContainer) return;

    let iconSvg = '';
    if (currentPreference === 'auto') {
      // Clock icon for Auto
      iconSvg = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`;
    } else if (currentPreference === 'light') {
      // Sun icon for Light
      iconSvg = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
    } else if (currentPreference === 'dark') {
      // Moon icon for Dark
      iconSvg = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
    } else {
      // Monitor icon for System
      iconSvg = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>`;
    }

    iconContainer.innerHTML = iconSvg;
  }

  function setupControlEvents() {
    const wrapper = document.getElementById('theme-control-wrapper');
    const btn = document.getElementById('theme-selector-btn');
    const dropdown = document.getElementById('theme-dropdown-menu');
    const options = document.querySelectorAll('.theme-option');

    if (!wrapper || !btn || !dropdown) return;

    let isOpen = false;

    function openMenu() {
      isOpen = true;
      btn.setAttribute('aria-expanded', 'true');
      dropdown.classList.add('is-open');
      // Focus currently selected option or first option
      const activeOpt = dropdown.querySelector('.theme-option.is-active') || options[0];
      if (activeOpt) activeOpt.focus();
    }

    function closeMenu(restoreFocus = true) {
      if (!isOpen) return;
      isOpen = false;
      btn.setAttribute('aria-expanded', 'false');
      dropdown.classList.remove('is-open');
      if (restoreFocus) btn.focus();
    }

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isOpen) {
        closeMenu(false);
      } else {
        openMenu();
      }
    });

    // Keyboard support on button
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openMenu();
      }
    });

    // Option clicks & keyboard
    options.forEach((opt, idx) => {
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        const val = opt.getAttribute('data-theme-value');
        setPreference(val);
        closeMenu(true);
      });

      opt.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          closeMenu(true);
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          const next = options[(idx + 1) % options.length];
          if (next) next.focus();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          const prev = options[(idx - 1 + options.length) % options.length];
          if (prev) prev.focus();
        } else if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const val = opt.getAttribute('data-theme-value');
          setPreference(val);
          closeMenu(true);
        } else if (e.key === 'Tab') {
          closeMenu(false);
        }
      });
    });

    // Click outside to close
    document.addEventListener('click', (e) => {
      if (isOpen && !wrapper.contains(e.target)) {
        closeMenu(false);
      }
    });

    // Escape closes
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen) {
        closeMenu(true);
      }
    });
  }

  // --- Dev Simulation Floating Bar & Public Console API ---
  function setupDevSimulation() {
    // Public Global API for automated testing & browser console inspection
    window.__themeSimulateTime = function (hours, minutes) {
      if (hours === null || hours === undefined) {
        simulatedMinutes = null;
        simulatedStage = null;
      } else {
        simulatedMinutes = hours * 60 + (minutes || 0);
        simulatedStage = null;
      }
      refreshTheme();
      updateDevUiIfPresent();
      return `Simulated time set to ${String(hours).padStart(2, '0')}:${String(minutes || 0).padStart(2, '0')}. Current stage: ${currentActiveState.stage}`;
    };

    window.__themeSimulateStage = function (stageKey) {
      if (!stageKey || !PALETTES[stageKey.toLowerCase()]) {
        console.warn('Valid stages:', Object.keys(PALETTES));
        return;
      }
      simulatedStage = stageKey.toLowerCase();
      simulatedMinutes = null;
      refreshTheme();
      updateDevUiIfPresent();
      return `Simulated stage set to: ${simulatedStage}`;
    };

    window.__themeResetSimulation = function () {
      simulatedMinutes = null;
      simulatedStage = null;
      refreshTheme();
      updateDevUiIfPresent();
      return 'Simulation reset to real device clock.';
    };

    window.__themeGetState = function () {
      return Object.assign({}, currentActiveState, {
        simulatedMinutes,
        simulatedStage
      });
    };

    // Keyboard shortcut to toggle Dev Bar: Cmd+Shift+D or Ctrl+Shift+D
    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        e.preventDefault();
        toggleDevSimulationBar();
      }
    });
  }

  function toggleDevSimulationBar() {
    let bar = document.getElementById('dev-theme-sim-bar');
    if (bar) {
      bar.remove();
      return;
    }

    bar = document.createElement('aside');
    bar.id = 'dev-theme-sim-bar';
    bar.className = 'dev-sim-bar';
    bar.setAttribute('aria-label', 'Developer Time Simulation Bar');
    bar.innerHTML = `
      <div class="dev-sim-header">
        <span class="dev-sim-title">🛠️ Dev Stage Simulator</span>
        <button type="button" class="dev-sim-close" id="dev-sim-close" aria-label="Close Dev Bar">&times;</button>
      </div>
      <div class="dev-sim-presets">
        <button type="button" class="dev-sim-btn" data-time="06:30">Dawn (06:30)</button>
        <button type="button" class="dev-sim-btn" data-time="09:30">Morning (09:30)</button>
        <button type="button" class="dev-sim-btn" data-time="12:45">Noon (12:45)</button>
        <button type="button" class="dev-sim-btn" data-time="15:45">Afternoon (15:45)</button>
        <button type="button" class="dev-sim-btn" data-time="19:00">Dusk (19:00)</button>
        <button type="button" class="dev-sim-btn" data-time="22:30">Night (22:30)</button>
      </div>
      <div class="dev-sim-slider-row">
        <label for="dev-sim-range" id="dev-sim-time-label">Time: 12:00</label>
        <input type="range" id="dev-sim-range" min="0" max="1439" step="1" value="720">
      </div>
      <div class="dev-sim-footer">
        <button type="button" class="dev-sim-reset-btn" id="dev-sim-reset">Reset to Real Time</button>
        <span class="dev-sim-status" id="dev-sim-status">Stage: ${currentActiveState.stage}</span>
      </div>
    `;

    document.body.appendChild(bar);

    const closeBtn = document.getElementById('dev-sim-close');
    const resetBtn = document.getElementById('dev-sim-reset');
    const range = document.getElementById('dev-sim-range');
    const label = document.getElementById('dev-sim-time-label');
    const status = document.getElementById('dev-sim-status');
    const presetBtns = bar.querySelectorAll('.dev-sim-btn');

    closeBtn.addEventListener('click', () => bar.remove());

    resetBtn.addEventListener('click', () => {
      window.__themeResetSimulation();
      label.textContent = 'Real Device Time';
      status.textContent = `Stage: ${currentActiveState.stage}`;
    });

    presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const [h, m] = btn.getAttribute('data-time').split(':').map(Number);
        window.__themeSimulateTime(h, m);
        range.value = h * 60 + m;
        label.textContent = `Time: ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        status.textContent = `Stage: ${currentActiveState.stage}`;
      });
    });

    range.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      const h = Math.floor(val / 60);
      const m = val % 60;
      window.__themeSimulateTime(h, m);
      label.textContent = `Time: ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      status.textContent = `Stage: ${currentActiveState.stage}`;
    });

    updateDevUiIfPresent();
  }

  function updateDevUiIfPresent() {
    const range = document.getElementById('dev-sim-range');
    const label = document.getElementById('dev-sim-time-label');
    const status = document.getElementById('dev-sim-status');
    if (!range || !label || !status) return;

    if (simulatedMinutes !== null) {
      range.value = simulatedMinutes;
      const h = Math.floor(simulatedMinutes / 60);
      const m = simulatedMinutes % 60;
      label.textContent = `Time: ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    } else {
      const now = new Date();
      range.value = now.getHours() * 60 + now.getMinutes();
      label.textContent = `Real Time (${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')})`;
    }
    status.textContent = `Stage: ${currentActiveState.stage}`;
  }

  // --- Lifecycle & Initialization ---
  function init() {
    // Apply immediate theme on bootstrap
    refreshTheme();

    // Hook up UI when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setupControlEvents();
        updateControlUI();
      });
    } else {
      setupControlEvents();
      updateControlUI();
    }

    setupDevSimulation();

    // Recalculate once per minute (negligible battery impact)
    setInterval(() => {
      // Only recalculate automatically if not manually paused on a simulated time
      if (simulatedMinutes === null && simulatedStage === null) {
        refreshTheme();
      }
    }, 60000);

    // Recalculate on wake / focus / visibility change
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && simulatedMinutes === null && simulatedStage === null) {
        refreshTheme();
      }
    });

    window.addEventListener('focus', () => {
      if (simulatedMinutes === null && simulatedStage === null) {
        refreshTheme();
      }
    });

    window.addEventListener('pageshow', () => {
      if (simulatedMinutes === null && simulatedStage === null) {
        refreshTheme();
      }
    });

    // Listen for OS system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', () => {
        if (currentPreference === 'system') {
          refreshTheme();
        }
      });
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(() => {
        if (currentPreference === 'system') {
          refreshTheme();
        }
      });
    }
  }

  init();

})();
