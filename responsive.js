const BREAKPOINTS = Object.freeze({ phone: 600, tablet: 1024, wideDesktop: 1440, compactPhone: 390 });

function getResponsiveState(width) {
  const value = Number.isFinite(width) ? width : 0;
  return {
    compactPhone: value < BREAKPOINTS.compactPhone,
    phone: value < BREAKPOINTS.phone,
    tablet: value >= BREAKPOINTS.phone && value < BREAKPOINTS.tablet,
    desktop: value >= BREAKPOINTS.tablet,
    wideDesktop: value >= BREAKPOINTS.wideDesktop,
  };
}

module.exports = { BREAKPOINTS, getResponsiveState };
