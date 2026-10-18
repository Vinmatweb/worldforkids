const LEAFLET_CSS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const LEAFLET_JS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
const LEAFLET_CSS_SRI = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
const LEAFLET_JS_SRI = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";

function loadLeaflet() {
  if (window.L) return Promise.resolve(window.L);
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = LEAFLET_JS;
    script.integrity = LEAFLET_JS_SRI;
    script.crossOrigin = "anonymous";
    script.onload = () => resolve(window.L);
    script.onerror = reject;
    document.head.append(script);
  });
}

const labels = {
  cs: {
    range: "Areál druhu",
    world: "Celý svět",
    tripoint: "Pomezí tří států",
    map: "Interaktivní mapa výskytu",
    note: "Zvýrazněné oblasti ukazují přibližný známý výskyt. Mapa podkladu © OpenStreetMap contributors.",
    loading: "Načítám mapu světa…",
    failed: "Interaktivní mapu se nepodařilo načíst. Zkontrolujte připojení k internetu."
  },
  en: {
    range: "Species range",
    world: "Whole world",
    tripoint: "Three-country border",
    map: "Interactive species range map",
    note: "Highlighted areas show approximate known occurrence. Basemap © OpenStreetMap contributors.",
    loading: "Loading world map…",
    failed: "The interactive map could not be loaded. Check your internet connection."
  }
};

async function initializeRangeMaps() {
  const hosts = [...document.querySelectorAll("[data-animal-range-map]")];
  if (!hosts.length) return;
  const dictUrl = new URL("../data/animal-ranges.json", import.meta.url);
  const [L, ranges] = await Promise.all([
    loadLeaflet(),
    fetch(dictUrl).then(response => {
      if (!response.ok) throw new Error("Range data unavailable");
      return response.json();
    })
  ]);

  for (const host of hosts) {
    const species = ranges.species[host.dataset.animalRangeMap];
    const lang = labels[host.dataset.lang] || labels.cs;
    if (!species) continue;
    host.setAttribute("role", "region");
    host.setAttribute("aria-label", lang.map);

    const controls = document.createElement("div");
    controls.className = "animal-range-map__controls";
    controls.setAttribute("aria-label", lang.map + " controls");
    controls.innerHTML =
      '<button type="button" data-map-action="range">' + lang.range + '</button>' +
      '<button type="button" data-map-action="world">' + lang.world + '</button>' +
      '<button type="button" data-map-action="tripoint">' + lang.tripoint + '</button>';
    host.prepend(controls);

    const canvas = host.querySelector(".animal-range-map__canvas");
    const map = L.map(canvas, {
      minZoom: 0,
      maxZoom: ranges.maxZoom || 14,
      zoomControl: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      touchZoom: true,
      worldCopyJump: false,
      attributionControl: true,
      zoomSnap: 0.5
    }).setView(species.center, species.zoom);

    L.tileLayer(ranges.tileUrl, {
      subdomains: ranges.tileSubdomains || ["a", "b", "c"],
      minZoom: 0,
      maxZoom: 19,
      maxNativeZoom: 19,
      noWrap: true,
      attribution: '<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">© OpenStreetMap contributors</a>',
      crossOrigin: true,
      updateWhenIdle: true,
      keepBuffer: 2
    }).addTo(map);

    const rangeLayer = L.geoJSON(
      { type: "FeatureCollection", features: species.features },
      {
        style: {
          color: species.color,
          weight: 2,
          opacity: 0.95,
          fillColor: species.color,
          fillOpacity: 0.36
        },
        onEachFeature(feature, layer) {
          const name = feature.properties && feature.properties.name;
          if (name) layer.bindTooltip(name, { sticky: true, direction: "top" });
        }
      }
    ).addTo(map);

    const note = document.createElement("p");
    note.className = "animal-range-map__note";
    note.textContent = lang.note;
    host.append(note);

    host.querySelector(".animal-range-map__controls").addEventListener("click", event => {
      const button = event.target.closest("button[data-map-action]");
      if (!button) return;
      if (button.dataset.mapAction === "range") {
        map.fitBounds(rangeLayer.getBounds().pad(0.16), { maxZoom: 6 });
      } else if (button.dataset.mapAction === "world") {
        map.fitBounds([[-58, -180], [78, 180]], { padding: [8, 8] });
      } else if (button.dataset.mapAction === "tripoint") {
        map.setView(ranges.tripoint.center, ranges.tripoint.zoom);
      }
    });

    host.classList.add("is-ready");
    requestAnimationFrame(() => map.invalidateSize());
  }
}

initializeRangeMaps().catch(error => {
  console.error("Animal range map could not be initialized.", error);
  document.querySelectorAll("[data-animal-range-map]").forEach(host => {
    const fallback = host.querySelector(".animal-range-map__fallback");
    if (fallback) fallback.textContent = (labels[host.dataset.lang] || labels.cs).failed;
  });
});
