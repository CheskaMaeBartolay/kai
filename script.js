
const gamesGrid = document.getElementById("gamesGrid");
const viewAllBtn = document.getElementById("viewAllBtn");
const toast = document.getElementById("toast");

const onlineStatus = document.getElementById("onlineStatus");
const currentGame = document.getElementById("currentGame");
const statusDot = document.getElementById("statusDot");
const currentGameLink = document.getElementById("currentGameLink");
const joinGameBtn = document.getElementById("joinGameBtn");

const ROBLOX_USER_ID = 8685718614;

const gameLinks = {
  "ASMR Keyboard Tower": "https://www.roblox.com/games/95466577544785/ASMR-Pink-Keyboard-Tower",
  "Garden Tycoon": "https://www.roblox.com/games/YOUR-GARDEN-GAME-ID",
  "Anime Battle Arena": "https://www.roblox.com/games/YOUR-ANIME-GAME-ID",
  "Car Dealership": "https://www.roblox.com/games/YOUR-CAR-GAME-ID",
  "Island Survival": "https://www.roblox.com/games/YOUR-ISLAND-GAME-ID",
  "Neon City": "https://www.roblox.com/games/YOUR-NEON-GAME-ID"
};

function showToast(message) {
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(
    () => toast.classList.remove("show"),
    2800
  );
}

viewAllBtn?.addEventListener("click", () => {
  gamesGrid?.classList.toggle("show-all");

  const expanded = gamesGrid?.classList.contains("show-all");

  viewAllBtn.innerHTML = expanded
    ? 'Show Less <span>↑</span>'
    : 'View All <span>→</span>';
});

document.querySelectorAll(".play-btn").forEach((button) => {
  button.addEventListener("click", () => {
    const game = button.dataset.game;
    const gameUrl = gameLinks[game];

    if (!gameUrl || gameUrl.includes("YOUR-")) {
      showToast(`${game} link is not added yet.`);
      return;
    }

    window.open(gameUrl, "_blank", "noopener,noreferrer");
  });
});

function setStatusUnavailable() {
  if (onlineStatus) onlineStatus.textContent = "Status unavailable";
  if (currentGame) {
    currentGame.textContent = "Roblox activity could not be loaded";
  }
  if (statusDot) statusDot.className = "status-dot offline";
  if (currentGameLink) currentGameLink.hidden = true;
  if (joinGameBtn) joinGameBtn.style.display = "none";
}

async function loadRobloxPresence() {
  if (!onlineStatus || !currentGame || !statusDot) return;

  try {
    const response = await fetch(
      `/api/presence?userId=${ROBLOX_USER_ID}&t=${Date.now()}`,
      {
        headers: { Accept: "application/json" },
        cache: "no-store"
      }
    );

    if (!response.ok) {
      throw new Error(`Presence API failed: ${response.status}`);
    }

    const data = await response.json();
    const presence = data.userPresences?.[0];
    const presenceType = presence?.userPresenceType ?? 0;

    // Hide both buttons before applying the new status.
    if (currentGameLink) currentGameLink.hidden = true;
    if (joinGameBtn) joinGameBtn.style.display = "none";

    if (presenceType === 2) {
      onlineStatus.textContent = "Online — Playing Roblox";
      currentGame.textContent =
        presence.lastLocation || "Playing a Roblox game";
      statusDot.className = "status-dot online";

      // Original current game link.
      if (currentGameLink && presence.placeId) {
        currentGameLink.href =
          `https://www.roblox.com/games/${presence.placeId}`;
        currentGameLink.hidden = false;
      }

      // Original Join Current Game button.
      if (joinGameBtn && presence.placeId) {
        joinGameBtn.href =
          `https://www.roblox.com/games/start?placeId=${presence.placeId}`;
        joinGameBtn.style.display = "inline-flex";
      }

    } else if (presenceType === 3) {
      onlineStatus.textContent = "In Roblox Studio";
      currentGame.textContent = "Currently developing a game";
      statusDot.className = "status-dot studio";

    } else if (presenceType === 1) {
      onlineStatus.textContent = "Online";
      currentGame.textContent = "Browsing Roblox";
      statusDot.className = "status-dot online";

    } else {
      onlineStatus.textContent = "Offline";
      currentGame.textContent = "Not currently playing Roblox";
      statusDot.className = "status-dot offline";
    }

  } catch (error) {
    console.error("Roblox presence error:", error);
    setStatusUnavailable();
  }
}

// One refresh timer only.
loadRobloxPresence();
setInterval(loadRobloxPresence, 30000);

// Refresh when returning to the website on mobile, iPad, or tablet.
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    loadRobloxPresence();
  }
});

window.addEventListener("pageshow", loadRobloxPresence);
