import type { Variants, Transition } from 'framer-motion';

// ============================================================
// EASING CURVES — "honey" feel: smooth, slightly decelerating
// ============================================================

export const HONEY_EASE         = [0.25, 0.1, 0.25, 1.0] as const;
export const HONEY_EASE_OUT     = [0.16, 1, 0.3, 1] as const;
export const HONEY_EASE_IN_OUT  = [0.65, 0, 0.35, 1] as const;

export const honeyTransition: Transition = {
  duration: 0.8,
  ease: HONEY_EASE,
};

export const honeySpring: Transition = {
  type: 'spring',
  stiffness: 100,
  damping: 20,
  mass: 1,
};

// ============================================================
// FRAMER MOTION VARIANTS
// ============================================================

export const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: HONEY_EASE_OUT },
  },
};

export const fadeIn: Variants = {
  hidden:  { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6, ease: HONEY_EASE },
  },
};

export const scaleIn: Variants = {
  hidden:  { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.7, ease: HONEY_EASE_OUT },
  },
};

export const staggerContainer: Variants = {
  hidden:  {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren:   0.1,
    },
  },
};

export const slideInLeft: Variants = {
  hidden:  { opacity: 0, x: -60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: HONEY_EASE_OUT },
  },
};

export const slideInRight: Variants = {
  hidden:  { opacity: 0, x: 60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: HONEY_EASE_OUT },
  },
};

export const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: HONEY_EASE_OUT },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.3, ease: HONEY_EASE },
  },
};

export const drawerVariants: Variants = {
  hidden:  { x: '100%' },
  visible: {
    x: 0,
    transition: { duration: 0.45, ease: HONEY_EASE_OUT },
  },
  exit: {
    x: '100%',
    transition: { duration: 0.35, ease: HONEY_EASE_IN_OUT },
  },
};

export const overlayVariants: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit:    { opacity: 0, transition: { duration: 0.3 } },
};

export const cardHover = {
  rest:  { scale: 1,    boxShadow: '0 4px 12px rgba(44, 36, 23, 0.08)' },
  hover: { scale: 1.02, boxShadow: '0 12px 40px rgba(44, 36, 23, 0.14)' },
};
