const CLOUDINARY_ROOT = 'https://res.cloudinary.com/iutbvhyr/image/upload';

const artwork = (hero, landscape, portrait) => ({
  heroImageUrl: hero ? `${CLOUDINARY_ROOT}/${hero}` : null,
  landscapeImageUrl: `${CLOUDINARY_ROOT}/${landscape}`,
  portraitImageUrl: `${CLOUDINARY_ROOT}/${portrait}`,
});

const concept = ({ id, title, synopsis, format = 'Film', genre, language = 'Hindi', hero, landscape, portrait, focal = {} }) => ({
  id: `editorial-${id}`,
  title,
  synopsis,
  format,
  genre,
  language,
  releaseStatus: 'Coming Soon',
  ...artwork(hero, landscape, portrait),
  playable: false,
  editorialStatus: 'Editorial concept',
  // Compatibility aliases used by the live catalogue presentation layer.
  type: format.toLowerCase(),
  genres: [genre],
  originalLanguage: language,
  duration: 'Coming soon',
  maturityRating: 'Rating pending',
  aiDisclosure: 'AI-assisted concept art',
  isEditorialPreview: true,
  isPlayable: false,
  mediaStatus: 'coming-soon',
  creatorName: 'Ripple Editorial',
  imagePositionDesktop: focal.desktop || 'center center',
  imagePositionTablet: focal.tablet || focal.desktop || 'center center',
  imagePositionMobile: focal.mobile || focal.tablet || focal.desktop || 'center center',
});

/** The single source of truth for every Ripple editorial concept and artwork URL. */
export const editorialTitles = [
  concept({ id:'astra', title:'Astra: The Forgotten Weapon', genre:'Mythology & Epics', hero:'v1788175321/IMG_1053.png', landscape:'v1788175319/IMG_1058.png', portrait:'v1788175323/IMG_1071.png', focal:{desktop:'center center',tablet:'58% center',mobile:'66% center'}, synopsis:'A celestial weapon awakens beneath a forgotten kingdom and chooses an unlikely guardian.' }),
  concept({ id:'kali', title:'Kali: The Final Dawn', genre:'AI Cinema', hero:'v1788175320/IMG_1054.png', landscape:'v1788175319/IMG_1059.png', portrait:'v1788175315/IMG_1082.png', focal:{desktop:'center center',tablet:'60% center',mobile:'68% center'}, synopsis:'An ancient force awakens when darkness learns to hide inside human desire.' }),
  concept({ id:'signal', title:'The Monsoon Signal', format:'Series', genre:'Mystery', hero:'v1788175325/IMG_1057.png', landscape:'v1788175318/IMG_1060.png', portrait:'v1788175318/IMG_1075.png', synopsis:'A radio operator hears tomorrow’s weather—and a warning meant only for her.' }),
  concept({ id:'echo', title:'Echoes of Nila', genre:'Drama', hero:'v1788175320/IMG_1055.png', landscape:'v1788175318/IMG_1061.png', portrait:'v1788175324/IMG_1073.png', synopsis:'A sound archivist follows a lost melody through a city that is slowly forgetting.' }),
  concept({ id:'samudra', title:'Samudra: The Last Churning', format:'Series', genre:'Mythology & Epics', hero:'v1788175324/IMG_1056.png', landscape:'v1788175317/IMG_1063.png', portrait:'v1788175319/IMG_1074.png', synopsis:'Devas and asuras return to the cosmic ocean when a lost secret threatens the three worlds.' }),
  concept({ id:'lanka', title:'Lanka: Ashes of the Sky', genre:'Mythology & Epics', landscape:'v1788175317/IMG_1062.png', portrait:'v1788175319/IMG_1072.png', synopsis:'A young chronicler discovers that history remembers only half the truth.' }),
  concept({ id:'garuda', title:'Garuda: Keeper of Amrita', format:'Series', genre:'Fantasy', landscape:'v1788175317/IMG_1064.png', portrait:'v1788175315/IMG_1076.png', synopsis:'Garuda crosses seven impossible realms to free his mother.' }),
  concept({ id:'amrita', title:'Amrita Protocol', genre:'Science Fiction', landscape:'v1788175315/IMG_1066.png', portrait:'v1788175318/IMG_1077.png', synopsis:'In a distant future, an AI discovers an ancient formula for digital immortality.' }),
  concept({ id:'mayavi', title:'Mayavi', format:'Short', genre:'AI Cinema', landscape:'v1788175316/IMG_1065.png', portrait:'v1788175318/IMG_1078.png', synopsis:'An illusion architect becomes trapped inside a dream of his own creation.' }),
  concept({ id:'shakti', title:'Shakti: Nine Nights', format:'Short', genre:'Mythology & Epics', landscape:'v1788175315/IMG_1067.png', portrait:'v1788175317/IMG_1079.png', synopsis:'Nine manifestations of strength guide a fractured kingdom through transformation.' }),
  concept({ id:'anima', title:'Anima: The First Breath', format:'Animation', genre:'Animation', landscape:'v1788175316/IMG_1068.png', portrait:'v1788175318/IMG_1080.png', synopsis:'A hand-drawn universe searches for the artist who dreamed it into being.' }),
  concept({ id:'raga', title:'Raga at Dusk', format:'Music', genre:'Music & Mantras', landscape:'v1788175315/IMG_1069.png', portrait:'v1788175317/IMG_1081.png', synopsis:'An original visual meditation where ancient rhythm meets an imagined horizon.' }),
];

export const editorialHeroes = editorialTitles.filter(item => item.heroImageUrl);
const pick = (...ids) => ids.map(id => editorialTitles.find(item => item.id === `editorial-${id}`)).filter(Boolean);

export const editorialRows = [
  {id:'editorial-featured',title:'Featured',reason:'A first look at worlds being shaped at Ripple',items:pick('astra','kali','signal','echo')},
  {id:'editorial-mythology',title:'Mythology & Epics',reason:'Original editorial concepts • Coming Soon',items:pick('astra','samudra','lanka','garuda','shakti')},
  {id:'editorial-ai-cinema',title:'AI Cinema',reason:'Imagination, amplified',items:pick('kali','amrita','mayavi','echo')},
  {id:'editorial-series',title:'Series',reason:'Stories built to unfold',items:editorialTitles.filter(x=>x.format==='Series')},
  {id:'editorial-films',title:'Films',reason:'Feature-length concepts',items:editorialTitles.filter(x=>x.format==='Film')},
  {id:'editorial-shorts',title:'Shorts',reason:'Brief stories. Lasting worlds.',items:editorialTitles.filter(x=>x.format==='Short')},
  {id:'editorial-animation',title:'Animation',reason:'Frame by imagined frame',items:pick('anima','amrita','shakti')},
  {id:'editorial-music',title:'Music & Mantras',reason:'Original audiovisual concepts',items:pick('raga','mayavi')},
  {id:'editorial-coming',title:'Coming Soon',reason:'Preview the next wave of Ripple originals',items:editorialTitles},
];

const browseRows = format => [
  {id:`${format}-browse`,title:`${format[0].toUpperCase()+format.slice(1)} browsing`,portrait:true,reason:'Ripple editorial previews • Coming Soon',items:editorialTitles.filter(x=>x.type===format)},
  {id:`${format}-coming`,title:'Coming Soon',portrait:true,reason:'Media not yet available',items:editorialTitles.filter(x=>x.type===format)},
];
export const routeEditorial = { films:browseRows('film'), series:browseRows('series'), shorts:browseRows('short') };

export const relatedEditorialTitles = item => editorialTitles.filter(candidate => candidate.id !== item?.id && (candidate.genre === item?.genre || candidate.format === item?.format)).slice(0,4);
