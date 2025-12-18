document.addEventListener("DOMContentLoaded", () => {

  // Create map
  const map = L.map("field-map").setView([20.5937, 78.9629], 5);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors"
  }).addTo(map);

  // Fix size issue
  setTimeout(() => {
    map.invalidateSize();
  }, 300);

  // Field click logic
  const fields = document.querySelectorAll(".field-item");

  fields.forEach(field => {
    field.addEventListener("click", () => {
      fields.forEach(f => f.classList.remove("active"));
      field.classList.add("active");

      const type = field.dataset.field;

      if (type === "north") map.setView([19.5, 75.5], 7);
      if (type === "east")  map.setView([22.5, 88.5], 7);
      if (type === "south") map.setView([15.3, 75.7], 7);
    });
  });

});