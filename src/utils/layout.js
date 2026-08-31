export const pageGutter = width => width < 768 ? 16 : width < 1024 ? 24 : width < 1440 ? 48 : Math.min(76, Math.max(56, width * .04));

export const isTouchDevice = () => typeof window !== 'undefined' && window.matchMedia?.('(hover: none), (pointer: coarse)').matches;
