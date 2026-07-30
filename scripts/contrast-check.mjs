// WCAG contrast ratio validator for every RDIOS theme — Implementation
// Sprint 2.5 §4. Values below are copied directly from app/globals.css;
// keep in sync by hand (small enough token set that a build-time import
// isn't worth the added tooling complexity for a one-off audit script).

const THEMES = {
  "slate-light": {
    bg: [250, 250, 249], surface: [244, 244, 242], elevated: [255, 255, 255], border: [226, 226, 222],
    text: [28, 28, 26], muted: [96, 96, 92], dim: [104, 104, 98],
    accent: [79, 70, 229], accentBright: [99, 91, 244], onAccent: [255, 255, 255],
    success: [16, 116, 55], warning: [163, 75, 8], error: [185, 28, 28], info: [29, 78, 216],
  },
  "slate-dark": {
    bg: [15, 15, 17], surface: [24, 24, 27], elevated: [32, 32, 36], border: [40, 40, 44],
    text: [237, 237, 235], muted: [168, 168, 164], dim: [145, 145, 141],
    accent: [129, 122, 245], accentBright: [150, 143, 255], onAccent: [15, 15, 17],
    success: [74, 222, 128], warning: [251, 191, 36], error: [248, 113, 113], info: [96, 165, 250],
  },
  light: {
    bg: [255, 255, 255], surface: [248, 249, 251], elevated: [255, 255, 255], border: [210, 214, 220],
    text: [17, 24, 39], muted: [71, 85, 105], dim: [98, 108, 124],
    accent: [37, 99, 235], accentBright: [29, 90, 220], onAccent: [255, 255, 255],
    success: [16, 116, 55], warning: [163, 75, 8], error: [185, 28, 28], info: [29, 78, 216],
  },
  dark: {
    bg: [26, 24, 22], surface: [36, 33, 30], elevated: [46, 42, 38], border: [58, 54, 49],
    text: [232, 228, 223], muted: [176, 168, 158], dim: [150, 142, 131],
    accent: [33, 130, 122], accentBright: [56, 178, 169], onAccent: [255, 255, 255],
    success: [74, 222, 128], warning: [251, 191, 36], error: [248, 113, 113], info: [96, 165, 250],
  },
  forest: {
    bg: [250, 247, 237], surface: [243, 238, 222], elevated: [255, 253, 245], border: [223, 213, 188],
    text: [42, 38, 28], muted: [107, 97, 76], dim: [120, 108, 84],
    accent: [63, 122, 77], accentBright: [58, 110, 70], onAccent: [255, 255, 255],
    success: [12, 110, 50], warning: [151, 69, 6], error: [185, 28, 28], info: [29, 78, 216],
  },
  midnight: {
    bg: [8, 8, 9], surface: [16, 16, 18], elevated: [24, 24, 27], border: [38, 38, 42],
    text: [245, 245, 244], muted: [176, 176, 172], dim: [120, 120, 116],
    accent: [178, 140, 74], accentBright: [201, 163, 94], onAccent: [8, 8, 9],
    success: [74, 222, 128], warning: [251, 191, 36], error: [248, 113, 113], info: [96, 165, 250],
  },
};

function relLuminance([r, g, b]) {
  const chan = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const [R, G, B] = [chan(r), chan(g), chan(b)];
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function contrast(a, b) {
  const L1 = relLuminance(a);
  const L2 = relLuminance(b);
  const [lighter, darker] = L1 > L2 ? [L1, L2] : [L2, L1];
  return (lighter + 0.05) / (darker + 0.05);
}

function composite(fg, bgUnder, alpha) {
  return fg.map((c, i) => Math.round(c * alpha + bgUnder[i] * (1 - alpha)));
}

const results = [];
for (const [themeName, t] of Object.entries(THEMES)) {
  const badgeAlpha = 0.1;
  const pairs = [
    ["Primary text on Base", t.text, t.bg, 4.5],
    ["Primary text on Surface", t.text, t.surface, 4.5],
    ["Muted text on Base", t.muted, t.bg, 4.5],
    ["Dim text on Base (used for small captions/timestamps)", t.dim, t.bg, 4.5],
    ["On-accent text on Accent (buttons)", t.onAccent, t.accent, 4.5],
    ["Accent-bright text on Base (eyebrow labels, links)", t.accentBright, t.bg, 4.5],
    ["Success text on Base", t.success, t.bg, 4.5],
    ["Warning text on Base", t.warning, t.bg, 4.5],
    ["Error text on Base", t.error, t.bg, 4.5],
    ["Info text on Base", t.info, t.bg, 4.5],
    // Badges render as `bg-{tone}/N` over Surface — check the actual composited pill background.
    ["Success text on Success-tint badge bg", t.success, composite(t.success, t.surface, badgeAlpha), 4.5],
    ["Warning text on Warning-tint badge bg", t.warning, composite(t.warning, t.surface, badgeAlpha), 4.5],
    ["Error text on Error-tint badge bg", t.error, composite(t.error, t.surface, badgeAlpha), 4.5],
    ["Info text on Info-tint badge bg", t.info, composite(t.info, t.surface, badgeAlpha), 4.5],
    ["Border vs Base (non-text UI component, 3:1)", t.border, t.bg, 3.0],
  ];
  for (const [label, fg, bg, min] of pairs) {
    const ratio = contrast(fg, bg);
    results.push({ theme: themeName, label, ratio: Math.round(ratio * 100) / 100, min, pass: ratio >= min });
  }
}

const failures = results.filter((r) => !r.pass);
console.log(`Checked ${results.length} pairs across ${Object.keys(THEMES).length} theme renderings.\n`);
for (const r of results) {
  console.log(`${r.pass ? "PASS" : "FAIL"}  ${r.theme.padEnd(12)} ${r.label.padEnd(45)} ${r.ratio.toFixed(2)} (needs ${r.min})`);
}
console.log(`\n${failures.length} failure(s).`);
if (failures.length) {
  console.log(JSON.stringify(failures, null, 2));
}
