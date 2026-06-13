// Main Application Script for FotMob FIFA 2026 World Cup Clone
import "./style.css";
import { TEAMS, GROUPS, VENUES, NEWS, generateGroupFixtures } from "./data.js";
import { simulateMatch, calculateStandings, calculateBestThirdPlaced, compileStats, generateRoundOf32, generateNextKnockoutStage } from "./simulator.js";
import { API_CONFIG } from "./config.js";

// Global App State
const state = {
  currentTab: "matches",
  theme: localStorage.getItem("theme") || "dark",
  fixtures: [],
  knockoutFixtures: [],
  standings: {},
  thirdPlaced: [],
  favorites: (() => {
    try {
      const stored = localStorage.getItem("favorites");
      if (!stored) return { teams: [], matches: [] };
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return { teams: parsed, matches: [] };
      }
      if (parsed && typeof parsed === "object") {
        return {
          teams: Array.isArray(parsed.teams) ? parsed.teams : [],
          matches: Array.isArray(parsed.matches) ? parsed.matches : []
        };
      }
    } catch (e) {}
    return { teams: [], matches: [] };
  })(),
  searchQuery: "",
  activeFilter: "all", // all, live, finished, upcoming
  activeStage: "group", // group, knockout
  confedFilter: "ALL",
  venueCountryFilter: "ALL",
  venueSortOrder: "DESC",
  api: {
    enabled: true,
    status: "disconnected",
    liveMatches: []
  },
  overviewStatsTab: "goals",
  timezone: localStorage.getItem("timezone") || "Asia/Kolkata",
};

const flagPlaceholderHtml = `
  <div class="team-flag-placeholder-wrapper" style="display: inline-flex; align-items: center; justify-content: center; width: 16px; height: 16px; vertical-align: middle; margin-right: 4px;">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="placeholder-shield-svg" style="width: 12px; height: 12px; opacity: 0.6;">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  </div>`;

// Helper to retrieve circular country flags from flagcdn CDN
function getTeamFlagUrl(teamId) {
  if (!teamId) return "https://flagcdn.com/w40/un.png";
  const codes = {
    MEX: "mx", RSA: "za", KOR: "kr", CZE: "cz", CAN: "ca", BIH: "ba",
    QAT: "qa", SUI: "ch", BRA: "br", MAR: "ma", HAI: "ht", SCO: "gb-sct",
    USA: "us", PAR: "py", AUS: "au", TUR: "tr", GER: "de", CUW: "cw",
    CIV: "ci", ECU: "ec", NED: "nl", JPN: "jp", SWE: "se", TUN: "tn",
    BEL: "be", EGY: "eg", IRN: "ir", NZL: "nz", ESP: "es", CPV: "cv",
    KSA: "sa", URU: "uy", FRA: "fr", SEN: "sn", IRQ: "iq", NOR: "no",
    ARG: "ar", ALG: "dz", AUT: "at", JOR: "jo", POR: "pt", COD: "cd",
    UZB: "uz", COL: "co", ENG: "gb-eng", CRO: "hr", GHA: "gh", PAN: "pa"
  };
  const code = codes[teamId.toUpperCase()] || "un";
  return `https://flagcdn.com/w40/${code}.png`;
}

// Dictionary of primary and secondary colors for all 48 teams
function getTeamColors(teamId) {
  if (!teamId) return { primary: "#ff2a4b", secondary: "#ff7300" };
  const colors = {
    MEX: { primary: "#006341", secondary: "#c8102e" },
    RSA: { primary: "#007a4d", secondary: "#ffb612" },
    KOR: { primary: "#c21b36", secondary: "#0047a0" },
    CZE: { primary: "#d7141a", secondary: "#11457e" },
    CAN: { primary: "#da291c", secondary: "#ffffff" },
    BIH: { primary: "#002395", secondary: "#fecb00" },
    QAT: { primary: "#8a1538", secondary: "#ffffff" },
    SUI: { primary: "#da291c", secondary: "#ffffff" },
    BRA: { primary: "#009739", secondary: "#fecb00" },
    MAR: { primary: "#c1272d", secondary: "#006233" },
    HAI: { primary: "#00209f", secondary: "#d21034" },
    SCO: { primary: "#002b5c", secondary: "#ffffff" },
    USA: { primary: "#002868", secondary: "#bf0a30" },
    PAR: { primary: "#d52b1e", secondary: "#0038a8" },
    AUS: { primary: "#008751", secondary: "#ffcd00" },
    TUR: { primary: "#e30a17", secondary: "#ffffff" },
    GER: { primary: "#111111", secondary: "#ffcc00" },
    CUW: { primary: "#002b7f", secondary: "#f9e814" },
    CIV: { primary: "#f77f00", secondary: "#009e60" },
    ECU: { primary: "#ffdd00", secondary: "#0033a0" },
    NED: { primary: "#f36c21", secondary: "#21468b" },
    JPN: { primary: "#00008b", secondary: "#ffffff" },
    SWE: { primary: "#006aa7", secondary: "#fecb00" },
    TUN: { primary: "#e20909", secondary: "#ffffff" },
    BEL: { primary: "#e30613", secondary: "#fecb00" },
    EGY: { primary: "#c00000", secondary: "#e0b034" },
    IRN: { primary: "#239e46", secondary: "#da0000" },
    NZL: { primary: "#111111", secondary: "#ffffff" },
    ESP: { primary: "#c60b1e", secondary: "#ffc400" },
    CPV: { primary: "#002a8f", secondary: "#d21034" },
    KSA: { primary: "#006c35", secondary: "#ffffff" },
    URU: { primary: "#84b0e3", secondary: "#ffcc00" },
    FRA: { primary: "#002395", secondary: "#ed2939" },
    SEN: { primary: "#00853f", secondary: "#fdef42" },
    IRQ: { primary: "#007a3d", secondary: "#da121a" },
    NOR: { primary: "#ba0c2f", secondary: "#00205b" },
    ARG: { primary: "#75aadb", secondary: "#ffffff" },
    ALG: { primary: "#006633", secondary: "#d21034" },
    AUT: { primary: "#ed2939", secondary: "#ffffff" },
    JOR: { primary: "#c1272d", secondary: "#111111" },
    POR: { primary: "#da121a", secondary: "#046a38" },
    COD: { primary: "#007fff", secondary: "#fdec00" },
    UZB: { primary: "#00a6e2", secondary: "#1eb53a" },
    COL: { primary: "#fcd116", secondary: "#003893" },
    ENG: { primary: "#ffffff", secondary: "#ce1126" },
    CRO: { primary: "#ff0000", secondary: "#ffffff" },
    GHA: { primary: "#da121a", secondary: "#fcd116" },
    PAN: { primary: "#0051ba", secondary: "#da121a" }
  };
  return colors[teamId.toUpperCase()] || { primary: "#ff2a4b", secondary: "#ff7300" };
}

// Particle explosion emitter for favorited elements
function triggerStarExplosion(element) {
  if (!element) return;
  const rect = element.getBoundingClientRect();
  const x = rect.left + rect.width / 2 + window.scrollX;
  const y = rect.top + rect.height / 2 + window.scrollY;
  
  for (let i = 0; i < 12; i++) {
    const spark = document.createElement("div");
    spark.className = "star-sparkle";
    spark.innerHTML = "★";
    spark.style.left = `${x}px`;
    spark.style.top = `${y}px`;
    
    const angle = Math.random() * Math.PI * 2;
    const velocity = 35 + Math.random() * 45;
    const tx = Math.cos(angle) * velocity;
    const ty = Math.sin(angle) * velocity;
    
    spark.style.setProperty("--tx", `${tx}px`);
    spark.style.setProperty("--ty", `${ty}px`);
    
    const colors = ["#ffb612", "#ffcc00", "#ff7300", "#ff2a4b", "#00e5ff"];
    spark.style.color = colors[Math.floor(Math.random() * colors.length)];
    
    document.body.appendChild(spark);
    
    spark.style.animation = "sparkleAnim 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards";
    
    spark.addEventListener("animationend", () => {
      spark.remove();
    });
  }
}

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
  // Apply current theme
  document.documentElement.setAttribute("data-theme", state.theme);
  updateThemeIcon();
  
  // Start clock
  updateLocalTime();
  setInterval(updateLocalTime, 1000);

  // Generate initial group fixtures (sorted chronologically on load)
  state.fixtures = generateGroupFixtures().sort((a, b) => getMatchTimestamp(a) - getMatchTimestamp(b));
  
  // Recalculate initial empty standings
  recalculateData();
  
  state.knockoutFixtures = [];
  state.activeStage = "group";

  // Setup Event Listeners
  setupNavigation();
  setupTimezoneSelector();
  setupThemeToggle();
  setupSearch();
  setupSimulationControls();
  setupModalControls();
  setupConfedFilters();
  setupStageSelectors();
  setupApiSettings();
  setupVenuesControls();
  
  // Start countdown timer
  startCountdown();

  // Setup Stats Sub-tabs
  setupStatsTabs();

  // Setup Overview Stats Tabs
  setupOverviewTabs();

  // Initial Draw
  renderActiveTab();
  renderWidgets();

  // Dynamic Splash Loader Simulation
  const progressFill = document.getElementById("loader-progress-fill");
  const statusText = document.getElementById("loader-status-text");
  const overlay = document.getElementById("app-loader-overlay");

  let progressVal = 0;
  const statusMessages = [
    { threshold: 0, text: "Initializing Tournament Engine..." },
    { threshold: 30, text: "Loading Host Venues & Teams..." },
    { threshold: 60, text: "Compiling Fixtures & Schedules..." },
    { threshold: 85, text: "Ready for Kickoff!" }
  ];

  const interval = setInterval(() => {
    progressVal += Math.floor(Math.random() * 15) + 5;
    if (progressVal > 100) progressVal = 100;

    if (progressFill) progressFill.style.width = `${progressVal}%`;
    
    const msg = statusMessages.reduce((prev, curr) => {
      if (progressVal >= curr.threshold) return curr.text;
      return prev;
    }, statusMessages[0].text);
    if (statusText) statusText.textContent = msg;

    if (progressVal === 100) {
      clearInterval(interval);
      setTimeout(() => {
        if (overlay) {
          overlay.classList.add("fade-out");
          setTimeout(() => overlay.remove(), 550);
        }
      }, 300);
    }
  }, 80);
});

// Recalculate standings, third place, and stats based on current fixtures
function recalculateData() {
  state.standings = calculateStandings(GROUPS, state.fixtures, TEAMS);
  state.thirdPlaced = calculateBestThirdPlaced(state.standings);
}

// Navigation & Routing Tabs
function setupNavigation() {
  const navButtons = document.querySelectorAll(".nav-item");
  navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const tabName = btn.getAttribute("data-tab");
      switchTab(tabName);
    });
  });

  // Mobile Bottom Nav triggers
  const mobileNavButtons = document.querySelectorAll(".mobile-nav-item");
  mobileNavButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const tabName = btn.getAttribute("data-tab");
      if (tabName === "more") {
        document.getElementById("mobile-more-drawer").style.display = "flex";
      } else {
        switchTab(tabName);
      }
    });
  });

  // Mobile More Drawer items triggers
  const drawerItems = document.querySelectorAll(".mobile-drawer-item");
  drawerItems.forEach(item => {
    item.addEventListener("click", () => {
      const tabName = item.getAttribute("data-tab");
      switchTab(tabName);
      document.getElementById("mobile-more-drawer").style.display = "none";
    });
  });

  // Close Mobile Drawer handlers
  const closeDrawerBtn = document.getElementById("close-mobile-drawer-btn");
  if (closeDrawerBtn) {
    closeDrawerBtn.addEventListener("click", () => {
      document.getElementById("mobile-more-drawer").style.display = "none";
    });
  }
  
  const favsDrawerBtn = document.getElementById("mobile-drawer-favs-btn");
  if (favsDrawerBtn) {
    favsDrawerBtn.addEventListener("click", () => {
      document.getElementById("mobile-more-drawer").style.display = "none";
      document.getElementById("widget-sidebar").classList.add("active");
    });
  }

  const closeSidebarRightBtn = document.getElementById("close-sidebar-right-btn");
  if (closeSidebarRightBtn) {
    closeSidebarRightBtn.addEventListener("click", () => {
      document.getElementById("widget-sidebar").classList.remove("active");
    });
  }

  const drawerOverlay = document.getElementById("mobile-more-drawer");
  if (drawerOverlay) {
    drawerOverlay.addEventListener("click", (e) => {
      if (e.target === drawerOverlay) {
        drawerOverlay.style.display = "none";
      }
    });
  }
}

function switchTab(tabName) {
  state.currentTab = tabName;

  // Update active state in side nav
  const navButtons = document.querySelectorAll(".nav-item");
  navButtons.forEach(btn => {
    if (btn.getAttribute("data-tab") === tabName) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  // Update active state in mobile bottom bar
  const mobileNavButtons = document.querySelectorAll(".mobile-nav-item");
  mobileNavButtons.forEach(btn => {
    const btnTab = btn.getAttribute("data-tab");
    if (btnTab === tabName || (btnTab === "more" && ["stats", "teams", "news", "venues"].includes(tabName))) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  // Hide all views
  const views = document.querySelectorAll(".tab-view");
  views.forEach(view => {
    view.style.display = "none";
  });

  // Show active view
  const activeView = document.getElementById(`view-${tabName}`);
  if (activeView) {
    activeView.style.display = "block";
  }

  // Render tab content
  renderActiveTab();
}

// Render Content based on current active tab
function renderActiveTab() {
  // Hide details/clear searches if needed
  switch (state.currentTab) {
    case "overview":
      renderOverview();
      break;
    case "matches":
      renderMatches();
      break;
    case "playoffs":
      renderPlayoffs();
      break;
    case "table":
      renderTable();
      break;
    case "stats":
      renderStats();
      break;
    case "teams":
      renderTeams();
      break;
    case "news":
      renderNews();
      break;
    case "venues":
      renderVenues();
      break;
  }
}

function setupTimezoneSelector() {
  const tzSelect = document.getElementById("timezone-selector");
  if (!tzSelect) return;

  const timezones = [
    { value: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC", label: "Local Browser Time" },
    { value: "UTC", label: "UTC" },
    { value: "America/New_York", label: "Eastern Time (ET)" },
    { value: "America/Chicago", label: "Central Time (CT)" },
    { value: "America/Denver", label: "Mountain Time (MT)" },
    { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
    { value: "Europe/London", label: "London (GMT/BST)" },
    { value: "Europe/Paris", label: "Central Europe (CET)" },
    { value: "Asia/Kolkata", label: "India (IST)" },
    { value: "Asia/Tokyo", label: "Japan (JST)" },
    { value: "Australia/Sydney", label: "Sydney (AEST)" }
  ];

  tzSelect.innerHTML = "";
  timezones.forEach(tz => {
    const opt = document.createElement("option");
    opt.value = tz.value;
    opt.textContent = tz.label;
    tzSelect.appendChild(opt);
  });

  if (!timezones.find(t => t.value === state.timezone)) {
    const opt = document.createElement("option");
    opt.value = state.timezone;
    opt.textContent = state.timezone;
    tzSelect.appendChild(opt);
  }
  tzSelect.value = state.timezone;

  tzSelect.addEventListener("change", (e) => {
    state.timezone = e.target.value;
    localStorage.setItem("timezone", state.timezone);
    updateLocalTime();
    renderActiveTab();
  });
}

// Theme Switcher (Dark/Light)
function setupThemeToggle() {
  const toggleBtn = document.getElementById("theme-toggle-btn");
  toggleBtn.addEventListener("click", () => {
    state.theme = state.theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", state.theme);
    localStorage.setItem("theme", state.theme);
    updateThemeIcon();
  });
}

function updateThemeIcon() {
  const darkIcon = document.querySelector(".mode-icon-dark");
  const lightIcon = document.querySelector(".mode-icon-light");
  if (state.theme === "dark") {
    darkIcon.style.display = "inline-block";
    lightIcon.style.display = "none";
  } else {
    darkIcon.style.display = "none";
    lightIcon.style.display = "inline-block";
  }
}

// Search Logic
function setupSearch() {
  const searchInput = document.getElementById("global-search-input");
  const clearBtn = document.getElementById("clear-search-btn");

  searchInput.addEventListener("input", (e) => {
    state.searchQuery = e.target.value.toLowerCase().trim();
    if (state.searchQuery.length > 0) {
      clearBtn.style.display = "block";
      performSearch();
    } else {
      clearBtn.style.display = "none";
      renderActiveTab();
    }
  });

  clearBtn.addEventListener("click", () => {
    searchInput.value = "";
    state.searchQuery = "";
    clearBtn.style.display = "none";
    renderActiveTab();
  });
}

function performSearch() {
  // If user is searching, always switch to teams tab to filter them
  if (state.currentTab !== "teams") {
    switchTab("teams");
  } else {
    renderActiveTab();
  }
}

// Stage Selectors (Matches tab)
function setupStageSelectors() {
  const btnGroup = document.getElementById("selector-stage-group");
  const btnKnockout = document.getElementById("selector-stage-knockout");

  btnGroup.addEventListener("click", () => {
    state.activeStage = "group";
    btnGroup.classList.add("active");
    btnKnockout.classList.remove("active");
    renderMatches();
  });

  btnKnockout.addEventListener("click", () => {
    state.activeStage = "knockout";
    btnKnockout.classList.add("active");
    btnGroup.classList.remove("active");
    renderMatches();
  });
}

// Confederation Filters (Teams tab)
function setupConfedFilters() {
  const buttons = document.querySelectorAll("#view-teams .confed-btn");
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.confedFilter = btn.getAttribute("data-confed");
      renderTeams();
    });
  });
}

// Function to update local time in sidebar footer
function updateLocalTime() {
  const dateDisplay = document.getElementById("current-date-display");
  if (!dateDisplay) return;

  const now = new Date();
  const options = { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZone: state.timezone
  };
  dateDisplay.textContent = now.toLocaleString('en-US', options);
}

// Countdown Timer to Opening Ceremony (June 12, 2026 00:30:00 IST)
function startCountdown() {
  const targetDate = new Date("June 12, 2026 00:30:00 GMT+0530").getTime();
  
  const updateTimer = () => {
    const now = new Date().getTime();
    const diff = targetDate - now;

    if (diff <= 0) {
      document.querySelector(".countdown-container").innerHTML = "<div class='badge-stage live-badge'>TOURNAMENT LIVE</div>";
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById("cd-days").textContent = String(days).padStart(2, "0");
    document.getElementById("cd-hours").textContent = String(hours).padStart(2, "0");
    document.getElementById("cd-mins").textContent = String(mins).padStart(2, "0");
    document.getElementById("cd-secs").textContent = String(secs).padStart(2, "0");
  };

  updateTimer();
  setInterval(updateTimer, 1000);
}

// Render Overview View
// Render Overview View
function renderOverview() {
  // Compute dynamic tournament stats
  const allMatches = [...state.fixtures, ...state.knockoutFixtures];
  const playedMatches = allMatches.filter(m => m.status === "finished").length;
  let totalGoals = 0;
  let yellowCards = 0;
  let redCards = 0;
  
  allMatches.forEach(m => {
    if (m.status === "finished" && m.score) {
      totalGoals += m.score.home + m.score.away;
    }
    if (m.events) {
      m.events.forEach(e => {
        if (e.type === "card" && e.detail) {
          if (e.detail.includes("Yellow")) yellowCards++;
          else if (e.detail.includes("Red")) redCards++;
        }
      });
    }
  });

  const statsBar = document.getElementById("overview-stats-bar");
  if (statsBar) {
    statsBar.innerHTML = `
      <div class="overview-stat-card">
        <div class="overview-stat-icon-wrapper">
          <svg class="overview-stat-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </div>
        <div class="overview-stat-info">
          <span class="overview-stat-value">${playedMatches} / ${allMatches.length}</span>
          <span class="overview-stat-label">Matches Played</span>
        </div>
      </div>
      <div class="overview-stat-card">
        <div class="overview-stat-icon-wrapper" style="background: rgba(255, 115, 0, 0.08); color: var(--accent-orange);">
          <svg class="overview-stat-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20"></path>
          </svg>
        </div>
        <div class="overview-stat-info">
          <span class="overview-stat-value">${totalGoals}</span>
          <span class="overview-stat-label">Total Goals</span>
        </div>
      </div>
      <div class="overview-stat-card">
        <div class="overview-stat-icon-wrapper" style="background: rgba(250, 204, 21, 0.08); color: #eab308; display: flex; align-items: center; justify-content: center;">
          <span class="stat-card-badge yellow" style="width: 10px; height: 14px; border-radius: 2px; margin-right: 0;"></span>
        </div>
        <div class="overview-stat-info">
          <span class="overview-stat-value">${yellowCards}</span>
          <span class="overview-stat-label">Yellow Cards</span>
        </div>
      </div>
      <div class="overview-stat-card">
        <div class="overview-stat-icon-wrapper" style="background: rgba(239, 68, 68, 0.08); color: #ef4444; display: flex; align-items: center; justify-content: center;">
          <span class="stat-card-badge red" style="width: 10px; height: 14px; border-radius: 2px; margin-right: 0;"></span>
        </div>
        <div class="overview-stat-info">
          <span class="overview-stat-value">${redCards}</span>
          <span class="overview-stat-label">Red Cards</span>
        </div>
      </div>
    `;
  }

  // Render first 16 upcoming/live matches in timeline feed style (sorted chronologically by UTC timestamp)
  const matchesGrid = document.getElementById("overview-matches-grid");
  const activeMatches = allMatches
    .sort((a, b) => getMatchTimestamp(a) - getMatchTimestamp(b))
    .slice(0, 16);
  
  matchesGrid.innerHTML = "";
  if (activeMatches.length === 0) {
    matchesGrid.innerHTML = `<div class="info-badge">No matches created yet</div>`;
  } else {
    activeMatches.forEach((match, index) => {
      matchesGrid.appendChild(createMatchCard(match, index));
    });
  }

  // Render first 4 group standings summaries
  const groupsPreview = document.getElementById("overview-groups-preview");
  groupsPreview.innerHTML = "";
  
  const featuredGroups = ["A", "B", "C", "D"];
  featuredGroups.forEach(gId => {
    const groupCard = document.createElement("div");
    groupCard.className = "mini-group-card";
    
    const gpTeams = state.standings[gId] || [];
    
    let tableRows = gpTeams.slice(0, 4).map((entry, idx) => `
      <tr class="${idx < 2 ? 'qualification-zone-1' : ''}">
        <td class="text-left" style="padding-left: 8px;">
          ${idx + 1}. <img class="team-flag-img" src="${getTeamFlagUrl(entry.teamId)}" alt=""> ${entry.team.name}
        </td>
        <td>${entry.gp}</td>
        <td>${entry.gd > 0 ? '+' + entry.gd : entry.gd}</td>
        <td style="font-weight: 700;">${entry.pts}</td>
      </tr>
    `).join("");

    groupCard.innerHTML = `
      <h4>Group ${gId}</h4>
      <table class="standings-table">
        <thead>
          <tr>
            <th class="text-left">Team</th>
            <th>GP</th>
            <th>GD</th>
            <th>Pts</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    `;
    groupsPreview.appendChild(groupCard);
  });

  // Render news lists (max 3)
  const newsList = document.getElementById("overview-news-list");
  if (newsList) {
    newsList.innerHTML = "";
    NEWS.slice(0, 3).forEach(item => {
      const row = document.createElement("div");
      row.className = "news-card-row";
      row.innerHTML = `
        <div class="news-card-content" style="padding-left: 0;">
          <div class="news-meta-row">
            <span class="category">${item.category}</span>
            <span>•</span>
            <span>${item.time}</span>
          </div>
          <h4 style="margin-top: 4px;">${item.title}</h4>
        </div>
      `;
      row.addEventListener("click", () => openNewsDetail(item));
      newsList.appendChild(row);
    });
  }

  renderOverviewLeaderboard();
  triggerScrollAnimation();
}

function getLocalDateTime(dateStr, timeStr, venue) {
  if (!dateStr || !timeStr) {
    return { date: dateStr || "Date TBD", time: timeStr || "Time TBD" };
  }
  if (!venue || typeof venue.utcOffset === 'undefined') {
    return { date: dateStr, time: timeStr };
  }

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const parts = dateStr.replace(",", "").split(" ");
  const monthIndex = monthNames.indexOf(parts[0]);
  const day = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);
  
  const timeParts = timeStr.split(":");
  const hours = parseInt(timeParts[0], 10);
  const minutes = parseInt(timeParts[1], 10);

  // Parse venue local time as UTC template, then adjust to actual UTC
  const localTemplateObj = new Date(Date.UTC(year, monthIndex, day, hours, minutes));
  const trueUtcTime = localTemplateObj.getTime() - (venue.utcOffset * 60 * 60 * 1000);
  const dateObj = new Date(trueUtcTime);

  const tzOptionsDate = { month: 'long', day: 'numeric', year: 'numeric', timeZone: state.timezone };
  const tzOptionsTime = { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: state.timezone };
  
  return {
    date: dateObj.toLocaleDateString('en-US', tzOptionsDate),
    time: dateObj.toLocaleTimeString('en-US', tzOptionsTime)
  };
}

// Helper to get match absolute UTC timestamp
function getMatchTimestamp(match) {
  if (!match.venue || typeof match.venue.utcOffset === 'undefined') {
    return new Date(match.date + " " + match.time).getTime();
  }
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const parts = match.date.replace(",", "").split(" ");
  const monthIndex = monthNames.indexOf(parts[0]);
  const day = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);
  
  const timeParts = match.time.split(":");
  const hours = parseInt(timeParts[0], 10);
  const minutes = parseInt(timeParts[1], 10);

  const localTemplateObj = new Date(Date.UTC(year, monthIndex, day, hours, minutes));
  return localTemplateObj.getTime() - (match.venue.utcOffset * 60 * 60 * 1000);
}

// Trigger dynamic fade-in/slide-up scroll animations
function triggerScrollAnimation() {
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.05
  });

  document.querySelectorAll(".animate-on-scroll").forEach(card => {
    observer.observe(card);
  });
}

// Generate Match Card Component
function createMatchCard(match, index = 0) {
  const card = document.createElement("div");
  card.className = "match-card animate-on-scroll";
  card.style.setProperty("--card-index", index);
  
  const isFav = state.favorites.matches.includes(match.id);
  if (isFav) {
    card.classList.add("is-favorited-card");
    const colorsHome = getTeamColors(match.homeTeamId);
    card.style.setProperty("--team-glow-color", colorsHome.primary + "25");
  }
  
  const flagPlaceholderHtml = `
    <div class="team-flag-placeholder-wrapper">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="placeholder-shield-svg">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    </div>`;

  const homeTeam = TEAMS[match.homeTeamId] || { name: match.placeholderHome || "TBD" };
  const awayTeam = TEAMS[match.awayTeamId] || { name: match.placeholderAway || "TBD" };

  const isLive = match.status === "live";
  const isFinished = match.status === "finished";

  const istDateTime = getLocalDateTime(match.date, match.time, match.venue);

  let statusText = "";
  if (isLive) {
    statusText = `<span class="live-badge">LIVE</span>`;
  } else if (isFinished) {
    statusText = `<span class="ft-badge" style="font-weight: 700; font-size: 11px; opacity: 0.8;">FT</span>`;
  } else {
    statusText = `<span class="time-badge" style="font-weight: 700; color: var(--accent); font-size: 11px;">${istDateTime.time}</span>`;
  }

  const homeScore = match.score ? match.score.home : "-";
  const awayScore = match.score ? match.score.away : "-";

  const isHomeWinner = isFinished && match.score.home > match.score.away;
  const isAwayWinner = isFinished && match.score.away > match.score.home;

  const homeFlagHtml = match.homeTeamId 
    ? `<img class="team-flag-img" src="${getTeamFlagUrl(match.homeTeamId)}" alt="">` 
    : flagPlaceholderHtml;
  const awayFlagHtml = match.awayTeamId 
    ? `<img class="team-flag-img" src="${getTeamFlagUrl(match.awayTeamId)}" alt="">` 
    : flagPlaceholderHtml;

  card.innerHTML = `
    <div class="match-card-meta">
      <span>${match.stage} ${match.groupId ? '• Group ' + match.groupId : ''}</span>
      <span>${statusText}</span>
    </div>
    
    <div class="match-card-teams">
      <div class="match-card-team-row">
        <div class="team-info">
          ${homeFlagHtml}
          <span class="team-name">${homeTeam.name}</span>
        </div>
        <span class="team-score ${isHomeWinner ? 'winner' : ''}">${homeScore}</span>
      </div>
      <div class="match-card-team-row">
        <div class="team-info">
          ${awayFlagHtml}
          <span class="team-name">${awayTeam.name}</span>
        </div>
        <span class="team-score ${isAwayWinner ? 'winner' : ''}">${awayScore}</span>
      </div>
    </div>

    <div class="match-card-footer">
      <div style="flex: 1;">
        <span style="font-weight: 700; color: var(--text-primary); font-size: 12px; display: block;">${istDateTime.date}</span>
        <span style="font-size: 10px; color: var(--text-muted); display: block;">${match.venue ? match.venue.name : 'Stadium'} • ${match.venue ? match.venue.city : ''}</span>
      </div>
      <span class="favorite-star ${isFav ? 'active' : ''}" data-match-id="${match.id}">★</span>
    </div>
  `;

  // Attach modal popup trigger
  card.addEventListener("click", (e) => {
    if (e.target.classList.contains("favorite-star")) {
      e.stopPropagation();
      toggleFavoriteMatch(match.id, e.target);
    } else {
      openMatchDetail(match);
    }
  });

  return card;
}

// Render Matches Tab
function renderMatches() {
  const container = document.getElementById("matches-list-container");
  container.innerHTML = "";

  // Select source: Group Stage or Knockouts
  let matches = state.activeStage === "group" ? state.fixtures : state.knockoutFixtures;


  // Filter based on status (live, finished, upcoming)
  const filterGroup = document.querySelectorAll("#view-matches .filter-btn");
  filterGroup.forEach(btn => {
    if (btn.classList.contains("active")) {
      const statusFilter = btn.id.replace("filter-", "").replace("-matches", "");
      if (statusFilter !== "all") {
        matches = matches.filter(m => m.status === statusFilter);
      }
    }
  });

  if (matches.length === 0) {
    container.innerHTML = `<div class="card-box" style="text-align:center; padding:32px;">No matches found matching criteria.</div>`;
    return;
  }

  // Sort matches chronologically by absolute timestamp
  matches = [...matches].sort((a, b) => getMatchTimestamp(a) - getMatchTimestamp(b));

  // Group matches by IST Date (e.g. "June 12, 2026")
  const grouped = {};
  matches.forEach(m => {
    const istDateTime = getLocalDateTime(m.date, m.time, m.venue);
    const dateKey = istDateTime.date;
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(m);
  });

  Object.keys(grouped).forEach(date => {
    const groupSection = document.createElement("div");
    groupSection.className = "match-date-group";
    groupSection.innerHTML = `<div class="match-date-group-header">${date}</div>`;
    
    const grid = document.createElement("div");
    grid.className = "featured-matches-grid";
    
    let mIdx = 0;
    grouped[date].forEach(match => {
      grid.appendChild(createMatchCard(match, mIdx++));
    });

    groupSection.appendChild(grid);
    container.appendChild(groupSection);
  });

  // Setup match filters event listeners once
  setupMatchFilters();
  triggerScrollAnimation();
}

function setupMatchFilters() {
  const filters = ["all", "live", "finished", "upcoming"];
  filters.forEach(f => {
    const btn = document.getElementById(`filter-${f}-matches`);
    if (btn && !btn.dataset.listenerSet) {
      btn.dataset.listenerSet = "true";
      btn.addEventListener("click", () => {
        filters.forEach(x => document.getElementById(`filter-${x}-matches`).classList.remove("active"));
        btn.classList.add("active");
        renderMatches();
      });
    }
  });
}

// Render Standings Tables Tab
function renderTable() {
  const container = document.getElementById("groups-tables-container");
  container.innerHTML = "";

  Object.keys(GROUPS).forEach(groupId => {
    const group = GROUPS[groupId];
    const groupStandings = state.standings[groupId] || [];

    const card = document.createElement("div");
    card.className = "group-table-card";
    
    let tableRows = groupStandings.map((entry, idx) => {
      // Highlight zones
      let qClass = "";
      if (idx < 2) qClass = "qualification-zone-1"; // Top 2 qualify
      else if (idx === 2) qClass = "qualification-zone-3rd"; // 3rd place possible

      const isFav = state.favorites.teams.includes(entry.teamId);

      return `
        <tr class="${qClass}" style="cursor:pointer;" onclick="window.openTeamDetail('${entry.teamId}')">
          <td class="text-left" style="padding-left: 6px;">
            <span class="favorite-star ${isFav ? 'active' : ''}" style="margin-right:4px;" onclick="event.stopPropagation(); window.toggleFavoriteTeam('${entry.teamId}', this)">★</span>
            ${idx + 1}. <img class="team-flag-img" src="${getTeamFlagUrl(entry.teamId)}" alt=""> <strong>${entry.team.name}</strong>
          </td>
          <td>${entry.gp}</td>
          <td>${entry.w}</td>
          <td>${entry.d}</td>
          <td>${entry.l}</td>
          <td>${entry.gf}</td>
          <td>${entry.ga}</td>
          <td>${entry.gd > 0 ? '+' + entry.gd : entry.gd}</td>
          <td style="font-weight: 700;">${entry.pts}</td>
        </tr>
      `;
    }).join("");

    card.innerHTML = `
      <h3>Group ${groupId}</h3>
      <table class="standings-table">
        <thead>
          <tr>
            <th class="text-left">Team</th>
            <th>GP</th>
            <th>W</th>
            <th>D</th>
            <th>L</th>
            <th>GF</th>
            <th>GA</th>
            <th>GD</th>
            <th>Pts</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    `;
    container.appendChild(card);
  });

  // Render Best 3rd Placed table
  const thirdBody = document.getElementById("third-placed-standings-body");
  thirdBody.innerHTML = "";
  
  if (state.thirdPlaced.length === 0) {
    thirdBody.innerHTML = `<tr><td colspan="6" style="padding:16px; color:var(--text-muted);">No standings computed yet.</td></tr>`;
  } else {
    state.thirdPlaced.forEach((entry, idx) => {
      // Highlighting top 8
      const qClass = idx < 8 ? "qualification-zone-1" : "";
      thirdBody.innerHTML += `
        <tr class="${qClass}" style="cursor:pointer;" onclick="window.openTeamDetail('${entry.teamId}')">
          <td>${idx + 1}</td>
          <td><strong>Group ${entry.groupId}</strong></td>
          <td class="text-left"><img class="team-flag-img" src="${getTeamFlagUrl(entry.teamId)}" alt=""> ${entry.team.name}</td>
          <td>${entry.gp}</td>
          <td>${entry.w}</td>
          <td>${entry.d}</td>
          <td>${entry.l}</td>
          <td>${entry.gf}</td>
          <td>${entry.ga}</td>
          <td>${entry.gd > 0 ? '+' + entry.gd : entry.gd}</td>
          <td style="font-weight:700;">${entry.pts}</td>
        </tr>
      `;
    });
  }
}

function setupStatsTabs() {
  const btnPlayer = document.getElementById("stats-btn-player");
  const btnTeam = document.getElementById("stats-btn-team");
  const subviewPlayer = document.getElementById("stats-subview-player");
  const subviewTeam = document.getElementById("stats-subview-team");

  if (!btnPlayer || !btnTeam || !subviewPlayer || !subviewTeam) return;

  if (btnPlayer.dataset.listenerSet) return;
  btnPlayer.dataset.listenerSet = "true";

  btnPlayer.addEventListener("click", () => {
    btnPlayer.classList.add("active");
    btnTeam.classList.remove("active");
    subviewPlayer.style.display = "block";
    subviewTeam.style.display = "none";
  });

  btnTeam.addEventListener("click", () => {
    btnTeam.classList.add("active");
    btnPlayer.classList.remove("active");
    subviewTeam.style.display = "block";
    subviewPlayer.style.display = "none";
  });
}

function setupOverviewTabs() {
  const tabs = document.querySelectorAll(".stats-mini-tab-btn");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      state.overviewStatsTab = tab.getAttribute("data-leaderboard");
      renderOverviewLeaderboard();
    });
  });

  const viewAllBtn = document.getElementById("overview-stats-view-all");
  if (viewAllBtn) {
    viewAllBtn.addEventListener("click", (e) => {
      e.preventDefault();
      switchTab("stats");
      if (state.overviewStatsTab === "cleansheets") {
        const teamBtn = document.getElementById("stats-btn-team");
        if (teamBtn) teamBtn.click();
      } else {
        const playerBtn = document.getElementById("stats-btn-player");
        if (playerBtn) playerBtn.click();
      }
    });
  }
}

function renderOverviewLeaderboard() {
  const leaderboardList = document.getElementById("overview-leaderboard-list");
  if (!leaderboardList) return;
  leaderboardList.innerHTML = "";

  const stats = compileStats([...state.fixtures, ...state.knockoutFixtures]);
  const activeTab = state.overviewStatsTab || "goals";

  let listData = [];
  let isEmpty = false;
  let isTeamMetric = false;

  if (activeTab === "goals") {
    listData = stats.goals.slice(0, 5);
    isEmpty = listData.length === 0;
  } else if (activeTab === "assists") {
    listData = stats.assists.slice(0, 5);
    isEmpty = listData.length === 0;
  } else if (activeTab === "cleansheets") {
    listData = stats.teamCleanSheets.slice(0, 5);
    isEmpty = listData.length === 0;
    isTeamMetric = true;
  }

  if (isEmpty) {
    leaderboardList.innerHTML = `<div class="favorites-list-empty">Tournament has not started yet. Stats will be updated when matches begin!</div>`;
  } else {
    listData.forEach((item, idx) => {
      const row = document.createElement("div");
      row.className = "scorer-row";
      
      if (isTeamMetric) {
        row.innerHTML = `
          <div class="scorer-left">
            <span class="scorer-rank">${idx + 1}</span>
            <span class="scorer-name">${item.team.name}</span>
            <span class="scorer-team">
              <img class="team-flag-img" src="${getTeamFlagUrl(item.team.id)}" alt=""> ${item.team.confed}
            </span>
          </div>
          <span class="scorer-count">${item.count}</span>
        `;
      } else {
        row.innerHTML = `
          <div class="scorer-left">
            <span class="scorer-rank">${idx + 1}</span>
            <span class="scorer-name">${item.name}</span>
            <span class="scorer-team">
              <img class="team-flag-img" src="${getTeamFlagUrl(item.team.id)}" alt=""> ${item.team.name}
            </span>
          </div>
          <span class="scorer-count">${item.count}</span>
        `;
      }
      leaderboardList.appendChild(row);
    });
  }
}

function createPlayerStatRow(rank, name, team, displayValue, percentageValue, iconDetail = "") {
  const rankClass = rank === 1 ? "rank-1" : rank === 2 ? "rank-2" : rank === 3 ? "rank-3" : "";

  const row = document.createElement("div");
  row.className = "stat-row-item";
  row.innerHTML = `
    <div class="rank-medal-wrapper ${rankClass}">${rank}</div>
    <div class="stat-row-content">
      <div class="stat-row-main">
        <div class="stat-row-name-flag">
          <img class="team-flag-img" src="${getTeamFlagUrl(team.id)}" alt="${team.name}">
          <span class="stat-row-player-name">${name}</span>
        </div>
        <span class="stat-row-count">${displayValue}</span>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span class="stat-row-team-name">${team.name} ${iconDetail ? '• ' + iconDetail : ''}</span>
      </div>
      <div class="stat-progress-bar">
        <div class="stat-progress-fill" style="width: ${percentageValue}%;"></div>
      </div>
    </div>
  `;
  row.addEventListener("click", () => {
    openTeamDetail(team.id);
  });
  return row;
}

function createTeamStatRow(rank, team, displayValue, percentageValue, iconDetail = "") {
  const rankClass = rank === 1 ? "rank-1" : rank === 2 ? "rank-2" : rank === 3 ? "rank-3" : "";

  const row = document.createElement("div");
  row.className = "stat-row-item";
  row.innerHTML = `
    <div class="rank-medal-wrapper ${rankClass}">${rank}</div>
    <div class="stat-row-content">
      <div class="stat-row-main">
        <div class="stat-row-name-flag">
          <img class="team-flag-img" src="${getTeamFlagUrl(team.id)}" alt="${team.name}">
          <span class="stat-row-player-name">${team.name}</span>
        </div>
        <span class="stat-row-count">${displayValue}</span>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span class="stat-row-team-name">${team.confed} ${iconDetail ? '• ' + iconDetail : ''}</span>
      </div>
      <div class="stat-progress-bar">
        <div class="stat-progress-fill" style="width: ${percentageValue}%;"></div>
      </div>
    </div>
  `;
  row.addEventListener("click", () => {
    openTeamDetail(team.id);
  });
  return row;
}

// Render Stats Tab
function renderStats() {
  const playerGoalsContainer = document.getElementById("stats-player-goals");
  const playerAssistsContainer = document.getElementById("stats-player-assists");
  const playerCardsContainer = document.getElementById("stats-player-cards");
  
  const teamGoalsContainer = document.getElementById("stats-team-goals");
  const teamCleanSheetsContainer = document.getElementById("stats-team-cleansheets");
  const teamCardsContainer = document.getElementById("stats-team-cards");

  if (!playerGoalsContainer) return; // Guard check

  const stats = compileStats([...state.fixtures, ...state.knockoutFixtures]);

  // Player Discipline calculations
  const playerDiscipline = [];
  stats.yellowCards.forEach(item => {
    playerDiscipline.push({
      name: item.name,
      team: item.team,
      count: item.count,
      displayCount: item.count,
      detail: `<span class="stat-card-badge yellow"></span> ${item.count}`
    });
  });
  stats.redCards.forEach(item => {
    const existing = playerDiscipline.find(x => x.name === item.name);
    if (existing) {
      existing.detail += ` • <span class="stat-card-badge red"></span> ${item.count}`;
      existing.count += item.count * 3;
      existing.displayCount += item.count;
    } else {
      playerDiscipline.push({
        name: item.name,
        team: item.team,
        count: item.count * 3,
        displayCount: item.count,
        detail: `<span class="stat-card-badge red"></span> ${item.count}`
      });
    }
  });
  playerDiscipline.sort((a, b) => b.count - a.count);

  // Team Discipline calculations
  const teamDiscipline = [];
  stats.teamYellowCards.forEach(item => {
    teamDiscipline.push({
      team: item.team,
      count: item.count,
      displayCount: item.count,
      detail: `<span class="stat-card-badge yellow"></span> ${item.count}`
    });
  });
  stats.teamRedCards.forEach(item => {
    const existing = teamDiscipline.find(x => x.team.id === item.team.id);
    if (existing) {
      existing.detail += ` • <span class="stat-card-badge red"></span> ${item.count}`;
      existing.count += item.count * 3;
      existing.displayCount += item.count;
    } else {
      teamDiscipline.push({
        team: item.team,
        count: item.count * 3,
        displayCount: item.count,
        detail: `<span class="stat-card-badge red"></span> ${item.count}`
      });
    }
  });
  teamDiscipline.sort((a, b) => b.count - a.count);

  // Helpers to render individual list columns
  const renderPlayerList = (container, list, label, maxValField = "count") => {
    container.innerHTML = "";
    if (list.length === 0) {
      container.innerHTML = `<div class="favorites-list-empty">Tournament has not started yet. Stats will compile when matches begin!</div>`;
      return;
    }
    const leadScore = list[0][maxValField] || 1;
    list.forEach((item, idx) => {
      const percentage = Math.round((item[maxValField] / leadScore) * 100);
      const displayVal = item.displayCount !== undefined ? item.displayCount : item.count;
      container.appendChild(createPlayerStatRow(idx + 1, item.name, item.team, displayVal + " " + label, percentage, item.detail || ""));
    });
  };

  const renderTeamList = (container, list, label, maxValField = "count") => {
    container.innerHTML = "";
    if (list.length === 0) {
      container.innerHTML = `<div class="favorites-list-empty">Tournament has not started yet. Stats will compile when matches begin!</div>`;
      return;
    }
    const leadScore = list[0][maxValField] || 1;
    list.forEach((item, idx) => {
      const percentage = Math.round((item[maxValField] / leadScore) * 100);
      const displayVal = item.displayCount !== undefined ? item.displayCount : item.count;
      container.appendChild(createTeamStatRow(idx + 1, item.team, displayVal + " " + label, percentage, item.detail || ""));
    });
  };

  // Render individual views
  renderPlayerList(playerGoalsContainer, stats.goals, "Goals");
  renderPlayerList(playerAssistsContainer, stats.assists, "Assists");
  renderPlayerList(playerCardsContainer, playerDiscipline.slice(0, 10), "Cards", "count");

  // Render team views
  renderTeamList(teamGoalsContainer, stats.teamGoals, "Goals");
  renderTeamList(teamCleanSheetsContainer, stats.teamCleanSheets, "Sheets");
  renderTeamList(teamCardsContainer, teamDiscipline.slice(0, 10), "Cards", "count");
}

// Render Teams Tab
function renderTeams() {
  console.log("renderTeams called. confedFilter:", state.confedFilter, "searchQuery:", state.searchQuery);
  try {
    const container = document.getElementById("teams-grid");
    if (!container) {
      console.error("teams-grid container not found in DOM!");
      return;
    }
    container.innerHTML = "";

    let teamsList = Object.values(TEAMS);
    console.log("Initial teamsList count:", teamsList.length);

    // Confederation filter
    if (state.confedFilter && state.confedFilter !== "ALL") {
      teamsList = teamsList.filter(t => t.confed === state.confedFilter);
      console.log("After confed filter count:", teamsList.length);
    }

    // Search filter
    if (state.searchQuery && state.searchQuery.length > 0) {
      teamsList = teamsList.filter(t => t.name.toLowerCase().includes(state.searchQuery));
      console.log("After search filter count:", teamsList.length);
    }

    if (teamsList.length === 0) {
      container.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding:32px; color:var(--text-muted);">No teams found matching search criteria.</div>`;
      return;
    }

    teamsList.forEach((team, index) => {
      const card = document.createElement("div");
      card.className = "team-card animate-on-scroll";
      card.style.position = "relative";
      card.style.setProperty("--card-index", index);
      
      const isFav = state.favorites && state.favorites.teams && state.favorites.teams.includes(team.id);
      if (isFav) {
        card.classList.add("is-favorited-card");
        const colors = getTeamColors(team.id);
        card.style.setProperty("--team-glow-color", colors.primary + "25");
      }

      card.innerHTML = `
        <div style="position: absolute; top: 10px; right: 12px; z-index: 10;">
          <span class="favorite-star ${isFav ? 'active' : ''}" style="font-size: 16px; cursor: pointer;" onclick="event.stopPropagation(); window.toggleFavoriteTeam('${team.id}', this)">★</span>
        </div>
        <div class="team-flag-large">
          <img class="team-flag-large-img" src="${getTeamFlagUrl(team.id)}" alt="${team.name}">
        </div>
        <div class="team-name-text">${team.name}</div>
        <div class="team-confed-text">${team.confed} • Rating: ${team.rating}</div>
      `;

      card.addEventListener("click", () => openTeamDetail(team.id));
      container.appendChild(card);
    });

    // Trigger scroll animations so cards animate in and become visible
    triggerScrollAnimation();

    console.log("renderTeams successfully appended", teamsList.length, "cards.");
  } catch (error) {
    console.error("Error in renderTeams:", error);
  }
}

// Render News Tab
function renderNews() {
  const grid = document.getElementById("news-grid");
  if (!grid) return;
  
  grid.className = ""; // Clear class to prevent grid styles on the outer wrapper
  grid.innerHTML = "";

  if (NEWS.length === 0) {
    grid.innerHTML = `<div class="favorites-list-empty">No news available.</div>`;
    return;
  }

  // 1. Render Headline News (Hero card style)
  const heroItem = NEWS[0];
  const heroCard = document.createElement("div");
  heroCard.className = "news-hero-card";
  heroCard.innerHTML = `
    <div class="news-hero-content-pane" style="padding: 36px; display: flex; flex-direction: column; justify-content: center;">
      <div class="news-meta-row" style="margin-bottom: 12px; font-size: 12px; font-weight: 700; color: var(--text-secondary); display: flex; align-items: center; gap: 8px;">
        <span class="category" style="color: var(--accent-orange); text-transform: uppercase;">${heroItem.category}</span>
        <span>•</span>
        <span>${heroItem.time}</span>
        <span>•</span>
        <span>${heroItem.readTime}</span>
      </div>
      <h2 class="news-hero-title" style="font-size: 26px; font-weight: 900; line-height: 1.25; margin-bottom: 14px; color: var(--text-primary);">${heroItem.title}</h2>
      <p class="news-hero-summary" style="font-size: 14px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 24px;">${heroItem.summary}</p>
      <div class="news-footer" style="margin-top: auto; padding-top: 16px; border-top: 1px solid var(--border-color); display: flex; justify-content: space-between; font-size: 12px; color: var(--text-muted);">
        <span>By ${heroItem.author}</span>
        <span>${heroItem.date}</span>
      </div>
    </div>
  `;
  heroCard.addEventListener("click", () => openNewsDetail(heroItem));
  grid.appendChild(heroCard);

  // 2. Render remaining stories in sub-grid
  const subGrid = document.createElement("div");
  subGrid.className = "news-grid-container";
  
  NEWS.slice(1).forEach(item => {
    const card = document.createElement("div");
    card.className = "news-card-main";
    card.innerHTML = `
      <div class="news-body" style="padding: 24px; display: flex; flex-direction: column; gap: 12px; height: 100%;">
        <div class="news-meta-row" style="font-size: 11px; font-weight: 700; color: var(--text-secondary); display: flex; align-items: center; gap: 6px;">
          <span class="category" style="color: var(--accent-orange); text-transform: uppercase;">${item.category}</span>
          <span>•</span>
          <span>${item.time}</span>
        </div>
        <h3 style="font-size: 17px; font-weight: 800; line-height: 1.3; color: var(--text-primary); margin: 0;">${item.title}</h3>
        <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.5; margin: 0; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">${item.summary}</p>
        <div class="news-footer" style="margin-top: auto; padding-top: 12px; border-top: 1px dashed var(--border-color); display: flex; justify-content: space-between; font-size: 11px; color: var(--text-muted);">
          <span>By ${item.author}</span>
          <span>${item.readTime}</span>
        </div>
      </div>
    `;
    card.addEventListener("click", () => openNewsDetail(item));
    subGrid.appendChild(card);
  });
  grid.appendChild(subGrid);
}

// Setup Venues Country Filters & Sorting
function setupVenuesControls() {
  const countryButtons = document.querySelectorAll("#venue-country-filters .confed-btn");
  const sortButtons = document.querySelectorAll("#venue-sort-filters .confed-btn");

  countryButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      countryButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.venueCountryFilter = btn.getAttribute("data-country");
      renderVenues();
    });
  });

  sortButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      sortButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.venueSortOrder = btn.getAttribute("data-sort");
      renderVenues();
    });
  });
}

// Render Venues Tab (VIP tickets style with country filters and capacity sorting)
function renderVenues() {
  const grid = document.getElementById("venues-grid");
  if (!grid) return;
  grid.innerHTML = "";

  let list = [...VENUES];

  // 1. Filter by country selection
  if (state.venueCountryFilter !== "ALL") {
    list = list.filter(v => v.country.toLowerCase() === state.venueCountryFilter.toLowerCase());
  }

  // 2. Sort by capacity
  if (state.venueSortOrder === "DESC") {
    list.sort((a, b) => b.capacity - a.capacity);
  } else {
    list.sort((a, b) => a.capacity - b.capacity);
  }

  if (list.length === 0) {
    grid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding:32px; color:var(--text-muted);">No stadiums found.</div>`;
    return;
  }

  list.forEach(v => {
    const card = document.createElement("div");
    card.className = "venue-card";
    
    // Count matches scheduled at this venue
    const allMatches = [...state.fixtures, ...state.knockoutFixtures];
    const matchCount = allMatches.filter(m => m.venue && m.venue.id === v.id).length;

    // Map stadium to one of the 3 generated images deterministically
    const stadiumImgMap = {
      azteca: "stadium_modern",
      metlife: "stadium_sunset",
      att: "stadium_pitch",
      sofi: "stadium_modern",
      mercedes: "stadium_sunset",
      nrg: "stadium_pitch",
      arrowhead: "stadium_modern",
      hardrock: "stadium_sunset",
      lincoln: "stadium_pitch",
      levis: "stadium_modern",
      lumen: "stadium_sunset",
      gillette: "stadium_pitch",
      bmo: "stadium_modern",
      bcplace: "stadium_sunset",
      akron: "stadium_pitch",
      bbva: "stadium_modern"
    };
    const imgName = stadiumImgMap[v.id] || "stadium_modern";

    card.innerHTML = `
      <div class="venue-img">
        <img src="/images/${imgName}.png" class="venue-stadium-img" alt="${v.name}">
        <svg class="venue-stadium-svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="1.2">
          <ellipse cx="50" cy="50" rx="45" ry="30" />
          <ellipse cx="50" cy="50" rx="35" ry="20" />
          <circle cx="50" cy="50" r="10" />
        </svg>
        <span class="venue-img-text">Stadium Pass</span>
      </div>
      <div class="venue-card-notch-right"></div>
      <div class="venue-info-box">
        <h3 style="font-size: 16px; font-weight: 800; color: var(--text-primary); margin-bottom: 8px;">${v.name}</h3>
        
        <div class="venue-info-row">
          <svg class="venue-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          <span>${v.city}, ${v.country}</span>
        </div>

        <div class="venue-details-grid">
          <div class="venue-capacity-badge" style="display: flex; align-items: center; justify-content: center; gap: 4px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 11px; height: 11px; opacity: 0.8; color: var(--text-secondary);">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span>${v.capacity.toLocaleString()}</span>
          </div>
          <div class="venue-capacity-badge" style="background-color: var(--accent-light); border-color: var(--accent-glow); color: var(--accent); display: flex; align-items: center; justify-content: center; gap: 4px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 11px; height: 11px; opacity: 0.9; color: var(--accent);">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span>${matchCount} Matches</span>
          </div>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

// Render widget columns (Favorites panel & Ticker logs)
function renderWidgets() {
  // Render favorites list
  const favList = document.getElementById("favorite-teams-list");
  if (!favList) return;
  favList.innerHTML = "";

  if (state.favorites.teams.length === 0) {
    favList.classList.add("favorites-list-empty");
    favList.innerHTML = `<p>Click the star icon next to any team or match to add them here!</p>`;
  } else {
    favList.classList.remove("favorites-list-empty");
    state.favorites.teams.forEach(teamId => {
      const team = TEAMS[teamId];
      if (!team) return;

      const item = document.createElement("div");
      item.className = "fav-team-item";
      item.innerHTML = `
        <span><img class="team-flag-img" src="${getTeamFlagUrl(teamId)}" alt=""> ${team.name}</span>
        <button class="remove-fav-btn">×</button>
      `;

      item.querySelector(".remove-fav-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        toggleFavoriteTeam(teamId);
      });

      item.addEventListener("click", () => openTeamDetail(teamId));
      favList.appendChild(item);
    });
  }

  // Update simulator state widget info (safe checked if widgets exist)
  const groupPlayed = state.fixtures.filter(m => m.status === "finished").length;
  const groupTotal = state.fixtures.length;
  const pct = groupTotal > 0 ? Math.round((groupPlayed / groupTotal) * 100) : 0;

  const simProgressPct = document.getElementById("sim-progress-pct");
  if (simProgressPct) simProgressPct.textContent = `${pct}%`;

  const simProgressBar = document.getElementById("sim-progress-bar");
  if (simProgressBar) simProgressBar.style.width = `${pct}%`;

  const simMatchesCount = document.getElementById("sim-matches-count");
  if (simMatchesCount) {
    simMatchesCount.textContent = `${groupTotal - groupPlayed} of ${groupTotal} matches remaining`;
  }

  // Control button displays
  const knockoutBtn = document.getElementById("sim-knockouts-btn");
  if (knockoutBtn) {
    if (groupPlayed === groupTotal && groupTotal > 0) {
      knockoutBtn.style.display = "block";
      
      // Toggle label if knockouts are already generated/completed
      const knockoutTotal = state.knockoutFixtures.length;
      if (knockoutTotal > 0) {
        const koPlayed = state.knockoutFixtures.filter(m => m.status === "finished").length;
        if (koPlayed === knockoutTotal) {
          knockoutBtn.textContent = "Simulate Tournament Completed!";
          knockoutBtn.disabled = true;
        } else {
          knockoutBtn.textContent = "Simulate Next Knockout Round";
          knockoutBtn.disabled = false;
        }
      } else {
        knockoutBtn.textContent = "Generate & Simulate Knockouts";
        knockoutBtn.disabled = false;
      }
    } else {
      knockoutBtn.style.display = "none";
    }
  }
}

// Favorite toggle buttons logic
function toggleFavoriteTeam(teamId, starElement = null) {
  const index = state.favorites.teams.indexOf(teamId);
  if (index === -1) {
    state.favorites.teams.push(teamId);
    if (starElement) {
      starElement.classList.add("active");
      triggerStarExplosion(starElement);
    }
  } else {
    state.favorites.teams.splice(index, 1);
    if (starElement) starElement.classList.remove("active");
  }
  localStorage.setItem("favorites", JSON.stringify(state.favorites));
  renderWidgets();
  
  // Re-render views if active to sync stars
  if (state.currentTab === "table") renderTable();
  if (state.currentTab === "teams") renderTeams();
}
// Expose functions globally for table HTML triggers
window.toggleFavoriteTeam = toggleFavoriteTeam;

function toggleFavoriteMatch(matchId, starElement) {
  const index = state.favorites.matches.indexOf(matchId);
  if (index === -1) {
    state.favorites.matches.push(matchId);
    starElement.classList.add("active");
    triggerStarExplosion(starElement);
  } else {
    state.favorites.matches.splice(index, 1);
    starElement.classList.remove("active");
  }
  localStorage.setItem("favorites", JSON.stringify(state.favorites));
  renderWidgets();
}

// Tournament Simulation Controllers
function setupSimulationControls() {
  const stepBtn = document.getElementById("sim-step-matchday-btn");
  const allGroupsBtn = document.getElementById("sim-all-groups-btn");
  const knockoutsBtn = document.getElementById("sim-knockouts-btn");
  const resetBtn = document.getElementById("sim-reset-btn");
  const toggleSidebarBtn = document.getElementById("sim-panel-toggle-btn");

  // Toggle right panel on smaller screens (safely checking element)
  if (toggleSidebarBtn) {
    toggleSidebarBtn.addEventListener("click", () => {
      document.getElementById("widget-sidebar").classList.toggle("active");
    });
  }

  if (!stepBtn || !allGroupsBtn || !knockoutsBtn || !resetBtn) return;

  // Step Simulation: simulate the next 4 upcoming matches
  stepBtn.addEventListener("click", () => {
    const unplayed = state.fixtures.filter(m => m.status === "upcoming");
    if (unplayed.length === 0) {
      alert("All Group Stage matches have already been simulated!");
      return;
    }

    const nextMatches = unplayed.slice(0, 4);
    
    // Simulate live-ticker for the first simulated match
    let liveIndex = 0;
    const playLiveMatch = () => {
      if (liveIndex >= nextMatches.length) {
        recalculateData();
        renderActiveTab();
        renderWidgets();
        return;
      }
      
      const match = nextMatches[liveIndex];
      match.status = "live";
      renderActiveTab();
      updateMatchTicker(match);

      setTimeout(() => {
        simulateMatch(match);
        updateMatchTicker(match);
        liveIndex++;
        playLiveMatch();
      }, 800); // 800ms of simulated live delay
    };

    playLiveMatch();
  });

  // Simulate all remaining group stage matches
  allGroupsBtn.addEventListener("click", () => {
    const unplayed = state.fixtures.filter(m => m.status === "upcoming");
    if (unplayed.length === 0) {
      alert("All Group stage matches have already been simulated!");
      return;
    }

    // Quick loop to simulate all
    unplayed.forEach(m => simulateMatch(m));
    recalculateData();
    renderActiveTab();
    renderWidgets();
  });

  // Simulate/Generate Knockouts step-by-step
  knockoutsBtn.addEventListener("click", () => {
    if (state.knockoutFixtures.length === 0) {
      // 1. Generate Round of 32
      state.knockoutFixtures = generateRoundOf32(state.standings, state.thirdPlaced);
      state.activeStage = "knockout";
      switchTab("matches");
      
      // Update stage tabs selector UI
      document.getElementById("selector-stage-knockout").click();
      
      renderWidgets();
      alert("Round of 32 Knockouts generated successfully! Check the matches tab.");
      return;
    }

    // 2. Simulate next unfinished knockout round
    const stages = ["Round of 32", "Round of 16", "Quarter-finals", "Semi-finals", "Third Place Match", "Final"];
    
    // Find first stage that is not fully completed
    let targetStage = null;
    for (let i = 0; i < stages.length; i++) {
      const stageMatches = state.knockoutFixtures.filter(m => m.stage === stages[i]);
      if (stageMatches.length > 0) {
        const uncompleted = stageMatches.filter(m => m.status !== "finished");
        if (uncompleted.length > 0) {
          targetStage = stages[i];
          break;
        }
      }
    }

    if (targetStage) {
      // Simulate matches of current knockout stage
      const stageMatches = state.knockoutFixtures.filter(m => m.stage === targetStage && m.status === "upcoming");
      stageMatches.forEach(m => simulateMatch(m));
      
      // Post-stage generation logic
      generateSubsequentKnockouts(targetStage);
      
      renderActiveTab();
      renderWidgets();
    }
  });

  // Reset Tournament
  resetBtn.addEventListener("click", () => {
    state.fixtures = generateGroupFixtures();
    state.knockoutFixtures = [];
    state.activeStage = "group";
    document.getElementById("selector-stage-group").click();
    
    // Clear live ticker
    const ticker = document.getElementById("ticker-match-details");
    ticker.className = "ticker-empty";
    ticker.innerHTML = `<p>No matches are currently live. Run the simulator to see live play-by-play events here!</p>`;

    recalculateData();
    renderActiveTab();
    renderWidgets();
  });
}

// Generate following knockout brackets dynamically based on completed matches
function generateSubsequentKnockouts(completedStage) {
  const allKo = state.knockoutFixtures;
  
  if (completedStage === "Round of 32") {
    // Generate Round of 16 (8 matches)
    const prevMatches = allKo.filter(m => m.stage === "Round of 32");
    const dates = ["July 4, 2026", "July 5, 2026", "July 6, 2026", "July 7, 2026"];
    const roundOf16 = generateNextKnockoutStage(prevMatches, "Round of 32", "Round of 16", 89, 8, dates);
    state.knockoutFixtures = [...allKo, ...roundOf16];
  } 
  else if (completedStage === "Round of 16") {
    // Generate Quarter-finals (4 matches)
    const prevMatches = allKo.filter(m => m.stage === "Round of 16");
    const dates = ["July 9, 2026", "July 10, 2026", "July 11, 2026"];
    const quarters = generateNextKnockoutStage(prevMatches, "Round of 16", "Quarter-finals", 97, 4, dates);
    state.knockoutFixtures = [...allKo, ...quarters];
  } 
  else if (completedStage === "Quarter-finals") {
    // Generate Semi-finals (2 matches)
    const prevMatches = allKo.filter(m => m.stage === "Quarter-finals");
    const dates = ["July 14, 2026", "July 15, 2026"];
    const semis = generateNextKnockoutStage(prevMatches, "Quarter-finals", "Semi-finals", 101, 2, dates);
    state.knockoutFixtures = [...allKo, ...semis];
  } 
  else if (completedStage === "Semi-finals") {
    // Generate 3rd Place Match & Final
    const semis = allKo.filter(m => m.stage === "Semi-finals");
    
    // Winners go to Final, Losers go to 3rd Place Match
    const getWinnerId = (m) => m.score.home > m.score.away ? m.homeTeamId : m.awayTeamId;
    const getLoserId = (m) => m.score.home > m.score.away ? m.awayTeamId : m.homeTeamId;

    const finalMatch = {
      id: 104,
      stage: "Final",
      homeTeamId: getWinnerId(semis[0]),
      awayTeamId: getWinnerId(semis[1]),
      date: "July 19, 2026",
      time: "20:00",
      venue: VENUES.find(v => v.id === "metlife"),
      score: null,
      status: "upcoming",
      events: []
    };

    const thirdMatch = {
      id: 103,
      stage: "Third Place Match",
      homeTeamId: getLoserId(semis[0]),
      awayTeamId: getLoserId(semis[1]),
      date: "July 18, 2026",
      time: "20:00",
      venue: VENUES.find(v => v.id === "arrowhead"),
      score: null,
      status: "upcoming",
      events: []
    };

    state.knockoutFixtures = [...allKo, thirdMatch, finalMatch];
  }
  else if (completedStage === "Final") {
    const finalMatch = allKo.find(m => m.stage === "Final");
    const champion = TEAMS[finalMatch.score.home > finalMatch.score.away ? finalMatch.homeTeamId : finalMatch.awayTeamId];
    openCelebrationModal(champion);
  }
}

function openCelebrationModal(champion) {
  const modal = document.getElementById("celebration-modal");
  const winnerName = document.getElementById("celebration-winner-name");
  const flagContainer = document.getElementById("celebration-winner-flag-container");
  
  if (!modal || !winnerName || !flagContainer) return;
  
  winnerName.textContent = champion.name;
  flagContainer.innerHTML = `<img src="${getTeamFlagUrl(champion.id)}" alt="${champion.name}">`;
  
  modal.style.display = "flex";
}

// Update live match center widget ticker logs
function updateMatchTicker(match) {
  const ticker = document.getElementById("ticker-match-details");
  if (!ticker) return;
  const home = TEAMS[match.homeTeamId];
  const away = TEAMS[match.awayTeamId];

  ticker.className = "live-match-log";
  
  let headerHtml = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; font-weight:700;">
      <span>
        <img class="team-flag-img" src="${getTeamFlagUrl(match.homeTeamId)}" alt=""> vs 
        <img class="team-flag-img" src="${getTeamFlagUrl(match.awayTeamId)}" alt="">
      </span>
      <span>${match.status === "live" ? '<span class="live-dot"></span> LIVE' : 'FT'}</span>
    </div>
  `;

  if (match.status === "live") {
    ticker.innerHTML = headerHtml + `<p style="font-size:12px; color:var(--text-secondary); text-align:center;">Match in progress... Simulating play-by-play events.</p>`;
  } else {
    // Show events summary
    let eventsHtml = match.events.filter(e => e.type === "goal").map(e => `
      <div class="ticker-item">
        <span class="ticker-min">${e.minute}'</span>
        <span class="ticker-desc"><svg class="api-league-ball-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 12px; height: 12px; display: inline-block; vertical-align: middle; margin-right: 4px; color: var(--text-primary);"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20"></path></svg> <strong>${e.player}</strong> (<img class="team-flag-img" src="${getTeamFlagUrl(e.teamId)}" alt=""> ${TEAMS[e.teamId].name}) scored! ${e.assist ? '<span style="font-size:10px; color:var(--text-muted);">Assist: ' + e.assist + '</span>' : ''}</span>
      </div>
    `).join("");

    if (eventsHtml.length === 0) {
      eventsHtml = `<div class="favorites-list-empty">No goals scored in this match.</div>`;
    }

    ticker.innerHTML = headerHtml + `
      <div style="text-align:center; font-size:18px; font-weight:800; margin: 4px 0 10px 0; color:var(--accent);">
        ${match.score.home} - ${match.score.away}
      </div>
      <div style="font-size:11px; font-weight:700; color:var(--text-muted); margin-bottom:6px; text-transform:uppercase;">Key Events</div>
      ${eventsHtml}
    `;
  }
}

// Modal Detail Drawers (Close handlers)
function setupModalControls() {
  const modal = document.getElementById("detail-modal");
  const closeBtn = document.getElementById("close-modal-btn");

  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // Close when clicking overlay backdrop
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });
}

// Show team profile modal details
function openTeamProfile(teamId) {
  const team = TEAMS[teamId];
  if (!team) return;

  const modal = document.getElementById("detail-modal");
  const modalContent = document.getElementById("modal-body-content");

  // Determine Group Details
  let groupName = "N/A";
  let groupLetter = "";
  for (const [letter, group] of Object.entries(GROUPS)) {
    if (group.teams.includes(teamId)) {
      groupName = group.name;
      groupLetter = letter;
      break;
    }
  }

  // Get Standing info
  const groupStandings = state.standings[groupLetter] || [];
  const teamStanding = groupStandings.find(s => s.teamId === teamId) || {
    mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0
  };
  const standingRank = groupStandings.indexOf(teamStanding) + 1;

  // Calculate Tournament Stats
  let tournamentStats = { mp: 0, w: 0, d: 0, l: 0, gs: 0, gc: 0, gd: 0, cs: 0 };
  const allMatches = [...state.fixtures, ...state.knockoutFixtures].filter(
    m => m.status === "finished" && (m.homeTeamId === teamId || m.awayTeamId === teamId)
  );
  allMatches.forEach(m => {
    tournamentStats.mp++;
    const isHome = m.homeTeamId === teamId;
    const goalsFor = isHome ? m.score.home : m.score.away;
    const goalsAgainst = isHome ? m.score.away : m.score.home;
    tournamentStats.gs += goalsFor;
    tournamentStats.gc += goalsAgainst;
    if (goalsAgainst === 0) tournamentStats.cs++;
    
    if (goalsFor > goalsAgainst) {
      tournamentStats.w++;
    } else if (goalsFor < goalsAgainst) {
      tournamentStats.l++;
    } else {
      if (m.shootoutWinner) {
        if (m.shootoutWinner === teamId) {
          tournamentStats.w++;
        } else {
          tournamentStats.l++;
        }
      } else {
        tournamentStats.d++;
      }
    }
  });
  tournamentStats.gd = tournamentStats.gs - tournamentStats.gc;

  // Generate bio description
  const bio = `${team.name} competes in the ${team.confed} confederation. With a squad strength rating of ${team.rating}/100, they enter the 2026 FIFA World Cup as ${team.rating >= 90 ? "strong title contenders" : team.rating >= 80 ? "dangerous dark horses" : "ambitious challengers"}. Their tactical layout relies on key players like ${team.keyPlayers.slice(0, 3).join(", ")}${team.keyPlayers[3] ? " and " + team.keyPlayers[3] : ""}.`;

  // Generate Group standings mini table HTML
  let standingsRowsHtml = "";
  if (groupLetter && state.standings[groupLetter]) {
    state.standings[groupLetter].forEach((row, idx) => {
      const rowTeam = TEAMS[row.teamId] || { name: row.teamId };
      const isCurrent = row.teamId === teamId;
      const highlightStyle = isCurrent ? "background-color: var(--bg-hover); font-weight: 800; color: var(--text-primary);" : "";
      const rankNum = idx + 1;
      
      let qClass = "";
      if (rankNum <= 2) {
        qClass = "qualification-zone-1";
      } else if (rankNum === 3) {
        qClass = "qualification-zone-3rd";
      }
      
      standingsRowsHtml += `
        <tr style="${highlightStyle}">
          <td class="${qClass}" style="width: 28px;">${rankNum}</td>
          <td class="text-left" style="display: flex; align-items: center; gap: 8px; padding-left: 8px;">
            <img class="team-flag-img" src="${getTeamFlagUrl(row.teamId)}" alt="">
            <span style="${isCurrent ? 'color: var(--accent-orange);' : ''}">${rowTeam.name}</span>
          </td>
          <td>${row.mp}</td>
          <td>${row.w}</td>
          <td>${row.d}</td>
          <td>${row.l}</td>
          <td>${row.gd > 0 ? '+' + row.gd : row.gd}</td>
          <td style="font-weight: 800; color: var(--text-primary);">${row.pts}</td>
        </tr>
      `;
    });
  }

  // Generate tactical roster & visual pitch
  const colors = getTeamColors(teamId);
  const teamRoster = getTeamRoster(team, false);
  
  let pitchPlayersHtml = "";
  teamRoster.forEach(p => {
    pitchPlayersHtml += `
      <div class="player-node" style="left: ${p.x}%; top: ${p.y}%;" title="${p.role}: ${p.name}">
        <div class="player-jersey" style="background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary}); border-color: #fff; box-shadow: 0 4px 10px ${colors.primary}50;">${p.number}</div>
        <div class="player-node-name">${p.name.split(" ").slice(-1)[0]}</div>
      </div>
    `;
  });

  const teamRosterHtml = teamRoster.map(p => `
    <div class="roster-item" title="${p.role}">
      <span class="roster-number" style="color: ${colors.primary}; font-weight: 900;">${p.number}</span>
      <span style="font-weight:600;">${p.name}</span>
      <span style="font-size:10px; color:var(--text-muted); margin-left:auto;">${p.pos}</span>
    </div>
  `).join("");

  // Generate complete matches listings
  const matches = [...state.fixtures, ...state.knockoutFixtures].filter(m => m.homeTeamId === teamId || m.awayTeamId === teamId);
  const matchRows = matches.map(m => {
    const isHome = m.homeTeamId === teamId;
    const oppId = isHome ? m.awayTeamId : m.homeTeamId;
    const opp = TEAMS[oppId] || { name: m.placeholderHome || m.placeholderAway || "TBD" };
    const scoreText = m.score ? `${m.score.home} - ${m.score.away}` : m.time;
    const istDateTime = getLocalDateTime(m.date, m.time, m.venue);
    
    let resultBadge = "";
    if (m.status === "finished" && m.score) {
      const homeWon = m.score.home > m.score.away;
      const awayWon = m.score.away > m.score.home;
      if (m.score.home === m.score.away) {
        if (m.shootoutWinner) {
          resultBadge = m.shootoutWinner === teamId ? 
            `<span style="color:var(--success); font-weight:800; font-size:11px; margin-right:8px;">W (P)</span>` : 
            `<span style="color:var(--danger); font-weight:800; font-size:11px; margin-right:8px;">L (P)</span>`;
        } else {
          resultBadge = `<span style="color:var(--text-muted); font-weight:800; font-size:11px; margin-right:8px;">D</span>`;
        }
      } else {
        const won = isHome ? homeWon : awayWon;
        resultBadge = won ? 
          `<span style="color:var(--success); font-weight:800; font-size:11px; margin-right:8px;">W</span>` : 
          `<span style="color:var(--danger); font-weight:800; font-size:11px; margin-right:8px;">L</span>`;
      }
    } else {
      resultBadge = `<span style="color:var(--text-muted); font-size:11px; margin-right:8px;">VS</span>`;
    }
    
    const homeFlagHtml = TEAMS[m.homeTeamId] ? `<img class="team-flag-img" src="${getTeamFlagUrl(m.homeTeamId)}" alt="">` : flagPlaceholderHtml;
    const awayFlagHtml = TEAMS[m.awayTeamId] ? `<img class="team-flag-img" src="${getTeamFlagUrl(m.awayTeamId)}" alt="">` : flagPlaceholderHtml;
    
    return `
      <div class="roster-item" style="cursor: pointer; display: flex; flex-direction: column; gap: 8px; padding: 14px; margin-bottom: 10px; background-color: var(--bg-primary); border: 1px solid var(--border-color); border-radius: var(--btn-radius); transition: var(--transition);" onclick="window.openMatchDetailFromTeam('${m.id}')">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed var(--border-color); padding-bottom: 6px; margin-bottom: 2px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 11px; color: var(--text-muted); font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">${m.stage}</span>
            ${resultBadge}
          </div>
          <div style="font-size: 11px; color: var(--text-secondary); font-weight: 700; display: flex; align-items: center; gap: 4px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width: 12px; height: 12px; color: var(--accent-orange);">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span>${istDateTime.date} • ${istDateTime.time} (IST)</span>
          </div>
        </div>
        
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 700;">
            <div style="display: flex; align-items: center; gap: 6px;">
              ${homeFlagHtml}
              <span style="${isHome ? 'color: var(--accent-orange); font-weight: 800;' : 'color: var(--text-primary);'}">${TEAMS[m.homeTeamId]?.name || m.placeholderHome || "TBD"}</span>
            </div>
            <span style="color: var(--text-muted); font-weight: 500; font-size: 12px;">vs</span>
            <div style="display: flex; align-items: center; gap: 6px;">
              ${awayFlagHtml}
              <span style="${!isHome ? 'color: var(--accent-orange); font-weight: 800;' : 'color: var(--text-primary);'}">${TEAMS[m.awayTeamId]?.name || m.placeholderAway || "TBD"}</span>
            </div>
          </div>
          
          <div style="display: flex; align-items: center; gap: 8px;">
            ${m.status === 'live' ? '<span class="live-badge" style="background: var(--accent-gradient); color:#fff; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: 900; animation: heartbeat 1.5s infinite;">LIVE</span>' : ''}
            <div style="font-weight: 900; color: var(--text-primary); font-size: 14px; letter-spacing: 0.5px;">
              ${m.status === 'finished' ? `${m.score.home} - ${m.score.away}` : `<span style="font-size: 12px; color: var(--text-muted); font-weight: 700;">${m.time} Local</span>`}
            </div>
          </div>
        </div>
      </div>
    `;
  }).join("");

  const headerGradient = `linear-gradient(135deg, ${colors.primary}50, ${colors.secondary}25)`;
  const isFav = state.favorites.teams.includes(teamId);

  modalContent.innerHTML = `
    <div class="team-detail-header" style="position: relative; background: ${headerGradient};">
      <button class="control-btn" style="position: absolute; top: 12px; right: 12px; padding: 6px 12px; font-size: 12px; font-weight: 700; background-color: var(--bg-primary); border: 1px solid var(--border-color); border-radius: var(--btn-radius); cursor: pointer;" onclick="window.toggleFavoriteTeamFromProfile('${teamId}', this)">
        ${isFav ? '★ Favorited' : '☆ Add to Favorites'}
      </button>
      <div class="team-detail-flag">
        <img class="team-detail-flag-img" src="${getTeamFlagUrl(teamId)}" alt="${team.name}">
      </div>
      <div class="team-detail-info">
        <h2>${team.name}</h2>
        <p>Confederation: ${team.confed} • Rating: ${team.rating} • ${groupName}</p>
      </div>
    </div>

    <!-- Modal navigation subtabs -->
    <div class="modal-tabs" style="margin-top: 20px; margin-bottom: 16px;">
      <button class="modal-tab-btn active" data-modal-tab="team-overview">Overview & Stats</button>
      <button class="modal-tab-btn" data-modal-tab="team-lineup">Squad & Lineup</button>
      <button class="modal-tab-btn" data-modal-tab="team-fixtures">Fixtures & Results</button>
    </div>

    <!-- Tab 1: Overview & Stats -->
    <div id="modal-tab-team-overview" class="modal-tab-content-view active">
      <p style="font-size: 13px; line-height: 1.5; color: var(--text-secondary); margin-bottom: 16px; background-color: var(--bg-primary); border: 1px solid var(--border-color); border-radius: var(--card-radius); padding: 14px;">
        ${bio}
      </p>

      <!-- Stats grids -->
      <h3 style="font-size: 14px; font-weight: 800; margin-bottom: 10px; color: var(--accent-orange);">Tournament Statistics</h3>
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 10px;">
        <div style="background-color: var(--bg-primary); border: 1px solid var(--border-color); border-radius: var(--btn-radius); padding: 10px; text-align: center;">
          <span style="font-size: 18px; font-weight: 900; color: var(--text-primary); display: block;">${tournamentStats.mp}</span>
          <span style="font-size: 9px; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Played</span>
        </div>
        <div style="background-color: var(--bg-primary); border: 1px solid var(--border-color); border-radius: var(--btn-radius); padding: 10px; text-align: center;">
          <span style="font-size: 18px; font-weight: 900; color: var(--success); display: block;">${tournamentStats.w}</span>
          <span style="font-size: 9px; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Wins</span>
        </div>
        <div style="background-color: var(--bg-primary); border: 1px solid var(--border-color); border-radius: var(--btn-radius); padding: 10px; text-align: center;">
          <span style="font-size: 18px; font-weight: 900; color: var(--text-secondary); display: block;">${tournamentStats.d}</span>
          <span style="font-size: 9px; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Draws</span>
        </div>
        <div style="background-color: var(--bg-primary); border: 1px solid var(--border-color); border-radius: var(--btn-radius); padding: 10px; text-align: center;">
          <span style="font-size: 18px; font-weight: 900; color: var(--danger); display: block;">${tournamentStats.l}</span>
          <span style="font-size: 9px; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Losses</span>
        </div>
      </div>
      
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px;">
        <div style="background-color: var(--bg-primary); border: 1px solid var(--border-color); border-radius: var(--btn-radius); padding: 10px; text-align: center;">
          <span style="font-size: 18px; font-weight: 900; color: var(--accent-orange); display: block;">${tournamentStats.gs}</span>
          <span style="font-size: 9px; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Goals For</span>
        </div>
        <div style="background-color: var(--bg-primary); border: 1px solid var(--border-color); border-radius: var(--btn-radius); padding: 10px; text-align: center;">
          <span style="font-size: 18px; font-weight: 900; color: var(--text-secondary); display: block;">${tournamentStats.gc}</span>
          <span style="font-size: 9px; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Goals Against</span>
        </div>
        <div style="background-color: var(--bg-primary); border: 1px solid var(--border-color); border-radius: var(--btn-radius); padding: 10px; text-align: center;">
          <span style="font-size: 18px; font-weight: 900; color: ${tournamentStats.gd >= 0 ? 'var(--success)' : 'var(--danger)'}; display: block;">${tournamentStats.gd > 0 ? '+' + tournamentStats.gd : tournamentStats.gd}</span>
          <span style="font-size: 9px; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Goal Diff</span>
        </div>
        <div style="background-color: var(--bg-primary); border: 1px solid var(--border-color); border-radius: var(--btn-radius); padding: 10px; text-align: center;">
          <span style="font-size: 18px; font-weight: 900; color: var(--info); display: block;">${tournamentStats.cs}</span>
          <span style="font-size: 9px; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Clean Sheets</span>
        </div>
      </div>

      <!-- Compact group standings -->
      <div class="card-box" style="padding: 16px; margin-bottom: 10px;">
        <h3 style="font-size: 14px; margin-bottom: 12px; font-weight: 800; color: var(--accent-orange);">${groupName} Standings</h3>
        <table class="standings-table">
          <thead>
            <tr>
              <th style="width: 28px;">#</th>
              <th class="text-left" style="padding-left: 8px;">Team</th>
              <th>P</th>
              <th>W</th>
              <th>D</th>
              <th>L</th>
              <th>GD</th>
              <th>PTS</th>
            </tr>
          </thead>
          <tbody>
            ${standingsRowsHtml}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Tab 2: Squad & Lineup -->
    <div id="modal-tab-team-lineup" class="modal-tab-content-view">
      <div class="soccer-field-wrapper" style="margin-top: 10px; margin-bottom: 20px;">
        <div class="soccer-pitch">
          <div class="pitch-box-top"></div>
          <div class="pitch-box-bottom"></div>
          ${pitchPlayersHtml}
        </div>
      </div>

      <div class="lineup-team-section" style="margin-top: 10px; margin-bottom: 10px;">
        <h3 style="font-size: 14px; font-weight: 800; color: var(--accent-orange); margin-bottom: 12px;">Tactical Squad Roster</h3>
        <div class="roster-list" style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
          ${teamRosterHtml}
        </div>
      </div>
    </div>

    <!-- Tab 3: Fixtures & Results -->
    <div id="modal-tab-team-fixtures" class="modal-tab-content-view">
      <div style="margin-top: 10px; margin-bottom: 10px; max-height: 480px; overflow-y: auto; padding-right: 4px;">
        ${matchRows.length > 0 ? matchRows : '<p style="color:var(--text-muted); font-size:12px; text-align:center; padding: 24px;">No matches scheduled.</p>'}
      </div>
    </div>
  `;

  // Attach tab switching event listeners
  const tabs = modalContent.querySelectorAll(".modal-tab-btn");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      
      const targetViewId = "modal-tab-" + tab.getAttribute("data-modal-tab");
      modalContent.querySelectorAll(".modal-tab-content-view").forEach(view => {
        if (view.id === targetViewId) {
          view.classList.add("active");
        } else {
          view.classList.remove("active");
        }
      });
    });
  });

  modal.style.display = "flex";
}
window.openTeamDetail = openTeamProfile;

// Expose match details from team profile fixtures globally
window.openMatchDetailFromTeam = function(matchId) {
  const match = [...state.fixtures, ...state.knockoutFixtures].find(m => m.id == matchId);
  if (match) {
    openMatchDetail(match);
  }
};

// Helper to generate a full 11-player lineup roster for a team (key stars + positions placeholders)
function getTeamRoster(team, isAway = false) {
  const squad = [];
  const keyPlayers = team.keyPlayers || [];
  
  // Roster positions: 1 GK, 4 DEF, 3 MID, 3 ATT
  const positions = [
    { pos: "GK", label: "Goalkeeper" },
    { pos: "DEF", label: "Left Back" },
    { pos: "DEF", label: "Center Back" },
    { pos: "DEF", label: "Center Back" },
    { pos: "DEF", label: "Right Back" },
    { pos: "MID", label: "Left Mid" },
    { pos: "MID", label: "Center Mid" },
    { pos: "MID", label: "Right Mid" },
    { pos: "ATT", label: "Left Winger" },
    { pos: "ATT", label: "Striker" },
    { pos: "ATT", label: "Right Winger" }
  ];

  // Coordinates for visual soccer field positions (x: width%, y: height%)
  const homeCoords = [
    { x: 50, y: 91 }, // GK
    { x: 15, y: 79 }, // LB
    { x: 38, y: 81 }, // CB1
    { x: 62, y: 81 }, // CB2
    { x: 85, y: 79 }, // RB
    { x: 25, y: 68 }, // LM
    { x: 50, y: 71 }, // DM
    { x: 75, y: 68 }, // RM
    { x: 20, y: 58 }, // LW
    { x: 50, y: 56 }, // ST
    { x: 80, y: 58 }  // RW
  ];

  const awayCoords = [
    { x: 50, y: 9 },  // GK
    { x: 85, y: 21 }, // LB
    { x: 62, y: 19 }, // CB1
    { x: 38, y: 19 }, // CB2
    { x: 15, y: 21 }, // RB
    { x: 75, y: 32 }, // LM
    { x: 50, y: 29 }, // DM
    { x: 25, y: 32 }, // RM
    { x: 80, y: 42 }, // LW
    { x: 50, y: 44 }, // ST
    { x: 20, y: 42 }  // RW
  ];

  const coords = isAway ? awayCoords : homeCoords;
  let keyIndex = 0;
  
  positions.forEach((p, idx) => {
    let name = "";
    let number = idx === 0 ? 1 : idx + 2;
    
    // Distribute key stars to match their positions
    if (p.pos === "ATT" && keyIndex < keyPlayers.length && idx >= 8) {
      name = keyPlayers[keyIndex++];
    } else if (p.pos === "MID" && keyIndex < keyPlayers.length && idx >= 5 && idx <= 7) {
      name = keyPlayers[keyIndex++];
    } else if (p.pos === "DEF" && keyIndex < keyPlayers.length && idx >= 1 && idx <= 4) {
      name = keyPlayers[keyIndex++];
    } else {
      if (keyIndex < keyPlayers.length) {
        name = keyPlayers[keyIndex++];
      } else {
        name = `${team.name} ${p.label}`;
      }
    }
    
    squad.push({
      number,
      name,
      pos: p.pos,
      role: p.label,
      x: coords[idx].x,
      y: coords[idx].y
    });
  });
  
  return squad;
}

function openMatchDetail(match) {
  const modal = document.getElementById("detail-modal");
  const modalContent = document.getElementById("modal-body-content");

  const flagPlaceholderHtml = `
    <div class="team-flag-placeholder-wrapper" style="display: inline-flex; width: 16px; height: 16px;">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="placeholder-shield-svg" style="width: 10px; height: 10px;">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    </div>`;

  const home = TEAMS[match.homeTeamId] || { name: match.placeholderHome || "TBD", rating: 75, confed: "N/A", keyPlayers: [] };
  const away = TEAMS[match.awayTeamId] || { name: match.placeholderAway || "TBD", rating: 75, confed: "N/A", keyPlayers: [] };

  const isFinished = match.status === "finished";
  const homeScore = match.score ? match.score.home : "-";
  const awayScore = match.score ? match.score.away : "-";

  const istDateTime = getLocalDateTime(match.date, match.time, match.venue);

  // Compute team colors and gradient for the modal header card
  const colorsHome = getTeamColors(match.homeTeamId);
  const colorsAway = getTeamColors(match.awayTeamId);
  const headerGradient = `linear-gradient(135deg, ${colorsHome.primary}44, ${colorsAway.primary}20)`;

  // H2H stats calculations
  const totalRating = home.rating + away.rating;
  const homeRatingPct = totalRating > 0 ? Math.round((home.rating / totalRating) * 100) : 50;
  const awayRatingPct = 100 - homeRatingPct;

  const isLive = match.status === "live";

  // Build match events
  let eventsHtml = "";
  if (match.events && match.events.length > 0) {
    eventsHtml = match.events.map(e => {
      let iconHtml = "";
      if (e.type === "goal") {
        iconHtml = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 12px; height: 12px; color: var(--text-primary); display: inline-block; vertical-align: middle;">
            <circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20"/>
          </svg>`;
      } else if (e.type === "card" && e.detail && e.detail.includes("Yellow")) {
        iconHtml = `<span class="stat-card-badge yellow" style="width: 8px; height: 12px; margin-right: 0;"></span>`;
      } else if (e.type === "card" && e.detail && e.detail.includes("Red")) {
        iconHtml = `<span class="stat-card-badge red" style="width: 8px; height: 12px; margin-right: 0;"></span>`;
      } else {
        iconHtml = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 12px; height: 12px; color: var(--text-muted); display: inline-block; vertical-align: middle;">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>`;
      }
      
      const eventFlagHtml = e.teamId ? `<img class="team-flag-img" src="${getTeamFlagUrl(e.teamId)}" alt="">` : flagPlaceholderHtml;
      
      return `
        <div class="match-event-row">
          <span class="me-icon" style="display: inline-flex; align-items: center; justify-content: center; width: 16px; height: 16px;">${iconHtml}</span>
          <span class="me-time">${e.minute}'</span>
          <span style="margin-right: 6px;">${eventFlagHtml}</span>
          <span class="me-player">${e.player} ${e.assist ? '<span class="me-assist">(Assist: ' + e.assist + ')</span>' : ''}</span>
          <span class="me-type-label">${e.detail || ''}</span>
        </div>
      `;
    }).join("");
  } else if (isFinished) {
    eventsHtml = `<p style="color:var(--text-muted); text-align:center; padding:12px; font-size:12px;">No key match events recorded.</p>`;
  } else if (isLive) {
    eventsHtml = `<p style="color:var(--live-color); text-align:center; padding:12px; font-size:12px; font-weight:700; animation:pulseLive 1s alternate infinite;">Match is live! No key events recorded yet.</p>`;
  } else {
    eventsHtml = `<p style="color:var(--text-muted); text-align:center; padding:12px; font-size:12px;">Match is scheduled on IST: ${istDateTime.date} at ${istDateTime.time}. Events will display here once the match starts.</p>`;
  }

  // Generate rosters
  const homeRoster = getTeamRoster(home, false);
  const awayRoster = getTeamRoster(away, true);

  // Generate HTML for visual soccer field
  let pitchPlayersHtml = "";
  homeRoster.forEach(p => {
    pitchPlayersHtml += `
      <div class="player-node" style="left: ${p.x}%; top: ${p.y}%;" title="${p.role}: ${p.name}">
        <div class="player-jersey">${p.number}</div>
        <div class="player-node-name">${p.name.split(" ").slice(-1)[0]}</div>
      </div>
    `;
  });

  awayRoster.forEach(p => {
    pitchPlayersHtml += `
      <div class="player-node" style="left: ${p.x}%; top: ${p.y}%;" title="${p.role}: ${p.name}">
        <div class="player-jersey away">${p.number}</div>
        <div class="player-node-name">${p.name.split(" ").slice(-1)[0]}</div>
      </div>
    `;
  });

  // Generate lineups listings HTML
  const homeRosterHtml = homeRoster.map(p => `
    <div class="roster-item" title="${p.role}">
      <span class="roster-number">${p.number}</span>
      <span style="font-weight:600;">${p.name}</span>
      <span style="font-size:10px; color:var(--text-muted); margin-left:auto;">${p.pos}</span>
    </div>
  `).join("");

  const awayRosterHtml = awayRoster.map(p => `
    <div class="roster-item" title="${p.role}">
      <span class="roster-number away">${p.number}</span>
      <span style="font-weight:600;">${p.name}</span>
      <span style="font-size:10px; color:var(--text-muted); margin-left:auto;">${p.pos}</span>
    </div>
  `).join("");

  modalContent.innerHTML = `
    <div class="match-detail-header" style="background: ${headerGradient};">
      <div class="match-detail-stage">${match.stage} ${match.groupId ? '• Group ' + match.groupId : ''}</div>
      <div class="match-detail-scorebox">
        <div class="md-team" style="cursor:pointer;" onclick="window.openTeamDetail('${match.homeTeamId}')">
          <span class="md-flag">
            ${match.homeTeamId ? `<img class="md-flag-img" src="${getTeamFlagUrl(match.homeTeamId)}" alt="">` : flagPlaceholderHtml}
          </span>
          <span class="md-name">${home.name}</span>
        </div>
        <div class="md-score">${homeScore} - ${awayScore}</div>
        <div class="md-team" style="cursor:pointer;" onclick="window.openTeamDetail('${match.awayTeamId}')">
          <span class="md-flag">
            ${match.awayTeamId ? `<img class="md-flag-img" src="${getTeamFlagUrl(match.awayTeamId)}" alt="">` : flagPlaceholderHtml}
          </span>
          <span class="md-name">${away.name}</span>
        </div>
      </div>
      
      <div class="match-detail-info-row" style="margin-top:12px; font-size: 15px; font-weight: 700; color: var(--accent); display: flex; align-items: center; justify-content: center; gap: 6px;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="info-svg-icon" style="width: 14px; height: 14px; color: var(--accent);">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        <span>${istDateTime.date} at ${istDateTime.time} (IST)</span>
      </div>
      <div class="match-detail-info-row" style="margin-top:4px; display: flex; align-items: center; justify-content: center; gap: 6px;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="info-svg-icon" style="width: 14px; height: 14px; color: var(--text-secondary);">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
        <span>${match.venue ? match.venue.name : 'Stadium'} • ${match.venue ? match.venue.city : ''}, ${match.venue ? match.venue.country : ''}</span>
      </div>
    </div>

    <!-- Modal Navigation Sub-tabs -->
    <div class="modal-tabs">
      <button class="modal-tab-btn active" data-modal-tab="info">Match Info</button>
      <button class="modal-tab-btn" data-modal-tab="lineups">Lineups & Field</button>
      <button class="modal-tab-btn" data-modal-tab="h2h">Team Comparison</button>
    </div>

    <!-- TAB 1: MATCH INFO -->
    <div id="modal-tab-info" class="modal-tab-content-view active">
      <div class="match-events-list">
        <h3>Match Events</h3>
        <div style="display:flex; flex-direction:column; gap:8px;">
          ${eventsHtml}
        </div>
      </div>
    </div>

    <!-- TAB 2: LINEUPS -->
    <div id="modal-tab-lineups" class="modal-tab-content-view">
      <div class="soccer-field-wrapper">
        <div class="soccer-pitch">
          <div class="pitch-box-top"></div>
          <div class="pitch-box-bottom"></div>
          <!-- Player Nodes injected here -->
          ${pitchPlayersHtml}
        </div>
      </div>
      
      <div class="lineups-split-lists">
        <div class="lineup-team-section">
          <h4>
            ${match.homeTeamId ? `<img class="team-flag-img" src="${getTeamFlagUrl(match.homeTeamId)}" alt="">` : flagPlaceholderHtml}
            ${home.name} Lineup
          </h4>
          <div class="roster-list">${homeRosterHtml}</div>
        </div>
        <div class="lineup-team-section">
          <h4>
            ${match.awayTeamId ? `<img class="team-flag-img" src="${getTeamFlagUrl(match.awayTeamId)}" alt="">` : flagPlaceholderHtml}
            ${away.name} Lineup
          </h4>
          <div class="roster-list">${awayRosterHtml}</div>
        </div>
      </div>
    </div>

    <!-- TAB 3: TEAM COMPARISON -->
    <div id="modal-tab-h2h" class="modal-tab-content-view">
      <div class="card-box" style="margin-top: 10px; padding: 24px;">
        <h3 style="font-size: 16px; margin-bottom: 20px; text-align: center; font-weight: 800;">Team Performance Comparison</h3>
        
        <div class="comparison-row header" style="border-bottom: 2px solid var(--border-color); padding-bottom: 14px; margin-bottom: 16px;">
          <div class="comparison-val-left" style="font-size: 15px; font-weight: 800;">
            ${match.homeTeamId ? `<img class="team-flag-img" src="${getTeamFlagUrl(match.homeTeamId)}" alt="">` : flagPlaceholderHtml}
            ${home.name}
          </div>
          <div class="comparison-label" style="font-size: 12px; font-weight: 900;">VS</div>
          <div class="comparison-val-right" style="font-size: 15px; font-weight: 800;">
            ${match.awayTeamId ? `<img class="team-flag-img" src="${getTeamFlagUrl(match.awayTeamId)}" alt="">` : flagPlaceholderHtml}
            ${away.name}
          </div>
        </div>

        <div class="comparison-stat-item" style="margin: 20px 0;">
          <div class="comparison-row" style="border-bottom: none; padding-bottom: 6px;">
            <div class="comparison-val-left" style="color: var(--text-primary); font-weight: 800; font-size: 14px;">${home.rating}</div>
            <div class="comparison-label">FIFA Rating</div>
            <div class="comparison-val-right" style="color: var(--text-primary); font-weight: 800; font-size: 14px;">${away.rating}</div>
          </div>
          <div class="comparison-bar-track" style="height: 6px; background-color: var(--bg-tertiary); border-radius: 3px; overflow: hidden; display: flex; border: 1px solid var(--border-color);">
            <div class="comparison-bar-fill home" style="width: ${homeRatingPct}%; height: 100%; background: linear-gradient(to right, ${colorsHome.primary}, ${colorsHome.secondary || colorsHome.primary}); transition: width 0.6s ease;"></div>
            <div class="comparison-bar-fill away" style="width: ${awayRatingPct}%; height: 100%; background: linear-gradient(to left, ${colorsAway.primary}, ${colorsAway.secondary || colorsAway.primary}); transition: width 0.6s ease;"></div>
          </div>
        </div>

        <div class="comparison-row" style="padding: 14px 0;">
          <div class="comparison-val-left">${home.confed || "N/A"}</div>
          <div class="comparison-label">Confederation</div>
          <div class="comparison-val-right">${away.confed || "N/A"}</div>
        </div>

        <div class="comparison-row" style="padding: 14px 0; border-bottom: none;">
          <div class="comparison-val-left" style="font-size: 11px; white-space: normal; line-height: 1.4; font-weight: 700;">
            ${(home.keyPlayers || []).slice(0, 3).join(", ") || "None"}
          </div>
          <div class="comparison-label">Key Stars</div>
          <div class="comparison-val-right" style="font-size: 11px; white-space: normal; line-height: 1.4; font-weight: 700;">
            ${(away.keyPlayers || []).slice(0, 3).join(", ") || "None"}
          </div>
        </div>
      </div>
    </div>
  `;

  // Attach tab switching event listeners
  const tabs = modalContent.querySelectorAll(".modal-tab-btn");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      
      const targetViewId = "modal-tab-" + tab.getAttribute("data-modal-tab");
      modalContent.querySelectorAll(".modal-tab-content-view").forEach(view => {
        if (view.id === targetViewId) {
          view.classList.add("active");
        } else {
          view.classList.remove("active");
        }
      });
    });
  });

  modal.style.display = "flex";
}

// Show News articles details modal
function openNewsDetail(newsItem) {
  const modal = document.getElementById("detail-modal");
  const modalContent = document.getElementById("modal-body-content");

  modalContent.innerHTML = `
    <div style="border-bottom:1px solid var(--border-color); padding-bottom:16px; margin-bottom:16px;">
      <span class="badge-stage" style="background-color:var(--accent-light); color:var(--accent);">${newsItem.category}</span>
      <h2 style="font-size:22px; margin-top:8px; margin-bottom:8px;">${newsItem.title}</h2>
      <div style="font-size:11px; color:var(--text-muted); font-weight:700;">
        <span>By ${newsItem.author}</span> • <span>${newsItem.date} (${newsItem.time})</span> • <span>${newsItem.readTime}</span>
      </div>
    </div>
    <div style="font-size:14px; line-height:1.6; color:var(--text-secondary);">
      <p style="font-weight:600; font-size:15px; color:var(--text-primary); margin-bottom:16px;">${newsItem.summary}</p>
      <p style="margin-bottom:12px;">The excitement surrounding the FIFA World Cup 2026 continues to gather pace across North America. With under 10 days remaining until the opening whistle at Estadio Azteca, confederations are confirming squads, managers are perfecting training programs, and local host cities are preparing to welcome millions of fans.</p>
      <p style="margin-bottom:12px;">Our team will follow every fixture, tackle, goal, and decision live. Stay tuned for match previews, post-match breakdowns, and exclusive analysis throughout the summer of 2026.</p>
    </div>
  `;
  modal.style.display = "flex";
}

// Render Playoff Bracket Page
// Render Playoff Bracket Page
function renderPlayoffs() {
  const container = document.getElementById("playoffs-bracket-container");
  if (!container) return;

  container.innerHTML = "";

  // Check if knockout stages have been unlocked/generated
  const unplayedGroupsCount = state.fixtures.filter(m => m.status !== "finished").length;
  


  const treeContainer = document.createElement("div");
  treeContainer.className = "bracket-tree-container";

  // Create SVG element for connections
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "bracket-svg");
  treeContainer.appendChild(svg);

  // Helper helper to add a column
  const addColumn = (matchIds) => {
    const col = document.createElement("div");
    col.className = "bracket-column";
    matchIds.forEach(id => {
      col.appendChild(createBracketMatchCard(id));
    });
    treeContainer.appendChild(col);
  };

  // Left Column 1: Round of 32 (8 matches: 73 to 80)
  addColumn([73, 74, 75, 76, 77, 78, 79, 80]);

  // Left Column 2: Round of 16 (4 matches: 89 to 92)
  addColumn([89, 90, 91, 92]);

  // Left Column 3: Quarter-finals (2 matches: 97, 98)
  addColumn([97, 98]);

  // Left Column 4: Semi-finals (1 match: 101)
  addColumn([101]);

  // Center Column: Trophy, Final (104) and Bronze Final (103)
  const centerCol = document.createElement("div");
  centerCol.className = "bracket-center-col";

  const trophyBox = document.createElement("div");
  trophyBox.className = "bracket-trophy-box";
  trophyBox.innerHTML = `
    <svg class="bracket-trophy-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 48px; height: 48px; color: var(--accent-orange); filter: drop-shadow(0 0 10px rgba(255, 115, 0, 0.3));">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34M12 2a5 5 0 0 0-5 5v5h10V7a5 5 0 0 0-5-5z"/>
    </svg>
    <span class="bracket-trophy-label">CHAMPION</span>
  `;
  centerCol.appendChild(trophyBox);

  centerCol.appendChild(createBracketMatchCard(104));
  centerCol.appendChild(createBracketMatchCard(103));
  treeContainer.appendChild(centerCol);

  // Right Column 4: Semi-finals (1 match: 102)
  addColumn([102]);

  // Right Column 3: Quarter-finals (2 matches: 99, 100)
  addColumn([99, 100]);

  // Right Column 2: Round of 16 (4 matches: 93 to 96)
  addColumn([93, 94, 95, 96]);

  // Right Column 1: Round of 32 (8 matches: 81 to 88)
  addColumn([81, 82, 83, 84, 85, 86, 87, 88]);

  container.appendChild(treeContainer);

  // Animate enter effects
  triggerScrollAnimation();

  // Run SVG connector drawing on frame request and set listener
  requestAnimationFrame(() => {
    drawBracketLines();
  });
}

function getMatchInfo(mId) {
  const info = {
    // R32 Left
    73: { home: "1E", away: "3AB", date: "June 30, 2026" },
    74: { home: "1I", away: "3CD", date: "July 1, 2026" },
    75: { home: "2A", away: "2B", date: "June 28, 2026" },
    76: { home: "1F", away: "2C", date: "June 30, 2026" },
    77: { home: "2K", away: "2L", date: "July 3, 2026" },
    78: { home: "1H", away: "2J", date: "July 2, 2026" },
    79: { home: "1D", away: "3BE", date: "July 2, 2026" },
    80: { home: "1G", away: "3AE", date: "July 1, 2026" },
    // R32 Right
    81: { home: "1C", away: "2F", date: "June 29, 2026" },
    82: { home: "2E", away: "2I", date: "June 30, 2026" },
    83: { home: "1A", away: "3CE", date: "July 1, 2026" },
    84: { home: "1L", away: "3EH", date: "July 1, 2026" },
    85: { home: "1J", away: "2H", date: "July 4, 2026" },
    86: { home: "2D", away: "2G", date: "July 3, 2026" },
    87: { home: "1B", away: "3EF", date: "July 3, 2026" },
    88: { home: "1K", away: "3DE", date: "July 4, 2026" },
    
    // R16 Left
    89: { home: "1EA", away: "1IC", date: "July 5, 2026" },
    90: { home: "2AB", away: "1FC", date: "July 4, 2026" },
    91: { home: "2KL", away: "1HJ", date: "July 6, 2026" },
    92: { home: "1DB", away: "1GA", date: "July 7, 2026" },
    // R16 Right
    93: { home: "1CF", away: "2EI", date: "July 5, 2026" },
    94: { home: "1AC", away: "1LE", date: "July 6, 2026" },
    95: { home: "1JH", away: "2DG", date: "July 7, 2026" },
    96: { home: "1BE", away: "1KD", date: "July 7, 2026" },
    
    // QF Left
    97: { home: "EF1", away: "EF2", date: "July 9, 2026" },
    98: { home: "EF5", away: "EF6", date: "July 10, 2026" },
    // QF Right
    99: { home: "EF3", away: "EF4", date: "July 12, 2026" },
    100: { home: "EF7", away: "EF8", date: "July 12, 2026" },
    
    // SF Left
    101: { home: "WQ1", away: "WQ2", date: "July 14, 2026" },
    // SF Right
    102: { home: "WQ3", away: "WQ4", date: "July 15, 2026" },
    
    // Final & Bronze Final
    104: { home: "WS1", away: "WS2", date: "July 19, 2026" },
    103: { home: "LS1", away: "LS2", date: "July 18, 2026" }
  };
  return info[mId] || { home: "TBD", away: "TBD", date: "TBD" };
}

function createBracketMatchCard(mId) {
  let match = state.knockoutFixtures.find(m => m.id === mId);
  const info = getMatchInfo(mId);

  if (!match) {
    match = {
      id: mId,
      homeTeamId: null,
      awayTeamId: null,
      placeholderHome: info.home,
      placeholderAway: info.away,
      date: info.date,
      status: "upcoming",
      score: null
    };
  }

  const isHomeWinner = match.status === "finished" && match.score.home > match.score.away;
  const isAwayWinner = match.status === "finished" && match.score.away > match.score.home;
  const isFinished = match.status === "finished";
  const isLive = match.status === "live";

  const homeTeam = match.homeTeamId ? TEAMS[match.homeTeamId] : null;
  const awayTeam = match.awayTeamId ? TEAMS[match.awayTeamId] : null;

  const homeName = homeTeam ? homeTeam.name : (match.placeholderHome || info.home);
  const awayName = awayTeam ? awayTeam.name : (match.placeholderAway || info.away);

  let homeFlagHtml = "";
  if (homeTeam) {
    homeFlagHtml = `<img class="bracket-flag-circle" src="${getTeamFlagUrl(match.homeTeamId)}" alt="${homeName}">`;
  } else {
    homeFlagHtml = `
      <div class="bracket-shield-wrapper">
        <svg class="bracket-shield-svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z"/>
        </svg>
      </div>`;
  }

  let awayFlagHtml = "";
  if (awayTeam) {
    awayFlagHtml = `<img class="bracket-flag-circle" src="${getTeamFlagUrl(match.awayTeamId)}" alt="${awayName}">`;
  } else {
    awayFlagHtml = `
      <div class="bracket-shield-wrapper">
        <svg class="bracket-shield-svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z"/>
        </svg>
      </div>`;
  }

  let scoreHtml = `<span class="card-score-mid vs">vs</span>`;
  if (isLive) {
    scoreHtml = `<span class="card-score-mid" style="color:var(--live-color); font-weight: 900;">${match.score.home} - ${match.score.away}</span>`;
  } else if (isFinished) {
    scoreHtml = `<span class="card-score-mid">${match.score.home} - ${match.score.away}</span>`;
  }

  let cardClass = "bracket-match-card animate-on-scroll";
  if (!match.homeTeamId && !match.awayTeamId) {
    cardClass += " placeholder";
  }

  const card = document.createElement("div");
  card.className = cardClass;
  card.setAttribute("data-match-id", mId);

  let dateText = info.date;
  if (dateText && dateText.includes(",")) {
    const parts = dateText.replace(",", "").split(" ");
    if (parts.length >= 2) {
      const shortMonths = {
        "January": "Jan", "February": "Feb", "March": "Mar", "April": "Apr", "May": "May", "June": "Jun",
        "July": "Jul", "August": "Aug", "September": "Sep", "October": "Oct", "November": "Nov", "December": "Dec"
      };
      const shortMonth = shortMonths[parts[0]] || parts[0].substring(0, 3);
      dateText = `${shortMonth} ${parts[1]}`;
    }
  }
  if (isLive) dateText = `<span class="live-dot" style="margin-right:4px;"></span>LIVE`;
  else if (isFinished) dateText = "FT";

  let badgeRowHtml = "";
  if (mId === 104) {
    badgeRowHtml = `<div class="card-badge-row"><span class="badge-stage" style="background:var(--accent-gradient); font-size:8px; padding:3px 8px; margin:0; box-shadow:none;">FINAL</span></div>`;
  } else if (mId === 103) {
    badgeRowHtml = `<div class="card-badge-row"><span class="badge-stage" style="background:rgba(56,189,248,0.15); border:1px solid rgba(56,189,248,0.3); color:var(--info); font-size:8px; padding:2px 8px; margin:0; box-shadow:none;">BRONZE-FINAL</span></div>`;
  }

  card.innerHTML = `
    <div class="card-shields-row">
      ${homeFlagHtml}
      ${scoreHtml}
      ${awayFlagHtml}
    </div>
    <div class="card-names-row">
      <span class="card-team-code home-code ${isHomeWinner ? 'winner-code' : (isAwayWinner ? 'loser-code' : '')}">${homeTeam ? homeTeam.id : homeName}</span>
      <span class="card-team-code away-code ${isAwayWinner ? 'winner-code' : (isHomeWinner ? 'loser-code' : '')}">${awayTeam ? awayTeam.id : awayName}</span>
    </div>
    <div class="card-date-row">${dateText}</div>
    ${badgeRowHtml}
  `;

  if (match.homeTeamId || match.awayTeamId) {
    card.addEventListener("click", () => {
      openMatchDetail(match);
    });
  }

  return card;
}

function drawBracketLines() {
  const treeContainer = document.querySelector(".bracket-tree-container");
  if (!treeContainer) return;
  const svg = treeContainer.querySelector(".bracket-svg");
  if (!svg) return;
  svg.innerHTML = ""; // Clear existing

  const containerRect = treeContainer.getBoundingClientRect();
  
  const connections = [
    // R32 -> R16 Left
    [73, 89], [74, 89], [75, 90], [76, 90],
    [77, 91], [78, 91], [79, 92], [80, 92],
    // R32 -> R16 Right
    [81, 93], [82, 93], [83, 94], [84, 94],
    [85, 95], [86, 95], [87, 96], [88, 96],
    // R16 -> QF Left
    [89, 97], [90, 97], [91, 98], [92, 98],
    // R16 -> QF Right
    [93, 99], [94, 99], [95, 100], [96, 100],
    // QF -> SF Left
    [97, 101], [98, 101],
    // QF -> SF Right
    [99, 102], [100, 102],
    // SF -> Final (Center)
    [101, 104], [102, 104]
  ];

  connections.forEach(([parentId, childId]) => {
    const parentEl = treeContainer.querySelector(`[data-match-id="${parentId}"]`);
    const childEl = treeContainer.querySelector(`[data-match-id="${childId}"]`);

    if (parentEl && childEl) {
      const pRect = parentEl.getBoundingClientRect();
      const cRect = childEl.getBoundingClientRect();

      const px = pRect.left - containerRect.left;
      const py = pRect.top - containerRect.top;
      const cx = cRect.left - containerRect.left;
      const cy = cRect.top - containerRect.top;

      let x1, y1, x2, y2;
      const isLeft = px < cx;

      if (isLeft) {
        x1 = px + pRect.width;
        y1 = py + pRect.height / 2;
        x2 = cx;
        y2 = cy + cRect.height / 2;
      } else {
        x1 = px;
        y1 = py + pRect.height / 2;
        x2 = cx + cRect.width;
        y2 = cy + cRect.height / 2;
      }

      const midX = (x1 + x2) / 2;
      const pathData = `M ${x1} ${y1} H ${midX} V ${y2} H ${x2}`;

      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", pathData);
      path.setAttribute("class", "bracket-line-path");
      
      const parentMatch = state.knockoutFixtures.find(m => m.id === parentId);
      if (parentMatch && parentMatch.status === "finished") {
        path.classList.add("active");
      }

      svg.appendChild(path);
    }
  });
}

window.drawBracketLines = drawBracketLines;
window.addEventListener("resize", drawBracketLines);

// Create a match card node element for playoff bracket tree (legacy helper)
function createBracketMatchNode(match) {
  const node = document.createElement("div");
  node.className = "bracket-match-node";
  
  const isPlaceholder = !match.homeTeamId && !match.awayTeamId;
  if (isPlaceholder) {
    node.classList.add("placeholder");
  }

  const homeTeam = match.homeTeamId ? (TEAMS[match.homeTeamId] || { name: match.homeTeamId, flag: "" }) : null;
  const awayTeam = match.awayTeamId ? (TEAMS[match.awayTeamId] || { name: match.awayTeamId, flag: "" }) : null;

  const isLive = match.status === "live";
  const isFinished = match.status === "finished";

  const homeScore = match.score ? match.score.home : "-";
  const awayScore = match.score ? match.score.away : "-";

  let homeWinClass = "";
  let awayWinClass = "";
  if (isFinished) {
    if (match.score.home > match.score.away) {
      homeWinClass = "winner";
      awayWinClass = "loser";
    } else if (match.score.away > match.score.home) {
      homeWinClass = "loser";
      awayWinClass = "winner";
    }
  }

  const homeFlagHtml = homeTeam ? `<img class="team-flag-img" src="${getTeamFlagUrl(match.homeTeamId)}" alt="">` : flagPlaceholderHtml;
  const homeName = homeTeam ? homeTeam.name : (match.placeholderHome || "TBD");
  
  const awayFlagHtml = awayTeam ? `<img class="team-flag-img" src="${getTeamFlagUrl(match.awayTeamId)}" alt="">` : flagPlaceholderHtml;
  const awayName = awayTeam ? awayTeam.name : (match.placeholderAway || "TBD");

  let statusHtml = "";
  if (isLive) {
    statusHtml = `<span class="bracket-live-badge">LIVE</span>`;
  } else if (isFinished) {
    const isPen = match.penaltiesWinner ? " (Pen)" : "";
    statusHtml = `<span>FT${isPen}</span>`;
  } else {
    statusHtml = `<span>${match.time || "20:00"}</span>`;
  }

  node.innerHTML = `
    <div class="bracket-team-line ${homeWinClass}">
      <div class="bracket-team-details">
        <span class="bracket-flag">${homeFlagHtml}</span>
        <span class="bracket-name" title="${homeName}">${homeName}</span>
      </div>
      <span class="bracket-score">${homeScore}</span>
    </div>
    <div class="bracket-team-line ${awayWinClass}">
      <div class="bracket-team-details">
        <span class="bracket-flag">${awayFlagHtml}</span>
        <span class="bracket-name" title="${awayName}">${awayName}</span>
      </div>
      <span class="bracket-score">${awayScore}</span>
    </div>
    <div class="bracket-match-info-bar">
      <span>M${match.id} • ${match.stage === "Finals" ? (match.id === 104 ? "Final" : "3rd Place") : match.stage}</span>
      ${statusHtml}
    </div>
  `;

  const isClickable = match.homeTeamId || match.awayTeamId;
  if (isClickable) {
    node.addEventListener("click", () => {
      openMatchDetail(match);
    });
  }

  return node;
}

// ==========================================
// API-Football Integration & Real-Time Data
// ==========================================

// Global state tracking for current selected match ID
state.currentSelectedMatchId = null;

// Override openMatchDetail to track which match is open and display cyberpunk panels
const originalOpenMatchDetail = openMatchDetail;
openMatchDetail = function(match) {
  state.currentSelectedMatchId = match.id;
  originalOpenMatchDetail(match);
  openCyberpunkShowcase(match);
};

// Override openTeamProfile to open left cyberpunk panel
const originalOpenTeamProfile = openTeamProfile;
openTeamProfile = function(teamId) {
  originalOpenTeamProfile(teamId);
  openCyberpunkSingleTeam(teamId);
};

// Hook into detail modal close button to clear tracked match ID & close cyberpunk panels
document.getElementById("close-modal-btn").addEventListener("click", () => {
  state.currentSelectedMatchId = null;
  closeCyberpunkPanels();
});

// Also hook backdrop click to close cyberpunk panels
document.getElementById("detail-modal").addEventListener("click", (e) => {
  if (e.target === document.getElementById("detail-modal")) {
    closeCyberpunkPanels();
  }
});

// Attach event listeners to cyberpunk panel individual close buttons
document.getElementById("close-cyberpunk-left-btn").addEventListener("click", () => {
  document.getElementById("cyberpunk-showcase-left").classList.remove("active");
  syncCyberpunkBodyClass();
});
document.getElementById("close-cyberpunk-right-btn").addEventListener("click", () => {
  document.getElementById("cyberpunk-showcase-right").classList.remove("active");
  syncCyberpunkBodyClass();
});

// Sync body class for mobile stacking when both panels are simultaneously active
function syncCyberpunkBodyClass() {
  const leftActive = document.getElementById("cyberpunk-showcase-left")?.classList.contains("active");
  const rightActive = document.getElementById("cyberpunk-showcase-right")?.classList.contains("active");
  document.body.classList.toggle("cb-both-active", !!(leftActive && rightActive));
}

// Generate deterministic FUT stats based on player name and team rating
function getPlayerStats(playerName, teamRating) {
  let hash = 0;
  for (let i = 0; i < playerName.length; i++) {
    hash = playerName.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);
  
  const offset = (hash % 15) - 6; // -6 to +8
  const base = Math.min(99, Math.max(62, teamRating + offset));
  
  return {
    pac: Math.min(99, base + (hash % 7)),
    sho: Math.min(99, base + ((hash >> 2) % 9)),
    pas: Math.min(99, base + ((hash >> 4) % 8)),
    dri: Math.min(99, base + ((hash >> 6) % 7)),
    def: Math.min(99, base + ((hash >> 8) % 10)),
    phy: Math.min(99, base + ((hash >> 10) % 6))
  };
}

// Render team's key players inside a showcase panel
function renderCyberpunkPlayers(teamId, panelBodyId, teamNameId, panelId) {
  const panel = document.getElementById(panelId);
  const body = document.getElementById(panelBodyId);
  const title = document.getElementById(teamNameId);
  
  if (!panel || !body || !title) return;
  
  const team = TEAMS[teamId];
  if (!team) {
    panel.style.display = "none";
    return;
  }
  
  panel.style.display = ""; // Ensure shown if hidden
  
  const colors = getTeamColors(teamId);
  
  // Set custom CSS variables for team cyberpunk theme
  panel.style.setProperty('--team-color-primary', colors.primary);
  panel.style.setProperty('--team-color-secondary', colors.secondary);
  
  title.innerText = `${team.name} Stars`;
  
  // Create player cards HTML
  const playersHtml = team.keyPlayers.map((playerName, index) => {
    const stats = getPlayerStats(playerName, team.rating);
    const overall = Math.round((stats.pac + stats.sho + stats.pas + stats.dri + stats.def + stats.phy) / 6);
    
    // Guess a position from role
    const pos = index === 0 ? "ATT" : index === 1 ? "MID" : index === 2 ? "DEF" : "GK";
    
    return `
      <div class="cyberpunk-player-card" style="animation: fadeInUp 0.4s ease forwards; animation-delay: ${index * 0.1}s;">
        <div class="cp-card-main">
          <div class="cp-player-avatar-wrapper">
            <svg class="cp-player-avatar-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 21a6 6 0 0 0-12 0"/>
              <circle cx="12" cy="10" r="4"/>
              <path d="M12 2v2M12 18v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
            </svg>
          </div>
          <div class="cp-player-info">
            <span class="cp-player-name">${playerName}</span>
            <div class="cp-player-meta">
              <span class="cp-player-pos-badge">${pos}</span>
              <img class="cp-player-team-flag" src="${getTeamFlagUrl(teamId)}" alt="">
              <span style="color: var(--text-muted);">${team.confed}</span>
            </div>
          </div>
          <span class="cp-player-rating">${overall}</span>
        </div>
        <div class="cp-card-stats">
          <div class="cp-stat-box"><span class="cp-stat-lbl">PAC</span><span class="cp-stat-val">${stats.pac}</span></div>
          <div class="cp-stat-box"><span class="cp-stat-lbl">SHO</span><span class="cp-stat-val">${stats.sho}</span></div>
          <div class="cp-stat-box"><span class="cp-stat-lbl">PAS</span><span class="cp-stat-val">${stats.pas}</span></div>
          <div class="cp-stat-box"><span class="cp-stat-lbl">DRI</span><span class="cp-stat-val">${stats.dri}</span></div>
          <div class="cp-stat-box"><span class="cp-stat-lbl">DEF</span><span class="cp-stat-val">${stats.def}</span></div>
          <div class="cp-stat-box"><span class="cp-stat-lbl">PHY</span><span class="cp-stat-val">${stats.phy}</span></div>
        </div>
      </div>
    `;
  }).join("");
  
  body.innerHTML = playersHtml;
}

// Open both panels (Home vs Away cyberpunk showcase)
function openCyberpunkShowcase(match) {
  if (match.homeTeamId) {
    renderCyberpunkPlayers(match.homeTeamId, "cyberpunk-left-body", "cyberpunk-home-team-name", "cyberpunk-showcase-left");
    document.getElementById("cyberpunk-showcase-left").classList.add("active");
  } else {
    document.getElementById("cyberpunk-showcase-left").classList.remove("active");
  }
  
  if (match.awayTeamId) {
    renderCyberpunkPlayers(match.awayTeamId, "cyberpunk-right-body", "cyberpunk-away-team-name", "cyberpunk-showcase-right");
    document.getElementById("cyberpunk-showcase-right").classList.add("active");
  } else {
    document.getElementById("cyberpunk-showcase-right").classList.remove("active");
  }
  syncCyberpunkBodyClass();
}

// Open left panel for a single team clicked
function openCyberpunkSingleTeam(teamId) {
  renderCyberpunkPlayers(teamId, "cyberpunk-left-body", "cyberpunk-home-team-name", "cyberpunk-showcase-left");
  document.getElementById("cyberpunk-showcase-left").classList.add("active");
  document.getElementById("cyberpunk-showcase-right").classList.remove("active");
  syncCyberpunkBodyClass();
}

// Close both side panels
function closeCyberpunkPanels() {
  document.getElementById("cyberpunk-showcase-left").classList.remove("active");
  document.getElementById("cyberpunk-showcase-right").classList.remove("active");
  syncCyberpunkBodyClass();
}

// Setup API settings event listeners (simplified background service)
function setupApiSettings() {
  if (state.api.enabled) {
    fetchLiveScores();
  }
  // Poll every 60 seconds
  setInterval(fetchLiveScores, 60000);
}

// Fetch live scores from API
async function fetchLiveScores() {
  if (!state.api.enabled) {
    updateApiStatus("disconnected");
    const liveWidget = document.getElementById("live-api-widget");
    if (liveWidget) liveWidget.style.display = "none";
    return;
  }

  updateApiStatus("fetching");

  try {
    const res = await fetch("https://worldcup26.ir/get/games");
    if (!res.ok) throw new Error("HTTP Status " + res.status);
    const data = await res.json();
    const games = data.games || [];
    
    state.api.liveMatches = games;
    updateApiStatus("active");
    
    let updatedAny = false;
    games.forEach(item => {
      let localMatch = null;
      
      const homeName = item.home_team_name_en || item.home_team_en;
      const awayName = item.away_team_name_en || item.away_team_en;
      
      const localHomeId = findLocalTeamIdByName(homeName);
      const localAwayId = findLocalTeamIdByName(awayName);
      
      if (localHomeId && localAwayId) {
        const isGroup = item.type === "group";
        const searchPool = isGroup ? state.fixtures : state.knockoutFixtures;
        localMatch = searchPool.find(
          m => (m.homeTeamId === localHomeId && m.awayTeamId === localAwayId) ||
               (m.homeTeamId === localAwayId && m.awayTeamId === localHomeId)
        );
      }
      
      if (localMatch) {
        const isFinished = item.finished === "TRUE";
        const isLive = item.finished === "FALSE" && item.time_elapsed !== "notstarted";
        const newStatus = isFinished ? "finished" : (isLive ? "live" : "upcoming");
        
        let apiHomeScore = parseInt(item.home_score) || 0;
        let apiAwayScore = parseInt(item.away_score) || 0;
        let apiHomeScorers = item.home_scorers;
        let apiAwayScorers = item.away_scorers;
        
        if (localMatch.homeTeamId !== localHomeId) {
          apiHomeScore = parseInt(item.away_score) || 0;
          apiAwayScore = parseInt(item.home_score) || 0;
          apiHomeScorers = item.away_scorers;
          apiAwayScorers = item.home_scorers;
        }
        
        const newHomeScore = apiHomeScore;
        const newAwayScore = apiAwayScore;
        
        if (localMatch.status !== newStatus || localMatch.score?.home !== newHomeScore || localMatch.score?.away !== newAwayScore) {
          localMatch.status = newStatus;
          localMatch.score = { home: newHomeScore, away: newAwayScore };
          
          if (isFinished || isLive) {
            const homeScorersList = parseApiScorers(apiHomeScorers, localMatch.homeTeamId);
            const awayScorersList = parseApiScorers(apiAwayScorers, localMatch.awayTeamId);
            localMatch.events = [...homeScorersList, ...awayScorersList];
          }
          
          updatedAny = true;
        }
      }
    });
    
    if (updatedAny) {
      recalculateData();
      renderActiveTab();
    }
    
    renderLiveApiWidget();
  } catch (error) {
    console.error("API Error:", error);
    updateApiStatus("error", error.message);
    
    const widget = document.getElementById("live-api-widget");
    const listContainer = document.getElementById("live-api-matches-list");
    if (widget && listContainer) {
      widget.style.display = "block";
      listContainer.innerHTML = `<div style="padding: 12px; color: #ff4d4d; text-align: center; font-size: 13px;"><b>API Error:</b><br>${error.message}</div>`;
    }
  }
}

// Update header status indicator
function updateApiStatus(status, errorMsg = "") {
  state.api.status = status;
  
  const indicator = document.getElementById("api-status-indicator");
  if (!indicator) return;
  
  const dot = indicator.querySelector(".status-dot");
  const text = indicator.querySelector(".status-text");
  
  if (!dot || !text) return;
  
  if (status === "disconnected" || status === "error") {
    text.textContent = "Live Offline";
    dot.style.backgroundColor = "var(--text-muted)";
    indicator.style.borderColor = "var(--border-color)";
    
    if (status === "error" && errorMsg.includes("subscribed")) {
      text.textContent = "Subscription Error";
    }
  } else if (status === "fetching") {
    text.textContent = "Connecting...";
    dot.style.backgroundColor = "#eab308";
    indicator.style.borderColor = "rgba(250, 204, 21, 0.3)";
  } else if (status === "active") {
    text.textContent = "Live Connected";
    dot.style.backgroundColor = "#22c55e";
    indicator.style.borderColor = "rgba(34, 197, 94, 0.3)";
  }
}



// Match live team names to our local database of 48 teams
function findLocalTeamIdByName(apiTeamName) {
  if (!apiTeamName) return null;
  const nameLower = apiTeamName.toLowerCase().trim();
  
  for (const teamId in TEAMS) {
    const team = TEAMS[teamId];
    if (team.name.toLowerCase() === nameLower) {
      return teamId;
    }
  }
  
  const mappings = {
    "united states": "USA",
    "us": "USA",
    "south korea": "KOR",
    "korea republic": "KOR",
    "republic of ireland": "IRL",
    "ireland": "IRL",
    "mexico": "MEX",
    "canada": "CAN",
    "saudi arabia": "KSA",
    "south africa": "RSA",
    "czech republic": "CZE",
    "czechia": "CZE",
    "cote d'ivoire": "CIV",
    "ivory coast": "CIV",
    "scotland": "SCO",
    "austria": "AUT",
    "cape verde": "CPV",
    "bosnia and herzegovina": "BIH",
    "turkey": "TUR",
    "curacao": "CUW"
  };
  
  if (mappings[nameLower]) return mappings[nameLower];
  
  for (const teamId in TEAMS) {
    const team = TEAMS[teamId];
    if (nameLower.includes(team.name.toLowerCase()) || team.name.toLowerCase().includes(nameLower)) {
      return teamId;
    }
  }
  
  return null;
}

// Parse API scorer string "Player Name 12', Player Name 45'" into event objects
function parseApiScorers(scorerString, teamId) {
  if (!scorerString || scorerString.trim() === "null") return [];
  const events = [];
  
  // The API returns strings like "{“J. Quiñones 9'”,”R. Jiménez 67'”}"
  // Clean out brackets and smart quotes to make it a normal comma-separated string
  const cleanStr = scorerString.replace(/[\{\}\"“”]/g, '');
  
  const parts = cleanStr.split(",");
  parts.forEach(part => {
    const match = part.match(/(.+?)\s+(\d+)'/);
    if (match) {
      events.push({
        type: "goal",
        team: teamId,
        player: match[1].trim(),
        minute: parseInt(match[2]),
        isOwnGoal: part.toLowerCase().includes("og")
      });
    }
  });
  return events;
}



// Render the live API matches list inside the sidebar widget
function renderLiveApiWidget() {
  const widget = document.getElementById("live-api-widget");
  const listContainer = document.getElementById("live-api-matches-list");
  
  if (!widget || !listContainer) return;
  
  const liveGames = state.api.liveMatches || [];
  
  // Smart filter: Show live matches, last 2 finished matches, and next 3 upcoming matches
  const live = liveGames.filter(g => g.finished === "FALSE" && g.time_elapsed !== "notstarted");
  const upcoming = liveGames.filter(g => g.finished === "FALSE" && g.time_elapsed === "notstarted").slice(0, 3);
  const finished = liveGames.filter(g => g.finished === "TRUE").slice(-2);
  
  const activeGames = [...finished, ...live, ...upcoming];
  
  if (activeGames.length === 0) {
    widget.style.display = "none";
    return;
  }
  
  widget.style.display = "block";
  listContainer.innerHTML = activeGames.map(game => {
    const isLive = game.finished === "FALSE" && game.time_elapsed !== "notstarted";
    const statusClass = isLive ? "status-live" : "status-finished";
    const timeDisplay = isLive ? `${game.time_elapsed}'` : (game.finished === "TRUE" ? "FT" : "vs");
    
    // The API uses home_team_name_en and away_team_name_en
    const homeName = game.home_team_name_en || game.home_team_en || "Home";
    const awayName = game.away_team_name_en || game.away_team_en || "Away";
    
    return `
      <div class="live-widget-match">
        <div class="live-widget-team">
          <img src="${getTeamFlagUrl(findLocalTeamIdByName(homeName))}" alt="">
          <span>${homeName}</span>
        </div>
        <div class="live-widget-score">
          <span class="live-widget-time ${statusClass}">${timeDisplay}</span>
          <span class="live-widget-goals">${game.home_score} - ${game.away_score}</span>
        </div>
        <div class="live-widget-team">
          <img src="${getTeamFlagUrl(findLocalTeamIdByName(awayName))}" alt="">
          <span>${awayName}</span>
        </div>
      </div>
    `;
  }).join("");
}

// Compatibility wrapper
function openLiveApiMatchDetails(apiMatch) {
  const localMatch = [...state.fixtures, ...state.knockoutFixtures].find(m => m.id.toString() === apiMatch.id.toString());
  if (localMatch) {
    openMatchDetail(localMatch);
  }
}

// Expose team profile favorite toggle globally
window.toggleFavoriteTeamFromProfile = function(teamId, button) {
  toggleFavoriteTeam(teamId, button);
  const isFav = state.favorites.teams.includes(teamId);
  button.innerHTML = isFav ? '★ Favorited' : '☆ Add to Favorites';
  // Also re-render active tabs to sync stars in lists
  renderActiveTab();
};
