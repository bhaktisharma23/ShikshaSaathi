/**
 * ShikshaSaathi design tokens.
 *
 * Every colour, size and spacing value used by the UI comes from this file.
 * Components must never hard-code hex values or pixel sizes — import a token instead.
 * That keeps the whole app visually consistent and lets us re-theme in one place.
 *
 * MVP is light theme only (decision D4): it reads best in classroom sunlight and on projectors.
 */
import { Platform } from 'react-native';

export const Colors = {
  /** Warm off-white page background (like notebook paper). */
  paper: '#FBF7F0',
  /** Card / raised surface. */
  surface: '#FFFFFF',
  /** Slightly darker surface for pressed states and inset areas. */
  surfaceMuted: '#F3EDE3',
  /** Hairline borders and dividers. */
  line: '#E7DFD3',
  lineStrong: '#D4C8B8',

  /** Main text. Contrast on paper ≈ 14:1. */
  ink: '#2A2522',
  /** Secondary text. Contrast on paper ≈ 5.6:1 (passes WCAG AA). */
  inkMuted: '#6B625B',
  /** Text on primary / dark backgrounds. */
  inkInverse: '#FFFFFF',

  /** Main action colour (deep teal-green). Contrast with white ≈ 6:1. */
  primary: '#1F6F5C',
  primaryPressed: '#185747',
  primarySoft: '#E3F0EC',

  /** Highlight colour (saffron). Used sparingly. */
  accent: '#D9822B',
  accentSoft: '#FBEBDA',
  /** Darker saffron for text on accentSoft (contrast ≥ 4.5:1). */
  accentInk: '#8A4C10',

  success: '#2E7D4F',
  successSoft: '#E2F2E8',
  danger: '#B3412E',
  dangerPressed: '#93321F',
  dangerSoft: '#F8E4E0',
  info: '#2F5D8A',
  infoSoft: '#E3ECF5',

  /** Used for disabled controls. */
  disabled: '#CFC7BC',
} as const;

/** Each subject has one identity colour used for chips and icons only — never large backgrounds. */
export const SubjectColors = {
  maths: { main: '#3B6EA5', soft: '#E4EDF7' },
  science: { main: '#2E8B57', soft: '#E2F3E9' },
  english: { main: '#8A4F9E', soft: '#F1E7F4' },
  hindi: { main: '#B85A2A', soft: '#F8E8DF' },
  'social-science': { main: '#9A7424', soft: '#F5EEDD' },
} as const;

export type SubjectColorKey = keyof typeof SubjectColors;

/** 4-point spacing scale. Use these instead of raw numbers. */
export const Spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

/**
 * Touch-target sizes. Android guidance is 48dp minimum; we use larger targets
 * for primary actions because teachers often use the phone while standing.
 */
export const Touch = {
  min: 48,
  comfortable: 56,
} as const;

/**
 * Font families. Android cannot pick a weight from one family name for custom fonts,
 * so each weight is loaded as its own family (see src/app/_layout.tsx).
 * Latin text uses Noto Sans; Hindi (Devanagari) text uses Noto Sans Devanagari —
 * the Text component switches automatically.
 */
export const FontFamily = {
  latin: {
    regular: 'NotoSans_400Regular',
    semibold: 'NotoSans_600SemiBold',
    bold: 'NotoSans_700Bold',
  },
  devanagari: {
    regular: 'NotoSansDevanagari_400Regular',
    semibold: 'NotoSansDevanagari_600SemiBold',
    bold: 'NotoSansDevanagari_700Bold',
  },
} as const;

export type FontWeightName = keyof typeof FontFamily.latin;

/**
 * Type scale. Body text is 17sp (larger than the usual 16) for readability.
 * Devanagari needs extra line height so matras (ि, ी, ु, ू) are not clipped,
 * so each style has a separate `devanagariLineHeight`.
 */
export const Typography = {
  display: { fontSize: 30, lineHeight: 38, devanagariLineHeight: 46, weight: 'bold' },
  title: { fontSize: 24, lineHeight: 32, devanagariLineHeight: 38, weight: 'bold' },
  heading: { fontSize: 20, lineHeight: 28, devanagariLineHeight: 34, weight: 'semibold' },
  body: { fontSize: 17, lineHeight: 26, devanagariLineHeight: 30, weight: 'regular' },
  bodyStrong: { fontSize: 17, lineHeight: 26, devanagariLineHeight: 30, weight: 'semibold' },
  label: { fontSize: 16, lineHeight: 22, devanagariLineHeight: 28, weight: 'semibold' },
  caption: { fontSize: 14, lineHeight: 20, devanagariLineHeight: 24, weight: 'regular' },
} as const satisfies Record<
  string,
  { fontSize: number; lineHeight: number; devanagariLineHeight: number; weight: FontWeightName }
>;

export type TypographyVariant = keyof typeof Typography;

/** Content never stretches wider than this on tablets / landscape. */
export const MaxContentWidth = 720;

/**
 * Native tabs draw over the bottom of the screen; scrollable content needs this much
 * bottom padding so the last item is not hidden behind the tab bar.
 */
export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
