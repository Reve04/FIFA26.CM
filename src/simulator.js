

// FIFA World Cup 2026 Simulation Engine
import { TEAMS, VENUES } from "./data.js";

// Helper to get random number in range
function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

// Simulate events for a match (goals, cards, substitutions)
export function simulateMatchEvents(homeTeam, awayTeam, homeGoals, awayGoals) {
  const events = [];
  const minutes = [];
  
  // Helper to get unique minute
  function getUniqueMinute() {
    let min;
    do {
      min = Math.floor(randomRange(1, 90));
    } while (minutes.includes(min));
    minutes.push(min);
    return min;
  }

  // Generate Goal events
  const addGoals = (team, goals, oppTeam) => {
    for (let i = 0; i < goals; i++) {
      const min = getUniqueMinute();
      // Select goal scorer (favor key players)
      let scorer = "Unknown Player";
      if (team.keyPlayers && team.keyPlayers.length > 0) {
        if (Math.random() < 0.8) {
          scorer = team.keyPlayers[Math.floor(Math.random() * team.keyPlayers.length)];
        } else {
          // General player names
          const squadMock = ["Defender", "Midfielder", "Striker"];
          scorer = team.name + " " + squadMock[Math.floor(Math.random() * squadMock.length)];
        }
      }
      
      // Assist scorer
      let assist = null;
      if (Math.random() < 0.7 && team.keyPlayers && team.keyPlayers.length > 1) {
        const potentialAssists = team.keyPlayers.filter(p => p !== scorer);
        if (potentialAssists.length > 0) {
          assist = potentialAssists[Math.floor(Math.random() * potentialAssists.length)];
        }
      }

      events.push({
        type: "goal",
        teamId: team.id,
        minute: min,
        player: scorer,
        assist: assist,
        detail: "Goal"
      });
    }
  };

  addGoals(homeTeam, homeGoals, awayTeam);
  addGoals(awayTeam, awayGoals, homeTeam);

  // Generate Yellow Cards (0 to 3 per team)
  const addCards = (team) => {
    const cardCount = Math.floor(randomRange(0, 3));
    for (let i = 0; i < cardCount; i++) {
      const min = getUniqueMinute();
      let player = team.keyPlayers[Math.floor(Math.random() * team.keyPlayers.length)];
      events.push({
        type: "card",
        teamId: team.id,
        minute: min,
        player: player,
        detail: "Yellow Card"
      });
    }
    // Rare Red Card (5% chance)
    if (Math.random() < 0.05) {
      const min = getUniqueMinute();
      let player = team.keyPlayers[Math.floor(Math.random() * team.keyPlayers.length)];
      events.push({
        type: "card",
        teamId: team.id,
        minute: min,
        player: player,
        detail: "Red Card"
      });
    }
  };

  addCards(homeTeam);
  addCards(awayTeam);

  // Sort events by minute
  events.sort((a, b) => a.minute - b.minute);
  return events;
}

// Simulate a single match
export function simulateMatch(match) {
  if (match.status === "finished") return match;

  const homeTeam = TEAMS[match.homeTeamId];
  const awayTeam = TEAMS[match.awayTeamId];

  // Rating differences influence the odds
  // Average goals in football is around 2.5 to 3
  const ratingDiff = homeTeam.rating - awayTeam.rating;
  
  // Expected goals (lambda)
  let homeExp = 1.4 + (ratingDiff * 0.05);
  let awayExp = 1.3 - (ratingDiff * 0.05);

  // Home advantage (minor)
  if (homeTeam.id === "USA" || homeTeam.id === "MEX" || homeTeam.id === "CAN") {
    homeExp += 0.2;
  }

  // Ensure positive expectations
  homeExp = Math.max(0.3, homeExp);
  awayExp = Math.max(0.3, awayExp);

  // Poisson goal generator
  const getPoisson = (lambda) => {
    let L = Math.exp(-lambda);
    let k = 0;
    let p = 1.0;
    do {
      k++;
      p *= Math.random();
    } while (p > L && k < 10);
    return k - 1;
  };

  let homeGoals = getPoisson(homeExp);
  let awayGoals = getPoisson(awayExp);

  // If knockout stage, ensure there is no draw
  if (match.stage !== "Group Stage" && homeGoals === awayGoals) {
    // 50-50 chance for who wins in extra-time/penalties
    if (Math.random() < 0.5) {
      homeGoals += 1; // Represented as winning in extra-time or pen
      match.penaltiesWinner = match.homeTeamId;
    } else {
      awayGoals += 1;
      match.penaltiesWinner = match.awayTeamId;
    }
    match.extraTime = true;
  }

  match.score = { home: homeGoals, away: awayGoals };
  match.status = "finished";
  match.events = simulateMatchEvents(homeTeam, awayTeam, homeGoals, awayGoals);

  return match;
}

// Calculate Standings for all groups
export function calculateStandings(groups, fixtures, teams) {
  const standings = {};

  // Initialize standings for all groups
  Object.keys(groups).forEach(groupId => {
    standings[groupId] = groups[groupId].teams.map(teamId => ({
      teamId,
      team: teams[teamId],
      gp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0
    }));
  });

  // Populate standings from finished fixtures
  fixtures.forEach(match => {
    if (match.stage !== "Group Stage" || match.status !== "finished") return;

    const groupStandings = standings[match.groupId];
    const homeEntry = groupStandings.find(e => e.teamId === match.homeTeamId);
    const awayEntry = groupStandings.find(e => e.teamId === match.awayTeamId);

    if (!homeEntry || !awayEntry) return;

    homeEntry.gp += 1;
    awayEntry.gp += 1;

    const homeG = match.score.home;
    const awayG = match.score.away;

    homeEntry.gf += homeG;
    homeEntry.ga += awayG;
    awayEntry.gf += awayG;
    awayEntry.ga += homeG;

    homeEntry.gd = homeEntry.gf - homeEntry.ga;
    awayEntry.gd = awayEntry.gf - awayEntry.ga;

    if (homeG > awayG) {
      homeEntry.w += 1;
      homeEntry.pts += 3;
      awayEntry.l += 1;
    } else if (homeG < awayG) {
      awayEntry.w += 1;
      awayEntry.pts += 3;
      homeEntry.l += 1;
    } else {
      homeEntry.d += 1;
      homeEntry.pts += 1;
      awayEntry.d += 1;
      awayEntry.pts += 1;
    }
  });

  // Sort each group standings
  // Rules: Points, Goal Difference, Goals Scored, Team Rating (as tiebreaker)
  Object.keys(standings).forEach(groupId => {
    standings[groupId].sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.gd !== a.gd) return b.gd - a.gd;
      if (b.gf !== a.gf) return b.gf - a.gf;
      return b.team.rating - a.team.rating;
    });
  });

  return standings;
}

// Calculate the 8 best 3rd placed teams
export function calculateBestThirdPlaced(standings) {
  const thirdPlaced = [];

  Object.keys(standings).forEach(groupId => {
    const groupStandings = standings[groupId];
    if (groupStandings.length >= 3) {
      const third = groupStandings[2]; // Index 2 is 3rd place
      thirdPlaced.push({
        groupId,
        ...third
      });
    }
  });

  // Sort: Points, Goal Difference, Goals Scored, Rating
  thirdPlaced.sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.gd !== a.gd) return b.gd - a.gd;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return b.team.rating - a.team.rating;
  });

  return thirdPlaced;
}

// Compile stats from fixtures
export function compileStats(fixtures) {
  const playerGoals = {};
  const playerAssists = {};
  const playerYellows = {};
  const playerReds = {};

  const teamGoals = {};
  const teamCleanSheets = {};
  const teamYellows = {};
  const teamReds = {};

  // Initialize team stats for all teams in data
  for (const tId in TEAMS) {
    teamGoals[tId] = 0;
    teamCleanSheets[tId] = 0;
    teamYellows[tId] = 0;
    teamReds[tId] = 0;
  }

  fixtures.forEach(match => {
    if (match.status !== "finished") return;

    const homeId = match.homeTeamId;
    const awayId = match.awayTeamId;
    if (!homeId || !awayId) return;

    const homeG = match.score.home;
    const awayG = match.score.away;

    // Team goals
    teamGoals[homeId] = (teamGoals[homeId] || 0) + homeG;
    teamGoals[awayId] = (teamGoals[awayId] || 0) + awayG;

    // Clean sheets
    if (awayG === 0) teamCleanSheets[homeId] = (teamCleanSheets[homeId] || 0) + 1;
    if (homeG === 0) teamCleanSheets[awayId] = (teamCleanSheets[awayId] || 0) + 1;

    if (!match.events) return;

    match.events.forEach(e => {
      const tId = e.teamId;
      if (e.type === "goal") {
        playerGoals[e.player] = (playerGoals[e.player] || 0) + 1;
        if (e.assist) {
          playerAssists[e.assist] = (playerAssists[e.assist] || 0) + 1;
        }
      } else if (e.type === "card") {
        if (e.detail.includes("Yellow")) {
          playerYellows[e.player] = (playerYellows[e.player] || 0) + 1;
          if (tId) teamYellows[tId] = (teamYellows[tId] || 0) + 1;
        } else if (e.detail.includes("Red")) {
          playerReds[e.player] = (playerReds[e.player] || 0) + 1;
          if (tId) teamReds[tId] = (teamReds[tId] || 0) + 1;
        }
      }
    });
  });

  const getLeaderboard = (dict) => {
    return Object.keys(dict).map(name => {
      let team = findTeamByPlayer(name);
      return { name, team, count: dict[name] };
    }).sort((a, b) => b.count - a.count).filter(x => x.count > 0).slice(0, 10);
  };

  const getTeamLeaderboard = (dict) => {
    return Object.keys(dict).map(tId => {
      return { team: TEAMS[tId], count: dict[tId] };
    }).sort((a, b) => b.count - a.count).filter(x => x.count > 0).slice(0, 10);
  };

  return {
    goals: getLeaderboard(playerGoals),
    assists: getLeaderboard(playerAssists),
    yellowCards: getLeaderboard(playerYellows),
    redCards: getLeaderboard(playerReds),
    teamGoals: getTeamLeaderboard(teamGoals),
    teamCleanSheets: getTeamLeaderboard(teamCleanSheets),
    teamYellowCards: getTeamLeaderboard(teamYellows),
    teamRedCards: getTeamLeaderboard(teamReds)
  };
}

function findTeamByPlayer(playerName) {
  for (const teamId in TEAMS) {
    const team = TEAMS[teamId];
    if (team.keyPlayers.includes(playerName) || playerName.startsWith(team.name)) {
      return team;
    }
  }
  return { name: "Unknown", flag: "" };
}

// Generate the initial round of 32 knockout matches from group stage results
export function generateRoundOf32(standings, thirdPlacedQualified) {
  const roundOf32 = [];
  let matchId = 73; // Starts after 72 group stage matches

  // 12 Group Winners: A1 to L1
  // 12 Group Runners-up: A2 to L2
  // 8 Best 3rd place: T1 to T8
  const winners = {};
  const runnersUp = {};
  
  Object.keys(standings).forEach(groupId => {
    winners[groupId] = standings[groupId][0].teamId;
    runnersUp[groupId] = standings[groupId][1].teamId;
  });

  const thirds = thirdPlacedQualified.map(t => t.teamId);

  // Standard pairing for 32 teams:
  // Pair group winners against runners-up or 3rd placed teams.
  // To keep it simple, clean, and tournament-realistic:
  // Match 1: Winner A vs Runner C
  // Match 2: Winner B vs 3rd Best 1st
  // Match 3: Winner C vs Runner A
  // Match 4: Winner D vs 3rd Best 2nd
  // Match 5: Winner E vs Runner F
  // Match 6: Winner F vs 3rd Best 3rd
  // Match 7: Winner G vs Runner H
  // Match 8: Winner H vs 3rd Best 4th
  // Match 9: Winner I vs Runner J
  // Match 10: Winner J vs 3rd Best 5th
  // Match 11: Winner K vs Runner L
  // Match 12: Winner L vs 3rd Best 6th
  // Match 13: Runner B vs Runner D
  // Match 14: Runner E vs Runner G
  // Match 15: Runner H vs Runner I
  // Match 16: Winner D vs 3rd Best 7th (rearranged)
  // Let's pair them in a deterministic bracket:
  const pairings = [
    // Left Side
    { home: winners["E"], away: thirds[0] || "RSA", label: "1E vs 3AB", placeholderHome: "1E", placeholderAway: "3AB" },
    { home: winners["I"], away: thirds[1] || "QAT", label: "1I vs 3CD", placeholderHome: "1I", placeholderAway: "3CD" },
    { home: runnersUp["A"], away: runnersUp["B"], label: "2A vs 2B", placeholderHome: "2A", placeholderAway: "2B" },
    { home: winners["F"], away: runnersUp["C"], label: "1F vs 2C", placeholderHome: "1F", placeholderAway: "2C" },
    { home: runnersUp["K"], away: runnersUp["L"], label: "2K vs 2L", placeholderHome: "2K", placeholderAway: "2L" },
    { home: winners["H"], away: runnersUp["J"], label: "1H vs 2J", placeholderHome: "1H", placeholderAway: "2J" },
    { home: winners["D"], away: thirds[2] || "SCO", label: "1D vs 3BE", placeholderHome: "1D", placeholderAway: "3BE" },
    { home: winners["G"], away: thirds[3] || "AUS", label: "1G vs 3AE", placeholderHome: "1G", placeholderAway: "3AE" },
    
    // Right Side
    { home: winners["C"], away: runnersUp["F"], label: "1C vs 2F", placeholderHome: "1C", placeholderAway: "2F" },
    { home: runnersUp["E"], away: runnersUp["I"], label: "2E vs 2I", placeholderHome: "2E", placeholderAway: "2I" },
    { home: winners["A"], away: thirds[4] || "CIV", label: "1A vs 3CE", placeholderHome: "1A", placeholderAway: "3CE" },
    { home: winners["L"], away: thirds[5] || "SWE", label: "1L vs 3EH", placeholderHome: "1L", placeholderAway: "3EH" },
    { home: winners["J"], away: runnersUp["H"], label: "1J vs 2H", placeholderHome: "1J", placeholderAway: "2H" },
    { home: runnersUp["D"], away: runnersUp["G"], label: "2D vs 2G", placeholderHome: "2D", placeholderAway: "2G" },
    { home: winners["B"], away: thirds[6] || "CPV", label: "1B vs 3EF", placeholderHome: "1B", placeholderAway: "3EF" },
    { home: winners["K"], away: thirds[7] || "AUT", label: "1K vs 3DE", placeholderHome: "1K", placeholderAway: "3DE" }
  ];

  // Resolve duplicate home teams
  const usedTeams = new Set();
  const getUnusedThird = (index) => {
    for (let i = 0; i < thirds.length; i++) {
      if (!usedTeams.has(thirds[i])) {
        usedTeams.add(thirds[i]);
        return thirds[i];
      }
    }
    return thirds[index] || "RSA";
  };

  const finalPairings = [];
  const addPairing = (h, a, label, placeholderHome, placeholderAway) => {
    let finalHome = h;
    let finalAway = a;
    
    // Ensure uniqueness
    if (usedTeams.has(finalHome)) {
      // Find another team
      for (const tId in TEAMS) {
        if (!usedTeams.has(tId)) {
          finalHome = tId;
          break;
        }
      }
    }
    usedTeams.add(finalHome);

    if (usedTeams.has(finalAway)) {
      for (const tId in TEAMS) {
        if (!usedTeams.has(tId)) {
          finalAway = tId;
          break;
        }
      }
    }
    usedTeams.add(finalAway);

    finalPairings.push({ home: finalHome, away: finalAway, label, placeholderHome, placeholderAway });
  };

  pairings.forEach((p, idx) => {
    let a = p.away;
    if (thirds.includes(a)) {
      a = getUnusedThird(idx % thirds.length);
    }
    addPairing(p.home, a, p.label, p.placeholderHome, p.placeholderAway);
  });

  const dates = [
    "June 30, 2026", "July 1, 2026", "June 28, 2026", "June 30, 2026",
    "July 3, 2026", "July 2, 2026", "July 2, 2026", "July 1, 2026",
    "June 29, 2026", "June 30, 2026", "July 1, 2026", "July 1, 2026",
    "July 4, 2026", "July 3, 2026", "July 3, 2026", "July 4, 2026"
  ];

  return finalPairings.map((p, index) => ({
    id: matchId + index,
    groupId: null,
    stage: "Round of 32",
    round: 4, // knockout round code
    homeTeamId: p.home,
    awayTeamId: p.away,
    placeholderHome: p.placeholderHome,
    placeholderAway: p.placeholderAway,
    date: dates[index % dates.length],
    time: index % 2 === 0 ? "16:00" : "20:00",
    venue: VENUES[index % VENUES.length],
    score: null,
    status: "upcoming",
    events: [],
    label: p.label
  }));
}

// Generate next stage based on previous stage finished matches
export function generateNextKnockoutStage(prevStageMatches, currentStageName, nextStageName, baseId, numMatches, dates) {
  const nextMatches = [];
  
  for (let i = 0; i < numMatches; i++) {
    const match1 = prevStageMatches[i * 2];
    const match2 = prevStageMatches[i * 2 + 1];

    let homeId = null;
    let awayId = null;
    let placeholderHome = `Winner of M${match1 ? match1.id : "?"}`;
    let placeholderAway = `Winner of M${match2 ? match2.id : "?"}`;

    if (match1 && match1.status === "finished") {
      homeId = match1.score.home > match1.score.away ? match1.homeTeamId : match1.awayTeamId;
      placeholderHome = null;
    }

    if (match2 && match2.status === "finished") {
      awayId = match2.score.home > match2.score.away ? match2.homeTeamId : match2.awayTeamId;
      placeholderAway = null;
    }

    nextMatches.push({
      id: baseId + i,
      stage: nextStageName,
      homeTeamId: homeId,
      awayTeamId: awayId,
      placeholderHome: placeholderHome,
      placeholderAway: placeholderAway,
      date: dates[i % dates.length],
      time: "20:00",
      venue: VENUES[i % VENUES.length],
      score: null,
      status: "upcoming",
      events: []
    });
  }

  return nextMatches;
}
