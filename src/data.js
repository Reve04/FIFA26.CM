// FIFA World Cup 2026 Data Model

export const TEAMS = {
  // Group A
  MEX: { id: "MEX", name: "Mexico", flag: "🇲🇽", confed: "CONCACAF", rating: 82, keyPlayers: ["Santiago Giménez", "Edson Álvarez", "Chucky Lozano", "Luis Chávez"] },
  RSA: { id: "RSA", name: "South Africa", flag: "🇿🇦", confed: "CAF", rating: 74, keyPlayers: ["Percy Tau", "Teboho Mokoena", "Themba Zwane", "Ronwen Williams"] },
  KOR: { id: "KOR", name: "South Korea", flag: "🇰🇷", confed: "AFC", rating: 80, keyPlayers: ["Son Heung-min", "Hwang Hee-chan", "Lee Kang-in", "Kim Min-jae"] },
  CZE: { id: "CZE", name: "Czechia", flag: "🇨🇿", confed: "UEFA", rating: 78, keyPlayers: ["Patrik Schick", "Tomas Soucek", "Adam Hlozek", "Vladimir Coufal"] },

  // Group B
  CAN: { id: "CAN", name: "Canada", flag: "🇨🇦", confed: "CONCACAF", rating: 79, keyPlayers: ["Alphonso Davies", "Jonathan David", "Cyle Larin", "Stephen Eustáquio"] },
  BIH: { id: "BIH", name: "Bosnia & Herzegovina", flag: "🇧🇦", confed: "UEFA", rating: 75, keyPlayers: ["Edin Džeko", "Miralem Pjanić", "Sead Kolašinac", "Rade Krunić"] },
  QAT: { id: "QAT", name: "Qatar", flag: "🇶🇦", confed: "AFC", rating: 72, keyPlayers: ["Akram Afif", "Almoez Ali", "Hassan Al-Haydos", "Boualem Khoukhi"] },
  SUI: { id: "SUI", name: "Switzerland", flag: "🇨🇭", confed: "UEFA", rating: 82, keyPlayers: ["Granit Xhaka", "Xherdan Shaqiri", "Manuel Akanji", "Yann Sommer"] },

  // Group C
  BRA: { id: "BRA", name: "Brazil", flag: "🇧🇷", confed: "CONMEBOL", rating: 92, keyPlayers: ["Vinicius Jr.", "Rodrygo", "Neymar Jr.", "Bruno Guimarães", "Alisson"] },
  MAR: { id: "MAR", name: "Morocco", flag: "🇲🇦", confed: "CAF", rating: 85, keyPlayers: ["Achraf Hakimi", "Hakim Ziyech", "Sofyan Amrabat", "Yassine Bounou"] },
  HAI: { id: "HAI", name: "Haiti", flag: "🇭🇹", confed: "CONCACAF", rating: 68, keyPlayers: ["Duckens Nazon", "Frantzdy Pierrot", "Derrick Etienne", "Danley Jean Jacques"] },
  SCO: { id: "SCO", name: "Scotland", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", confed: "UEFA", rating: 77, keyPlayers: ["Scott McTominay", "Andrew Robertson", "John McGinn", "Billy Gilmour"] },

  // Group D
  USA: { id: "USA", name: "United States", flag: "🇺🇸", confed: "CONCACAF", rating: 84, keyPlayers: ["Christian Pulisic", "Weston McKennie", "Tyler Adams", "Gio Reyna", "Matt Turner"] },
  PAR: { id: "PAR", name: "Paraguay", flag: "🇵🇾", confed: "CONMEBOL", rating: 78, keyPlayers: ["Miguel Almirón", "Julio Enciso", "Gustavo Gómez", "Antonio Sanabria"] },
  AUS: { id: "AUS", name: "Australia", flag: "🇦🇺", confed: "AFC", rating: 77, keyPlayers: ["Harry Souttar", "Mathew Ryan", "Craig Goodwin", "Jackson Irvine"] },
  TUR: { id: "TUR", name: "Türkiye", flag: "🇹🇷", confed: "UEFA", rating: 81, keyPlayers: ["Hakan Çalhanoğlu", "Arda Güler", "Kerem Aktürkoğlu", "Barış Alper Yılmaz"] },

  // Group E
  GER: { id: "GER", name: "Germany", flag: "🇩🇪", confed: "UEFA", rating: 89, keyPlayers: ["Jamal Musiala", "Florian Wirtz", "Kai Havertz", "İlkay Gündoğan", "Manuel Neuer"] },
  CUW: { id: "CUW", name: "Curaçao", flag: "🇨🇼", confed: "CONCACAF", rating: 67, keyPlayers: ["Juninho Bacuna", "Leandro Bacuna", "Kenji Gorré", "Eloy Room"] },
  CIV: { id: "CIV", name: "Ivory Coast", flag: "🇨🇮", confed: "CAF", rating: 81, keyPlayers: ["Sébastien Haller", "Franck Kessié", "Simon Adingra", "Ousmane Diomande"] },
  ECU: { id: "ECU", name: "Ecuador", flag: "🇪🇨", confed: "CONMEBOL", rating: 80, keyPlayers: ["Enner Valencia", "Moises Caicedo", "Pervis Estupiñán", "Piero Hincapié"] },

  // Group F
  NED: { id: "NED", name: "Netherlands", flag: "🇳🇱", confed: "UEFA", rating: 87, keyPlayers: ["Virgil van Dijk", "Cody Gakpo", "Frenkie de Jong", "Xavi Simons", "Bart Verbruggen"] },
  JPN: { id: "JPN", name: "Japan", flag: "🇯🇵", confed: "AFC", rating: 83, keyPlayers: ["Kaoru Mitoma", "Wataru Endo", "Takefusa Kubo", "Takumi Minamino"] },
  SWE: { id: "SWE", name: "Sweden", flag: "🇸🇪", confed: "UEFA", rating: 81, keyPlayers: ["Alexander Isak", "Viktor Gyökeres", "Dejan Kulusevski", "Victor Lindelöf"] },
  TUN: { id: "TUN", name: "Tunisia", flag: "🇹🇳", confed: "CAF", rating: 75, keyPlayers: ["Youssef Msakni", "Ellyes Skhiri", "Aïssa Laïdouni", "Montassar Talbi"] },

  // Group G
  BEL: { id: "BEL", name: "Belgium", flag: "🇧🇪", confed: "UEFA", rating: 86, keyPlayers: ["Kevin De Bruyne", "Romelu Lukaku", "Jérémy Doku", "Amadou Onana"] },
  EGY: { id: "EGY", name: "Egypt", flag: "🇪🇬", confed: "CAF", rating: 80, keyPlayers: ["Mohamed Salah", "Mostafa Mohamed", "Trézéguet", "Omar Marmoush"] },
  IRN: { id: "IRN", name: "Iran", flag: "🇮🇷", confed: "AFC", rating: 77, keyPlayers: ["Mehdi Taremi", "Sardar Azmoun", "Alireza Jahanbakhsh", "Samaman Ghoddos"] },
  NZL: { id: "NZL", name: "New Zealand", flag: "🇳🇿", confed: "OFC", rating: 70, keyPlayers: ["Chris Wood", "Liborato Cacace", "Sarpreet Singh", "Joe Bell"] },

  // Group H
  ESP: { id: "ESP", name: "Spain", flag: "🇪🇸", confed: "UEFA", rating: 91, keyPlayers: ["Lamine Yamal", "Rodri", "Pedri", "Nico Williams", "Unai Simón"] },
  CPV: { id: "CPV", name: "Cape Verde", flag: "🇨🇻", confed: "CAF", rating: 73, keyPlayers: ["Ryan Mendes", "Garry Rodrigues", "Bebé", "Logan Costa"] },
  KSA: { id: "KSA", name: "Saudi Arabia", flag: "🇸🇦", confed: "AFC", rating: 75, keyPlayers: ["Salem Al-Dawsari", "Firas Al-Buraikan", "Saud Abdulhamid", "Mohamed Kanno"] },
  URU: { id: "URU", name: "Uruguay", flag: "🇺🇾", confed: "CONMEBOL", rating: 86, keyPlayers: ["Darwin Núñez", "Federico Valverde", "Ronald Araújo", "Luis Suárez"] },

  // Group I
  FRA: { id: "FRA", name: "France", flag: "🇫🇷", confed: "UEFA", rating: 93, keyPlayers: ["Kylian Mbappé", "Antoine Griezmann", "Ousmane Dembélé", "Aurélien Tchouaméni", "Mike Maignan"] },
  SEN: { id: "SEN", name: "Senegal", flag: "🇸🇳", confed: "CAF", rating: 81, keyPlayers: ["Sadio Mané", "Nicolas Jackson", "Pape Matar Sarr", "Kalidou Koulibaly"] },
  IRQ: { id: "IRQ", name: "Iraq", flag: "🇮🇶", confed: "AFC", rating: 73, keyPlayers: ["Aymen Hussein", "Ali Jasim", "Zidane Iqbal", "Jalal Hassan"] },
  NOR: { id: "NOR", name: "Norway", flag: "🇳🇴", confed: "UEFA", rating: 82, keyPlayers: ["Erling Haaland", "Martin Ødegaard", "Oscar Bobb", "Leo Østigård"] },

  // Group J
  ARG: { id: "ARG", name: "Argentina", flag: "🇦🇷", confed: "CONMEBOL", rating: 94, keyPlayers: ["Lionel Messi", "Lautaro Martínez", "Julián Álvarez", "Alexis Mac Allister", "E. Martínez"] },
  ALG: { id: "ALG", name: "Algeria", flag: "🇩🇿", confed: "CAF", rating: 78, keyPlayers: ["Riyad Mahrez", "Said Benrahma", "Amine Gouiri", "Ismaël Bennacer"] },
  AUT: { id: "AUT", name: "Austria", flag: "🇦🇹", confed: "UEFA", rating: 81, keyPlayers: ["Marcel Sabitzer", "Konrad Laimer", "Christoph Baumgartner", "David Alaba"] },
  JOR: { id: "JOR", name: "Jordan", flag: "🇯🇴", confed: "AFC", rating: 71, keyPlayers: ["Musa Al-Taamari", "Yazan Al-Naimat", "Ali Olwan", "Yazeed Abulaila"] },

  // Group K
  POR: { id: "POR", name: "Portugal", flag: "🇵🇹", confed: "UEFA", rating: 90, keyPlayers: ["Cristiano Ronaldo", "Bruno Fernandes", "Bernardo Silva", "Rafael Leão", "Diogo Costa"] },
  COD: { id: "COD", name: "DR Congo", flag: "🇨🇩", confed: "CAF", rating: 74, keyPlayers: ["Yoane Wissa", "Chancel Mbemba", "Meschack Elia", "Samuel Moutoussamy"] },
  UZB: { id: "UZB", name: "Uzbekistan", flag: "🇺🇿", confed: "AFC", rating: 73, keyPlayers: ["Eldor Shomurodov", "Abbosbek Fayzullaev", "Oston Urunov", "Jaloliddin Masharipov"] },
  COL: { id: "COL", name: "Colombia", flag: "🇨🇴", confed: "CONMEBOL", rating: 85, keyPlayers: ["Luis Díaz", "James Rodríguez", "Jhon Durán", "Daniel Muñoz"] },

  // Group L
  ENG: { id: "ENG", name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", confed: "UEFA", rating: 92, keyPlayers: ["Jude Bellingham", "Harry Kane", "Bukayo Saka", "Phil Foden", "Declan Rice"] },
  CRO: { id: "CRO", name: "Croatia", flag: "🇭🇷", confed: "UEFA", rating: 83, keyPlayers: ["Luka Modrić", "Mateo Kovačić", "Joško Gvardiol", "Andrej Kramarić"] },
  GHA: { id: "GHA", name: "Ghana", flag: "🇬🇭", confed: "CAF", rating: 76, keyPlayers: ["Mohammed Kudus", "Inaki Williams", "Thomas Partey", "Jordan Ayew"] },
  PAN: { id: "PAN", name: "Panama", flag: "🇵🇦", confed: "CONCACAF", rating: 74, keyPlayers: ["Adalberto Carrasquilla", "José Fajardo", "Yoel Bárcenas", "Orlando Mosquera"] }
};

export const GROUPS = {
  A: { id: "A", name: "Group A", teams: ["MEX", "RSA", "KOR", "CZE"] },
  B: { id: "B", name: "Group B", teams: ["CAN", "BIH", "QAT", "SUI"] },
  C: { id: "C", name: "Group C", teams: ["BRA", "MAR", "HAI", "SCO"] },
  D: { id: "D", name: "Group D", teams: ["USA", "PAR", "AUS", "TUR"] },
  E: { id: "E", name: "Group E", teams: ["GER", "CUW", "CIV", "ECU"] },
  F: { id: "F", name: "Group F", teams: ["NED", "JPN", "SWE", "TUN"] },
  G: { id: "G", name: "Group G", teams: ["BEL", "EGY", "IRN", "NZL"] },
  H: { id: "H", name: "Group H", teams: ["ESP", "CPV", "KSA", "URU"] },
  I: { id: "I", name: "Group I", teams: ["FRA", "SEN", "IRQ", "NOR"] },
  J: { id: "J", name: "Group J", teams: ["ARG", "ALG", "AUT", "JOR"] },
  K: { id: "K", name: "Group K", teams: ["POR", "COD", "UZB", "COL"] },
  L: { id: "L", name: "Group L", teams: ["ENG", "CRO", "GHA", "PAN"] }
};

export const VENUES = [
  { id: "azteca", name: "Estadio Azteca Mexico City", city: "Mexico City", country: "Mexico", capacity: 83000, image: "estadio_azteca", utcOffset: -6 },
  { id: "metlife", name: "New York New Jersey Stadium", city: "East Rutherford (NY)", country: "USA", capacity: 82500, image: "metlife_stadium", utcOffset: -4 },
  { id: "att", name: "Dallas Stadium", city: "Arlington (Dallas)", country: "USA", capacity: 80000, image: "att_stadium", utcOffset: -5 },
  { id: "sofi", name: "Los Angeles Stadium", city: "Inglewood (LA)", country: "USA", capacity: 70240, image: "sofi_stadium", utcOffset: -7 },
  { id: "mercedes", name: "Atlanta Stadium", city: "Atlanta", country: "USA", capacity: 71000, image: "mercedes_stadium", utcOffset: -4 },
  { id: "nrg", name: "Houston Stadium", city: "Houston", country: "USA", capacity: 72220, image: "nrg_stadium", utcOffset: -5 },
  { id: "arrowhead", name: "Kansas City Stadium", city: "Kansas City", country: "USA", capacity: 76416, image: "arrowhead_stadium", utcOffset: -5 },
  { id: "hardrock", name: "Miami Stadium", city: "Miami", country: "USA", capacity: 64767, image: "hardrock_stadium", utcOffset: -4 },
  { id: "lincoln", name: "Philadelphia Stadium", city: "Philadelphia", country: "USA", capacity: 69796, image: "lincoln_stadium", utcOffset: -4 },
  { id: "levis", name: "San Francisco Bay Area Stadium", city: "Santa Clara (SF)", country: "USA", capacity: 68500, image: "levis_stadium", utcOffset: -7 },
  { id: "lumen", name: "Seattle Stadium", city: "Seattle", country: "USA", capacity: 69000, image: "lumen_stadium", utcOffset: -7 },
  { id: "gillette", name: "Boston Stadium", city: "Foxborough (Boston)", country: "USA", capacity: 65878, image: "gillette_stadium", utcOffset: -4 },
  { id: "bmo", name: "Toronto Stadium", city: "Toronto", country: "Canada", capacity: 45000, image: "bmo_field", utcOffset: -4 },
  { id: "bcplace", name: "Vancouver Stadium", city: "Vancouver", country: "Canada", capacity: 54500, image: "bc_place", utcOffset: -7 },
  { id: "akron", name: "Estadio Guadalajara", city: "Guadalajara", country: "Mexico", capacity: 48071, image: "estadio_akron", utcOffset: -6 },
  { id: "bbva", name: "Estadio Monterrey", city: "Monterrey", country: "Mexico", capacity: 53500, image: "estadio_bbva", utcOffset: -6 }
];

export const NEWS = [
  {
    id: 1,
    title: "Mbappé declared fit and ready to lead France's World Cup assault",
    summary: "French captain Kylian Mbappé has dismissed injury concerns and says France is fully focused on capturing their third World Cup title in North America.",
    category: "France",
    date: "June 3, 2026",
    time: "2 hours ago",
    readTime: "4 min read",
    author: "Marc L'Hôpital",
    image: "news_mbappe"
  },
  {
    id: 2,
    title: "Messi: 'This is my final World Cup dance, we will enjoy every moment'",
    summary: "In an exclusive interview, Lionel Messi reflects on defending Argentina's crown and what it means to lead the Albiceleste in a historic 48-team tournament.",
    category: "Argentina",
    date: "June 2, 2026",
    time: "1 day ago",
    readTime: "6 min read",
    author: "Sofia Gaitan",
    image: "news_messi"
  },
  {
    id: 3,
    title: "Host Cities buzz: USA, Canada, and Mexico stadiums put on final polishes",
    summary: "From Toronto's BMO Field expansion to the iconic Azteca, we tour the 16 state-of-the-art stadiums ready to host the world starting June 11.",
    category: "Venues",
    date: "June 1, 2026",
    time: "2 days ago",
    readTime: "8 min read",
    author: "John Miller",
    image: "news_venues"
  },
  {
    id: 4,
    title: "Pulisic: 'Playing a World Cup on home soil is a dream come true'",
    summary: "USMNT talisman Christian Pulisic talks about the pressure and excitement of playing in front of home fans and the team's ambitions to go deep.",
    category: "USA",
    date: "May 31, 2026",
    time: "3 days ago",
    readTime: "5 min read",
    author: "Alex Morgan",
    image: "news_pulisic"
  },
  {
    id: 5,
    title: "Cape Verde and Uzbekistan: Meet the 2026 World Cup debutants",
    summary: "A breakdown of the underdogs qualifying for the expanded 48-team tournament and their paths to causing massive group-stage upsets.",
    category: "Analysis",
    date: "May 30, 2026",
    time: "4 days ago",
    readTime: "7 min read",
    author: "Yusuf Al-Jamil",
    image: "news_underdogs"
  }
];

// Generate dynamic round-robin group fixtures
export function generateGroupFixtures() {
  const fixtures = [];
  let matchId = 1;

  const groupDates = [
    // Group A (MEX, RSA, KOR, CZE)
    ["June 11, 2026", "June 12, 2026", "June 18, 2026", "June 18, 2026", "June 24, 2026", "June 24, 2026"],
    // Group B (CAN, BIH, QAT, SUI)
    ["June 12, 2026", "June 13, 2026", "June 18, 2026", "June 18, 2026", "June 24, 2026", "June 24, 2026"],
    // Group C (BRA, MAR, HAI, SCO)
    ["June 13, 2026", "June 13, 2026", "June 19, 2026", "June 19, 2026", "June 24, 2026", "June 24, 2026"],
    // Group D (USA, PAR, AUS, TUR)
    ["June 12, 2026", "June 14, 2026", "June 19, 2026", "June 20, 2026", "June 25, 2026", "June 25, 2026"],
    // Group E (GER, ECU, CIV, CUW)
    ["June 14, 2026", "June 14, 2026", "June 20, 2026", "June 20, 2026", "June 25, 2026", "June 25, 2026"],
    // Group F (NED, JPN, SWE, TUN)
    ["June 14, 2026", "June 15, 2026", "June 20, 2026", "June 21, 2026", "June 25, 2026", "June 25, 2026"],
    // Group G (BEL, EGY, IRN, NZL)
    ["June 15, 2026", "June 15, 2026", "June 21, 2026", "June 21, 2026", "June 26, 2026", "June 26, 2026"],
    // Group H (ESP, CPV, KSA, URU)
    ["June 15, 2026", "June 16, 2026", "June 21, 2026", "June 22, 2026", "June 26, 2026", "June 26, 2026"],
    // Group I (FRA, SEN, IRQ, NOR)
    ["June 16, 2026", "June 16, 2026", "June 22, 2026", "June 22, 2026", "June 26, 2026", "June 26, 2026"],
    // Group J (ARG, ALG, AUT, JOR)
    ["June 16, 2026", "June 17, 2026", "June 22, 2026", "June 23, 2026", "June 27, 2026", "June 27, 2026"],
    // Group K (POR, COD, UZB, COL)
    ["June 17, 2026", "June 17, 2026", "June 23, 2026", "June 23, 2026", "June 27, 2026", "June 27, 2026"],
    // Group L (ENG, CRO, GHA, PAN)
    ["June 17, 2026", "June 18, 2026", "June 23, 2026", "June 24, 2026", "June 27, 2026", "June 27, 2026"]
  ];
  
  const groupIds = Object.keys(GROUPS);
  
  groupIds.forEach((groupId, gIndex) => {
    const group = GROUPS[groupId];
    const teams = group.teams; // 4 teams e.g., ["MEX", "RSA", "KOR", "CZE"]
    
    // Venues list rotating
    const venue1 = VENUES[gIndex % VENUES.length];
    const venue2 = VENUES[(gIndex + 6) % VENUES.length];
    
    // Round-robin pairings
    const roundRobin = [
      { home: teams[0], away: teams[1], round: 1 },
      { home: teams[2], away: teams[3], round: 1 },
      { home: teams[0], away: teams[2], round: 2 },
      { home: teams[1], away: teams[3], round: 2 },
      { home: teams[3], away: teams[0], round: 3 },
      { home: teams[1], away: teams[2], round: 3 }
    ];

    roundRobin.forEach((m, rIndex) => {
      let dateStr = groupDates[gIndex][rIndex];
      
      // Select venue
      let actualVenue = rIndex % 2 === 0 ? venue1 : venue2;
      
      // Rotate kickoff times realistically
      const kickoffTimes = ["13:00", "16:00", "18:00", "20:00"];
      let actualTime = kickoffTimes[(gIndex + rIndex) % kickoffTimes.length];

      // Explicit overrides for Groups A-L to match official 2026 schedule
      if (groupId === "A") {
        const slots = [
          { date: "June 11, 2026", time: "13:00", venueId: "azteca" }, // Match 1: Mexico vs South Africa (June 12 at 12.30 AM IST, Venue: Mexico City)
          { date: "June 11, 2026", time: "20:00", venueId: "akron" }, // Match 2: South Korea vs Czechia (June 12 at 7:30 AM IST, Venue: Zapopan)
          { date: "June 18, 2026", time: "19:00", venueId: "akron" }, // Match 3: Mexico vs South Korea (June 19 at 6.30 AM IST, Venue: Zapopan)
          { date: "June 18, 2026", time: "12:00", venueId: "mercedes" }, // Match 4: Czechia vs South Africa (June 18 at 9:30 PM IST, Venue: Atlanta) [REVERSED]
          { date: "June 24, 2026", time: "19:00", venueId: "azteca" }, // Match 5: Czechia vs Mexico (June 25 at 6.30 AM IST, Venue: Mexico City)
          { date: "June 24, 2026", time: "19:00", venueId: "akron" }, // Match 6: South Africa vs South Korea (June 25 at 6.30 AM IST, Venue: Guadalajara)
        ];
        const slot = slots[rIndex];
        dateStr = slot.date;
        actualTime = slot.time;
        actualVenue = VENUES.find(v => v.id === slot.venueId) || actualVenue;
      } else if (groupId === "B") {
        const slots = [
          { date: "June 12, 2026", time: "15:00", venueId: "bmo" }, // Match 1: Canada vs Bosnia and Herzegovina (June 13 at 12.30 AM IST, Venue: Toronto)
          { date: "June 13, 2026", time: "12:00", venueId: "levis" }, // Match 2: Qatar vs Switzerland (June 14 at 12:30 AM IST, Venue: Santa Clara)
          { date: "June 18, 2026", time: "15:00", venueId: "bcplace" }, // Match 3: Canada vs Qatar (June 19 at 3:30 AM IST, Venue: Vancouver)
          { date: "June 18, 2026", time: "12:00", venueId: "sofi" }, // Match 4: Switzerland vs Bosnia and Herzegovina (June 19 at 12:30 AM IST, Venue: Los Angeles) [REVERSED]
          { date: "June 24, 2026", time: "12:00", venueId: "bcplace" }, // Match 5: Switzerland vs Canada (June 25 at 12:30 AM IST, Venue: Vancouver)
          { date: "June 24, 2026", time: "12:00", venueId: "lumen" }, // Match 6: Bosnia and Herzegovina vs Qatar (June 25 at 12:30 AM IST, Venue: Seattle)
        ];
        const slot = slots[rIndex];
        dateStr = slot.date;
        actualTime = slot.time;
        actualVenue = VENUES.find(v => v.id === slot.venueId) || actualVenue;
      } else if (groupId === "C") {
        const slots = [
          { date: "June 13, 2026", time: "18:00", venueId: "metlife" }, // Match 1: Brazil vs Morocco (June 14 at 3:30 AM IST, Venue: New Jersey)
          { date: "June 13, 2026", time: "21:00", venueId: "gillette" }, // Match 2: Haiti vs Scotland (June 14 at 6:30 AM IST, Venue: Foxborough)
          { date: "June 19, 2026", time: "20:30", venueId: "lincoln" }, // Match 3: Brazil vs Haiti (June 20 at 6 AM IST, Venue: Philadelphia)
          { date: "June 19, 2026", time: "18:00", venueId: "gillette" }, // Match 4: Scotland vs Morocco (June 20 at 3:30 AM IST, Venue: Foxborough) [REVERSED]
          { date: "June 24, 2026", time: "18:00", venueId: "hardrock" }, // Match 5: Scotland vs Brazil (June 25 at 3.30 AM IST, Venue: Miami)
          { date: "June 24, 2026", time: "18:00", venueId: "mercedes" }, // Match 6: Morocco vs Haiti (June 25 at 3.30 AM IST, Venue: Atlanta)
        ];
        const slot = slots[rIndex];
        dateStr = slot.date;
        actualTime = slot.time;
        actualVenue = VENUES.find(v => v.id === slot.venueId) || actualVenue;
      } else if (groupId === "D") {
        const slots = [
          { date: "June 12, 2026", time: "18:00", venueId: "sofi" }, // Match 1: USA vs Paraguay (June 13 at 6:30 AM IST, Venue: Los Angeles)
          { date: "June 13, 2026", time: "21:00", venueId: "bcplace" }, // Match 2: Australia vs Turkey (June 14 at 9:30 AM IST, Venue: Vancouver)
          { date: "June 19, 2026", time: "12:00", venueId: "lumen" }, // Match 3: USA vs Australia (June 20 at 12.30 AM IST, Venue: Seattle)
          { date: "June 19, 2026", time: "20:00", venueId: "levis" }, // Match 4: Turkey vs Paraguay (June 20 at 8.30 AM IST, Venue: Santa Clara) [REVERSED]
          { date: "June 25, 2026", time: "19:00", venueId: "sofi" }, // Match 5: Turkey vs USA (June 26 at 7:30 AM IST, Venue: Los Angeles)
          { date: "June 25, 2026", time: "19:00", venueId: "levis" }, // Match 6: Paraguay vs Australia (June 26 at 7:30 AM IST, Venue: Santa Clara)
        ];
        const slot = slots[rIndex];
        dateStr = slot.date;
        actualTime = slot.time;
        actualVenue = VENUES.find(v => v.id === slot.venueId) || actualVenue;
      } else if (groupId === "E") {
        const slots = [
          { date: "June 14, 2026", time: "12:00", venueId: "nrg" }, // Match 1: Germany vs Curaçao (June 14 at 10:30 PM IST, Venue: Houston)
          { date: "June 14, 2026", time: "19:00", venueId: "lincoln" }, // Match 2: Ivory Coast vs Ecuador (June 15 at 4.30 AM IST, Venue: Philadelphia)
          { date: "June 20, 2026", time: "16:00", venueId: "bmo" }, // Match 3: Germany vs Ivory Coast (June 21 at 1.30 AM IST, Venue: Toronto)
          { date: "June 20, 2026", time: "19:00", venueId: "arrowhead" }, // Match 4: Ecuador vs Curaçao (June 21 at 5.30 AM IST, Venue: Kansas City) [REVERSED]
          { date: "June 25, 2026", time: "16:00", venueId: "metlife" }, // Match 5: Ecuador vs Germany (June 26 at 1.30 AM IST, Venue: New Jersey)
          { date: "June 25, 2026", time: "16:00", venueId: "lincoln" }, // Match 6: Curaçao vs Ivory Coast (June 26 at 1.30 AM IST, Venue: Philadelphia)
        ];
        const slot = slots[rIndex];
        dateStr = slot.date;
        actualTime = slot.time;
        actualVenue = VENUES.find(v => v.id === slot.venueId) || actualVenue;
      } else if (groupId === "F") {
        const slots = [
          { date: "June 14, 2026", time: "15:00", venueId: "att" }, // Match 1: Netherlands vs Japan (June 15 at 1:30 AM IST, Venue: Arlington)
          { date: "June 14, 2026", time: "20:00", venueId: "akron" }, // Match 2: Sweden vs Tunisia (June 15 at 7:30 AM IST, Venue: Guadalajara)
          { date: "June 20, 2026", time: "12:00", venueId: "nrg" }, // Match 3: Netherlands vs Sweden (June 20 at 10:30 PM IST, Venue: Houston)
          { date: "June 20, 2026", time: "22:00", venueId: "akron" }, // Match 4: Tunisia vs Japan (June 21 at 9.30 AM IST, Venue: Guadalajara) [REVERSED]
          { date: "June 25, 2026", time: "18:00", venueId: "arrowhead" }, // Match 5: Tunisia vs Netherlands (June 26 at 4.30 AM IST, Venue: Kansas City)
          { date: "June 25, 2026", time: "18:00", venueId: "att" }, // Match 6: Japan vs Sweden (June 26 at 4.30 AM IST, Venue: Arlington)
        ];
        const slot = slots[rIndex];
        dateStr = slot.date;
        actualTime = slot.time;
        actualVenue = VENUES.find(v => v.id === slot.venueId) || actualVenue;
      } else if (groupId === "G") {
        const slots = [
          { date: "June 15, 2026", time: "12:00", venueId: "lumen" }, // Match 1: Belgium vs Egypt (June 16 at 12:30 AM IST, Venue: Seattle)
          { date: "June 15, 2026", time: "18:00", venueId: "sofi" }, // Match 2: Iran vs New Zealand (June 16 at 6:30 AM IST, Venue: Los Angeles)
          { date: "June 21, 2026", time: "12:00", venueId: "sofi" }, // Match 3: Belgium vs Iran (June 22 at 12.30 AM IST, Venue: Los Angeles)
          { date: "June 21, 2026", time: "18:00", venueId: "bcplace" }, // Match 4: New Zealand vs Egypt (June 22 at 6.30 AM IST, Venue: Vancouver) [REVERSED]
          { date: "June 26, 2026", time: "20:00", venueId: "bcplace" }, // Match 5: New Zealand vs Belgium (June 27 at 8:30 AM IST, Venue: Vancouver)
          { date: "June 26, 2026", time: "20:00", venueId: "lumen" }, // Match 6: Egypt vs Iran (June 27 at 8:30 AM IST, Venue: Seattle)
        ];
        const slot = slots[rIndex];
        dateStr = slot.date;
        actualTime = slot.time;
        actualVenue = VENUES.find(v => v.id === slot.venueId) || actualVenue;
      } else if (groupId === "H") {
        const slots = [
          { date: "June 15, 2026", time: "12:00", venueId: "mercedes" }, // Match 1: Spain vs Cape Verde (June 15 at 9:30 PM IST, Venue: Atlanta)
          { date: "June 15, 2026", time: "18:00", venueId: "hardrock" }, // Match 2: Saudi Arabia vs Uruguay (June 16 at 3:30 AM IST, Venue: Miami)
          { date: "June 21, 2026", time: "12:00", venueId: "mercedes" }, // Match 3: Spain vs Saudi Arabia (June 21 at 9:30 PM IST, Venue: Atlanta)
          { date: "June 21, 2026", time: "18:00", venueId: "hardrock" }, // Match 4: Uruguay vs Cape Verde (June 22 at 3.30 AM IST, Venue: Miami) [REVERSED]
          { date: "June 26, 2026", time: "18:00", venueId: "akron" }, // Match 5: Uruguay vs Spain (June 27 at 5.30 AM IST, Venue: Zapopan)
          { date: "June 26, 2026", time: "19:00", venueId: "nrg" }, // Match 6: Cape Verde vs Saudi Arabia (June 27 at 5.30 AM IST, Venue: Houston)
        ];
        const slot = slots[rIndex];
        dateStr = slot.date;
        actualTime = slot.time;
        actualVenue = VENUES.find(v => v.id === slot.venueId) || actualVenue;
      } else if (groupId === "I") {
        const slots = [
          { date: "June 16, 2026", time: "15:00", venueId: "metlife" }, // Match 1: France vs Senegal (June 17 at 12.30 AM IST, Venue: New Jersey)
          { date: "June 16, 2026", time: "18:00", venueId: "gillette" }, // Match 2: Iraq vs Norway (June 17 at 3:30 AM IST, Venue: Foxborough)
          { date: "June 22, 2026", time: "17:00", venueId: "lincoln" }, // Match 3: France vs Iraq (June 23 at 2.30 AM IST, Venue: Philadelphia)
          { date: "June 22, 2026", time: "20:00", venueId: "bmo" }, // Match 4: Norway vs Senegal (June 23 at 5.30 AM IST, Venue: Toronto) [REVERSED]
          { date: "June 26, 2026", time: "15:00", venueId: "gillette" }, // Match 5: Norway vs France (June 27 at 12.30 AM IST, Venue: Foxborough)
          { date: "June 26, 2026", time: "15:00", venueId: "bmo" }, // Match 6: Senegal vs Iraq (June 27 at 12.30 AM IST, Venue: Toronto)
        ];
        const slot = slots[rIndex];
        dateStr = slot.date;
        actualTime = slot.time;
        actualVenue = VENUES.find(v => v.id === slot.venueId) || actualVenue;
      } else if (groupId === "J") {
        const slots = [
          { date: "June 16, 2026", time: "20:00", venueId: "arrowhead" }, // Match 1: Argentina vs Algeria (June 17 at 6:30 AM IST, Venue: Kansas City)
          { date: "June 16, 2026", time: "21:00", venueId: "levis" }, // Match 2: Austria vs Jordan (June 17 at 9.30 AM IST, Venue: Santa Clara)
          { date: "June 22, 2026", time: "12:00", venueId: "att" }, // Match 3: Argentina vs Austria (June 22 at 10:30 PM IST, Venue: Arlington)
          { date: "June 22, 2026", time: "20:00", venueId: "levis" }, // Match 4: Jordan vs Algeria (June 23 at 8:30 AM IST, Venue: Santa Clara) [REVERSED]
          { date: "June 27, 2026", time: "21:00", venueId: "att" }, // Match 5: Jordan vs Argentina (June 28 at 7.30 AM IST, Venue: Arlington)
          { date: "June 27, 2026", time: "21:00", venueId: "arrowhead" }, // Match 6: Algeria vs Austria (June 28 at 7.30 AM IST, Venue: Kansas City)
        ];
        const slot = slots[rIndex];
        dateStr = slot.date;
        actualTime = slot.time;
        actualVenue = VENUES.find(v => v.id === slot.venueId) || actualVenue;
      } else if (groupId === "K") {
        const slots = [
          { date: "June 17, 2026", time: "12:00", venueId: "nrg" }, // Match 1: Portugal vs DR Congo (June 17 at 10:30 PM IST, Venue: Houston)
          { date: "June 17, 2026", time: "20:00", venueId: "azteca" }, // Match 2: Uzbekistan vs Colombia (June 18 at 7:30 AM IST, Venue: Mexico City)
          { date: "June 23, 2026", time: "12:00", venueId: "nrg" }, // Match 3: Portugal vs Uzbekistan (June 23 at 10:30 PM IST, Venue: Houston)
          { date: "June 23, 2026", time: "20:00", venueId: "akron" }, // Match 4: Colombia vs DR Congo (June 24 at 7:30 AM IST, Venue: Zapopan) [REVERSED]
          { date: "June 27, 2026", time: "19:30", venueId: "hardrock" }, // Match 5: Colombia vs Portugal (June 28 at 5 AM IST, Venue: Miami)
          { date: "June 27, 2026", time: "19:30", venueId: "mercedes" }, // Match 6: DR Congo vs Uzbekistan (June 28 at 5 AM IST, Venue: Atlanta)
        ];
        const slot = slots[rIndex];
        dateStr = slot.date;
        actualTime = slot.time;
        actualVenue = VENUES.find(v => v.id === slot.venueId) || actualVenue;
      } else if (groupId === "L") {
        const slots = [
          { date: "June 17, 2026", time: "15:00", venueId: "att" }, // Match 1: England vs Croatia (June 18 at 1.30 AM IST, Venue: Arlington)
          { date: "June 17, 2026", time: "19:00", venueId: "bmo" }, // Match 2: Ghana vs Panama (June 18 at 4:30 AM IST, Venue: Toronto)
          { date: "June 23, 2026", time: "16:00", venueId: "gillette" }, // Match 3: England vs Ghana (June 24 at 1.30 AM IST, Venue: Foxborough)
          { date: "June 23, 2026", time: "19:00", venueId: "gillette" }, // Match 4: Panama vs Croatia (June 24 at 4:30 AM IST, Venue: Foxborough) [REVERSED]
          { date: "June 27, 2026", time: "17:00", venueId: "metlife" }, // Match 5: Panama vs England (June 28 at 2:30 AM IST, Venue: New Jersey)
          { date: "June 27, 2026", time: "17:00", venueId: "lincoln" }, // Match 6: Croatia vs Ghana (June 28 at 2:30 AM IST, Venue: Philadelphia)
        ];
        const slot = slots[rIndex];
        dateStr = slot.date;
        actualTime = slot.time;
        actualVenue = VENUES.find(v => v.id === slot.venueId) || actualVenue;
      }

      fixtures.push({
        id: matchId++,
        groupId,
        stage: "Group Stage",
        round: m.round,
        homeTeamId: m.home,
        awayTeamId: m.away,
        date: dateStr,
        time: actualTime,
        venue: actualVenue,
        score: null,
        status: "upcoming", // upcoming, live, finished
        events: []
      });
    });
  });

  return fixtures;
}
