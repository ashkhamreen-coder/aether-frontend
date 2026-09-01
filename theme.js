const tokens = Object.freeze({
  color: { background:'#05030d', elevated:'#11111b', surface:'#181824', text:'#f8f7ff', muted:'#aaa8b8', accent:'#7c5cff', accentSoft:'#9a86ff', danger:'#ff6b7a', focus:'#c9bdff' },
  spacing: { xs:4, sm:8, md:16, lg:24, xl:40, xxl:64 },
  radius: { sm:6, md:12, lg:20, pill:999 },
  shadow: { card:'0 16px 40px rgba(0,0,0,.42)' },
  motion: { fast:140, normal:240, hero:6500 },
  breakpoint: { compact:390, phone:600, tablet:1024, wide:1440 },
  z: { base:0, navigation:20, modal:50, player:80, toast:100 },
});
module.exports = { tokens };
