// Data for each focus bubble

// Called when a focus bubble is clicked (see onclick in HTML)
// script.js - clean, safe JS for all pages

// Provide a default focusOn so inline onclick doesn't crash


document.addEventListener("DOMContentLoaded", () => {
  // Small helper for safe fetch
  async function fetchJSON(url) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(res.status + " " + res.statusText);
      return await res.json();
    } catch (err) {
      console.error("Fetch error for", url, err);
      return null;
    }
  }

  // ==========================
  // DASHBOARD (index.html)
  // ==========================
  document.addEventListener("DOMContentLoaded", () => {

  // ---------- Focus bubbles ----------
  const focusLabelEl = document.getElementById("focusLabel");
  const focusBubbles = document.querySelectorAll(".focus-bubble");

  function setFocus(area) {
    // Update small pill "Focus: Soil"
    if (focusLabelEl) {
      let label = "Soil";
      if (area === "water") label = "Water";
      else if (area === "crop") label = "Crop Health";
      else if (area === "market") label = "Market";
      focusLabelEl.textContent = "Focus: " + label;
      console.log("FOCUS CHANGED TO:",area);
    }

    // Highlight active bubble
    focusBubbles.forEach((b) => {
      if (b.dataset.focus === area) b.classList.add("active");
      else b.classList.remove("active");
    });

    // Optional: tweak KPIs a bit so you see change
    const moistureEl = document.getElementById("kpiMoisture");
    const nitrogenEl = document.getElementById("kpiNitrogen");
    const irrigationEl = document.getElementById("kpiIrrigation");
    const yieldEl = document.getElementById("kpiYield");

    if (moistureEl && nitrogenEl && irrigationEl && yieldEl) {
      if (area === "soil") {
        moistureEl.textContent = "46%";
        nitrogenEl.textContent = "Slightly low";
        irrigationEl.textContent = "23 mm";
        yieldEl.textContent = "3.8 t/ha";
      } else if (area === "water") {
        moistureEl.textContent = "39%";
        nitrogenEl.textContent = "OK";
        irrigationEl.textContent = "18 mm";
        yieldEl.textContent = "3.5 t/ha";
      } else if (area === "crop") {
        moistureEl.textContent = "52%";
        nitrogenEl.textContent = "Medium";
        irrigationEl.textContent = "20 mm";
        yieldEl.textContent = "4.0 t/ha (est.)";
      } else if (area === "market") {
        moistureEl.textContent = "48%";
        nitrogenEl.textContent = "Balanced";
        irrigationEl.textContent = "21 mm";
        yieldEl.textContent = "3.9 t/ha";
      }
    }
  }

  
  
  if (focusBubbles.length > 0) {
    focusBubbles.forEach((bubble) => {
      bubble.addEventListener("click", () => {
        const area = bubble.dataset.focus || "soil";
        setFocus(area);
      });
    });

   
  }

  // ---------- View soil actions button ----------
  const soilBtn = document.getElementById("view-soil-actions-btn");
  const soilList = document.getElementById("soil-actions-list");
  const soilCard = document.getElementById("soil-actions-card");
  let soilActionsLoaded = false;

  if (soilBtn && soilList && soilCard) {
    soilBtn.addEventListener("click", async () => {
      if (!soilActionsLoaded) {
        const data = await fetchJSON("http://localhost:5000/api/soil/actions");

        if (data && Array.isArray(data) && data.length > 0) {
          soilList.innerHTML = data
            .map(
              (item) => `
            <li class="list-item-row">
              <div class="list-item-main">
                <span><strong>${item.field}</strong> · ${
                item.priority
              } priority</span>
                <span class="card-subtitle">${item.action}</span>
              </div>
            </li>`
            )
            .join("");
        } else {
          soilList.innerHTML = `
            <li class="list-item-row">
              <div class="list-item-main">
                <span>No tasks returned from backend.</span>
                <span class="card-subtitle">Check /api/soil/actions.</span>
              </div>
            </li>`;
        }

        soilActionsLoaded = true;
        soilCard.style.display = "block";
      } else {
        // Toggle card visibility
        soilCard.style.display =
          soilCard.style.display === "none" ? "block" : "none";
      }
    });
  }

  // ---------- Crop Health Snapshot (card on dashboard) ----------
  const cropNdviEl = document.getElementById("cropNdvi");
  const cropNdviTrendEl = document.getElementById("cropNdviTrend");
  const leafWetEl = document.getElementById("leafWetness");
  const leafWetNoteEl = document.getElementById("leafWetnessNote");
  const chlEl = document.getElementById("chlorophyllIndex");
  const chlNoteEl = document.getElementById("chlorophyllNote");

  if (
    cropNdviEl &&
    cropNdviTrendEl &&
    leafWetEl &&
    leafWetNoteEl &&
    chlEl &&
    chlNoteEl
  ) {
    fetchJSON("http://localhost:5000/api/dashboard/crop-health-snapshot").then(
      (data) => {
        if (!data) return;
        cropNdviEl.textContent =
          typeof data.ndvi === "number" ? data.ndvi.toFixed(2) : data.ndvi;
        cropNdviTrendEl.textContent = data.ndviTrend || "--";
        leafWetEl.textContent = data.leafWetness || "--";
        leafWetNoteEl.textContent = data.leafWetnessNote || "--";
        chlEl.textContent = data.chlorophyllIndex || "--";
        chlNoteEl.textContent = data.chlorophyllNote || "--";
      }
    );
  }

  // ---------- Drip Irrigation Status ----------
  const dripFlowEl = document.getElementById("dripFlow");
  const dripPressureEl = document.getElementById("dripPressure");
  const dripBlockEl = document.getElementById("dripBlockage");

  if (dripFlowEl && dripPressureEl && dripBlockEl) {
    fetchJSON("http://localhost:5000/api/dashboard/drip-status").then(
      (data) => {
        if (!data) return;
        dripFlowEl.textContent = data.flowRate || "--";
        dripPressureEl.textContent = data.pressure || "--";
        dripBlockEl.textContent = data.blockage || "--";
      }
    );
  }

  // ---------- Satellite View Summary ----------
  const satCloudEl = document.getElementById("satCloud");
  const satHeatEl = document.getElementById("satHeatZones");
  const satStressEl = document.getElementById("satWaterStress");

  if (satCloudEl && satHeatEl && satStressEl) {
    fetchJSON("http://localhost:5000/api/dashboard/satellite-view").then(
      (data) => {
        if (!data) return;
        satCloudEl.textContent = data.cloudCover || "--";
        satHeatEl.textContent = data.heatZones || "--";
        satStressEl.textContent = data.waterStressZones || "--";
      }
    );
  }

  // ---------- Top image tiles scroll to cards ----------
  function bindTileToCard(tileId, cardId) {
    const tile = document.getElementById(tileId);
    const card = document.getElementById(cardId);
    if (!tile || !card) return;

    tile.style.cursor = "pointer";
    tile.addEventListener("click", () => {
      card.scrollIntoView({ behavior: "smooth", block: "start" });
      card.classList.add("card-highlight");
      setTimeout(() => card.classList.remove("card-highlight"), 800);
    });
  }

  bindTileToCard("tile-crop", "crop-card");
  bindTileToCard("tile-drip", "drip-card");
  bindTileToCard("tile-sat", "sat-card");

  
});
const searchInput = document.getElementById("globalSearch");

searchInput?.addEventListener("input", () => {
  const q = searchInput.value.toLowerCase();

  // Reset bubbles
  document.querySelectorAll(".focus-bubble").forEach(b => {
    b.classList.remove("active");
    b.style.opacity = "0.3";
  });

  // Auto-focus crop health
  if (q.includes("rice") || q.includes("maize") || q.includes("wheat")) {
    const cropBubble = document.querySelector('[data-focus="crop"]');
    cropBubble?.classList.add("active");
    cropBubble.style.opacity = "1";
  }

  // Filter alerts
  document.querySelectorAll(".alert-item").forEach(alert => {
    const keywords = alert.dataset.keywords || "";
    alert.style.display = keywords.includes(q) ? "block" : "none";
  });

  // Scroll to alerts
  if (q.length > 2) {
    document
      .querySelector(".smart-alerts")
      ?.scrollIntoView({ behavior: "smooth" });
  }
});

// ================= AUTH CHECK =================
const isLoggedIn = localStorage.getItem("isLoggedIn");
const user = JSON.parse(localStorage.getItem("currentUser"));

if (isLoggedIn !== "true" || !user) {
  window.location.replace("login.html");
}

// ================= SHOW USER =================
const nameEl = document.getElementById("userName");
if (nameEl && user) {
  nameEl.innerText = user.name || user.email;
}

// ================= LOGOUT =================
const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.clear();
    window.location.replace("login.html");
  });
}})
document.querySelectorAll(".focus-bubble").forEach(btn => {
  btn.addEventListener("click", () => {
    const focus = btn.dataset.focus;

    // remove active state
    document.querySelectorAll(".focus-bubble")
      .forEach(b => b.classList.remove("active"));

    btn.classList.add("active");

    console.log("Focus changed to:", focus);

    // 🔴 IMPORTANT: DO NOT redirect
    // Just update UI here if needed
  });
});
const focusData = {
  soil: {
    title: "Today's Focus: Soil & Irrigation",
    desc: "AI analyzes soil health and nutrient balance.",
    metricTitle: "Average soil moisture",
    metricValue: "46%"
  },
  water: {
    title: "Today's Focus: Water Stress",
    desc: "Monitoring irrigation efficiency and water stress.",
    metricTitle: "Water stress index",
    metricValue: "Moderate"
  },
  crop: {
    title: "Today's Focus: Crop Health",
    desc: "Tracking crop vigor and NDVI changes.",
    metricTitle: "Crop health score",
    metricValue: "87%"
  },
  market: {
    title: "Today's Focus: Market Prices",
    desc: "Analyzing commodity price movements.",
    metricTitle: "Market trend",
    metricValue: "Upward ↑"
  }
};

document.querySelectorAll(".focus-bubble").forEach(bubble => {
  bubble.addEventListener("click", () => {

    // active glow
    document.querySelectorAll(".focus-bubble")
      .forEach(b => b.classList.remove("active"));
    bubble.classList.add("active");

    const focus = bubble.dataset.focus;
    const data = focusData[focus];

    // update text
    document.getElementById("focusTitle").innerText = data.title;
    document.getElementById("focusDesc").innerText = data.desc;
    document.getElementById("metric1Title").innerText = data.metricTitle;
    document.getElementById("metric1Value").innerText = data.metricValue;
  });
});
