//-----------------------------------------------------
// Helper: detect sites that block iframes
//-----------------------------------------------------
const IFRAME_BLOCK_LIST = [
  "google.com",
  "www.google.com",
  "accounts.google.com",
  "youtube.com",
  "www.youtube.com",
  "twitter.com",
  "x.com",
  "discord.com",
  "facebook.com",
  "www.facebook.com",
  "bankofamerica.com" // etc – add more if you find them
];

function getHost(url) {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return "";
  }
}

//-----------------------------------------------------
// Basic Browser State
//-----------------------------------------------------
let tabs = [];
let currentTab = null;

function createTab(url="about:blank") {
  let tab = {
    id: Math.random(),
    history: [],
    index: -1,
    element: document.createElement("div")
  };

  tab.element.className = "tab";
  tab.element.textContent = "Tab";
  tab.element.onclick = () => switchTab(tab);

  document.getElementById("tabs").appendChild(tab.element);

  tabs.push(tab);
  switchTab(tab);
  loadURL(url);
}

function switchTab(tab) {
  currentTab = tab;

  // update UI
  for (let t of tabs) t.element.classList.remove("active");
  tab.element.classList.add("active");

  if (tab.history[tab.index]) {
    document.getElementById("viewer").src = tab.history[tab.index];
    document.getElementById("urlbar").value = tab.history[tab.index];
  }
}

//-----------------------------------------------------
// Navigation Helpers
//-----------------------------------------------------
function normalizeURL(input) {
  if (!input) return "about:blank";

  // If it looks like a URL with scheme, keep it
  if (input.startsWith("http://") || input.startsWith("https://")) {
    return input;
  }

  // If it looks like a bare domain (no spaces)
  if (!input.includes(" ")) {
    return "https://" + input;
  }

  // Otherwise treat it as a search
  return "https://duckduckgo.com/?q=" + encodeURIComponent(input);
}

function showBlockedMessage(url) {
  const viewer = document.getElementById("viewer");
  const msgHTML = `
<!DOCTYPE html>
<html>
<body style="font-family:Arial; padding:20px; background:#fff;">
  <h2>This site can’t be shown inside Enkidu’s web demo</h2>
  <p>
    The website <b>${url}</b> does not allow being embedded inside other sites
    (it uses security headers like <code>X-Frame-Options</code> or
    <code>Content-Security-Policy</code>).
  </p>
  <p>It has been opened in a new browser tab instead.</p>
</body>
</html>
  `;
  const blob = new Blob([msgHTML], { type: "text/html" });
  viewer.src = URL.createObjectURL(blob);
}

function loadURL(rawInput, pushHistory=true) {
  if (!currentTab) return;

  let url = normalizeURL(rawInput);
  const host = getHost(url);

  // If the host is known to block iframes → open in new tab
  if (IFRAME_BLOCK_LIST.includes(host)) {
    window.open(url, "_blank");
    showBlockedMessage(url);
  } else {
    document.getElementById("viewer").src = url;
  }

  document.getElementById("urlbar").value = url;

  if (pushHistory) {
    currentTab.history = currentTab.history.slice(0, currentTab.index + 1);
    currentTab.history.push(url);
    currentTab.index++;
  }

  currentTab.element.textContent = host || "Tab";
}

//-----------------------------------------------------
// Button bindings
//-----------------------------------------------------
document.getElementById("goBtn").onclick = () => {
  let raw = document.getElementById("urlbar").value.trim();
  loadURL(raw);
};

document.getElementById("urlbar").addEventListener("keydown", e => {
  if (e.key === "Enter") {
    let raw = document.getElementById("urlbar").value.trim();
    loadURL(raw);
  }
});

// Back / Forward / Reload
document.getElementById("backBtn").onclick = () => {
  if (!currentTab) return;
  if (currentTab.index > 0) {
    currentTab.index--;
    let url = currentTab.history[currentTab.index];
    loadURL(url, false);
  }
};

document.getElementById("forwardBtn").onclick = () => {
  if (!currentTab) return;
  if (currentTab.index < currentTab.history.length - 1) {
    currentTab.index++;
    let url = currentTab.history[currentTab.index];
    loadURL(url, false);
  }
};

document.getElementById("reloadBtn").onclick = () => {
  if (!currentTab) return;
  let url = currentTab.history[currentTab.index];
  loadURL(url, false);
};

//-----------------------------------------------------
// Demo homepage (updated text)
//-----------------------------------------------------
const DEMO_HTML = `
<!DOCTYPE html>
<html>
<body style="font-family:Arial; padding:20px;">
<h1>Enkidu Browser Online</h1>
<p>A web demo of the Enkidu browser V2</p>

<input id="searchInput" placeholder="Search…" style="padding:8px; width:200px;">
<button onclick="submitSearch()">Search</button>

<script>
function submitSearch() {
  let q = document.getElementById("searchInput").value.trim();
  if (q) {
    location.href = "https://duckduckgo.com/?q=" + encodeURIComponent(q);
  }
}
</script>

<p>Video Example (HTML5):</p>
<video width="480" controls>
  <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4">
</video>

<p>
<button onclick="document.body.style.background='lightyellow'">
Click me (JS demo)
</button>
</p>

</body>
</html>
`;

let blob = new Blob([DEMO_HTML], { type: "text/html" });
let demoURL = URL.createObjectURL(blob);

// Create two starter tabs
createTab(demoURL);
createTab("https://wikipedia.org");
