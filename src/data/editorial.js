const art = {
  astra: require('../../assets/hero_neon.png'), samudra: require('../../assets/trend_eclipse.png'),
  lanka: require('../../assets/trend_sands.png'), garuda: require('../../assets/film_signal.png'),
  kali: require('../../assets/film_neon.png'), amrita: require('../../assets/art_chromatic.png'),
  shakti: require('../../assets/short_afterlight.png'), mayavi: require('../../assets/music_midnight.png'),
  anima: require('../../assets/art_eternal.png'), raga: require('../../assets/music_copper.png'),
  signal: require('../../assets/trend_electric.png'), echo: require('../../assets/film_echoes.png'),
};

const preview = (id,title,image,genre,synopsis,type='film') => ({
  id:`editorial-${id}`, title, image, backdropUrl:null, genre, genres:[genre], type,
  synopsis, description:synopsis, year:2026, duration:type==='short'?'12 min':'Coming soon',
  maturityRating:'Rating pending', originalLanguage:'Hindi', aiDisclosure:'AI-assisted concept art',
  isEditorialPreview:true, isPlayable:false, mediaStatus:'coming-soon', creatorName:'Ripple Editorial',
});

export const editorialTitles = [
  preview('astra','Astra: The Forgotten Weapon',art.astra,'Mythology and Epics','A celestial weapon awakens beneath a forgotten kingdom and chooses an unlikely guardian.'),
  preview('samudra','Samudra: The Last Churning',art.samudra,'Mythology and Epics','Devas and asuras return to the cosmic ocean when a lost secret threatens the three worlds.','series'),
  preview('lanka','Lanka: Ashes of the Sky',art.lanka,'Regional Stories','A young chronicler discovers that history remembers only half the truth.'),
  preview('garuda','Garuda: Keeper of Amrita',art.garuda,'Fantasy','Garuda crosses seven impossible realms to free his mother.','series'),
  preview('kali','Kali: The Final Dawn',art.kali,'AI Cinema','An ancient force awakens when darkness learns to hide inside human desire.'),
  preview('amrita','Amrita Protocol',art.amrita,'Science Fiction','In a distant future, an AI discovers an ancient formula for digital immortality.'),
  preview('shakti','Shakti: Nine Nights',art.shakti,'Short Films','Nine manifestations of strength guide a fractured kingdom through transformation.','short'),
  preview('mayavi','Mayavi',art.mayavi,'AI Music Videos','An illusion architect becomes trapped inside a dream of his own creation.','short'),
  preview('anima','Anima: The First Breath',art.anima,'Animation','A hand-drawn universe searches for the artist who dreamed it into being.','animation'),
  preview('raga','Raga at Dusk',art.raga,'Music and Mantras','An original visual meditation where ancient rhythm meets an imagined horizon.','music'),
  preview('signal','The Monsoon Signal',art.signal,'Series','A radio operator hears tomorrow’s weather—and a warning meant only for her.','series'),
  preview('echo','Echoes of Nila',art.echo,'Drama','A sound archivist follows a lost melody through a city that is slowly forgetting.','film'),
];

export const editorialRows = [
  {id:'editorial-featured',title:'Featured',reason:'A first look at worlds being shaped at Ripple',items:[editorialTitles[0],editorialTitles[4],editorialTitles[10],editorialTitles[11]]},
  {id:'editorial-mythology',title:'Mythology & Epics',reason:'Original editorial concepts • Coming Soon',items:editorialTitles.slice(0,4)},
  {id:'editorial-ai-cinema',title:'AI Cinema',reason:'Imagination, amplified',items:[editorialTitles[4],editorialTitles[5],editorialTitles[7],editorialTitles[11]]},
  {id:'editorial-series',title:'Series',portrait:true,reason:'Stories built to unfold',items:[editorialTitles[1],editorialTitles[3],editorialTitles[10]]},
  {id:'editorial-films',title:'Films',portrait:true,reason:'Feature-length concepts',items:[editorialTitles[0],editorialTitles[4],editorialTitles[5],editorialTitles[11]]},
  {id:'editorial-shorts',title:'Shorts',reason:'Brief stories. Lasting worlds.',items:[editorialTitles[6],editorialTitles[7]]},
  {id:'editorial-animation',title:'Animation',portrait:true,reason:'Frame by imagined frame',items:[editorialTitles[8],editorialTitles[5],editorialTitles[6]]},
  {id:'editorial-music',title:'Music & Mantras',reason:'Original audiovisual concepts',items:[editorialTitles[9],editorialTitles[7]]},
  {id:'editorial-coming',title:'Coming Soon',portrait:true,reason:'Preview the next wave of Ripple originals',items:editorialTitles.slice(2,10)},
];

const by = predicate => editorialTitles.filter(predicate);
export const routeEditorial = {
  films: [
    {id:'films-popular',title:'Popular Films',reason:'Editorial previews • Rankings unavailable until sufficient viewing data exists',items:by(x=>x.type==='film').slice(0,4)},
    {id:'films-new',title:'New Films',reason:'Editorial previews • Coming Soon',items:by(x=>x.type==='film').slice(2)},
    {id:'films-language',title:'Films by Language',reason:'Hindi • Editorial previews • Coming Soon',items:by(x=>x.type==='film')},
    {id:'films-genre',title:'Films by Genre',reason:'Mythology, science fiction and regional stories • Editorial previews',items:by(x=>x.type==='film')},
    {id:'films-coming',title:'Coming Soon',reason:'Ripple editorial concepts • Media not yet available',items:by(x=>x.type==='film')},
  ],
  series: [
    {id:'series-trending',title:'Trending Series',reason:'Editorial previews • No fabricated ranking',items:by(x=>x.type==='series')},
    {id:'series-new',title:'New Episodes',reason:'Editorial previews • Episodes coming soon',items:by(x=>x.type==='series')},
    {id:'series-genres',title:'Series by Genre',reason:'Mythology and fantasy • Editorial previews',items:by(x=>x.type==='series')},
    {id:'series-seasons',title:'Seasons and Episodes',reason:'Episode guides will appear when published',items:by(x=>x.type==='series')},
    {id:'series-coming',title:'Coming Soon',reason:'Ripple editorial concepts • Media not yet available',items:by(x=>x.type==='series')},
  ],
  shorts: [
    {id:'shorts-new',title:'New Shorts',reason:'Editorial previews • Coming Soon',items:by(x=>x.type==='short')},
    {id:'shorts-popular',title:'Popular Shorts',reason:'Popularity will appear when backend aggregates are sufficient',items:by(x=>x.type==='short')},
    {id:'shorts-genres',title:'Shorts by Genre',reason:'Short films and AI music videos • Editorial previews',items:by(x=>x.type==='short')},
  ],
};
