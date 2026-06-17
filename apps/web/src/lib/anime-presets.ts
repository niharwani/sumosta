// ============================================================
// ANIME.JS PRESETS — used for text reveals, SVG draws, counters
// ============================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnimeStatic = any;

// Character-by-character text reveal
export function textReveal(
  animeLib: AnimeStatic,
  container: HTMLElement,
  selector: string = '.char',
) {
  return animeLib({
    targets:    container.querySelectorAll(selector),
    opacity:    [0, 1],
    translateY: [40, 0],
    rotateX:    [90, 0],
    easing:     'cubicBezier(0.25, 0.1, 0.25, 1.0)',
    duration:   800,
    delay:      animeLib.stagger(30, { start: 200 }),
  });
}

// Honey drip SVG path animation
export function honeyDrip(animeLib: AnimeStatic, svgElement: HTMLElement) {
  return animeLib({
    targets:          svgElement.querySelectorAll('.drip-path'),
    strokeDashoffset: [animeLib.setDashoffset, 0],
    easing:           'cubicBezier(0.65, 0, 0.35, 1)',
    duration:         2000,
    delay:            animeLib.stagger(150),
  });
}

// Honeycomb grid entrance
export function honeycombEntrance(animeLib: AnimeStatic, container: HTMLElement) {
  return animeLib({
    targets:  container.querySelectorAll('.hex-cell'),
    scale:    [0, 1],
    opacity:  [0, 1],
    easing:   'cubicBezier(0.16, 1, 0.3, 1)',
    duration: 600,
    delay:    animeLib.stagger(50, { grid: [5, 3], from: 'center' }),
  });
}

// Animated number counter
export function animateCounter(
  animeLib: AnimeStatic,
  target: HTMLElement,
  endValue: number,
) {
  const obj = { value: 0 };
  return animeLib({
    targets:  obj,
    value:    endValue,
    round:    1,
    easing:   'cubicBezier(0.25, 0.1, 0.25, 1.0)',
    duration: 2000,
    update: () => {
      target.textContent = Math.round(obj.value).toLocaleString('en-IN');
    },
  });
}

// Bee SVG path fly-across
export function beeFlyAcross(animeLib: AnimeStatic, bee: HTMLElement) {
  return animeLib({
    targets:    bee,
    translateX: ['-100px', '120vw'],
    translateY: ['20px', '-10px'],
    opacity:    [
      { value: [0, 1], duration: 300 },
      { value: [1, 0], duration: 300, delay: 2400 },
    ],
    easing:   'cubicBezier(0.25, 0.1, 0.25, 1.0)',
    duration: 3000,
  });
}
