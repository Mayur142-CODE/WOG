export const pageTransition = {
  initial:    { opacity: 0, y: 14 },
  animate:    { opacity: 1, y: 0 },
  exit:       { opacity: 0, y: -8 },
  transition: { duration: 0.22, ease: 'easeOut' },
};

export const fadeIn = {
  initial:    { opacity: 0 },
  animate:    { opacity: 1 },
  transition: { duration: 0.3 },
};

export const fadeInUp = {
  initial:    { opacity: 0, y: 20 },
  animate:    { opacity: 1, y: 0 },
  transition: { duration: 0.38, ease: 'easeOut' },
};

export const fadeInScale = {
  initial:    { opacity: 0, scale: 0.95 },
  animate:    { opacity: 1, scale: 1 },
  transition: { duration: 0.28, ease: 'easeOut' },
};

export const staggerContainer = {
  animate: { transition: { staggerChildren: 0.08 } },
};

export const staggerItem = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.28 } },
};

export const overlayFade = {
  initial:    { opacity: 0 },
  animate:    { opacity: 1 },
  exit:       { opacity: 0 },
  transition: { duration: 0.18 },
};

export const modalScale = {
  initial:    { opacity: 0, scale: 0.92, y: 20 },
  animate:    { opacity: 1, scale: 1, y: 0 },
  exit:       { opacity: 0, scale: 0.95, y: 10 },
  transition: { duration: 0.22, ease: 'easeOut' },
};
