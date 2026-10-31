// Tour data. This is the one file the team edits: dates, venues, status, links and city drops.
// status: 'on-sale' | 'low' | 'sold-out'
window.TOUR = {
  artist: 'Belly Gang Kushington',
  name: 'WTF Goin Tour',
  site: 'https://bellygangkushington.com',
  shop: 'https://bellygangkushington.com/collections/all',
  stream: 'https://bellygangkushington.com',
  stops: [
    { code: '404', city: 'Atlanta', state: 'GA', fips: '13', venue: 'Tabernacle', date: '2026-11-25', doors: '7:00 PM', show: '8:00 PM', tz: '-05:00', ages: 'All Ages',
      lon: -84.388, lat: 33.749, status: 'low', tickets: 'https://bellygangkushington.com', tee: '404 Tee' },
    { code: '313', city: 'Detroit', state: 'MI', fips: '26', venue: 'The Shelter', date: '2026-12-03', doors: '7:00 PM', show: '8:00 PM', tz: '-05:00', ages: '18+',
      lon: -83.046, lat: 42.331, status: 'on-sale', tickets: 'https://bellygangkushington.com', tee: '313 Tee' },
    { code: '713', city: 'Houston', state: 'TX', fips: '48', venue: 'House of Blues', date: '2026-12-08', doors: '7:00 PM', show: '8:00 PM', tz: '-06:00', ages: 'All Ages',
      lon: -95.369, lat: 29.760, status: 'on-sale', tickets: 'https://bellygangkushington.com', tee: '713 Tee' }
  ],
  // Sample fan requests for the next leg (a real build would load these from a backend)
  requests: [
    ['Dallas', 1240], ['Miami', 980], ['Chicago', 870], ['Los Angeles', 812], ['New York', 794],
    ['Memphis', 640], ['Charlotte', 512], ['New Orleans', 466], ['Nashville', 390], ['Phoenix', 248]
  ]
};

// Places the request box can put on the map
window.CITIES = {
  'Dallas':[-96.797,32.777],'Miami':[-80.192,25.762],'Chicago':[-87.630,41.878],'Los Angeles':[-118.244,34.052],'New York':[-74.006,40.713],
  'Memphis':[-90.049,35.150],'Charlotte':[-80.843,35.227],'New Orleans':[-90.072,29.951],'Nashville':[-86.781,36.163],'Phoenix':[-112.074,33.448],
  'Atlanta':[-84.388,33.749],'Detroit':[-83.046,42.331],'Houston':[-95.369,29.760],'San Antonio':[-98.494,29.424],'Austin':[-97.743,30.267],
  'Birmingham':[-86.802,33.521],'Jacksonville':[-81.656,30.332],'Orlando':[-81.379,28.538],'Tampa':[-82.458,27.951],'Columbia':[-81.035,34.000],
  'Raleigh':[-78.638,35.780],'Richmond':[-77.436,37.541],'Washington':[-77.037,38.907],'Baltimore':[-76.612,39.290],'Philadelphia':[-75.165,39.953],
  'Boston':[-71.059,42.360],'Cleveland':[-81.694,41.499],'Columbus':[-82.999,39.961],'Cincinnati':[-84.512,39.103],'Indianapolis':[-86.158,39.768],
  'Louisville':[-85.759,38.253],'St. Louis':[-90.199,38.627],'Kansas City':[-94.579,39.100],'Milwaukee':[-87.906,43.039],'Minneapolis':[-93.265,44.978],
  'Oklahoma City':[-97.516,35.468],'Little Rock':[-92.290,34.746],'Jackson':[-90.185,32.299],'Shreveport':[-93.750,32.525],'Baton Rouge':[-91.187,30.451],
  'Denver':[-104.990,39.739],'Las Vegas':[-115.140,36.170],'San Diego':[-117.161,32.716],'San Francisco':[-122.419,37.775],'Oakland':[-122.271,37.804],
  'Sacramento':[-121.494,38.582],'Seattle':[-122.332,47.606],'Portland':[-122.676,45.515],'Salt Lake City':[-111.891,40.761],'Albuquerque':[-106.650,35.084],
  'El Paso':[-106.485,31.762],'Pittsburgh':[-79.996,40.441],'Buffalo':[-78.878,42.886],'Savannah':[-81.100,32.084],'Mobile':[-88.043,30.695],
  'Tulsa':[-95.993,36.154],'Omaha':[-95.935,41.257],'Flint':[-83.687,43.012],'Gary':[-87.346,41.593],'Newark':[-74.172,40.736],'Brooklyn':[-73.944,40.678]
};
