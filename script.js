
const gamesGrid = document.getElementById("gamesGrid");
const viewAllBtn = document.getElementById("viewAllBtn");
const toast = document.getElementById("toast");

const onlineStatus = document.getElementById("onlineStatus");
const currentGame = document.getElementById("currentGame");
const statusDot = document.getElementById("statusDot");
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

// Keep all game card links working.
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

// Update the status card.
function setPresenceStatus(label, game, state) {
  if (onlineStatus) onlineStatus.textContent = label;
  if (currentGame) currentGame.textContent = game;
  if (statusDot) statusDot.className = `status-dot ${state}`;
}

// Hide the Join Current Game button.
function hideJoinGameButton() {
  if (joinGameBtn) {
    joinGameBtn.style.display = "none";
    joinGameBtn.removeAttribute("href");
  }
}

// Show the Join Current Game button with the current Roblox game.
function showJoinGameButton(placeId) {
  if (!joinGameBtn || !placeId) return;

  joinGameBtn.href =
    `https://www.roblox.com/games/start?placeId=${placeId}`;

  joinGameBtn.style.display = "inline-flex";
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

    // Reset the button before applying the new status.
    hideJoinGameButton();

    if (presenceType === 2) {
      setPresenceStatus(
        "Currently Playing",
        presence.lastLocation || "Playing a Roblox game",
        "online"
      );

      // Restore the original Join Current Game button.
      showJoinGameButton(presence.placeId);

    } else if (presenceType === 3) {
      setPresenceStatus(
        "In Roblox Studio",
        "Currently developing a game.",
        "studio"
      );

    } else if (presenceType === 1) {
      setPresenceStatus(
        "Online",
        "Browsing Roblox",
        "online"
      );

    } else {
      setPresenceStatus(
        "Offline",
        "Not currently playing Roblox.",
        "offline"
      );
    }

  } catch (error) {
    console.error("Roblox presence error:", error);

    setPresenceStatus(
      "Status unavailable",
      "Roblox activity could not be loaded",
      "offline"
    );

    hideJoinGameButton();
  }
}

// Refresh once on page load and every 30 seconds.
loadRobloxPresence();
setInterval(loadRobloxPresence, 30000);

// Refresh when returning to the website on mobile, iPad, or tablet.
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    loadRobloxPresence();
  }
});

window.addEventListener("pageshow", loadRobloxPresence);
