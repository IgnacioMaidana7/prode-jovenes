import type { Variants, Transition } from "framer-motion";

const easeOutExpo: Transition["ease"] = [0.16, 1, 0.3, 1];
const easeOutQuart: Transition["ease"] = [0.25, 1, 0.5, 1];

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: easeOutExpo },
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: { duration: 0.2, ease: easeOutQuart },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.3, ease: easeOutExpo } },
  exit: { opacity: 0, transition: { duration: 0.15, ease: easeOutQuart } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.35, ease: easeOutExpo },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    transition: { duration: 0.15 },
  },
};

export const staggerContainer = (
  staggerChildren = 0.05,
  delayChildren = 0.05
): Variants => ({
  hidden: {},
  show: {
    transition: { staggerChildren, delayChildren },
  },
});

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: easeOutExpo },
  },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.45, ease: easeOutExpo },
  },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.45, ease: easeOutExpo },
  },
};

export const cardHover = {
  whileHover: { y: -2, scale: 1.005 },
  whileTap: { scale: 0.99 },
  transition: { type: "spring" as const, stiffness: 300, damping: 22 },
};

export const tapScale = {
  whileTap: { scale: 0.97 },
  transition: { type: "spring" as const, stiffness: 400, damping: 25 },
};

export const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
  transition: { duration: 0.25, ease: easeOutExpo },
};

export const livePulse: Variants = {
  initial: { scale: 1, opacity: 1 },
  animate: {
    scale: [1, 1.12, 1],
    opacity: [1, 0.85, 1],
    transition: {
      duration: 1.6,
      ease: "easeInOut",
      repeat: Infinity,
    },
  },
};

export const shimmerTransition: Transition = {
  duration: 3,
  ease: "linear",
  repeat: Infinity,
};
