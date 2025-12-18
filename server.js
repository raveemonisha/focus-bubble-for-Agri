// server.js - Beautiful, clean backend for AgroFocus 🌱

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

// ---------- MIDDLEWARE ----------
app.use(cors());
app.use(express.json());

// ---------- SAMPLE DATA (FAKE BUT REALISTIC) ----------

// 1) DASHBOARD SUMMARY
const dashboardSummary = {
  todayFocus: "Soil moisture & water stress",
  recommendedActions: 12,
  alerts: [
    { id: 1, type: "water", text: "East Plot rice is below target moisture." },
    { id: 2, type: "pest", text: "Check yellowing patches in South Plot maize." }
  ],
  soilMoistureAvg: 46,
  soilMoistureChangePercent: 4,
  ndviAnomalyPercent: 8.2
};
// Detailed soil actions for dashboard
const soilActions = [
  {
    id: 1,
    field: "East Plot - Rice",
    priority: "High",
    action:
      "Schedule irrigation within the next 6 hours – soil moisture is below 30% and hot day ahead."
  },
  {
    id: 2,
    field: "South Plot - Maize",
    priority: "Medium",
    action:
      "Check yellowing patches in lower half – possible N deficiency or waterlogging."
  },
  {
    id: 3,
    field: "North Plot - Wheat",
    priority: "Low",
    action:
      "Good moisture and NDVI - keep current irrigation schedule and monitor for pest activity."
  }
];
// 2) WEATHER & IRRIGATION
const weatherToday = {
  location: "Farm HQ",
  tempC: 29,
  feelsLikeC: 31,
  condition: "Partly cloudy · Humid",
  windKph: 8,
  humidityPercent: 72,
  rainChancePercent: 40,
  expectedRainMm: 12,      // 👈 change this and frontend should show it
  etoMm: 4.2,
  netWaterNeedMm: 1.8,
  sunrise: "06:01",
  sunset: "18:27",
  lastUpdatedMinutesAgo: 10
};

const weatherForecast7d = [
  { day: "Today", tempC: 30, rainMm: 6, icon: "🌧" },
  { day: "D+1", tempC: 31, rainMm: 2, icon: "🌥" },
  { day: "D+2", tempC: 32, rainMm: 0, icon: "☀" },
  { day: "D+3", tempC: 29, rainMm: 10, icon: "🌧" },
  { day: "D+4", tempC: 28, rainMm: 4, icon: "🌧" },
  { day: "D+5", tempC: 30, rainMm: 1, icon: "🌥" },
  { day: "D+6", tempC: 31, rainMm: 0, icon: "☀" }
];

// 3) FIELDS (FOR FIELD MAP & ANALYTICS)
const fields = [
  {
    id: "north",
    name: "Field 1 – North Plot",
    crop: "Wheat",
    areaAcres: 2.5,
    status: "Healthy",
    moisturePercent: 46,
    ndvi: 0.78,
    risk: "Low"
  },
  {
    id: "east",
    name: "Field 2 – East Plot",
    crop: "Rice",
    areaAcres: 1.7,
    status: "Needs irrigation",
    moisturePercent: 32,
    ndvi: 0.69,
    risk: "Medium"
  },
  {
    id: "south",
    name: "Field 3 – South Plot",
    crop: "Maize",
    areaAcres: 3.1,
    status: "Watch patches",
    moisturePercent: 38,
    ndvi: 0.65,
    risk: "Medium"
  }
];

// 4) SOIL LAB
const soilSummary = {
  fields: [
    { field: "North Plot", pH: 6.8, organicC: 0.72, N: 290, P: 24, K: 185 },
    { field: "East Plot", pH: 6.3, organicC: 0.58, N: 240, P: 18, K: 160 },
    { field: "South Plot", pH: 7.1, organicC: 0.65, N: 270, P: 20, K: 190 }
  ],
  soilHealthScore: 78,
  notes: [
    "Ideal pH for most crops: 6.5 – 7.2",
    "Organic carbon above 0.75% indicates very good soil health."
  ],
  recommendations: [
    {
      field: "North Plot – Wheat (target 4.0 t/ha)",
      recommendation: "Apply 80 kg N, 40 kg P₂O₅, 20 kg K₂O per ha split across 3 doses.",
      tag: "Balanced"
    },
    {
      field: "East Plot – Rice (target 4.2 t/ha)",
      recommendation: "Increase P dose by 25% · apply at transplanting + tillering.",
      tag: "Adjust P"
    },
    {
      field: "South Plot – Maize (target 5.0 t/ha)",
      recommendation: "Maintain current N & K plan · focus on organic matter additions (FYM/compost).",
      tag: "Build OC"
    }
  ]
};

// 5) YIELD TRENDS
const yieldTrends = {
  years: [2022, 2023, 2024, 2025],
  overallTph: [3.3, 3.7, 4.0, 4.3],
  crops: {
    wheat: [3.1, 3.4, 3.6, 3.9],
    maize: [4.0, 4.2, 4.1, 4.4],
    rice: [3.5, 3.6, 3.8, 4.0]
  },
  seasons: [
    { season: "Kharif", values: { "2023": 3.7, "2024": 3.9, "2025": 4.1 } },
    { season: "Rabi",   values: { "2023": 3.3, "2024": 3.5, "2025": 3.8 } }
  ]
};

// 6) WATER USE
const waterUse = {
  fields: [
    { field: "North Plot", crop: "Wheat", irrigationMm: 22, rainfallMm: 8, totalMm: 30 },
    { field: "East Plot", crop: "Rice",  irrigationMm: 35, rainfallMm: 10, totalMm: 45 },
    { field: "South Plot", crop: "Maize", irrigationMm: 18, rainfallMm: 6, totalMm: 24 }
  ],
  dailySeries: {
    labels: ["D-6", "D-5", "D-4", "D-3", "D-2", "D-1", "Today"],
    irrigationMm: [10, 15, 20, 25, 22, 18, 19],
    rainfallMm:   [2, 3, 4, 5, 3, 1, 2]
  },
  sourceSplit: [
    { source: "Borewell", sharePercent: 52, volumeMl: 4.1, comment: "High usage – monitor energy cost & groundwater level" },
    { source: "Canal", sharePercent: 28, volumeMl: 2.2, comment: "Reliable supply this season" },
    { source: "Rainwater / Pond", sharePercent: 20, volumeMl: 1.6, comment: "Scope to increase storage and reuse" }
  ]
};

// 7) CROP HEALTH / NDVI
const cropHealth = {
  ndviAverage: 0.72,
  ndviChangePercent: 3.5,
  fields: [
    { field: "North Plot", ndvi: 0.78, status: "Healthy" },
    { field: "East Plot", ndvi: 0.69, status: "Mild stress" },
    { field: "South Plot", ndvi: 0.65, status: "Watch patches" }
  ]
};

// ---------- API ROUTES ----------

// Simple test route
app.get("/api/hello", (req, res) => {
  res.json({ message: "AgroFocus backend is running ✅" });
});

// Dashboard
app.get("/api/dashboard/summary", (req, res) => {
  res.json(dashboardSummary);
});
// Dashboard soil actions
app.get("/api/soil/actions", (req, res) => {
  res.json(soilActions);
});

// Weather
app.get("/api/weather/today", (req, res) => {
  res.json(weatherToday);
});

app.get("/api/weather/forecast", (req, res) => {
  res.json(weatherForecast7d);
});

// Fields
app.get("/api/fields", (req, res) => {
  res.json(fields);
});

app.get("/api/fields/:id", (req, res) => {
  const field = fields.find(f => f.id === req.params.id);
  if (!field) {
    return res.status(404).json({ error: "Field not found" });
  }
  res.json(field);
});

// Soil
app.get("/api/soil/summary", (req, res) => {
  res.json(soilSummary);
});

// Yield
app.get("/api/yield/trends", (req, res) => {
  res.json(yieldTrends);
});

// Water Use
app.get("/api/water/use", (req, res) => {
  res.json(waterUse);
});

// Crop Health / NDVI
app.get("/api/crop-health", (req, res) => {
  res.json(cropHealth);
});


// --- NEW ROUTES ---
// Crop Health Snapshot
app.get("/api/dashboard/crop-health-snapshot", (req, res) => {
  res.json({
    ndvi: "0.82",
    ndviTrend: "+3% vs last week",
    leafWetness: "Moderate",
    leafWetnessNote: "Slight pest risk",
    chlorophyllIndex: "High",
    chlorophyllNote: "Good photosynthesis activity"
  });
});

// Drip Irrigation Status
app.get("/api/dashboard/drip-status", (req, res) => {
  res.json({
    flowRateLpm: 12.5,
    pressureBar: 1.8,
    pressureNote: "Optimal",
    blockage: "No issues",
    uniformity: "92% uniform"
  });
});

// Satellite View Summary
app.get("/api/dashboard/satellite-view", (req, res) => {
  res.json({
    cloudCoveragePercent: 12,
    cloudNote: "Clear sky",
    heatZones: "Moderate hotspot in east field",
    waterStressZones: "2 patches require irrigation",
    ndviHotspots: "Low-vigor zone at north corner"
  });
});


// ------- START SERVER --------
app.listen(PORT, () => {
  console.log("API running at http://localhost:" + PORT);
});
