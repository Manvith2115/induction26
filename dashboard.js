// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURATION — Update these after setting up your Google Form & Apps Script
// ─────────────────────────────────────────────────────────────────────────────

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwu3Qj6IWx9s5j7muKZYDmMcYpiyUi2F6rf_Zp_dtNtapf8rZyge23lK4u0hysLczNO/exec"; // ← paste your URL here

const TEAMS = [
  "Team 01", "Team 02", "Team 03", "Team 04", "Team 05",
  "Team 06", "Team 07", "Team 08", "Team 09", "Team 10",
  "Team 11", "Team 12", "Team 13", "Team 14", "Team 15"
];

const DELIVERABLES = ["Abstract(.pdf)", "Components List(.pdf)", "Circuit Diagram(.jpg)", "CAD(.pdf)","Code(.ino)","Report(.pdf)"];

// ─────────────────────────────────────────────────────────────────────────────
// FETCH SUBMISSIONS FROM APPS SCRIPT
// ─────────────────────────────────────────────────────────────────────────────

async function fetchSubmissions() {
  try {
    const res = await fetch(APPS_SCRIPT_URL);
    const data = await res.json();
    return data; // expects: { "Team 01": ["Abstract", "CAD"], "Team 03": ["Code"], ... }
  } catch (err) {
    console.error("Failed to fetch submissions:", err);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// BUILD THE TABLE
// ─────────────────────────────────────────────────────────────────────────────

function renderTable(submissions) {
  const tbody = document.getElementById("table-body");
  tbody.innerHTML = "";

  let totalComplete = 0;
  let totalSubmitted = 0;
  let totalPending = 0;

  TEAMS.forEach((team, index) => {
    const submitted = submissions[team] || [];
    const count = submitted.length;
    const max = DELIVERABLES.length;
    const pct = Math.round((count / max) * 100);

    if (count === max) totalComplete++;
    totalSubmitted += count;
    totalPending += (max - count);

    const tr = document.createElement("tr");

    // Team name
    const tdTeam = document.createElement("td");
    tdTeam.innerHTML = `
      <span class="team-name">
        <span class="team-num">${String(index + 1).padStart(2, "0")}</span>${team}
      </span>`;
    tr.appendChild(tdTeam);

    // Deliverable badges
    DELIVERABLES.forEach(del => {
      const td = document.createElement("td");
      const done = submitted.includes(del);
      td.innerHTML = `
        <span class="badge ${done ? "submitted" : "pending"}">
          ${done ? "✓" : "○"} ${done ? "Submitted" : "Pending"}
        </span>`;
      tr.appendChild(td);
    });

    // Progress bar
    const tdProg = document.createElement("td");
    tdProg.innerHTML = `
      <div class="progress-wrap">
        <div class="progress-track">
          <div class="progress-fill" style="width: ${pct}%"></div>
        </div>
        <span class="progress-pct">${pct}%</span>
      </div>`;
    tr.appendChild(tdProg);

    tbody.appendChild(tr);
  });

  // Summary chips
  document.getElementById("count-complete").textContent = totalComplete;
  document.getElementById("count-submitted").textContent = totalSubmitted;
  document.getElementById("count-pending").textContent = totalPending;

  // Last updated
  const now = new Date();
  document.getElementById("last-updated").textContent =
    `Updated ${now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────────────────────────────────────

async function init() {
  const submissions = await fetchSubmissions();

  if (!submissions) {
    document.getElementById("table-body").innerHTML =
      `<tr><td colspan="6" class="loading-row">⚠ Could not load data. Check your Apps Script URL.</td></tr>`;
    return;
  }

  renderTable(submissions);
}

init();

// Auto-refresh every 2 minutes
setInterval(init, 120000);
