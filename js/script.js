const NAME = "Andrzej";

/* Lokalizacja zapasowa, gdy przeglądarka nie poda swojej (brak zgody lub błąd) */
const DEFAULT_LOCATION = { lat: 51.75, lon: 19.47, name: "Łódź" };

/* --- POWITANIE ZALEŻNE OD PORY DNIA --- */
function getGreeting(hour) {
  if (hour >= 5 && hour < 12) return "Dzień dobry";
  if (hour >= 12 && hour < 18) return "Miłego popołudnia";
  if (hour >= 18 && hour < 22) return "Dobry wieczór";
  return "Dobrej nocy";
}

function updateGreeting(hour) {
  const text = `${getGreeting(hour)}, ${NAME}!`;
  const el = document.getElementById("greeting");
  if (el.textContent !== text) {
    el.textContent = text;
    document.title = text;
  }
}

/* --- ZEGAR --- */
/* Strefa czasowa lokalizacji (np. "Europe/Moscow"), ustawiana po pobraniu pogody.
   undefined = strefa czasowa systemu. */
let displayTimeZone;

function setDisplayTimeZone(timeZone) {
  if (timeZone === displayTimeZone) return;
  try {
    new Intl.DateTimeFormat("pl-PL", { timeZone }); // sprawdzenie poprawności strefy
  } catch {
    return; // Nieznana strefa – zostaje czas systemowy
  }
  displayTimeZone = timeZone;
  updateTime();
}

function updateTime() {
  const now = new Date();
  const timeZone = displayTimeZone;

  document.getElementById("clock").textContent = now.toLocaleTimeString(
    "pl-PL",
    { hour: "2-digit", minute: "2-digit", timeZone },
  );

  const dateString = now.toLocaleDateString("pl-PL", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone,
  });
  document.getElementById("date").textContent =
    dateString.charAt(0).toUpperCase() + dateString.slice(1);

  const hour = Number(
    new Intl.DateTimeFormat("pl-PL", {
      hour: "numeric",
      hourCycle: "h23",
      timeZone,
    }).format(now),
  );
  updateGreeting(hour);
  updateTimeZoneLabel(now, timeZone);
}

/* Nazwa strefy czasowej pod zegarem, np. "czas środkowoeuropejski · GMT+1" */
function timeZonePart(now, timeZone, style) {
  return new Intl.DateTimeFormat("pl-PL", { timeZone, timeZoneName: style })
    .formatToParts(now)
    .find((part) => part.type === "timeZoneName")?.value;
}

function updateTimeZoneLabel(now, timeZone) {
  const name = timeZonePart(now, timeZone, "longGeneric");
  const offset = timeZonePart(now, timeZone, "shortOffset");
  const text = [name, offset].filter(Boolean).join(" · ");
  const el = document.getElementById("timezone");
  if (el.textContent !== text) el.textContent = text;
}

setInterval(updateTime, 1000);
updateTime();

/* --- POGODA --- */
function getWeatherDetails(code, isDay = true) {
  if (code === 0)
    return isDay
      ? { icon: "fa-sun", desc: "Bezchmurnie" }
      : { icon: "fa-moon", desc: "Bezchmurnie" };
  if (code >= 1 && code <= 3)
    return isDay
      ? { icon: "fa-cloud-sun", desc: "Zachmurzenie" }
      : { icon: "fa-cloud-moon", desc: "Zachmurzenie" };
  if (code >= 45 && code <= 48) return { icon: "fa-smog", desc: "Mgła" };
  if (code >= 51 && code <= 57)
    return { icon: "fa-cloud-rain", desc: "Mżawka" };
  if (code >= 61 && code <= 67)
    return { icon: "fa-cloud-rain", desc: "Deszcz" };
  if (code >= 71 && code <= 77)
    return { icon: "fa-snowflake", desc: "Śnieg" };
  if (code >= 80 && code <= 82)
    return { icon: "fa-cloud-showers-heavy", desc: "Ulewa" };
  if (code >= 85 && code <= 86)
    return { icon: "fa-snowflake", desc: "Śnieżyca" };
  if (code >= 95) return { icon: "fa-bolt", desc: "Burza" };
  return { icon: "fa-cloud", desc: "Pochmurno" };
}

/* Pomocnik do tworzenia elementów */
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function weatherIcon(code, isDay) {
  const icon = el("i", `fas ${getWeatherDetails(code, isDay).icon}`);
  icon.setAttribute("aria-hidden", "true");
  return icon;
}

function precipBadge(probability) {
  if (!probability) return null;
  const badge = el("span", "precip");
  badge.append(el("i", "fas fa-droplet"), ` ${probability}%`);
  return badge;
}

function renderCurrent(current) {
  const isDay = current.is_day === 1;
  const info = getWeatherDetails(current.weather_code, isDay);
  document.getElementById("temp").textContent =
    `${Math.round(current.temperature_2m)}°C`;
  document.getElementById("weather-icon").className =
    `weather-icon fas ${info.icon}`;
  document.getElementById("weather-desc").textContent = info.desc;
}

function renderDetails(current, daily) {
  const items = [
    ["fa-temperature-half", "Odczuwalna", `${Math.round(current.apparent_temperature)}°C`],
    ["fa-droplet", "Wilgotność", `${current.relative_humidity_2m}%`],
    ["fa-wind", "Wiatr", `${Math.round(current.wind_speed_10m)} km/h`],
    ["fa-sun", "Wschód", daily.sunrise[0].slice(11, 16)],
    ["fa-moon", "Zachód", daily.sunset[0].slice(11, 16)],
  ];
  const container = document.getElementById("weather-details");
  container.replaceChildren(
    ...items.map(([icon, label, value]) => {
      const item = el("span", "detail");
      item.append(el("i", `fas ${icon}`), `${label}: `, el("strong", "", value));
      return item;
    }),
  );
}

function renderHourly(hourly, currentTime) {
  // Pierwsza pełna godzina od teraz (czasy ISO można porównywać jak tekst)
  const currentHour = currentTime.slice(0, 13) + ":00";
  const start = Math.max(0, hourly.time.findIndex((t) => t >= currentHour));
  const container = document.getElementById("weather-hourly");

  const hours = [];
  for (let i = start; i < Math.min(start + 12, hourly.time.length); i++) {
    const hour = el("div", "hour");
    hour.append(
      el("span", "hour-time", i === start ? "Teraz" : hourly.time[i].slice(11, 16)),
      weatherIcon(hourly.weather_code[i], hourly.is_day[i] === 1),
      el("span", "hour-temp", `${Math.round(hourly.temperature_2m[i])}°`),
    );
    const precip = precipBadge(hourly.precipitation_probability[i]);
    if (precip) hour.append(precip);
    hours.push(hour);
  }
  container.replaceChildren(...hours);
}

function renderDaily(daily) {
  const container = document.getElementById("weather-daily");
  container.replaceChildren(
    ...daily.time.map((date, i) => {
      let name;
      if (i === 0) name = "Dziś";
      else if (i === 1) name = "Jutro";
      else {
        name = new Date(`${date}T12:00`).toLocaleDateString("pl-PL", {
          weekday: "long",
        });
        name = name.charAt(0).toUpperCase() + name.slice(1);
      }

      const day = el("div", "day");
      const temps = el("span", "day-temps");
      temps.append(
        el("strong", "", `${Math.round(daily.temperature_2m_max[i])}°`),
        el("span", "day-min", `${Math.round(daily.temperature_2m_min[i])}°`),
      );
      day.append(
        el("span", "day-name", name),
        weatherIcon(daily.weather_code[i], true),
        el("span", "day-desc", getWeatherDetails(daily.weather_code[i]).desc),
        temps,
      );
      const precip = precipBadge(daily.precipitation_probability_max[i]);
      if (precip) day.append(precip);
      return day;
    }),
  );
}

/* --- LOKALIZACJA --- */
const LOCATION_KEY = "weather-location";
let currentLocation = null;

// Zaokrąglenie do ~1 km – wystarczy do pogody i nie zdradza dokładnego adresu
const roundCoord = (value) => Math.round(value * 100) / 100;

function readSavedLocation() {
  try {
    const saved = JSON.parse(localStorage.getItem(LOCATION_KEY));
    if (saved && typeof saved.lat === "number" && typeof saved.lon === "number")
      return saved;
  } catch {
    // Brak zapisanej lokalizacji albo brak dostępu do pamięci
  }
  return null;
}

function saveLocation(location) {
  try {
    localStorage.setItem(LOCATION_KEY, JSON.stringify(location));
  } catch {
    // Bez zapisu – przy następnym wejściu lokalizacja zostanie pobrana ponownie
  }
}

// Pyta przeglądarkę o pozycję; zwraca null, gdy brak zgody lub błąd
function requestPosition() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: roundCoord(pos.coords.latitude),
          lon: roundCoord(pos.coords.longitude),
        }),
      () => resolve(null),
      { timeout: 15000, maximumAge: 30 * 60 * 1000 },
    );
  });
}

// Zamienia współrzędne na nazwę miejscowości (po polsku)
async function lookupPlaceName(lat, lon) {
  try {
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=pl`,
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return data.city || data.locality || data.principalSubdivision || null;
  } catch (error) {
    console.error("Błąd pobierania nazwy lokalizacji:", error);
    return null;
  }
}

function renderLocation(location) {
  const container = document.getElementById("weather-location");
  const name = location.name || "Twoja lokalizacja";
  const icon = el("i", "fas fa-location-dot");
  icon.setAttribute("aria-hidden", "true");
  container.replaceChildren(
    icon,
    location.isDefault ? `${name} (domyślnie)` : name,
  );
  container.title = location.isDefault
    ? "Brak dostępu do lokalizacji – pokazuję pogodę domyślną"
    : "Pogoda dla Twojej lokalizacji";
}

// Czy nowa pozycja różni się od poprzedniej o więcej niż ~5 km
function hasMoved(a, b) {
  return (
    !a || Math.abs(a.lat - b.lat) > 0.05 || Math.abs(a.lon - b.lon) > 0.05
  );
}

async function setLocation(location) {
  currentLocation = location;
  renderLocation(location);
  // Zapamiętana strefa czasowa – zegar od razu w czasie lokalizacji
  if (!location.isDefault && location.timeZone)
    setDisplayTimeZone(location.timeZone);
  await fetchWeather();
}

async function initLocation() {
  const saved = readSavedLocation();

  // Zapamiętana lokalizacja: pogoda od razu, bez czekania na przeglądarkę
  if (saved) setLocation(saved);

  const position = await requestPosition();

  if (!position) {
    if (!saved) setLocation({ ...DEFAULT_LOCATION, isDefault: true });
    return;
  }

  if (!hasMoved(saved, position)) return;

  const name = await lookupPlaceName(position.lat, position.lon);
  const location = { ...position, name };
  saveLocation(location);
  setLocation(location);
}

/* --- POBIERANIE POGODY --- */
let weatherRequestId = 0;

async function fetchWeather() {
  if (!currentLocation) return;
  // Odpowiedź na starsze zapytanie (np. dla poprzedniej lokalizacji) jest pomijana
  const requestId = ++weatherRequestId;
  const { lat, lon } = currentLocation;
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    "&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day" +
    "&hourly=temperature_2m,weather_code,precipitation_probability,is_day" +
    "&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max" +
    // "auto" – godziny wschodu, zachodu i prognozy w strefie czasowej lokalizacji
    "&timezone=auto&forecast_days=4";

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (requestId !== weatherRequestId) return;

    // Zegar w strefie czasowej lokalizacji (przy lokalizacji domyślnej – czas systemu)
    if (!currentLocation.isDefault && data.timezone) {
      setDisplayTimeZone(data.timezone);
      if (currentLocation.timeZone !== data.timezone) {
        currentLocation.timeZone = data.timezone;
        saveLocation(currentLocation);
      }
    }

    renderCurrent(data.current);
    renderDetails(data.current, data.daily);
    renderHourly(data.hourly, data.current.time);
    renderDaily(data.daily);
  } catch (error) {
    console.error("Błąd pobierania pogody:", error);
    const iconEl = document.getElementById("weather-icon");
    iconEl.className = "weather-icon fas fa-triangle-exclamation";
    document.getElementById("weather-desc").textContent = "Błąd pogody";
  }
}
initLocation();
setInterval(fetchWeather, 1800000);

/* Rozwijanie / zwijanie prognozy */
const weatherWidget = document.getElementById("weather-widget");
const weatherPanel = document.getElementById("weather-panel");

function setWeatherPanel(open) {
  weatherPanel.hidden = !open;
  weatherWidget.setAttribute("aria-expanded", String(open));
  weatherWidget.title = open ? "Ukryj prognozę" : "Pokaż prognozę";
}

weatherWidget.addEventListener("click", () => setWeatherPanel(weatherPanel.hidden));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !weatherPanel.hidden) setWeatherPanel(false);
});

/* --- ZORZA PODĄŻAJĄCA ZA KURSOREM --- */
(function auroraFollow() {
  const blob = document.getElementById("aurora-cursor");
  if (!blob || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    return;

  const EASE = 0.035; // Im mniej, tym wolniej plama dogania kursor
  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let x = targetX;
  let y = targetY;
  let frame = null;

  function place() {
    blob.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
  }

  function step() {
    x += (targetX - x) * EASE;
    y += (targetY - y) * EASE;
    place();
    // Zatrzymaj animację, gdy plama dotrze na miejsce – nie obciąża procesora
    if (Math.abs(targetX - x) > 0.5 || Math.abs(targetY - y) > 0.5) {
      frame = requestAnimationFrame(step);
    } else {
      frame = null;
    }
  }

  place();

  window.addEventListener(
    "pointermove",
    (e) => {
      if (e.pointerType !== "mouse") return;
      targetX = e.clientX;
      targetY = e.clientY;
      blob.classList.add("is-active");
      if (!frame) frame = requestAnimationFrame(step);
    },
    { passive: true },
  );

  document.documentElement.addEventListener("mouseleave", () =>
    blob.classList.remove("is-active"),
  );
})();
