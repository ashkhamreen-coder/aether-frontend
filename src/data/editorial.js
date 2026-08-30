const art = {
  astra: require('../../assets/hero_neon.png'), samudra: require('../../assets/trend_eclipse.png'),
  lanka: require('../../assets/trend_sands.png'), garuda: require('../../assets/film_signal.png'),
  kali: require('../../assets/film_neon.png'), amrita: require('../../assets/art_chromatic.png'),
  shakti: require('../../assets/short_afterlight.png'), mayavi: require('../../assets/music_midnight.png'),
};

const preview = (id,title,image,genre,synopsis,type='film') => ({
  id:`editorial-${id}`, title, image, backdropUrl:null, genre, genres:[genre], type,
  synopsis, description:synopsis, year:2026, duration:type==='short'?'12 min':'Coming soon',
  maturityRating:'Rating pending', originalLanguage:'Hindi', aiDisclosure:'AI-assisted concept art',
  isEditorialPreview:true, isPlayable:false, mediaStatus:'coming-soon', creatorName:'Ripple Editorial',
});

export const editorialTitles = [
  preview('astra','Astra: The Forgotten Weapon',art.astra,'Mythology and Epics','A celestial weapon awakens beneath a forgotten kingdom and chooses an unlikely guardian.'),
  preview('samudra','Samudra: The Last Churning',art.samudra,'Mythology and Epics','Devas and asuras return to the cosmic ocean when a lost secret threatens the three worlds.'),
  preview('lanka','Lanka: Ashes of the Sky',art.lanka,'Regional Stories','A young chronicler discovers that history remembers only half the truth.'),
  preview('garuda','Garuda: Keeper of Amrita',art.garuda,'Fantasy Worlds','Garuda crosses seven impossible realms to free his mother.'),
  preview('kali','Kali: The Final Dawn',art.kali,'AI Cinema','An ancient force awakens when darkness learns to hide inside human desire.'),
  preview('amrita','Amrita Protocol',art.amrita,'Science Fiction','In a distant future, an AI discovers an ancient formula for digital immortality.'),
  preview('shakti','Shakti: Nine Nights',art.shakti,'Short Films','Nine manifestations of strength guide a fractured kingdom through transformation.','short'),
  preview('mayavi','Mayavi',art.mayavi,'AI Music Videos','An illusion architect becomes trapped inside a dream of his own creation.','short'),
];

export const editorialRows = [
  {id:'editorial-mythology',title:'Mythology and Epics',reason:'Editorial previews • Coming Soon',items:editorialTitles.slice(0,4)},
  {id:'editorial-ai-cinema',title:'AI Cinema',reason:'Editorial previews • Coming Soon',items:[editorialTitles[4],editorialTitles[5]]},
  {id:'editorial-shorts',title:'Shorts',reason:'Editorial previews • Coming Soon',items:[editorialTitles[6],editorialTitles[7]]},
  {id:'editorial-coming',title:'Coming Soon',reason:'Ripple editorial concepts • Media not yet available',items:editorialTitles.slice(2,7)},
];
